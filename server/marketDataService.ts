import { db } from './db';
import { carInquiries } from '@shared/schema';
import { eq, lt, and } from 'drizzle-orm';
import { storage } from './storage';

interface MarketData {
  make: string;
  model: string;
  year: number;
  trend: number; // percentage change
  averagePrice: number;
  lastUpdated: Date;
}

// Mock market data source - in a real app, this would fetch from external APIs
const getMarketData = async (make: string, model: string, year: number): Promise<MarketData | null> => {
  // Simulate API call to external market data source
  console.log(`Fetching market data for ${make} ${model} ${year}...`);
  
  // This would be replaced with actual API calls to Bulgarian car market APIs
  // For demo purposes, we're returning synthesized data
  const mockMarketData: Record<string, MarketData> = {
    'bmw-5-series-2017': {
      make: 'BMW',
      model: '5 Series',
      year: 2017,
      trend: -2.5,
      averagePrice: 16000,
      lastUpdated: new Date()
    },
    'mercedes-e-class-2018': {
      make: 'Mercedes',
      model: 'E Class',
      year: 2018,
      trend: -1.8,
      averagePrice: 18500,
      lastUpdated: new Date()
    },
    'audi-a6-2019': {
      make: 'Audi',
      model: 'A6',
      year: 2019,
      trend: -1.2,
      averagePrice: 21000,
      lastUpdated: new Date()
    }
  };
  
  // Try to find a match in our mock data
  const key = `${make.toLowerCase()}-${model.toLowerCase()}-${year}`;
  const fuzzyMatch = Object.keys(mockMarketData).find(k => k.includes(make.toLowerCase()) && year >= 2015);
  
  return mockMarketData[key] || (fuzzyMatch ? mockMarketData[fuzzyMatch] : null);
};

/**
 * Processes an inquiry and updates its valuation based on the latest market data
 */
export const refineValuation = async (inquiryId: number): Promise<boolean> => {
  try {
    // Fetch the inquiry
    const inquiry = await storage.getInquiry(inquiryId);
    if (!inquiry || !inquiry.valuationResult) {
      console.error(`Cannot refine valuation: Inquiry ${inquiryId} not found or has no valuation result`);
      return false;
    }
    
    // Extract car details from the inquiry
    const { make, model, year } = inquiry.valuationResult as any;
    if (!make || !model || !year) {
      console.error(`Cannot refine valuation: Missing car details for inquiry ${inquiryId}`);
      return false;
    }
    
    // Get latest market data
    const marketData = await getMarketData(make, model, year);
    if (!marketData) {
      console.log(`No market data available for ${make} ${model} ${year}`);
      return false;
    }
    
    // Calculate the refined valuation
    const currentValuation = (inquiry.valuationResult as any).marketValue || 0;
    const marketTrend = marketData.trend;
    const refinedValuation = Math.round(currentValuation * (1 + marketTrend / 100));
    
    // Update the valuation result with new data
    const updatedValuationResult = {
      ...(inquiry.valuationResult as any),
      marketValue: refinedValuation,
      marketInsights: {
        ...(inquiry.valuationResult as any).marketInsights || {},
        historicalTrendPercentage: marketTrend,
        lastUpdated: new Date().toISOString()
      },
      refinementHistory: [
        ...((inquiry.valuationResult as any).refinementHistory || []),
        {
          date: new Date().toISOString(),
          previousValue: currentValuation,
          newValue: refinedValuation,
          marketTrend: marketTrend
        }
      ]
    };
    
    // Update the inquiry in the database
    await storage.updateInquiry(inquiryId, {
      valuationResult: updatedValuationResult
    });
    
    console.log(`Valuation refined for inquiry ${inquiryId}: ${currentValuation} → ${refinedValuation} (${marketTrend > 0 ? '+' : ''}${marketTrend}%)`);
    return true;
  } catch (error) {
    console.error('Error refining valuation:', error);
    return false;
  }
};

/**
 * Scans for valuations that need refinement and updates them
 */
export const scheduleValuationRefinements = async (): Promise<void> => {
  try {
    // Find completed inquiries with valuations older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // This would typically be a database query to find inquiries needing updates
    // Here we're just getting all inquiries and filtering them in memory
    const allInquiries = await storage.getAllInquiries();
    
    // Filter inquiries that need refinement
    const inquiriesNeedingRefinement = allInquiries.filter(inquiry => {
      if (!inquiry.valuationResult) return false;
      
      const lastUpdated = (inquiry.valuationResult as any).marketInsights?.lastUpdated;
      if (!lastUpdated) return true; // Never updated
      
      // Check if it's been more than 7 days since the last update
      return new Date(lastUpdated) < sevenDaysAgo;
    });
    
    console.log(`Found ${inquiriesNeedingRefinement.length} inquiries needing valuation refinement`);
    
    // Process each inquiry
    for (const inquiry of inquiriesNeedingRefinement) {
      await refineValuation(inquiry.id);
    }
    
    console.log('Valuation refinement process completed');
  } catch (error) {
    console.error('Error scheduling valuation refinements:', error);
  }
};

// Function to manually trigger the refinement process
export const manuallyRefineAllValuations = async (): Promise<{
  total: number,
  refined: number,
  failed: number
}> => {
  try {
    const allInquiries = await storage.getAllInquiries();
    const completedInquiries = allInquiries.filter(inquiry => 
      inquiry.status === 'completed' && inquiry.valuationResult
    );
    
    console.log(`Found ${completedInquiries.length} completed inquiries with valuations`);
    
    let refined = 0;
    let failed = 0;
    
    for (const inquiry of completedInquiries) {
      const success = await refineValuation(inquiry.id);
      if (success) {
        refined++;
      } else {
        failed++;
      }
    }
    
    return {
      total: completedInquiries.length,
      refined,
      failed
    };
  } catch (error) {
    console.error('Error in manual refinement process:', error);
    return { total: 0, refined: 0, failed: 0 };
  }
};