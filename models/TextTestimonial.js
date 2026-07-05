import mongoose from "mongoose";

const textTestimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    stars: {
      type: Number,
      required: [true, "Star rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
      default: 5,
    },
    message: {
      type: String,
      required: [true, "Review message is required"],
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

textTestimonialSchema.index({ sortOrder: 1, createdAt: -1 });

const TextTestimonial = mongoose.model("TextTestimonial", textTestimonialSchema);
export default TextTestimonial;
