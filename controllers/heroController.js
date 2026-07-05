import HeroConfig from "../models/HeroConfig.js";
import Destination from "../models/Destination.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { getOptimizedImageUrl } from "../config/cloudinary.js";

// ─── Helper: get or create singleton config ──────────────────────────────────
async function getOrCreateConfig() {
  let config = await HeroConfig.findOne();
  if (!config) {
    config = await HeroConfig.create({});
  }
  return config;
}

// ─── Helper: format config for response ──────────────────────────────────────
async function formatConfigForResponse(config, optimizeImages = true) {
  // Populate destination slugs for carousel slides
  const destinationIds = config.mobileCarouselSlides
    .filter((s) => s.destinationId)
    .map((s) => s.destinationId);

  const destinations = destinationIds.length
    ? await Destination.find({ _id: { $in: destinationIds }, deletedAt: null }).select("_id name slug")
    : [];

  const destMap = {};
  destinations.forEach((d) => {
    destMap[d._id.toString()] = { id: d._id, name: d.name, slug: d.slug };
  });

  const obj = config.toObject();

  return {
    ...obj,
    desktopBgImage: optimizeImages && obj.desktopBgImage
      ? getOptimizedImageUrl(obj.desktopBgImage, 1920)
      : obj.desktopBgImage,
    desktopCards: obj.desktopCards.map((card) => ({
      ...card,
      imageUrl: optimizeImages && card.imageUrl
        ? getOptimizedImageUrl(card.imageUrl, 600)
        : card.imageUrl,
    })),
    mobileCarouselSlides: obj.mobileCarouselSlides
      .filter((s) => s.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((slide) => ({
        ...slide,
        imageUrl: optimizeImages && slide.imageUrl
          ? getOptimizedImageUrl(slide.imageUrl, 800)
          : slide.imageUrl,
        destination: slide.destinationId
          ? destMap[slide.destinationId.toString()] || null
          : null,
      })),
  };
}

// ─── PUBLIC: GET /api/public/hero ─────────────────────────────────────────────
export const getPublicHeroConfig = async (req, res, next) => {
  try {
    const config = await getOrCreateConfig();
    const formatted = await formatConfigForResponse(config, true);
    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: GET /api/admin/hero ───────────────────────────────────────────────
export const getAdminHeroConfig = async (req, res, next) => {
  try {
    const config = await getOrCreateConfig();
    // For admin, return all slides (including inactive) without optimization
    const obj = config.toObject();

    const destinationIds = obj.mobileCarouselSlides
      .filter((s) => s.destinationId)
      .map((s) => s.destinationId);

    const destinations = destinationIds.length
      ? await Destination.find({ _id: { $in: destinationIds }, deletedAt: null }).select("_id name slug")
      : [];

    const destMap = {};
    destinations.forEach((d) => { destMap[d._id.toString()] = { id: d._id, name: d.name, slug: d.slug }; });

    const result = {
      ...obj,
      mobileCarouselSlides: obj.mobileCarouselSlides
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((slide) => ({
          ...slide,
          destination: slide.destinationId
            ? destMap[slide.destinationId.toString()] || null
            : null,
        })),
    };

    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: PATCH /api/admin/hero ─────────────────────────────────────────────
// Updates desktop settings (bg image, dynamic words, desktop cards)
export const updateHeroConfig = async (req, res, next) => {
  try {
    const { desktopBgImage, desktopDynamicWords, desktopCards } = req.body;
    const config = await getOrCreateConfig();

    if (desktopBgImage !== undefined) config.desktopBgImage = desktopBgImage || null;
    if (Array.isArray(desktopDynamicWords)) config.desktopDynamicWords = desktopDynamicWords.filter(Boolean);
    if (Array.isArray(desktopCards)) {
      config.desktopCards = desktopCards.map((c, i) => ({
        imageUrl: c.imageUrl,
        destinationName: c.destinationName || null,
        sortOrder: c.sortOrder ?? i,
      }));
    }

    await config.save();
    return successResponse(res, config.toObject());
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: POST /api/admin/hero/slides ──────────────────────────────────────
// Add a carousel slide
export const addHeroSlide = async (req, res, next) => {
  try {
    const { imageUrl, destinationId, sortOrder, isActive } = req.body;

    if (!imageUrl) {
      return errorResponse(res, "imageUrl is required.", "VALIDATION_ERROR", 400);
    }

    const config = await getOrCreateConfig();

    // Validate destinationId if provided
    if (destinationId) {
      const dest = await Destination.findOne({ _id: destinationId, deletedAt: null });
      if (!dest) {
        return errorResponse(res, "Destination not found.", "NOT_FOUND", 404);
      }
    }

    config.mobileCarouselSlides.push({
      imageUrl,
      destinationId: destinationId || null,
      sortOrder: sortOrder ?? config.mobileCarouselSlides.length,
      isActive: isActive !== false,
    });

    await config.save();
    return successResponse(res, config.toObject(), 201);
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: PATCH /api/admin/hero/slides/:slideId ────────────────────────────
// Update a specific carousel slide
export const updateHeroSlide = async (req, res, next) => {
  try {
    const { slideId } = req.params;
    const { imageUrl, destinationId, sortOrder, isActive } = req.body;

    const config = await getOrCreateConfig();
    const slide = config.mobileCarouselSlides.id(slideId);

    if (!slide) {
      return errorResponse(res, "Slide not found.", "NOT_FOUND", 404);
    }

    if (imageUrl !== undefined) slide.imageUrl = imageUrl;
    if (destinationId !== undefined) {
      if (destinationId) {
        const dest = await Destination.findOne({ _id: destinationId, deletedAt: null });
        if (!dest) {
          return errorResponse(res, "Destination not found.", "NOT_FOUND", 404);
        }
      }
      slide.destinationId = destinationId || null;
    }
    if (sortOrder !== undefined) slide.sortOrder = sortOrder;
    if (isActive !== undefined) slide.isActive = isActive;

    await config.save();
    return successResponse(res, config.toObject());
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: DELETE /api/admin/hero/slides/:slideId ───────────────────────────
// Remove a carousel slide
export const deleteHeroSlide = async (req, res, next) => {
  try {
    const { slideId } = req.params;
    const config = await getOrCreateConfig();

    const slide = config.mobileCarouselSlides.id(slideId);
    if (!slide) {
      return errorResponse(res, "Slide not found.", "NOT_FOUND", 404);
    }

    slide.deleteOne();
    await config.save();

    return successResponse(res, { message: "Slide deleted successfully." });
  } catch (error) {
    next(error);
  }
};
