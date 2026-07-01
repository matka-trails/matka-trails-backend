import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    placeName: {
      type: String,
      required: [true, "Place name is required"],
      trim: true,
      maxlength: [200, "Place name cannot exceed 200 characters"],
    },
    caption: {
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

galleryItemSchema.index({ sortOrder: 1 });

const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);
export default GalleryItem;
