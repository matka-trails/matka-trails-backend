import Blog from "../models/Blog.js";
import FAQ from "../models/FAQ.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response.js";
import { generateUniqueSlug } from "../utils/slugify.js";
import { parsePagination } from "../utils/pagination.js";
import { getOptimizedImageUrl } from "../config/cloudinary.js";

export const getPublicBlogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { tag, search } = req.query;

    const filter = { status: "PUBLISHED", deletedAt: null };
    if (tag) filter.tags = tag;
    if (search) filter.$or = [{ title: { $regex: search, $options: "i" } }];

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("authorId", "name avatar")
        .select("title slug coverImage tags createdAt authorId contentBlocks"),
      Blog.countDocuments(filter),
    ]);

    const items = blogs.map((blog) => {
      const obj = blog.toObject();
      const blocks = Array.isArray(obj.contentBlocks) ? obj.contentBlocks : [];
      const firstParagraph = blocks.find((b) => b.type === "paragraph");
      const excerpt = firstParagraph?.content
        ? firstParagraph.content.substring(0, 200) +
          (firstParagraph.content.length > 200 ? "..." : "")
        : "";

      return {
        id: obj._id,
        title: obj.title,
        slug: obj.slug,
        coverImage: obj.coverImage ? getOptimizedImageUrl(obj.coverImage, 600) : null,
        tags: obj.tags,
        createdAt: obj.createdAt,
        author: obj.authorId ? { name: obj.authorId.name, avatar: obj.authorId.avatar } : null,
        excerpt,
      };
    });

    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getPublicBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: "PUBLISHED", deletedAt: null })
      .populate("authorId", "name avatar");

    if (!blog) {
      return errorResponse(res, "Blog not found.", "NOT_FOUND", 404);
    }

    const faqs = await FAQ.find({ blogId: blog._id }).sort({ sortOrder: 1 });
    const blogObj = blog.toObject();

    return successResponse(res, {
      ...blogObj,
      author: blogObj.authorId ? { name: blogObj.authorId.name, avatar: blogObj.authorId.avatar } : null,
      coverImage: blogObj.coverImage ? getOptimizedImageUrl(blogObj.coverImage, 1200) : null,
      faqs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminBlogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status } = req.query;

    const filter = { deletedAt: null };
    if (status) filter.status = status;
    if (search) filter.$or = [{ title: { $regex: search, $options: "i" } }];

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("authorId", "name"),
      Blog.countDocuments(filter),
    ]);

    return paginatedResponse(res, blogs, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getAdminBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({ _id: id, deletedAt: null })
      .populate("authorId", "id name email");

    if (!blog) {
      return errorResponse(res, "Blog not found.", "NOT_FOUND", 404);
    }

    const faqs = await FAQ.find({ blogId: id }).sort({ sortOrder: 1 });

    return successResponse(res, { ...blog.toObject(), faqs });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const {
      title,
      coverImage,
      contentBlocks,
      tags,
      status,
      authorId,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!title || title.trim().length < 1) {
      return errorResponse(res, "Blog title is required.", "VALIDATION_ERROR", 400);
    }

    const slug = await generateUniqueSlug(title, async (s) => {
      const existing = await Blog.findOne({ slug: s });
      return existing !== null;
    });

    const blog = await Blog.create({
      title: title.trim(),
      slug,
      coverImage: coverImage || null,
      contentBlocks: contentBlocks || [],
      tags: tags || [],
      status: status || "DRAFT",
      authorId: authorId || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    });

    return successResponse(res, blog, 201);
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const blog = await Blog.findOne({ _id: id, deletedAt: null });
    if (!blog) {
      return errorResponse(res, "Blog not found.", "NOT_FOUND", 404);
    }

    if (updates.title && updates.title !== blog.title) {
      updates.slug = await generateUniqueSlug(updates.title, async (s) => {
        const found = await Blog.findOne({ slug: s });
        return found !== null && found._id.toString() !== id;
      });
    }

    Object.assign(blog, updates);
    await blog.save();

    const populated = await blog.populate("authorId", "id name");
    return successResponse(res, populated);
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({ _id: id, deletedAt: null });
    if (!blog) {
      return errorResponse(res, "Blog not found.", "NOT_FOUND", 404);
    }

    blog.deletedAt = new Date();
    await blog.save();

    return successResponse(res, { message: "Blog deleted successfully." });
  } catch (error) {
    next(error);
  }
};
