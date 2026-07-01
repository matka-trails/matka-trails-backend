import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";

import authRoutes from "./routes/auth.js";
import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";

connectDB();

const app = express();

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const globalLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || "15") * 60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "300"),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: "Too many requests. Please slow down and try again later.",
      code: "RATE_LIMITED",
    },
  },
});
app.use(globalLimiter);

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || "5001", 10);

const server = app.listen(PORT, () => {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log(`║  🏔  Matka Trails Backend                         ║`);
  console.log(`║  🚀  Server running on port ${PORT}                  ║`);
  console.log(`║  🌍  Environment: ${(process.env.NODE_ENV || "development").padEnd(30)}║`);
  console.log(`║  💚  Health: http://localhost:${PORT}/health          ║`);
  console.log("╚══════════════════════════════════════════════════╝\n");
});

process.on("unhandledRejection", (err) => {
  console.error("[UnhandledRejection]", err.message || err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("[UncaughtException]", err.message || err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

export default app;
