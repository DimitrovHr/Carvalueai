import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

// Car inquiry schema for storing user submissions
export const carInquiries = pgTable("car_inquiries", {
  id: serial("id").primaryKey(),
  vin: varchar("vin", { length: 17 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  carType: varchar("car_type", { length: 50 }).notNull(),
  mileage: integer("mileage").notNull(),
  fuelType: varchar("fuel_type", { length: 20 }).notNull(),
  transmission: varchar("transmission", { length: 20 }).notNull(),
  visibleDamages: text("visible_damages"),
  mechanicalDamages: text("mechanical_damages"),
  additionalInfo: text("additional_info"),
  createdAt: timestamp("created_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("pending"),
  planType: varchar("plan_type", { length: 10 }).notNull(),
  valuationResult: jsonb("valuation_result"),
  userId: integer("user_id").references(() => users.id),
  paymentId: varchar("payment_id", { length: 100 }),
  paymentCompleted: boolean("payment_completed").default(false),
  paymentAmount: real("payment_amount"),
  paymentMethod: varchar("payment_method", { length: 20 }),
  trialPeriod: boolean("trial_period").default(false),
});

export const insertCarInquirySchema = createInsertSchema(carInquiries).omit({
  id: true,
  createdAt: true,
  valuationResult: true,
  userId: true,
  paymentId: true,
  paymentCompleted: true,
});

// Admin settings schema
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  notificationEmail: text("notification_email").notNull(),
  apiSettings: jsonb("api_settings"),
  trialPeriodEnabled: boolean("trial_period_enabled").default(false),
  trialPeriodCount: integer("trial_period_count").default(50),
  trialPeriodUsed: integer("trial_period_used").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CarInquiry = typeof carInquiries.$inferSelect;
export type InsertCarInquiry = z.infer<typeof insertCarInquirySchema>;

export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;

// Validation schemas for forms
export const carDetailsSchema = z.object({
  vin: z.string().length(17, "VIN must be exactly 17 characters").nonempty("VIN is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1990, "Year must be 1990 or later").max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  carType: z.enum(["sedan", "hatchback", "wagon", "suv", "coupe", "convertible", "pickup", "van", "minivan"], {
    errorMap: () => ({ message: "Please select a car type" }),
  }),
  mileage: z.number().min(1, "Mileage must be greater than 0").max(1000000, "Mileage too high"),
  fuelType: z.enum(["petrol", "diesel", "electric", "hybrid", "lpg"], {
    errorMap: () => ({ message: "Please select a fuel type" }),
  }),
  transmission: z.enum(["manual", "automatic", "semi-automatic"], {
    errorMap: () => ({ message: "Please select a transmission type" }),
  }),
  visibleDamages: z.string().optional(),
  mechanicalDamages: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export const paymentSchema = z.object({
  planType: z.enum(["regular", "premium", "business"]),
  paymentMethod: z.enum(["paypal", "revolut"]),
  amount: z.number().positive(),
});

export const adminSettingsFormSchema = z.object({
  notificationEmail: z.string().email("Please enter a valid email"),
  apiSettings: z.string().optional(),
});
