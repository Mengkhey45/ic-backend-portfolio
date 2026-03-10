import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User.js";

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || "mengkheykhorn8@gmail.com";
    const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingUser) {
      console.log(`Admin user already exists: ${existingUser.email}`);
      await mongoose.disconnect();
      return;
    }

    const password = process.env.ADMIN_SEED_PASSWORD || "134679";

    const user = await User.create({ email: adminEmail, password, name: "Admin" });
    console.log(`\nAdmin user created successfully!`);
    console.log(`Email: ${user.email}`);
    console.log(`Password: Admin@123`);
    console.log(`\nPlease change the password after first login.`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
