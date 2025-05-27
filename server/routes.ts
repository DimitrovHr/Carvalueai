import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { carDetailsSchema, paymentSchema, adminSettingsFormSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import nodemailer from "nodemailer";
import { setupAuth } from "./auth";
import { 
  scheduleValuationRefinements, 
  manuallyRefineAllValuations, 
  refineValuation 
} from "./marketDataService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // API routes
  app.get("/api/inquiries", async (req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      return res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      return res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.delete("/api/inquiries/:id", async (req, res) => {
    try {
      const inquiryId = parseInt(req.params.id);
      
      if (isNaN(inquiryId)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }

      // Check if inquiry exists
      const inquiry = await storage.getInquiry(inquiryId);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      // Delete the inquiry
      await storage.deleteInquiry(inquiryId);
      
      return res.status(200).json({ message: "Inquiry deleted successfully" });
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      return res.status(500).json({ message: "Failed to delete inquiry" });
    }
  });

  app.get("/api/inquiries/:id", async (req, res) => {
    try {
      const inquiry = await storage.getInquiry(parseInt(req.params.id));
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      return res.json(inquiry);
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      return res.status(500).json({ message: "Failed to fetch inquiry" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const carDetails = carDetailsSchema.parse(req.body);
      const inquiry = await storage.createInquiry({
        ...carDetails,
        planType: "regular", // Default to regular until payment is made
        status: "pending",
      });
      
      // Send notification email if configured (optional)
      try {
        const adminSettings = await storage.getAdminSettings();
        if (adminSettings?.notificationEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: '"CarValueAI" <info@carvalueai.com>',
            to: adminSettings.notificationEmail,
            subject: `New Car Inquiry: ${carDetails.vin}`,
            text: `
              New car inquiry submitted:
              VIN: ${carDetails.vin}
              Mileage: ${carDetails.mileage}
              Fuel Type: ${carDetails.fuelType}
              Transmission: ${carDetails.transmission}
              Status: Pending payment
            `,
            html: `
              <h2>New Car Inquiry Submitted</h2>
              <p><strong>VIN:</strong> ${carDetails.vin}</p>
              <p><strong>Mileage:</strong> ${carDetails.mileage} km</p>
              <p><strong>Fuel Type:</strong> ${carDetails.fuelType}</p>
              <p><strong>Transmission:</strong> ${carDetails.transmission}</p>
              <p><strong>Status:</strong> Pending payment</p>
            `,
          });
        }
      } catch (emailError) {
        console.log("Email notification skipped (no credentials configured)");
      }

      return res.status(201).json(inquiry);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating inquiry:", error);
      return res.status(500).json({ message: "Failed to create inquiry" });
    }
  });

  app.post("/api/payment/complete", async (req, res) => {
    try {
      const { inquiryId, planType, paymentMethod, paymentId, amount } = req.body;
      
      // Validate required fields
      if (!inquiryId || !planType || !paymentMethod || !paymentId || !amount) {
        return res.status(400).json({ message: "Missing required payment details" });
      }

      // Get the inquiry
      const inquiry = await storage.getInquiry(parseInt(inquiryId));
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      // Update the inquiry with payment details
      let valuationResult;
      
      // Generate valuation result based on plan type
      if (planType === "premium") {
        valuationResult = generatePremiumValuationResult(inquiry);
      } else if (planType === "business") {
        valuationResult = generateBusinessValuationResult(inquiry);
      } else {
        valuationResult = generateRegularValuationResult(inquiry);
      }
      
      const updatedInquiry = await storage.updateInquiry(parseInt(inquiryId), {
        planType,
        paymentId,
        paymentMethod,
        paymentAmount: amount,
        paymentCompleted: true,
        status: "completed",
        valuationResult
      });

      return res.status(200).json(updatedInquiry);
    } catch (error) {
      console.error("Error completing payment:", error);
      return res.status(500).json({ message: "Failed to complete payment" });
    }
  });

  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getAdminSettings();
      return res.json(settings || { notificationEmail: "", apiSettings: {} });
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      return res.status(500).json({ message: "Failed to fetch admin settings" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const settings = adminSettingsFormSchema.parse(req.body);
      let apiSettings = {};
      
      if (settings.apiSettings) {
        try {
          apiSettings = JSON.parse(settings.apiSettings);
        } catch (e) {
          return res.status(400).json({ message: "Invalid API settings JSON format" });
        }
      }

      const updatedSettings = await storage.saveAdminSettings({
        notificationEmail: settings.notificationEmail,
        apiSettings
      });
      
      return res.json(updatedSettings);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating admin settings:", error);
      return res.status(500).json({ message: "Failed to update admin settings" });
    }
  });

  app.post("/api/admin/test-valuation", async (req, res) => {
    try {
      const carDetails = carDetailsSchema.parse(req.body);
      
      // Generate test valuation results for all plan types
      const regularResult = generateRegularValuationResult({
        ...carDetails,
        id: 0,
        createdAt: new Date(),
        planType: "regular",
        status: "test"
      });
      
      const premiumResult = generatePremiumValuationResult({
        ...carDetails,
        id: 0,
        createdAt: new Date(),
        planType: "premium",
        status: "test"
      });

      const businessResult = generateBusinessValuationResult({
        ...carDetails,
        id: 0,
        createdAt: new Date(),
        planType: "business",
        status: "test"
      });
      
      return res.json({
        regular: regularResult,
        premium: premiumResult,
        business: businessResult
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error generating test valuation:", error);
      return res.status(500).json({ message: "Failed to generate test valuation" });
    }
  });
  
  // Special test endpoint for the BMW 530d example
  app.get("/api/bmw-test-valuation", async (req, res) => {
    try {
      // BMW 530d station wagon 2017, automatic, 193000km
      const bmwTestData = {
        vin: "WBAJD52010G000001", // Example VIN
        mileage: 193000,
        fuelType: "diesel",
        transmission: "automatic",
        visibleDamages: "Minor scratches on rear bumper",
        mechanicalDamages: "None",
        additionalInfo: "Station wagon body style, 2017 model year",
        id: 0,
        createdAt: new Date(),
        planType: "regular",
        status: "test"
      };
      
      // Generate valuations for all plan types
      const regularResult = generateRegularValuationResult(bmwTestData);
      const premiumResult = generatePremiumValuationResult(bmwTestData);
      const businessResult = generateBusinessValuationResult(bmwTestData);
      
      return res.json({
        regular: regularResult,
        premium: premiumResult,
        business: businessResult
      });
    } catch (error) {
      console.error("Error generating BMW test valuation:", error);
      return res.status(500).json({ message: "Failed to generate BMW test valuation" });
    }
  });

  // PayPal integration routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Market data and valuation refinement endpoints
  app.post("/api/admin/market-data/refine-all", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized. Admin access required." });
      }
      
      const result = await manuallyRefineAllValuations();
      return res.json({
        message: `Refinement process completed. Processed ${result.total} valuations: ${result.refined} refined, ${result.failed} failed.`,
        result
      });
    } catch (error) {
      console.error("Error refining valuations:", error);
      return res.status(500).json({ message: "Failed to refine valuations" });
    }
  });

  app.post("/api/admin/market-data/refine/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized. Admin access required." });
      }
      
      const inquiryId = parseInt(req.params.id);
      const result = await refineValuation(inquiryId);
      
      if (result) {
        const updatedInquiry = await storage.getInquiry(inquiryId);
        return res.json({
          message: "Valuation successfully refined",
          inquiry: updatedInquiry
        });
      } else {
        return res.status(400).json({ message: "Unable to refine valuation" });
      }
    } catch (error) {
      console.error("Error refining valuation:", error);
      return res.status(500).json({ message: "Failed to refine valuation" });
    }
  });

  app.get("/api/admin/market-data/status", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized. Admin access required." });
      }
      
      // Get all inquiries and analyze their refinement status
      const allInquiries = await storage.getAllInquiries();
      const completedInquiries = allInquiries.filter(inquiry => 
        inquiry.status === 'completed' && inquiry.valuationResult
      );
      
      // Find recently refined valuations (within the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentlyRefined = completedInquiries.filter(inquiry => {
        const refinementHistory = (inquiry.valuationResult as any)?.refinementHistory || [];
        return refinementHistory.length > 0 && 
               new Date((refinementHistory[refinementHistory.length - 1] as any).date) >= sevenDaysAgo;
      });
      
      // Find valuations that need refinement
      const needsRefinement = completedInquiries.filter(inquiry => {
        const lastUpdated = (inquiry.valuationResult as any)?.marketInsights?.lastUpdated;
        if (!lastUpdated) return true; // Never updated
        return new Date(lastUpdated) < sevenDaysAgo;
      });
      
      return res.json({
        totalInquiries: allInquiries.length,
        completedInquiries: completedInquiries.length,
        recentlyRefined: recentlyRefined.length,
        needsRefinement: needsRefinement.length,
        lastScheduledRefinement: new Date().toISOString() // In a real app, this would be stored in the database
      });
    } catch (error) {
      console.error("Error getting market data status:", error);
      return res.status(500).json({ message: "Failed to get market data status" });
    }
  });

  // Set up scheduled refinement process (runs once a day at midnight)
  // In a production environment, this would be handled by a cron job or similar
  const scheduleRefinement = () => {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
      0, 0, 0 // midnight
    );
    
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    setTimeout(async () => {
      console.log("Running scheduled valuation refinement...");
      await scheduleValuationRefinements();
      // Schedule next run
      scheduleRefinement();
    }, timeUntilMidnight);
    
    console.log(`Scheduled next valuation refinement in ${Math.round(timeUntilMidnight / (1000 * 60 * 60))} hours`);
  };
  
  // Start the refinement scheduler
  scheduleRefinement();

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions to generate valuation results
function generateRegularValuationResult(inquiry: any) {
  // Calculate market value based on mileage, fuel type, and transmission
  let baseValue = 0;
  
  // Base value determined by fuel type
  switch (inquiry.fuelType) {
    case 'diesel':
      baseValue = 15000;
      break;
    case 'petrol':
      baseValue = 13500;
      break;
    case 'hybrid':
      baseValue = 20000;
      break;
    case 'electric':
      baseValue = 25000;
      break;
    case 'lpg':
      baseValue = 12000;
      break;
    default:
      baseValue = 14000;
  }
  
  // Adjust for mileage (higher mileage means lower value)
  const mileageFactor = Math.max(0.6, 1 - (inquiry.mileage / 300000));
  
  // Adjust for transmission (automatic typically has higher value)
  const transmissionFactor = inquiry.transmission === 'automatic' ? 1.1 : 
                            inquiry.transmission === 'semi-automatic' ? 1.05 : 1;
  
  // Calculate final value
  const marketValue = Math.round(baseValue * mileageFactor * transmissionFactor);
  
  return {
    marketValue,
    currency: "EUR",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleDetails: {
      vin: inquiry.vin,
      mileage: inquiry.mileage,
      fuelType: inquiry.fuelType,
      transmission: inquiry.transmission
    }
  };
}

function generatePremiumValuationResult(inquiry: any) {
  // Get regular valuation first
  const regularResult = generateRegularValuationResult(inquiry);
  const marketValue = regularResult.marketValue;
  
  // Generate 3-month historical data
  const threeMonthsAgo = marketValue * 0.95;
  const twoMonthsAgo = marketValue * 0.97;
  const oneMonthAgo = marketValue * 0.99;
  
  // Generate 1-month future prediction
  const nextMonth = marketValue * 1.02;
  
  // Calculate trend percentages
  const historicalTrend = ((marketValue - threeMonthsAgo) / threeMonthsAgo) * 100;
  const futureTrend = ((nextMonth - marketValue) / marketValue) * 100;
  
  return {
    ...regularResult,
    historicalData: [
      { month: "3 months ago", value: Math.round(threeMonthsAgo) },
      { month: "2 months ago", value: Math.round(twoMonthsAgo) },
      { month: "1 month ago", value: Math.round(oneMonthAgo) },
      { month: "Current", value: Math.round(marketValue) }
    ],
    futurePrediction: {
      nextMonth: Math.round(nextMonth),
      trendPercentage: Math.round(futureTrend * 10) / 10
    },
    marketInsights: {
      historicalTrendPercentage: Math.round(historicalTrend * 10) / 10,
      bestTimeToSell: historicalTrend > 2 ? "Within the next 4-6 weeks" : "Hold for 2-3 months",
      marketCondition: historicalTrend > 0 ? "Rising" : "Declining"
    }
  };
}

function generateBusinessValuationResult(inquiry: any) {
  // Get premium valuation first and extend it
  const premiumResult = generatePremiumValuationResult(inquiry);
  const marketValue = premiumResult.marketValue;
  
  // Generate 3-month future prediction instead of just 1 month
  const oneMonthFuture = marketValue * 1.02;
  const twoMonthsFuture = oneMonthFuture * 0.98; // slight decline
  const threeMonthsFuture = twoMonthsFuture * 0.99; // continued slight decline
  
  // Generate competitor pricing comparison
  const competitorPricing = [
    { dealer: "Dealership A", price: Math.round(marketValue * 1.10), comparison: "+10%" },
    { dealer: "Dealership B", price: Math.round(marketValue * 0.95), comparison: "-5%" },
    { dealer: "Dealership C", price: Math.round(marketValue * 1.05), comparison: "+5%" },
    { dealer: "Private sellers avg.", price: Math.round(marketValue * 0.92), comparison: "-8%" }
  ];
  
  // Generate market demand forecast
  const seasonalityFactor = Math.round(Math.random() * 10);
  const fuelEconomyFactor = Math.round(Math.random() * 10);
  const brandPopularityFactor = Math.round(Math.random() * 10);
  const marketTrendFactor = Math.round(Math.random() * 10);
  
  const demandFactors = [
    { factor: "Seasonality", score: seasonalityFactor },
    { factor: "Fuel Economy", score: fuelEconomyFactor },
    { factor: "Brand Popularity", score: brandPopularityFactor },
    { factor: "Market Trend", score: marketTrendFactor }
  ];
  
  const totalDemandScore = demandFactors.reduce((sum, item) => sum + item.score, 0);
  const avgDemandScore = totalDemandScore / demandFactors.length;
  
  // Determine demand level
  let demandLevel;
  if (avgDemandScore >= 7) {
    demandLevel = "High";
  } else if (avgDemandScore >= 5) {
    demandLevel = "Medium";
  } else {
    demandLevel = "Low";
  }
  
  // Update validUntil to be 30 days instead of 7
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  return {
    ...premiumResult,
    validUntil,
    // Extend historical data with future predictions
    historicalData: [
      ...premiumResult.historicalData,
      { month: "Next Month", value: Math.round(oneMonthFuture) },
      { month: "In 2 Months", value: Math.round(twoMonthsFuture) },
      { month: "In 3 Months", value: Math.round(threeMonthsFuture) }
    ],
    futurePrediction: {
      oneMonth: Math.round(oneMonthFuture),
      twoMonths: Math.round(twoMonthsFuture),
      threeMonths: Math.round(threeMonthsFuture),
      trendDescription: "Initial increase followed by gradual decline over 3 months"
    },
    competitorAnalysis: {
      pricingComparison: competitorPricing,
      marketPosition: "Mid-range",
      priceAdvantage: Math.round(((marketValue / (marketValue * 1.05)) - 1) * 100)
    },
    marketDemand: {
      demandLevel,
      demandScore: Math.round(avgDemandScore * 10) / 10,
      factors: demandFactors,
      seasonalTrends: seasonalityFactor > 6 ? "Positive seasonal demand" : "Low seasonal demand",
      bestSellingPeriod: seasonalityFactor > 6 ? "Current" : "Wait 2-3 months"
    },
    exportOptions: {
      pdfReportAvailable: true,
      pdfReportUrl: `/api/reports/${inquiry.id}/export-pdf`
    }
  };
}
