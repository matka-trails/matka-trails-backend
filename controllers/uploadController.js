import { CLOUDINARY_FOLDERS, getSignedUploadParams, cloudinary } from "../config/cloudinary.js";
import { successResponse, errorResponse } from "../utils/response.js";
import multer from "multer";

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
  // Re-configure here so env vars are read at request time
  // (ESM hoists imports before dotenv.config() runs in server.js, so
  //  the module-level cloudinary.config() in config/cloudinary.js fires with undefined values)
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  memoryMulter(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: { message: err.message } });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: "No PDF file uploaded" } });
    }

    try {
      const folderPath = CLOUDINARY_FOLDERS["pdfs"]; // "matka-trails/pdfs"

      // Convert buffer → base64 data URI (cloudinary.uploader.upload accepts this directly)
      const base64 = req.file.buffer.toString("base64");
      const dataUri = `data:application/pdf;base64,${base64}`;

      // Upload to Cloudinary using full admin credentials (bypasses "untrusted customer" CDN block)
      const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: "raw",
        folder: folderPath,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
      });

      return res.status(200).json({
        success: true,
        data: {
          // Store public_id as the URL — the frontend/DB saves this.
          // The download endpoint uses it to generate a private_download_url
          // via api.cloudinary.com (bypasses the CDN "untrusted customer" restriction).
          url: result.public_id,
          public_id: result.public_id,
          originalname: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (uploadErr) {
      console.error("[Cloudinary PDF Upload Error]", uploadErr);
      return res.status(500).json({
        success: false,
        error: {
          message: uploadErr?.message || JSON.stringify(uploadErr) || "Cloudinary upload failed",
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

