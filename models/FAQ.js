import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      default: null,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      default: null,
    },
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      default: null,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

faqSchema.index({ blogId: 1, sortOrder: 1 });
faqSchema.index({ packageId: 1, sortOrder: 1 });
faqSchema.index({ isGlobal: 1, sortOrder: 1 });
faqSchema.index({ destinationId: 1, sortOrder: 1 });

const FAQ = mongoose.model("FAQ", faqSchema);
export default FAQ;
