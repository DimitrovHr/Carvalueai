import { 
  User, InsertUser, 
  CarInquiry, InsertCarInquiry,
  AdminSettings, InsertAdminSettings,
  users, carInquiries, adminSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Interface for storage
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Car inquiry methods
  getInquiry(id: number): Promise<CarInquiry | undefined>;
  getAllInquiries(): Promise<CarInquiry[]>;
  createInquiry(inquiry: Partial<InsertCarInquiry> & { userId?: number | null, trialPeriod?: boolean }): Promise<CarInquiry>;
  updateInquiry(id: number, data: Partial<CarInquiry>): Promise<CarInquiry>;
  
  // Admin settings methods
  getAdminSettings(): Promise<AdminSettings | undefined>;
  saveAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true
    });
    
    // Add default admin user and settings during initialization
    this.initialize();
  }
  
  private async initialize() {
    try {
      // Initialize admin user if it doesn't exist
      const adminExists = await this.getUserByUsername("admin");
      if (!adminExists) {
        console.log("Creating default admin user...");
        await this.createUser({
          username: "admin",
          password: "admin123", // In a production app, use hashed passwords
          email: "admin@carvalueai.com",
          isAdmin: true
        });
      }
      
      // Initialize admin settings if they don't exist
      const settings = await this.getAdminSettings();
      if (!settings) {
        console.log("Creating default admin settings...");
        await this.saveAdminSettings({
          notificationEmail: "admin@carvalueai.com",
          apiSettings: {
            model: "car-valuation-v2",
            confidence_threshold: 0.85,
            market: "bulgarian",
            data_sources: ["auto.bg", "mobile.bg", "cars.bg"]
          },
          trialPeriodEnabled: true,
          trialPeriodCount: 50,
          trialPeriodUsed: 0
        });
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values({
        ...insertUser,
        createdAt: new Date()
      }).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Car inquiry methods
  async getInquiry(id: number): Promise<CarInquiry | undefined> {
    try {
      const [inquiry] = await db.select().from(carInquiries).where(eq(carInquiries.id, id));
      return inquiry;
    } catch (error) {
      console.error("Error getting inquiry:", error);
      return undefined;
    }
  }

  async getAllInquiries(): Promise<CarInquiry[]> {
    try {
      return await db.select()
        .from(carInquiries)
        .orderBy(desc(carInquiries.createdAt));
    } catch (error) {
      console.error("Error getting all inquiries:", error);
      return [];
    }
  }

  async createInquiry(inquiry: Partial<InsertCarInquiry> & { userId?: number | null, trialPeriod?: boolean }): Promise<CarInquiry> {
    try {
      const [newInquiry] = await db.insert(carInquiries).values({
        vin: inquiry.vin || '',
        mileage: inquiry.mileage || 0,
        fuelType: inquiry.fuelType || 'petrol',
        transmission: inquiry.transmission || 'manual',
        visibleDamages: inquiry.visibleDamages || null,
        mechanicalDamages: inquiry.mechanicalDamages || null,
        additionalInfo: inquiry.additionalInfo || null,
        status: inquiry.status || 'pending',
        planType: inquiry.planType || 'regular',
        userId: inquiry.userId || null,
        createdAt: new Date(),
        trialPeriod: inquiry.trialPeriod || false
      }).returning();
      
      return newInquiry;
    } catch (error) {
      console.error("Error creating inquiry:", error);
      throw error;
    }
  }

  async updateInquiry(id: number, data: Partial<CarInquiry>): Promise<CarInquiry> {
    try {
      const [updatedInquiry] = await db.update(carInquiries)
        .set(data)
        .where(eq(carInquiries.id, id))
        .returning();
      
      if (!updatedInquiry) {
        throw new Error(`Inquiry with ID ${id} not found`);
      }
      
      return updatedInquiry;
    } catch (error) {
      console.error("Error updating inquiry:", error);
      throw error;
    }
  }

  // Admin settings methods
  async getAdminSettings(): Promise<AdminSettings | undefined> {
    try {
      const [settings] = await db.select().from(adminSettings);
      return settings;
    } catch (error) {
      console.error("Error getting admin settings:", error);
      return undefined;
    }
  }

  async saveAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings> {
    try {
      // Check if settings exist
      const existingSettings = await this.getAdminSettings();
      
      if (existingSettings) {
        // Update existing settings
        const [updatedSettings] = await db.update(adminSettings)
          .set({
            ...settings,
            updatedAt: new Date()
          })
          .where(eq(adminSettings.id, existingSettings.id))
          .returning();
        
        return updatedSettings;
      } else {
        // Create new settings
        const [newSettings] = await db.insert(adminSettings)
          .values({
            notificationEmail: settings.notificationEmail || '',
            apiSettings: settings.apiSettings || null,
            trialPeriodEnabled: settings.trialPeriodEnabled ?? false,
            trialPeriodCount: settings.trialPeriodCount ?? 50,
            trialPeriodUsed: settings.trialPeriodUsed ?? 0,
            updatedAt: new Date()
          })
          .returning();
        
        return newSettings;
      }
    } catch (error) {
      console.error("Error saving admin settings:", error);
      throw error;
    }
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
