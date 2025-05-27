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
import { generateEmailTemplate } from "./emailTemplates";

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

  // Generate valuation email with language support
  app.post("/api/inquiries/:id/generate-valuation", async (req, res) => {
    try {
      const inquiryId = parseInt(req.params.id);
      const { planType = 'business', customerEmail, language = 'en' } = req.body;
      
      const inquiry = await storage.getInquiry(inquiryId);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      // Generate valuation result based on plan type
      let valuationResult;
      if (planType === "premium") {
        valuationResult = generatePremiumValuationResult(inquiry);
      } else if (planType === "business") {
        valuationResult = generateBusinessValuationResult(inquiry);
      } else {
        valuationResult = generateRegularValuationResult(inquiry);
      }

      // Generate bilingual email template
      const emailData = generateEmailTemplate({
        inquiry,
        valuationResult,
        planType,
        customerEmail,
        language
      });

      // Note: Email sending would happen here if SendGrid credentials are configured
      // For now, we'll return the generated email data
      console.log(`Generated ${language} email for inquiry ${inquiryId}:`, emailData.subject);

      return res.json({
        message: `Valuation email generated successfully in ${language === 'bg' ? 'Bulgarian' : 'English'}`,
        emailPreview: {
          subject: emailData.subject,
          language,
          planType
        }
      });
    } catch (error) {
      console.error("Error generating valuation email:", error);
      return res.status(500).json({ message: "Failed to generate valuation email" });
    }
  });
  
  // Test bilingual email generation
  app.get("/api/test-bilingual-emails", async (req, res) => {
    try {
      // Sample test inquiry data
      const testInquiry = {
        id: 1,
        vin: "WBAPL33549A000001",
        brand: "BMW",
        model: "530d",
        year: 2017,
        mileage: 193000,
        fuelType: "diesel",
        transmission: "automatic",
        carType: "wagon",
        visibleDamages: "Minor scratches on rear bumper",
        mechanicalDamages: "None",
        additionalInfo: "Station wagon body style, well maintained",
        createdAt: new Date(),
        planType: "business",
        status: "test"
      };

      const businessValuation = generateBusinessValuationResult(testInquiry);

      // Generate English email
      const englishEmail = generateEmailTemplate({
        inquiry: testInquiry,
        valuationResult: businessValuation,
        planType: 'business',
        customerEmail: 'test@example.com',
        language: 'en'
      });

      // Generate Bulgarian email
      const bulgarianEmail = generateEmailTemplate({
        inquiry: testInquiry,
        valuationResult: businessValuation,
        planType: 'business',
        customerEmail: 'test@example.com',
        language: 'bg'
      });

      return res.json({
        success: true,
        testResults: {
          vehicleInfo: `${testInquiry.year} ${testInquiry.brand} ${testInquiry.model}`,
          english: {
            subject: englishEmail.subject,
            language: 'en',
            preview: englishEmail.text.substring(0, 200) + '...'
          },
          bulgarian: {
            subject: bulgarianEmail.subject,
            language: 'bg',
            preview: bulgarianEmail.text.substring(0, 200) + '...'
          }
        }
      });
    } catch (error) {
      console.error("Error testing bilingual emails:", error);
      return res.status(500).json({ message: "Failed to test bilingual emails", error: error.message });
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

  // Additional payment method routes
  app.post("/api/payment/process", async (req, res) => {
    try {
      const { method, amount, currency, inquiryId, planType } = req.body;
      
      let paymentResult;
      
      switch (method) {
        case 'stripe':
          paymentResult = await processStripePayment(amount, currency);
          break;
        case 'revolut':
          paymentResult = await processRevolutPayment(amount, currency);
          break;
        case 'bank_transfer':
          paymentResult = await processBankTransfer(amount, currency);
          break;
        case 'crypto':
          paymentResult = await processCryptoPayment(amount, currency);
          break;
        case 'apple_pay':
          paymentResult = await processApplePayPayment(amount, currency);
          break;
        case 'google_pay':
          paymentResult = await processGooglePayPayment(amount, currency);
          break;
        default:
          return res.status(400).json({ message: "Unsupported payment method" });
      }
      
      if (paymentResult.success) {
        // Complete the inquiry with valuation
        const inquiry = await storage.getInquiry(parseInt(inquiryId));
        if (!inquiry) {
          return res.status(404).json({ message: "Inquiry not found" });
        }

        let valuationResult;
        if (planType === "premium") {
          valuationResult = generatePremiumValuationResult(inquiry);
        } else if (planType === "business") {
          valuationResult = generateBusinessValuationResult(inquiry);
        } else {
          valuationResult = generateRegularValuationResult(inquiry);
        }
        
        const updatedInquiry = await storage.updateInquiry(parseInt(inquiryId), {
          planType,
          paymentId: paymentResult.transactionId,
          paymentMethod: method,
          paymentAmount: amount,
          paymentCompleted: true,
          status: "completed",
          valuationResult
        });

        return res.status(200).json({
          success: true,
          inquiry: updatedInquiry,
          paymentDetails: paymentResult
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: paymentResult.error || "Payment failed" 
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      return res.status(500).json({ message: "Failed to process payment" });
    }
  });

  app.get("/api/payment/methods", async (req, res) => {
    try {
      // Return available payment methods based on configuration
      const availableMethods = {
        stripe: !!process.env.STRIPE_SECRET_KEY,
        paypal: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
        revolut: !!process.env.REVOLUT_API_KEY,
        bank_transfer: true, // Always available
        crypto: !!process.env.CRYPTO_PROCESSOR_API_KEY,
        apple_pay: !!process.env.STRIPE_SECRET_KEY, // Apple Pay through Stripe
        google_pay: !!process.env.STRIPE_SECRET_KEY  // Google Pay through Stripe
      };
      
      return res.json(availableMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return res.status(500).json({ message: "Failed to fetch payment methods" });
    }
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

// Brand value multipliers based on market positioning
const BRAND_VALUE_MULTIPLIERS = {
  // Luxury brands
  'BMW': 1.4, 'Mercedes-Benz': 1.45, 'Audi': 1.35, 'Lexus': 1.3, 'Porsche': 2.2,
  'Jaguar': 1.25, 'Land Rover': 1.3, 'Volvo': 1.15, 'Infiniti': 1.2, 'Acura': 1.15,
  'Cadillac': 1.1, 'Tesla': 1.6, 'Maserati': 1.8, 'Ferrari': 3.5, 'Lamborghini': 3.2,
  'Rolls-Royce': 4.0,
  
  // Premium brands
  'Volkswagen': 1.1, 'Toyota': 1.2, 'Honda': 1.15, 'Mazda': 1.05, 'Subaru': 1.1,
  'Hyundai': 1.0, 'Kia': 0.95, 'Genesis': 1.25, 'Mini': 1.15,
  
  // Mainstream brands
  'Ford': 0.9, 'Opel': 0.85, 'Renault': 0.9, 'Peugeot': 0.9, 'Citroën': 0.85,
  'Skoda': 0.95, 'SEAT': 0.9, 'Fiat': 0.8, 'Nissan': 0.95, 'Mitsubishi': 0.85,
  'Chevrolet': 0.8, 'Dacia': 0.7, 'Suzuki': 0.8,
  
  // Specialty/Niche brands
  'Jeep': 1.05, 'Saab': 0.75, 'Alfa Romeo': 0.9, 'Lancia': 0.7
};

// Car type value multipliers
const CAR_TYPE_MULTIPLIERS = {
  'suv': 1.15,
  'coupe': 1.1,
  'convertible': 1.2,
  'wagon': 1.05,
  'sedan': 1.0,
  'hatchback': 0.95,
  'pickup': 1.1,
  'van': 0.9,
  'minivan': 0.85
};

// Base values by fuel type (updated for 2024 market)
const FUEL_TYPE_BASE_VALUES = {
  'electric': 28000,
  'hybrid': 22000,
  'diesel': 16000,
  'petrol': 14000,
  'lpg': 12000
};

// Helper functions to generate valuation results
function generateRegularValuationResult(inquiry: any) {
  // 1. Start with base value from fuel type
  const baseValue = FUEL_TYPE_BASE_VALUES[inquiry.fuelType] || 14000;
  
  // 2. Apply brand multiplier
  const brandMultiplier = BRAND_VALUE_MULTIPLIERS[inquiry.brand] || 1.0;
  
  // 3. Apply car type multiplier
  const carTypeMultiplier = CAR_TYPE_MULTIPLIERS[inquiry.carType] || 1.0;
  
  // 4. Calculate age depreciation (assuming current year is 2024)
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - (inquiry.year || currentYear);
  const ageFactor = Math.max(0.15, 1 - (vehicleAge * 0.08)); // 8% depreciation per year, minimum 15%
  
  // 5. Calculate mileage depreciation
  const mileageFactor = Math.max(0.4, 1 - (inquiry.mileage / 350000)); // More realistic mileage factor
  
  // 6. Apply transmission multiplier
  const transmissionMultiplier = inquiry.transmission === 'automatic' ? 1.12 : 
                                inquiry.transmission === 'semi-automatic' ? 1.06 : 1.0;
  
  // 7. VIN-based features bonus (if VIN provided)
  let vinFeaturesBonus = 0;
  let detectedFeatures = [];
  
  if (inquiry.vin && inquiry.vin.length >= 10) {
    // Basic VIN analysis (in production, this would call a real VIN decoder API)
    detectedFeatures = analyzeVINFeatures(inquiry.vin);
    vinFeaturesBonus = detectedFeatures.reduce((total, feature) => total + feature.value, 0);
  }
  
  // 8. Calculate final market value
  let marketValue = baseValue * brandMultiplier * carTypeMultiplier * ageFactor * mileageFactor * transmissionMultiplier;
  marketValue += vinFeaturesBonus;
  marketValue = Math.round(marketValue);
  
  return {
    marketValue,
    currency: "EUR",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleDetails: {
      brand: inquiry.brand,
      model: inquiry.model,
      year: inquiry.year,
      carType: inquiry.carType,
      vin: inquiry.vin,
      mileage: inquiry.mileage,
      fuelType: inquiry.fuelType,
      transmission: inquiry.transmission
    },
    valuationBreakdown: {
      baseValue: Math.round(baseValue),
      brandAdjustment: `${Math.round((brandMultiplier - 1) * 100)}%`,
      carTypeAdjustment: `${Math.round((carTypeMultiplier - 1) * 100)}%`,
      ageDepreciation: `${Math.round((1 - ageFactor) * 100)}%`,
      mileageDepreciation: `${Math.round((1 - mileageFactor) * 100)}%`,
      transmissionBonus: `${Math.round((transmissionMultiplier - 1) * 100)}%`,
      vinFeaturesBonus: `+€${vinFeaturesBonus}`,
      detectedFeatures: detectedFeatures
    }
  };
}

// VIN analysis function (simulates real VIN decoder)
function analyzeVINFeatures(vin: string) {
  const features = [];
  
  // Simulate VIN decoding based on VIN characters (in production, use real VIN API)
  const vinUpper = vin.toUpperCase();
  
  // Check for luxury package indicators
  if (vinUpper.includes('L') || vinUpper.includes('X')) {
    features.push({ name: 'Luxury Package', value: 2500 });
  }
  
  // Check for sport package indicators
  if (vinUpper.includes('S') || vinUpper.includes('M')) {
    features.push({ name: 'Sport Package', value: 1800 });
  }
  
  // Check for navigation system indicators
  if (vinUpper.includes('N') || vinUpper.includes('G')) {
    features.push({ name: 'Navigation System', value: 1200 });
  }
  
  // Check for premium sound system
  if (vinUpper.includes('P') || vinUpper.includes('H')) {
    features.push({ name: 'Premium Audio', value: 800 });
  }
  
  // Check for sunroof indicators
  if (vinUpper.includes('R') || vinUpper.includes('T')) {
    features.push({ name: 'Sunroof/Panoramic Roof', value: 1500 });
  }
  
  // Check for AWD indicators
  if (vinUpper.includes('4') || vinUpper.includes('W')) {
    features.push({ name: 'All-Wheel Drive', value: 3000 });
  }
  
  // Limit to most valuable features to avoid over-valuation
  return features.slice(0, 3);
}

// Payment processor functions
async function processStripePayment(amount: number, currency: string) {
  // Simulate Stripe payment processing
  // In production, this would integrate with actual Stripe API
  return {
    success: true,
    transactionId: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    method: 'stripe',
    amount,
    currency,
    processingTime: 'instant'
  };
}

async function processRevolutPayment(amount: number, currency: string) {
  // Simulate Revolut payment processing
  // In production, this would integrate with Revolut Business API
  return {
    success: true,
    transactionId: `revolut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    method: 'revolut',
    amount,
    currency,
    processingTime: 'instant'
  };
}

async function processBankTransfer(amount: number, currency: string) {
  // Simulate bank transfer processing
  // In production, this would generate SEPA payment instructions
  return {
    success: true,
    transactionId: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    method: 'bank_transfer',
    amount,
    currency,
    processingTime: '1-2 business days',
    bankDetails: {
      accountName: 'CarValueAI Ltd',
      iban: 'BG80BNBG96611020345678',
      bic: 'BNBGBGSD',
      reference: `INV-${Date.now()}`
    }
  };
}

async function processCryptoPayment(amount: number, currency: string) {
  // Simulate cryptocurrency payment processing
  // In production, this would integrate with crypto payment processor
  return {
    success: true,
    transactionId: `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    method: 'crypto',
    amount,
    currency,
    processingTime: '5-30 minutes',
    cryptoDetails: {
      btcAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      ethAddress: '0x742d35Cc6635C0532925a3b8D186c',
      usdtAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5CXEF'
    }
  };
}

async function processApplePayPayment(amount: number, currency: string) {
  // Simulate Apple Pay processing (typically through Stripe)
  // In production, this would use Stripe's Apple Pay integration
  return {
    success: true,
    transactionId: `apple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    method: 'apple_pay',
    amount,
    currency,
    processingTime: 'instant'
  };
}

async function processGooglePayPayment(amount: number, currency: string) {
  // Simulate Google Pay processing (typically through Stripe)
  // In production, this would use Stripe's Google Pay integration
  return {
    success: true,
    transactionId: `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    method: 'google_pay',
    amount,
    currency,
    processingTime: 'instant'
  };
}

function generatePremiumValuationResult(inquiry: any) {
  // Get regular valuation first
  const regularResult = generateRegularValuationResult(inquiry);
  const marketValue = regularResult.marketValue;
  
  // Generate realistic 3-month historical data with seasonal variations
  const currentDate = new Date();
  const historicalData = [];
  const futureProjections = [];
  
  // Generate 3 months of historical data
  for (let i = 3; i >= 0; i--) {
    const monthsBack = i;
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - monthsBack);
    
    // Realistic market variations based on seasonality and trends
    let variation = 1;
    if (monthsBack === 3) variation = 0.94 + (Math.random() * 0.04); // 3 months ago: 94-98%
    if (monthsBack === 2) variation = 0.96 + (Math.random() * 0.04); // 2 months ago: 96-100%
    if (monthsBack === 1) variation = 0.98 + (Math.random() * 0.03); // 1 month ago: 98-101%
    if (monthsBack === 0) variation = 1; // Current value
    
    historicalData.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: Math.round(marketValue * variation),
      marketActivity: monthsBack === 0 ? "Current" : monthsBack === 1 ? "High" : "Moderate"
    });
  }
  
  // Generate 2-3 months future projections
  for (let i = 1; i <= 3; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + i);
    
    // Future projections with decreasing confidence
    let projectedVariation = 1;
    if (i === 1) projectedVariation = 1.01 + (Math.random() * 0.03); // Next month: 101-104%
    if (i === 2) projectedVariation = 1.02 + (Math.random() * 0.04); // 2 months: 102-106%
    if (i === 3) projectedVariation = 1.01 + (Math.random() * 0.06); // 3 months: 101-107%
    
    futureProjections.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: Math.round(marketValue * projectedVariation),
      confidence: Math.max(65, 95 - (i * 10)), // Decreasing confidence
      trend: projectedVariation > 1.02 ? "Increasing" : projectedVariation > 0.98 ? "Stable" : "Decreasing"
    });
  }
  
  // Calculate comprehensive trend analysis
  const oldestValue = historicalData[0].value;
  const currentValue = historicalData[historicalData.length - 1].value;
  const historicalTrend = ((currentValue - oldestValue) / oldestValue) * 100;
  const futureAverage = futureProjections.reduce((sum, proj) => sum + proj.value, 0) / futureProjections.length;
  const futureTrend = ((futureAverage - currentValue) / currentValue) * 100;
  
  return {
    ...regularResult,
    historicalData,
    futureProjections,
    marketTrendAnalysis: {
      historicalTrendPercentage: Math.round(historicalTrend * 10) / 10,
      futureTrendPercentage: Math.round(futureTrend * 10) / 10,
      marketMomentum: historicalTrend > 3 ? "Strong Upward" : historicalTrend > 1 ? "Upward" : historicalTrend > -1 ? "Stable" : "Downward",
      volatility: Math.abs(historicalTrend) > 5 ? "High" : "Low",
      bestTimeToSell: futureTrend > 2 ? `${futureProjections[0].month} (peak expected)` : historicalTrend > 0 ? "Within next 4-6 weeks" : "Hold for 2-3 months"
    },
    marketInsights: {
      demand: historicalTrend > 2 ? "High and increasing" : "Moderate",
      seasonalFactor: currentDate.getMonth() >= 2 && currentDate.getMonth() <= 7 ? "Spring/Summer peak season" : "Off-peak season",
      competitivePosition: `${Math.floor(Math.random() * 20) + 15} similar vehicles in market`,
      priceRecommendation: {
        quickSale: Math.round(currentValue * 0.95),
        marketPrice: currentValue,
        premiumPrice: Math.round(currentValue * 1.08)
      }
    }
  };
}

function generateBusinessValuationResult(inquiry: any) {
  // Get premium valuation first and extend it
  const premiumResult = generatePremiumValuationResult(inquiry);
  const marketValue = premiumResult.marketValue;
  
  // Personal Investment Risk Assessment
  const vehicleAge = new Date().getFullYear() - inquiry.year;
  const mileageRisk = inquiry.mileage > 150000 ? "High" : inquiry.mileage > 100000 ? "Medium" : "Low";
  const brandReliability = ["BMW", "Mercedes-Benz", "Audi", "Lexus", "Toyota"].includes(inquiry.brand) ? "High" : "Medium";
  
  const investmentRisk = {
    overall: mileageRisk === "High" || vehicleAge > 8 ? "Medium-High" : brandReliability === "High" ? "Low-Medium" : "Medium",
    riskScore: Math.round((vehicleAge * 0.3 + (inquiry.mileage / 10000) * 0.4 + (brandReliability === "High" ? -2 : 0)) * 10) / 10,
    factors: {
      depreciation: vehicleAge > 10 ? "Accelerated (15-20% annually)" : vehicleAge > 5 ? "Standard (8-12% annually)" : "Minimal (3-5% annually)",
      marketDemand: premiumResult.marketInsights.demand,
      maintenanceCosts: vehicleAge > 8 ? "Increasing significantly" : vehicleAge > 5 ? "Moderate increase" : "Low",
      liquidityRisk: brandReliability === "High" ? "Low (sells within 30-45 days)" : "Medium (sells within 60-90 days)",
      marketVolatility: Math.abs(premiumResult.marketTrendAnalysis.historicalTrendPercentage) > 5 ? "High" : "Low"
    },
    recommendation: vehicleAge < 3 ? "Excellent investment vehicle with strong appreciation potential" : 
                    vehicleAge < 6 ? "Good investment with stable value retention" : 
                    vehicleAge < 10 ? "Fair investment, monitor market conditions closely" : 
                    "Consider timing of sale to minimize depreciation",
    holdingPeriod: vehicleAge < 5 ? "12-24 months optimal" : "6-12 months maximum",
    exitStrategy: premiumResult.marketTrendAnalysis.futureTrendPercentage > 0 ? 
                 "Sell during spring/summer peak for maximum value" : 
                 "Monitor market conditions and sell before winter season"
  };
  
  // Generate 3-month future prediction instead of just 1 month
  const oneMonthFuture = marketValue * 1.02;
  const twoMonthsFuture = oneMonthFuture * 0.98;
  const threeMonthsFuture = twoMonthsFuture * 0.99;
  
  // Generate competitor pricing comparison
  const competitorPricing = [
    { dealer: "AutoHouse Sofia", price: Math.round(marketValue * 1.10), comparison: "+10%" },
    { dealer: "Premium Motors", price: Math.round(marketValue * 0.95), comparison: "-5%" },
    { dealer: "Elite Auto Gallery", price: Math.round(marketValue * 1.05), comparison: "+5%" },
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
    investmentRiskAssessment: investmentRisk,
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
