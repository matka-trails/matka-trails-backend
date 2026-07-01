import ItineraryDay from "../models/ItineraryDay.js";
import Package from "../models/Package.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getItinerary = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const days = await ItineraryDay.find({ packageId }).sort({ sortOrder: 1, dayNumber: 1 });
    return successResponse(res, days);
  } catch (error) {
    next(error);
  }
};

export const addItineraryDay = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const { dayNumber, title, description, images, sortOrder } = req.body;

    if (!dayNumber || !title) {
      return errorResponse(res, "dayNumber and title are required.", "VALIDATION_ERROR", 400);
    }

    const pkg = await Package.findOne({ _id: packageId, deletedAt: null });
    if (!pkg) {
      return errorResponse(res, "Package not found.", "NOT_FOUND", 404);
    }

    const day = await ItineraryDay.create({
      packageId,
      dayNumber: Number(dayNumber),
      title: title.trim(),
      description: description || null,
      images: images || [],
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
    });

    return successResponse(res, day, 201);
  } catch (error) {
    next(error);
  }
};

export const updateItineraryDay = async (req, res, next) => {
  try {
    const { packageId, dayId } = req.params;
    const updates = req.body;

    const day = await ItineraryDay.findOne({ _id: dayId, packageId });
    if (!day) {
      return errorResponse(res, "Itinerary day not found.", "NOT_FOUND", 404);
    }

    Object.assign(day, updates);
    await day.save();

    return successResponse(res, day);
  } catch (error) {
    next(error);
  }
};

export const deleteItineraryDay = async (req, res, next) => {
  try {
    const { packageId, dayId } = req.params;

    const day = await ItineraryDay.findOneAndDelete({ _id: dayId, packageId });
    if (!day) {
      return errorResponse(res, "Itinerary day not found.", "NOT_FOUND", 404);
    }

    return successResponse(res, { message: "Itinerary day deleted." });
  } catch (error) {
    next(error);
  }
};

export const bulkReplaceItinerary = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const { days } = req.body;

    if (!Array.isArray(days)) {
      return errorResponse(res, "days must be an array.", "VALIDATION_ERROR", 400);
    }

    const pkg = await Package.findOne({ _id: packageId, deletedAt: null });
    if (!pkg) {
      return errorResponse(res, "Package not found.", "NOT_FOUND", 404);
    }

    await ItineraryDay.deleteMany({ packageId });

    const newDays = await ItineraryDay.insertMany(
      days.map((d, idx) => ({
        packageId,
        dayNumber: Number(d.dayNumber || idx + 1),
        title: d.title?.trim() || `Day ${idx + 1}`,
        description: d.description || null,
        images: d.images || [],
        sortOrder: d.sortOrder !== undefined ? Number(d.sortOrder) : idx,
      }))
    );

    return successResponse(res, newDays);
  } catch (error) {
    next(error);
  }
};
