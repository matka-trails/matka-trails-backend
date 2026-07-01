import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Package title is required"],
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
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: [true, "Destination is required"],
    },
    summary: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    durationDays: {
      type: Number,
      required: [true, "Duration (days) is required"],
      min: [1, "Duration must be at least 1 day"],
    },
    durationNights: {
      type: Number,
      required: [true, "Duration (nights) is required"],
      min: [0, "Nights cannot be negative"],
    },
    priceOriginal: {
      type: Number,
      required: [true, "Original price is required"],
      min: [0, "Price must be positive"],
    },
    priceDiscounted: {
      type: Number,
      default: null,
      min: [0, "Discounted price must be positive"],
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    inclusions: {
      type: [String],
      default: [],
    },
    exclusions: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["DRAFT", "PUBLISHED"],
        message: "Status must be DRAFT or PUBLISHED",
      },
      default: "DRAFT",
    },
    groupType: {
      type: String,
      enum: {
        values: ["CORPORATE", "SOLO_GROUP", "CUSTOM"],
        message: "GroupType must be CORPORATE, SOLO_GROUP, or CUSTOM",
      },
      default: "SOLO_GROUP",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    maxGroupSize: {
      type: Number,
      default: null,
      min: [1, "Group size must be at least 1"],
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: [0, "Current bookings cannot be negative"],
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

packageSchema.index({ destinationId: 1 });
packageSchema.index({ status: 1 });
packageSchema.index({ groupType: 1 });
packageSchema.index({ isFeatured: 1 });
packageSchema.index({ deletedAt: 1 });
packageSchema.index({ priceOriginal: 1 });
packageSchema.index({ durationDays: 1 });

const Package = mongoose.model("Package", packageSchema);
export default Package;
