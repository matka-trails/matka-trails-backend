import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["SUPER_ADMIN", "ADMIN"],
        message: "Role must be SUPER_ADMIN or ADMIN",
      },
      default: "ADMIN",
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
