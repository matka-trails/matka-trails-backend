import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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
    sortOrder: {
      type: Number,
      default: 0,
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

destinationSchema.index({ isFeatured: 1 });
destinationSchema.index({ deletedAt: 1 });
destinationSchema.index({ sortOrder: 1 });

const Destination = mongoose.model("Destination", destinationSchema);
export default Destination;
