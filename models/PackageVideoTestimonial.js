import mongoose from "mongoose";

const packageVideoTestimonialSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: [true, "Package ID is required"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
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
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

packageVideoTestimonialSchema.index({ packageId: 1, sortOrder: 1 });

const PackageVideoTestimonial = mongoose.model("PackageVideoTestimonial", packageVideoTestimonialSchema);
export default PackageVideoTestimonial;
