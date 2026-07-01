import Package from "../models/Package.js";
import Destination from "../models/Destination.js";
import ItineraryDay from "../models/ItineraryDay.js";
import PackageReview from "../models/PackageReview.js";
import PackageVideoTestimonial from "../models/PackageVideoTestimonial.js";
import FAQ from "../models/FAQ.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { generateUniqueSlug } from "../utils/slugify.js";
import { parsePagination } from "../utils/pagination.js";
import { getOptimizedImageUrl, getOptimizedVideoUrl } from "../config/cloudinary.js";

export const getPublicPackages = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const {
      destination: destinationSlug,
      groupType,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      featured,
      sort = "latest",
      search,
    } = req.query;

    const filter = { status: "PUBLISHED", deletedAt: null };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    if (destinationSlug) {
      const dest = await Destination.findOne({ slug: destinationSlug, deletedAt: null });
      if (dest) filter.destinationId = dest._id;
      else filter.destinationId = null;
    }

    if (groupType) filter.groupType = groupType;
    if (featured === "true") filter.isFeatured = true;

    if (minPrice || maxPrice) {
      filter.priceOriginal = {};
      if (minPrice) filter.priceOriginal.$gte = parseFloat(minPrice);
      if (maxPrice) filter.priceOriginal.$lte = parseFloat(maxPrice);
    }

    if (minDuration || maxDuration) {
      filter.durationDays = {};
      if (minDuration) filter.durationDays.$gte = parseInt(minDuration);
      if (maxDuration) filter.durationDays.$lte = parseInt(maxDuration);
    }

    const sortMap = {
      price_asc: { priceOriginal: 1 },
      price_desc: { priceOriginal: -1 },
      duration_asc: { durationDays: 1 },
      duration_desc: { durationDays: -1 },
      latest: { createdAt: -1 },
    };
    const sortOrder = sortMap[sort] || { createdAt: -1 };

    const [packages, total] = await Promise.all([
      Package.find(filter)
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .populate("destinationId", "id name slug")
        .select(
          "title slug summary coverImage durationDays durationNights priceOriginal priceDiscounted groupType isFeatured startDate maxGroupSize currentBookings destinationId"
        ),
      Package.countDocuments(filter),
    ]);

    const pkgIds = packages.map((p) => p._id);
    const reviewCounts = await PackageReview.aggregate([
      { $match: { packageId: { $in: pkgIds }, isApproved: true } },
      { $group: { _id: "$packageId", count: { $sum: 1 } } },
    ]);
    const reviewMap = {};
    reviewCounts.forEach((r) => { reviewMap[r._id.toString()] = r.count; });

    const items = packages.map((pkg) => {
      const obj = pkg.toObject();
      return {
        ...obj,
        destination: obj.destinationId,
        destinationId: obj.destinationId?._id,
        coverImage: obj.coverImage ? getOptimizedImageUrl(obj.coverImage, 600) : null,
        _count: { reviews: reviewMap[obj._id.toString()] || 0 },
      };
    });

    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getPublicPackageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const pkg = await Package.findOne({ slug, status: "PUBLISHED", deletedAt: null })
      .populate("destinationId", "id name slug coverImage description");

    if (!pkg) {
      return errorResponse(res, "Package not found.", "NOT_FOUND", 404);
    }

    const [itinerary, reviews, testimonials, faqs] = await Promise.all([
      ItineraryDay.find({ packageId: pkg._id }).sort({ sortOrder: 1, dayNumber: 1 }),
      PackageReview.find({ packageId: pkg._id, isApproved: true }).sort({ createdAt: -1 }),
      PackageVideoTestimonial.find({ packageId: pkg._id }).sort({ sortOrder: 1 }),
      FAQ.find({ packageId: pkg._id }).sort({ sortOrder: 1 }),
    ]);

    const pkgObj = pkg.toObject();
    const dest = pkgObj.destinationId;

    const result = {
      ...pkgObj,
      destination: dest
        ? {
            ...dest,
            coverImage: dest.coverImage ? getOptimizedImageUrl(dest.coverImage, 600) : null,
          }
        : null,
      destinationId: dest?._id,
      coverImage: pkgObj.coverImage ? getOptimizedImageUrl(pkgObj.coverImage, 1200) : null,
      galleryImages: (pkgObj.galleryImages || []).map((url) =>
        getOptimizedImageUrl(url, 800)
      ),
      itinerary: itinerary.map((day) => ({
        ...day.toObject(),
        images: (day.images || []).map((url) => getOptimizedImageUrl(url, 800)),
      })),
      reviews: reviews.map((review) => ({
        ...review.toObject(),
        reviewImages: (review.reviewImages || []).map((url) =>
          getOptimizedImageUrl(url, 400)
        ),
      })),
      testimonials: testimonials.map((t) => ({
        ...t.toObject(),
        videoUrl: getOptimizedVideoUrl(t.videoUrl),
        thumbnail: t.thumbnail ? getOptimizedImageUrl(t.thumbnail, 400) : null,
      })),
      faqs: faqs.map((f) => f.toObject()),
      reviewCount: reviews.length,
      averageRating:
        reviews.length > 0
          ? Math.round(
              (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
            ) / 10
          : null,
      spotsLeft:
        pkgObj.maxGroupSize
          ? pkgObj.maxGroupSize - pkgObj.currentBookings
          : null,
    };

    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getAdminPackages = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status, destinationId, groupType } = req.query;

    const filter = { deletedAt: null };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;
    if (destinationId) filter.destinationId = destinationId;
    if (groupType) filter.groupType = groupType;

    const [packages, total] = await Promise.all([
      Package.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("destinationId", "id name slug"),
      Package.countDocuments(filter),
    ]);

    const pkgIds = packages.map((p) => p._id);
    const [itiCounts, reviewCounts, testimonialCounts, faqCounts] = await Promise.all([
      ItineraryDay.aggregate([
        { $match: { packageId: { $in: pkgIds } } },
        { $group: { _id: "$packageId", count: { $sum: 1 } } },
      ]),
      PackageReview.aggregate([
        { $match: { packageId: { $in: pkgIds } } },
        { $group: { _id: "$packageId", count: { $sum: 1 } } },
      ]),
      PackageVideoTestimonial.aggregate([
        { $match: { packageId: { $in: pkgIds } } },
        { $group: { _id: "$packageId", count: { $sum: 1 } } },
      ]),
      FAQ.aggregate([
        { $match: { packageId: { $in: pkgIds } } },
        { $group: { _id: "$packageId", count: { $sum: 1 } } },
      ]),
    ]);

    const makeMap = (arr) => {
      const m = {};
      arr.forEach((x) => { m[x._id.toString()] = x.count; });
      return m;
    };
    const itiMap = makeMap(itiCounts);
    const revMap = makeMap(reviewCounts);
    const testMap = makeMap(testimonialCounts);
    const faqMap = makeMap(faqCounts);

    const items = packages.map((pkg) => {
      const obj = pkg.toObject();
      return {
        ...obj,
        destination: obj.destinationId,
        destinationId: obj.destinationId?._id,
        _count: {
          itinerary: itiMap[obj._id.toString()] || 0,
          reviews: revMap[obj._id.toString()] || 0,
          testimonials: testMap[obj._id.toString()] || 0,
          faqs: faqMap[obj._id.toString()] || 0,
        },
      };
    });

    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getAdminPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findOne({ _id: id, deletedAt: null })
      .populate("destinationId", "id name slug");

    if (!pkg) {
      return errorResponse(res, "Package not found.", "NOT_FOUND", 404);
    }

    const [itinerary, reviews, testimonials, faqs] = await Promise.all([
      ItineraryDay.find({ packageId: id }).sort({ sortOrder: 1 }),
      PackageReview.find({ packageId: id }).sort({ createdAt: -1 }),
      PackageVideoTestimonial.find({ packageId: id }).sort({ sortOrder: 1 }),
      FAQ.find({ packageId: id }).sort({ sortOrder: 1 }),
    ]);

    const pkgObj = pkg.toObject();

    return successResponse(res, {
      ...pkgObj,
      destination: pkgObj.destinationId,
      destinationId: pkgObj.destinationId?._id,
      itinerary,
      reviews,
      testimonials,
      faqs,
    });
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req, res, next) => {
  try {
    const {
      title,
      destinationId,
      summary,
      description,
      durationDays,
      durationNights,
      priceOriginal,
      priceDiscounted,
      pdfUrl,
      coverImage,
      galleryImages,
      inclusions,
      exclusions,
      notes,
      status,
      groupType,
      isFeatured,
      startDate,
      endDate,
      maxGroupSize,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!title) return errorResponse(res, "Package title is required.", "VALIDATION_ERROR", 400);
    if (!destinationId) return errorResponse(res, "Destination is required.", "VALIDATION_ERROR", 400);
    if (!durationDays) return errorResponse(res, "Duration (days) is required.", "VALIDATION_ERROR", 400);
    if (!priceOriginal) return errorResponse(res, "Original price is required.", "VALIDATION_ERROR", 400);

    const destination = await Destination.findOne({ _id: destinationId, deletedAt: null });
    if (!destination) {
      return errorResponse(res, "Destination not found. Please select a valid destination.", "NOT_FOUND", 404);
    }

    const slug = await generateUniqueSlug(title, async (s) => {
      const existing = await Package.findOne({ slug: s });
      return existing !== null;
    });

    const pkg = await Package.create({
      title: title.trim(),
      slug,
      destinationId,
      summary: summary || null,
      description: description || null,
      durationDays: Number(durationDays),
      durationNights: Number(durationNights || 0),
      priceOriginal: Number(priceOriginal),
      priceDiscounted: priceDiscounted ? Number(priceDiscounted) : null,
      pdfUrl: pdfUrl || null,
      coverImage: coverImage || null,
      galleryImages: galleryImages || [],
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      notes: notes || null,
      status: status || "DRAFT",
      groupType: groupType || "SOLO_GROUP",
      isFeatured: isFeatured === true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      maxGroupSize: maxGroupSize ? Number(maxGroupSize) : null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    });

    const populated = await pkg.populate("destinationId", "id name slug");
    return successResponse(res, populated, 201);
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const pkg = await Package.findOne({ _id: id, deletedAt: null });
    if (!pkg) {
      return errorResponse(res, "Package not found.", "NOT_FOUND", 404);
    }

    if (updates.title && updates.title !== pkg.title) {
      updates.slug = await generateUniqueSlug(updates.title, async (s) => {
        const found = await Package.findOne({ slug: s });
        return found !== null && found._id.toString() !== id;
      });
    }

    if (updates.startDate !== undefined) {
      updates.startDate = updates.startDate ? new Date(updates.startDate) : null;
    }
    if (updates.endDate !== undefined) {
      updates.endDate = updates.endDate ? new Date(updates.endDate) : null;
    }

    Object.assign(pkg, updates);
    await pkg.save();

    const populated = await pkg.populate("destinationId", "id name slug");
    return successResponse(res, populated);
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findOne({ _id: id, deletedAt: null });
    if (!pkg) {
      return errorResponse(res, "Package not found.", "NOT_FOUND", 404);
    }

    pkg.deletedAt = new Date();
    await pkg.save();

    return successResponse(res, { message: "Package deleted successfully." });
  } catch (error) {
    next(error);
  }
};
