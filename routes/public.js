import express from "express";
import {
  getPublicDestinations,
  getPublicDestinationBySlug,
} from "../controllers/destinationController.js";
import { getPublicHeroConfig } from "../controllers/heroController.js";
import {
  getPublicPackages,
  getPublicPackageBySlug,
  downloadPackagePdf,
  streamFileFromGridFS,
} from "../controllers/packageController.js";
import {
  getPublicBlogs,
  getPublicBlogBySlug,
} from "../controllers/blogController.js";
import {
  submitLead,
  leadSubmitLimiter,
} from "../controllers/leadController.js";
import { getPublicGallery } from "../controllers/galleryController.js";
import { getPublicTestimonials } from "../controllers/videoTestimonialController.js";
import { getPublicTextTestimonials } from "../controllers/textTestimonialController.js";
import { getFaqs } from "../controllers/faqController.js";

const router = express.Router();

router.get("/hero", getPublicHeroConfig);

router.get("/destinations", getPublicDestinations);
router.get("/destinations/:slug", getPublicDestinationBySlug);

router.get("/packages", getPublicPackages);
router.get("/packages/:id/download-pdf", downloadPackagePdf);
router.get("/packages/files/:fileId", streamFileFromGridFS);
router.get("/packages/:slug", getPublicPackageBySlug);

router.get("/blogs", getPublicBlogs);
router.get("/blogs/:slug", getPublicBlogBySlug);

router.post("/leads", leadSubmitLimiter, submitLead);

router.get("/gallery", getPublicGallery);
router.get("/testimonials", getPublicTestimonials);
router.get("/text-testimonials", getPublicTextTestimonials);
router.get("/faqs", getFaqs);

export default router;
