import TextTestimonial from "../models/TextTestimonial.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { parsePagination } from "../utils/pagination.js";

// GET /api/public/text-testimonials
export const getPublicTextTestimonials = async (req, res, next) => {
  try {
    let items = await TextTestimonial.find().sort({ sortOrder: 1, createdAt: -1 });

    if (items.length === 0) {
      const seedData = [
        {
          name: "Aditya Sharma",
          stars: 5,
          message: "Had an absolutely incredible trip to Spiti Valley! The founder was our lead captain and his experience really showed. Handled every roadblock perfectly.",
          sortOrder: 0,
        },
        {
          name: "Sneha Patel",
          stars: 5,
          message: "Matka Trails made our Ladakh road trip dream come true. Customized itinerary, premium stays, and very professional guides. Highly recommend!",
          sortOrder: 1,
        },
        {
          name: "Rahul Verma",
          stars: 4,
          message: "Very well organized Kedarnath trek. The support staff was extremely helpful. Food was great considering the high altitude.",
          sortOrder: 2,
        },
        {
          name: "Pooja Krishnan",
          stars: 5,
          message: "I was skeptical about booking with a new agency, but knowing the founder has led 100+ tours gave me confidence. Rishikesh weekend getaway was flawless.",
          sortOrder: 3,
        },
        {
          name: "Vikram Singh",
          stars: 5,
          message: "One of the best backpacking experiences in Meghalaya. Met amazing co-travelers. Zero hidden charges and absolute transparency.",
          sortOrder: 4,
        },
      ];
      items = await TextTestimonial.create(seedData);
      items.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return successResponse(res, items);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/text-testimonials
export const getAdminTextTestimonials = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [items, total] = await Promise.all([
      TextTestimonial.find().sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      TextTestimonial.countDocuments(),
    ]);

    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/text-testimonials
export const createTextTestimonial = async (req, res, next) => {
  try {
    const { name, stars, message, sortOrder } = req.body;

    if (!name || !message) {
      return errorResponse(res, "Name and message are required.", "VALIDATION_ERROR", 400);
    }

    const item = await TextTestimonial.create({
      name: name.trim(),
      stars: stars !== undefined ? Number(stars) : 5,
      message: message.trim(),
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
    });

    return successResponse(res, item, 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/text-testimonials/:id
export const updateTextTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await TextTestimonial.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return errorResponse(res, "Testimonial not found.", "NOT_FOUND", 404);
    }

    return successResponse(res, item);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/text-testimonials/:id
export const deleteTextTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await TextTestimonial.findByIdAndDelete(id);
    if (!item) {
      return errorResponse(res, "Testimonial not found.", "NOT_FOUND", 404);
    }

    return successResponse(res, { message: "Testimonial deleted successfully." });
  } catch (error) {
    next(error);
  }
};
