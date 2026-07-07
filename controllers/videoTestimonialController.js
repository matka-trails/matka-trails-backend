import VideoTestimonial from "../models/VideoTestimonial.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";
import { getOptimizedVideoUrl, getOptimizedImageUrl } from "../config/cloudinary.js";

export const getPublicTestimonials = async (req, res, next) => {
  try {
    const { destinationId } = req.query;
    const filter = {};
    if (destinationId) filter.destinationId = destinationId;

    const items = await VideoTestimonial.find(filter).sort({ sortOrder: 1, createdAt: -1 });

    const optimized = items.map((item) => ({
      ...item.toObject(),
      videoUrl: getOptimizedVideoUrl(item.videoUrl),
      thumbnail: item.thumbnail ? getOptimizedImageUrl(item.thumbnail, 400) : null,
    }));

    return successResponse(res, optimized);
  } catch (error) {
    next(error);
  }
};

export const getAdminTestimonials = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { destinationId } = req.query;
    const filter = {};
    if (destinationId) filter.destinationId = destinationId;

    const [items, total] = await Promise.all([
      VideoTestimonial.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      VideoTestimonial.countDocuments(filter),
    ]);

    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const { videoUrl, title, thumbnail, sortOrder, destinationId } = req.body;

    if (!videoUrl || !title) {
      return errorResponse(res, "videoUrl and title are required.", "VALIDATION_ERROR", 400);
    }

    const testimonial = await VideoTestimonial.create({
      videoUrl,
      title: title.trim(),
      thumbnail: thumbnail || null,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      destinationId: destinationId || null,
    });

    return successResponse(res, testimonial, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const testimonial = await VideoTestimonial.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!testimonial) {
      return errorResponse(res, "Testimonial not found.", "NOT_FOUND", 404);
    }

    return successResponse(res, testimonial);
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const testimonial = await VideoTestimonial.findByIdAndDelete(id);
    if (!testimonial) {
      return errorResponse(res, "Testimonial not found.", "NOT_FOUND", 404);
    }

    return successResponse(res, { message: "Testimonial deleted." });
  } catch (error) {
    next(error);
  }
};
