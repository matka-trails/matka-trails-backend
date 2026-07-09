import { CLOUDINARY_FOLDERS, getSignedUploadParams } from "../config/cloudinary.js";
import { successResponse, errorResponse } from "../utils/response.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/pdfs directory exists
const pdfUploadDir = path.join(__dirname, "..", "uploads", "pdfs");
if (!fs.existsSync(pdfUploadDir)) {
  fs.mkdirSync(pdfUploadDir, { recursive: true });
}

// Multer config for PDF storage
const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, pdfUploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

const pdfFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

export const pdfMulter = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
}).single("pdf");

export const uploadPdf = (req, res) => {
  pdfMulter(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: { message: err.message } });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: "No PDF file uploaded" } });
    }

    const baseUrl = process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 5001}`;
    const fileUrl = `${baseUrl}/uploads/pdfs/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
      },
    });
  });
};

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
