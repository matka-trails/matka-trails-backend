import { CLOUDINARY_FOLDERS, getSignedUploadParams } from "../config/cloudinary.js";
import { successResponse, errorResponse } from "../utils/response.js";

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
