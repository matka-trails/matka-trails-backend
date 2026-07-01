import mongoose from "mongoose";

const videoTestimonialSchema = new mongoose.Schema(
  {
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    thumbnail: {
      type: String,
      default: null,
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

videoTestimonialSchema.index({ sortOrder: 1 });

const VideoTestimonial = mongoose.model("VideoTestimonial", videoTestimonialSchema);
export default VideoTestimonial;
