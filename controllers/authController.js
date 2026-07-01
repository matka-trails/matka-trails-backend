import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { successResponse, errorResponse } from "../utils/response.js";

function generateToken(adminId) {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required.", "VALIDATION_ERROR", 400);
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordHash"
    );

    if (!admin) {
      return errorResponse(res, "Invalid email or password.", "INVALID_CREDENTIALS", 401);
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password.", "INVALID_CREDENTIALS", 401);
    }

    const token = generateToken(admin._id);

    return successResponse(res, {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
      avatar: req.admin.avatar,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return successResponse(res, {
      message: "Logged out successfully. Please clear your local token.",
    });
  } catch (error) {
    next(error);
  }
};
