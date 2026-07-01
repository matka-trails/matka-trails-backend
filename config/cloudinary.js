import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const CLOUDINARY_FOLDERS = {
  packages: "matka-trails/packages",
  destinations: "matka-trails/destinations",
  blogs: "matka-trails/blogs",
  testimonials: "matka-trails/testimonials",
  reviews: "matka-trails/reviews",
  gallery: "matka-trails/gallery",
  pdfs: "matka-trails/pdfs",
};

export function getSignedUploadParams(folderPath) {
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = {
    timestamp,
    folder: folderPath,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    folder: folderPath,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
  };
}

export function getOptimizedImageUrl(url, width) {
  if (!url || !url.includes("cloudinary.com")) return url;
  let transformation = "f_auto,q_auto";
  if (width) transformation += `,w_${width},c_limit`;
  return url.replace("/upload/", `/upload/${transformation}/`);
}

export function getOptimizedVideoUrl(url) {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

export function getVideoThumbnailUrl(videoUrl, width = 400) {
  if (!videoUrl || !videoUrl.includes("cloudinary.com")) return videoUrl;
  return videoUrl
    .replace("/video/upload/", `/video/upload/f_auto,q_auto,w_${width},so_0/`)
    .replace(/\.(mp4|mov|avi|webm)$/i, ".jpg");
}

export async function deleteFromCloudinary(publicId, resourceType = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error(`[Cloudinary] Failed to delete ${publicId}:`, error.message);
    return null;
  }
}

export { cloudinary };
