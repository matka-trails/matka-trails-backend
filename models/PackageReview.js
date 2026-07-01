import mongoose from "mongoose";

const packageReviewSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: [true, "Package ID is required"],
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewText: {
      type: String,
      default: null,
    },
    reviewImages: {
      type: [String],
      default: [],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

packageReviewSchema.index({ packageId: 1 });
packageReviewSchema.index({ isApproved: 1 });
packageReviewSchema.index({ packageId: 1, isApproved: 1 });

const PackageReview = mongoose.model("PackageReview", packageReviewSchema);
export default PackageReview;
