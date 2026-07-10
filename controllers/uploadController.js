import { CLOUDINARY_FOLDERS, getSignedUploadParams, cloudinary } from "../config/cloudinary.js";
import { successResponse, errorResponse } from "../utils/response.js";
import multer from "multer";
import mongoose from "mongoose";

// ── Multer: memory storage (no disk — works on Vercel/serverless) ──
const memoryMulter = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
}).single("pdf");

export const uploadPdf = (req, res) => {
  memoryMulter(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: { message: err.message } });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: "No PDF file uploaded" } });
    }

    try {
      const db = mongoose.connection.db;
      const bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: "itineraries",
      });

      // Create upload stream with the original file name and content type
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
      });

      // Write buffer to GridFS stream
      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", () => {
        const fileIdString = uploadStream.id.toString();
        return res.status(200).json({
          success: true,
          data: {
            // Return GridFS file ID string as 'url' so the frontend form saves it in the Package schema pdfUrl field
            url: fileIdString,
            fileId: fileIdString,
            originalname: req.file.originalname,
            size: req.file.size,
          },
        });
      });

      uploadStream.on("error", (streamErr) => {
        console.error("[GridFS Upload Stream Error]", streamErr);
        return res.status(500).json({
          success: false,
          error: { message: "Failed to stream PDF to MongoDB GridFS." },
        });
      });
    } catch (uploadErr) {
      console.error("[GridFS PDF Upload Error]", uploadErr);
      return res.status(500).json({
        success: false,
        error: {
          message: uploadErr?.message || "MongoDB GridFS upload failed",
        },
      });
    }
  });
};

// ── Cloudinary image/video signed upload signature (existing) ──
export const getUploadSignature = async (req, res, next) => {
  try {
    const { folder } = req.body;

    if (!folder) {
      return errorResponse(
        res,
        "folder is required. Must be one of: " + Object.keys(CLOUDINARY_FOLDERS).join(", "),
        "VALIDATION_ERROR",
        400
      );
    }

    let folderPath = "";

    if (folder in CLOUDINARY_FOLDERS) {
      folderPath = CLOUDINARY_FOLDERS[folder];
    } else {
      const found = Object.values(CLOUDINARY_FOLDERS).find((v) => v === folder);
      if (found) folderPath = found;
    }

    if (!folderPath) {
      return errorResponse(
        res,
        `Invalid folder key "${folder}". Valid options: ${Object.keys(CLOUDINARY_FOLDERS).join(", ")}`,
        "VALIDATION_ERROR",
        400
      );
    }

    const params = getSignedUploadParams(folderPath);
    return successResponse(res, params);
  } catch (error) {
    next(error);
  }
};

