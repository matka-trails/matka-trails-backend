import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Access denied. Please log in to continue.",
        code: "NO_TOKEN",
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select(
      "_id name email role avatar"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Admin account not found. Please log in again.",
          code: "ADMIN_NOT_FOUND",
        },
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
        },
      });
    }
    next();
  };
};
