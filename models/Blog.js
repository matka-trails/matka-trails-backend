import mongoose from "mongoose";

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["paragraph", "image", "heading", "quote"],
    },
    content: { type: String, default: null },
    level: { type: Number, min: 2, max: 4, default: null },
    url: { type: String, default: null },
    caption: { type: String, default: null },
    alt: { type: String, default: null },
    author: { type: String, default: null },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    coverImage: {
      type: String,
      default: null,
    },
    contentBlocks: {
      type: [contentBlockSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ["DRAFT", "PUBLISHED"],
        message: "Status must be DRAFT or PUBLISHED",
      },
      default: "DRAFT",
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    metaTitle: {
      type: String,
      maxlength: [70, "Meta title should be under 70 characters"],
      default: null,
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description should be under 160 characters"],
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blogSchema.index({ status: 1 });
blogSchema.index({ authorId: 1 });
blogSchema.index({ deletedAt: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: "text" });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
