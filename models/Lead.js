import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      minlength: [10, "Phone number must be at least 10 digits"],
      maxlength: [15, "Phone number cannot exceed 15 digits"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: null,
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "City name too long"],
      default: null,
    },
    company: {
      type: String,
      trim: true,
      maxlength: [200, "Company name too long"],
      default: null,
    },
    age: {
      type: Number,
      min: [1, "Age must be at least 1"],
      default: null,
    },
    gender: {
      type: String,
      trim: true,
      default: null,
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [200, "Occupation name too long"],
      default: null,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      default: null,
    },
    groupSize: {
      type: Number,
      min: [1, "Group size must be at least 1"],
      default: null,
    },
    preferredDate: {
      type: String,
      maxlength: [200, "Preferred date field too long"],
      default: null,
    },
    message: {
      type: String,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["NEW", "CONTACTED", "CONFIRMED", "REJECTED"],
        message: "Status must be NEW, CONTACTED, CONFIRMED, or REJECTED",
      },
      default: "NEW",
    },
    source: {
      type: String,
      enum: {
        values: ["WEBSITE_FORM", "PACKAGE_BOOKING"],
        message: "Source must be WEBSITE_FORM or PACKAGE_BOOKING",
      },
      default: "WEBSITE_FORM",
    },
    adminNotes: {
      type: String,
      maxlength: [5000, "Admin notes cannot exceed 5000 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ packageId: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: "text", phone: "text", email: "text", company: "text", city: "text" });

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
