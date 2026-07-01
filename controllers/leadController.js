import Lead from "../models/Lead.js";
import Package from "../models/Package.js";
import rateLimit from "express-rate-limit";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";

// Rate limit lead submissions to 5 per minute per IP
export const leadSubmitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  keyGenerator: (req) =>
    req.headers["x-forwarded-for"] || req.ip || "unknown",
  message: {
    success: false,
    error: {
      message: "Too many submissions from this IP. Please wait a minute and try again.",
      code: "RATE_LIMITED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const submitLead = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      alternatePhone,
      city,
      company,
      packageId,
      groupSize,
      preferredDate,
      message,
      source,
    } = req.body;

    if (!name || name.trim().length < 1) {
      return errorResponse(res, "Name is required.", "VALIDATION_ERROR", 400);
    }
    if (!phone || phone.trim().length < 10) {
      return errorResponse(res, "A valid phone number (min 10 digits) is required.", "VALIDATION_ERROR", 400);
    }

    if (packageId) {
      const pkg = await Package.findOne({ _id: packageId, deletedAt: null });
      if (!pkg) {
        return errorResponse(
          res,
          "The selected package was not found. Please refresh and try again.",
          "NOT_FOUND",
          404
        );
      }
    }

    const lead = await Lead.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.toLowerCase().trim() || null,
      alternatePhone: alternatePhone?.trim() || null,
      city: city?.trim() || null,
      company: company?.trim() || null,
      packageId: packageId || null,
      groupSize: groupSize ? Number(groupSize) : null,
      preferredDate: preferredDate || null,
      message: message?.trim() || null,
      source: source || "WEBSITE_FORM",
    });

    return successResponse(
      res,
      {
        id: lead._id,
        name: lead.name,
        createdAt: lead.createdAt,
        message: "Thank you! Our team will contact you shortly.",
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const {
      search,
      status,
      source,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (source) filter.source = source;

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const allowedSortColumns = ["createdAt", "name", "status"];
    const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ [safeSort]: safeSortOrder })
        .skip(skip)
        .limit(limit)
        .populate("packageId", "id title slug"),
      Lead.countDocuments(filter),
    ]);

    const items = leads.map((lead) => {
      const obj = lead.toObject();
      return {
        ...obj,
        package: obj.packageId,
        packageId: obj.packageId?._id || obj.packageId,
      };
    });

    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const allowedStatuses = ["NEW", "CONTACTED", "CONFIRMED", "REJECTED"];
    if (status && !allowedStatuses.includes(status)) {
      return errorResponse(
        res,
        `Invalid status. Must be one of: ${allowedStatuses.join(", ")}.`,
        "VALIDATION_ERROR",
        400
      );
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return errorResponse(res, "Lead not found.", "NOT_FOUND", 404);
    }

    if (status) lead.status = status;
    if (adminNotes !== undefined) lead.adminNotes = adminNotes;

    await lead.save();

    const populated = await lead.populate("packageId", "id title slug");
    return successResponse(res, populated);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      return errorResponse(res, "Lead not found.", "NOT_FOUND", 404);
    }

    return successResponse(res, { message: "Lead deleted successfully." });
  } catch (error) {
    next(error);
  }
};
