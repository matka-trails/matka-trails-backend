import PackageReview from "../models/PackageReview.js";
import Package from "../models/Package.js";
import PackageVideoTestimonial from "../models/PackageVideoTestimonial.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getReviews = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const reviews = await PackageReview.find({ packageId }).sort({ createdAt: -1 });
    return successResponse(res, reviews);
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const { customerName, rating, reviewText, reviewImages, isApproved } = req.body;

    if (!customerName || !rating) {
      return errorResponse(res, "customerName and rating are required.", "VALIDATION_ERROR", 400);
    }
    if (rating < 1 || rating > 5) {
      return errorResponse(res, "Rating must be between 1 and 5.", "VALIDATION_ERROR", 400);
    }

    const pkg = await Package.findOne({ _id: packageId, deletedAt: null });
    if (!pkg) {
      return errorResponse(res, "Package not found.", "NOT_FOUND", 404);
    }

    const review = await PackageReview.create({
      packageId,
      customerName: customerName.trim(),
      rating: Number(rating),
      reviewText: reviewText || null,
      reviewImages: reviewImages || [],
      isApproved: isApproved !== false,
    });

    return successResponse(res, review, 201);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { packageId, reviewId } = req.params;
    const updates = req.body;

    const review = await PackageReview.findOne({ _id: reviewId, packageId });
    if (!review) {
      return errorResponse(res, "Review not found.", "NOT_FOUND", 404);
    }

    Object.assign(review, updates);
    await review.save();

    return successResponse(res, review);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { packageId, reviewId } = req.params;

    const review = await PackageReview.findOneAndDelete({ _id: reviewId, packageId });
    if (!review) {
      return errorResponse(res, "Review not found.", "NOT_FOUND", 404);
    }

    return successResponse(res, { message: "Review deleted." });
  } catch (error) {
    next(error);
  }
};

export const addPackageTestimonial = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const { videoUrl, customerName, thumbnail, sortOrder } = req.body;

    if (!videoUrl || !customerName) {
      return errorResponse(res, "videoUrl and customerName are required.", "VALIDATION_ERROR", 400);
    }

    const pkg = await Package.findOne({ _id: packageId, deletedAt: null });
    if (!pkg) {
      return errorResponse(res, "Package not found.", "NOT_FOUND", 404);
    }

    const testimonial = await PackageVideoTestimonial.create({
      packageId,
      videoUrl,
      customerName: customerName.trim(),
      thumbnail: thumbnail || null,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
    });

    return successResponse(res, testimonial, 201);
  } catch (error) {
    next(error);
  }
};

export const deletePackageTestimonial = async (req, res, next) => {
  try {
    const { packageId, testimonialId } = req.params;
    const testimonial = await PackageVideoTestimonial.findOneAndDelete({ _id: testimonialId, packageId });
    if (!testimonial) {
      return errorResponse(res, "Testimonial not found.", "NOT_FOUND", 404);
    }
    return successResponse(res, { message: "Testimonial deleted." });
  } catch (error) {
    next(error);
  }
};
