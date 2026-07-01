import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

async function run() {
  await connectDB();
  console.log("Connected to MongoDB.");

  const email = "anuj@matkatrails.com";
  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log("Admin already exists. Updating password...");
    existing.passwordHash = await bcrypt.hash("123456", 10);
    existing.name = "Anuj";
    await existing.save();
    console.log("Admin updated.");
  } else {
    const passwordHash = await bcrypt.hash("123456", 10);
    await Admin.create({
      name: "Anuj",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
    });
    console.log("Admin created.");
  }

  await mongoose.disconnect();
  console.log("Disconnected.");
}

run().catch(console.error);
