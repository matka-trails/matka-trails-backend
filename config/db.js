import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    console.log(`[MongoDB] Database: ${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error("[MongoDB] Connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("[MongoDB] Reconnected successfully.");
    });
  } catch (error) {
    console.error("[MongoDB] Initial connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
