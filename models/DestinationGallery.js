import mongoose from "mongoose";

const destinationGallerySchema = new mongoose.Schema(
  {
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: [true, "Destination ID is required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
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
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

destinationGallerySchema.index({ destinationId: 1, sortOrder: 1 });

const DestinationGallery = mongoose.model("DestinationGallery", destinationGallerySchema);
export default DestinationGallery;
