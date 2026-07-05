import mongoose from "mongoose";

const heroCarouselSlideSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "Slide image URL is required"],
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true, timestamps: true }
);

const heroDesktopCardSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "Card image URL is required"],
    },
    destinationName: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const heroConfigSchema = new mongoose.Schema(
  {
    // Desktop hero background image
    desktopBgImage: {
      type: String,
      default: null,
    },
    // Rotating dynamic destination words shown in the hero headline
    desktopDynamicWords: {
      type: [String],
      default: ["Ladakh", "Spiti Valley", "Kedarnath", "Rishikesh"],
    },
    // Glassmorphic trip cards shown on the right side of desktop hero
    desktopCards: {
      type: [heroDesktopCardSchema],
      default: [],
    },
    // Mobile hero carousel slides
    mobileCarouselSlides: {
      type: [heroCarouselSlideSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const HeroConfig = mongoose.model("HeroConfig", heroConfigSchema);
export default HeroConfig;
