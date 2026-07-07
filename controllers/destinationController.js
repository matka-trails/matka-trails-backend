import Destination from "../models/Destination.js";
import Package from "../models/Package.js";
import DestinationGallery from "../models/DestinationGallery.js";
import FAQ from "../models/FAQ.js";
import VideoTestimonial from "../models/VideoTestimonial.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { generateUniqueSlug } from "../utils/slugify.js";
import { parsePagination } from "../utils/pagination.js";
import { getOptimizedImageUrl, getOptimizedVideoUrl } from "../config/cloudinary.js";

export const getPublicDestinations = async (req, res, next) => {
  try {
    const { featured } = req.query;
    const filter = { deletedAt: null };
    if (featured === "true") filter.isFeatured = true;

    const destinations = await Destination.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .select("name slug description coverImage isFeatured");

    const destIds = destinations.map((d) => d._id);
    const packageCounts = await Package.aggregate([
      { $match: { destinationId: { $in: destIds }, status: "PUBLISHED", deletedAt: null } },
      { $group: { _id: "$destinationId", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    packageCounts.forEach((p) => { countMap[p._id.toString()] = p.count; });

    const result = destinations.map((dest) => ({
      ...dest.toObject(),
      coverImage: dest.coverImage ? getOptimizedImageUrl(dest.coverImage, 600) : null,
      packageCount: countMap[dest._id.toString()] || 0,
      _count: { packages: countMap[dest._id.toString()] || 0 },
    }));

    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getPublicDestinationBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const destination = await Destination.findOne({ slug, deletedAt: null });
    if (!destination) {
      return errorResponse(res, "Destination not found.", "NOT_FOUND", 404);
    }

    const [gallery, packages, faqs, testimonials] = await Promise.all([
      DestinationGallery.find({ destinationId: destination._id }).sort({ sortOrder: 1 }),
      Package.find({ destinationId: destination._id, status: "PUBLISHED", deletedAt: null })
        .sort({ createdAt: -1 })
        .select("title slug summary coverImage durationDays durationNights priceOriginal priceDiscounted groupType isFeatured startDate maxGroupSize currentBookings"),
      FAQ.find({ destinationId: destination._id }).sort({ sortOrder: 1 }),
      VideoTestimonial.find({ destinationId: destination._id }).sort({ sortOrder: 1 }),
    ]);

    const result = {
      ...destination.toObject(),
      coverImage: destination.coverImage ? getOptimizedImageUrl(destination.coverImage, 1200) : null,
      gallery: gallery.map((img) => ({
        ...img.toObject(),
        imageUrl: getOptimizedImageUrl(img.imageUrl, 800),
      })),
      packages: packages.map((pkg) => ({
        ...pkg.toObject(),
        coverImage: pkg.coverImage ? getOptimizedImageUrl(pkg.coverImage, 600) : null,
      })),
      faqs: faqs.map((f) => f.toObject()),
      testimonials: testimonials.map((t) => ({
        ...t.toObject(),
        videoUrl: getOptimizedVideoUrl(t.videoUrl),
        thumbnail: t.thumbnail ? getOptimizedImageUrl(t.thumbnail, 400) : null,
      })),
    };

    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getAdminDestinations = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search } = req.query;

    const filter = { deletedAt: null };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const [destinations, total] = await Promise.all([
      Destination.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      Destination.countDocuments(filter),
    ]);

    const destIds = destinations.map((d) => d._id);
    const [pkgCounts, galCounts] = await Promise.all([
      Package.aggregate([
        { $match: { destinationId: { $in: destIds }, deletedAt: null } },
        { $group: { _id: "$destinationId", count: { $sum: 1 } } },
      ]),
      DestinationGallery.aggregate([
        { $match: { destinationId: { $in: destIds } } },
        { $group: { _id: "$destinationId", count: { $sum: 1 } } },
      ]),
    ]);

    const pkgMap = {};
    pkgCounts.forEach((p) => { pkgMap[p._id.toString()] = p.count; });
    const galMap = {};
    galCounts.forEach((g) => { galMap[g._id.toString()] = g.count; });

    const items = destinations.map((dest) => ({
      ...dest.toObject(),
      _count: {
        packages: pkgMap[dest._id.toString()] || 0,
        gallery: galMap[dest._id.toString()] || 0,
      },
    }));

    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const createDestination = async (req, res, next) => {
  try {
    const { name, description, coverImage, isFeatured, metaTitle, metaDescription, sortOrder, guidelines, notes } = req.body;

    if (!name || name.trim().length < 1) {
      return errorResponse(res, "Destination name is required.", "VALIDATION_ERROR", 400);
    }

    const slug = await generateUniqueSlug(name, async (s) => {
      const existing = await Destination.findOne({ slug: s });
      return existing !== null;
    });

    const destination = await Destination.create({
      name: name.trim(),
      slug,
      description: description || null,
      coverImage: coverImage || null,
      isFeatured: isFeatured === true,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      guidelines: Array.isArray(guidelines) ? guidelines : [],
      notes: notes || null,
    });

    return successResponse(res, destination, 201);
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const destination = await Destination.findOne({ _id: id, deletedAt: null });
    if (!destination) {
      return errorResponse(res, "Destination not found.", "NOT_FOUND", 404);
    }

    if (updates.name && updates.name !== destination.name) {
      updates.slug = await generateUniqueSlug(updates.name, async (s) => {
        const found = await Destination.findOne({ slug: s });
        return found !== null && found._id.toString() !== id;
      });
    }

    Object.assign(destination, updates);
    await destination.save();

    return successResponse(res, destination);
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findOne({ _id: id, deletedAt: null });
    if (!destination) {
      return errorResponse(res, "Destination not found.", "NOT_FOUND", 404);
    }

    destination.deletedAt = new Date();
    await destination.save();

    return successResponse(res, { message: "Destination deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const getDestinationGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const gallery = await DestinationGallery.find({ destinationId: id }).sort({ sortOrder: 1 });
    return successResponse(res, gallery);
  } catch (error) {
    next(error);
  }
};

export const addDestinationGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageUrl, caption, sortOrder } = req.body;

    if (!imageUrl) {
      return errorResponse(res, "imageUrl is required.", "VALIDATION_ERROR", 400);
    }

    const destination = await Destination.findOne({ _id: id, deletedAt: null });
    if (!destination) {
      return errorResponse(res, "Destination not found.", "NOT_FOUND", 404);
    }

    const image = await DestinationGallery.create({
      destinationId: id,
      imageUrl,
      caption: caption || null,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    });

    return successResponse(res, image, 201);
  } catch (error) {
    next(error);
  }
};

export const removeDestinationGalleryImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    const image = await DestinationGallery.findByIdAndDelete(imageId);
    if (!image) {
      return errorResponse(res, "Gallery image not found.", "NOT_FOUND", 404);
    }
    return successResponse(res, { message: "Gallery image removed." });
  } catch (error) {
    next(error);
  }
};
