import mongoose from "mongoose";

const itineraryDaySchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: [true, "Package ID is required"],
    },
    dayNumber: {
      type: Number,
      required: [true, "Day number is required"],
      min: [1, "Day number must be at least 1"],
    },
    title: {
      type: String,
      required: [true, "Day title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    description: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      default: [],
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

itineraryDaySchema.index({ packageId: 1, sortOrder: 1 });
itineraryDaySchema.index({ packageId: 1, dayNumber: 1 });

const ItineraryDay = mongoose.model("ItineraryDay", itineraryDaySchema);
export default ItineraryDay;
