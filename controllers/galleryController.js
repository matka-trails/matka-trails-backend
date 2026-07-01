import GalleryItem from "../models/GalleryItem.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";
import { getOptimizedImageUrl } from "../config/cloudinary.js";

export const getPublicGallery = async (req, res, next) => {
  try {
    const items = await GalleryItem.find().sort({ sortOrder: 1, createdAt: -1 });

    const optimized = items.map((item) => ({
      ...item.toObject(),
      imageUrl: getOptimizedImageUrl(item.imageUrl, 800),
    }));

    return successResponse(res, optimized);
  } catch (error) {
    next(error);
  }
};

export const getAdminGallery = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [items, total] = await Promise.all([
      GalleryItem.find().sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      GalleryItem.countDocuments(),
    ]);

    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const createGalleryItem = async (req, res, next) => {
  try {
    const { imageUrl, placeName, caption, sortOrder } = req.body;

    if (!imageUrl || !placeName) {
      return errorResponse(res, "imageUrl and placeName are required.", "VALIDATION_ERROR", 400);
    }

    const item = await GalleryItem.create({
      imageUrl,
      placeName: placeName.trim(),
      caption: caption || null,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
    });

    return successResponse(res, item, 201);
  } catch (error) {
    next(error);
  }
};

export const updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await GalleryItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return errorResponse(res, "Gallery item not found.", "NOT_FOUND", 404);
    }

    return successResponse(res, item);
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await GalleryItem.findByIdAndDelete(id);
    if (!item) {
      return errorResponse(res, "Gallery item not found.", "NOT_FOUND", 404);
    }

    return successResponse(res, { message: "Gallery item deleted." });
  } catch (error) {
    next(error);
  }
};
