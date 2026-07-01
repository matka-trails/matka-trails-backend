import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse } from "../utils/response.js";

// Get all admin users
export const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find({}, "name email role createdAt").sort({ createdAt: -1 });
    return successResponse(res, admins);
  } catch (error) {
    next(error);
  }
};

// Create a new admin user
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role = "ADMIN" } = req.body;

    if (!name || name.trim().length < 1) {
      return errorResponse(res, "Name is required.", "VALIDATION_ERROR", 400);
    }
    if (!email || !email.includes("@")) {
      return errorResponse(res, "A valid email address is required.", "VALIDATION_ERROR", 400);
    }
    if (!password || password.length < 6) {
      return errorResponse(res, "Password must be at least 6 characters long.", "VALIDATION_ERROR", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: normalizedEmail });
    if (existing) {
      return errorResponse(res, "An admin with this email already exists.", "CONFLICT", 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
    });

    return successResponse(
      res,
      {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};
