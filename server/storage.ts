import { 
  User, InsertUser, 
  CarInquiry, InsertCarInquiry,
  AdminSettings, InsertAdminSettings
} from "@shared/schema";

// Interface for storage
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Car inquiry methods
  getInquiry(id: number): Promise<CarInquiry | undefined>;
  getAllInquiries(): Promise<CarInquiry[]>;
  createInquiry(inquiry: Partial<InsertCarInquiry>): Promise<CarInquiry>;
  updateInquiry(id: number, data: Partial<CarInquiry>): Promise<CarInquiry>;
  
  // Admin settings methods
  getAdminSettings(): Promise<AdminSettings | undefined>;
  saveAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inquiries: Map<number, CarInquiry>;
  private settings: AdminSettings | undefined;
  private userId: number;
  private inquiryId: number;
  private settingsId: number;

  constructor() {
    this.users = new Map();
    this.inquiries = new Map();
    this.userId = 1;
    this.inquiryId = 1;
    this.settingsId = 1;
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a production app, use hashed passwords
      email: "admin@carvalueai.com",
      isAdmin: true
    });
    
    // Initialize with default admin settings
    this.saveAdminSettings({
      notificationEmail: "admin@carvalueai.com",
      apiSettings: {
        model: "car-valuation-v2",
        confidence_threshold: 0.85,
        market: "bulgarian",
        data_sources: ["auto.bg", "mobile.bg", "cars.bg"]
      }
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Car inquiry methods
  async getInquiry(id: number): Promise<CarInquiry | undefined> {
    return this.inquiries.get(id);
  }

  async getAllInquiries(): Promise<CarInquiry[]> {
    return Array.from(this.inquiries.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createInquiry(inquiry: Partial<InsertCarInquiry>): Promise<CarInquiry> {
    const id = this.inquiryId++;
    const now = new Date();
    
    const newInquiry: CarInquiry = {
      id,
      vin: inquiry.vin || '',
      mileage: inquiry.mileage || 0,
      fuelType: inquiry.fuelType || 'petrol',
      transmission: inquiry.transmission || 'manual',
      visibleDamages: inquiry.visibleDamages || null,
      mechanicalDamages: inquiry.mechanicalDamages || null,
      additionalInfo: inquiry.additionalInfo || null,
      createdAt: now,
      status: inquiry.status || 'pending',
      planType: inquiry.planType || 'regular',
      valuationResult: null,
      userId: inquiry.userId || null,
      paymentId: null,
      paymentCompleted: false,
      paymentAmount: null,
      paymentMethod: null
    };
    
    this.inquiries.set(id, newInquiry);
    return newInquiry;
  }

  async updateInquiry(id: number, data: Partial<CarInquiry>): Promise<CarInquiry> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) {
      throw new Error(`Inquiry with ID ${id} not found`);
    }
    
    const updatedInquiry = { ...inquiry, ...data };
    this.inquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }

  // Admin settings methods
  async getAdminSettings(): Promise<AdminSettings | undefined> {
    return this.settings;
  }

  async saveAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings> {
    const now = new Date();
    
    if (this.settings) {
      this.settings = {
        ...this.settings,
        ...settings,
        updatedAt: now
      };
    } else {
      this.settings = {
        id: this.settingsId,
        notificationEmail: settings.notificationEmail || '',
        apiSettings: settings.apiSettings || null,
        updatedAt: now
      };
    }
    
    return this.settings;
  }
}

export const storage = new MemStorage();
