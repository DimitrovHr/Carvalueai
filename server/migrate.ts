import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";

// This will automatically run needed migrations on the database
async function main() {
  console.log("Running database migrations...");
  
  try {
    // This will create all tables based on our schema
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS car_inquiries (
        id SERIAL PRIMARY KEY,
        vin VARCHAR(17) NOT NULL,
        mileage INTEGER NOT NULL,
        fuel_type VARCHAR(20) NOT NULL,
        transmission VARCHAR(20) NOT NULL,
        visible_damages TEXT,
        mechanical_damages TEXT,
        additional_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        plan_type VARCHAR(10) NOT NULL,
        valuation_result JSONB,
        user_id INTEGER REFERENCES users(id),
        payment_id VARCHAR(100),
        payment_completed BOOLEAN DEFAULT FALSE,
        payment_amount REAL,
        payment_method VARCHAR(20),
        trial_period BOOLEAN DEFAULT FALSE
      );
      
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        notification_email TEXT NOT NULL,
        api_settings JSONB,
        trial_period_enabled BOOLEAN DEFAULT FALSE,
        trial_period_count INTEGER DEFAULT 50,
        trial_period_used INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Database migrations completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during database migration:", error);
    process.exit(1);
  }
}

main();