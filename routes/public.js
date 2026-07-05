import express from "express";
import {
  getPublicDestinations,
  getPublicDestinationBySlug,
} from "../controllers/destinationController.js";
import { getPublicHeroConfig } from "../controllers/heroController.js";
import {
  getPublicPackages,
  getPublicPackageBySlug,
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

const router = express.Router();

router.get("/hero", getPublicHeroConfig);

router.get("/destinations", getPublicDestinations);
router.get("/destinations/:slug", getPublicDestinationBySlug);

router.get("/packages", getPublicPackages);
router.get("/packages/:slug", getPublicPackageBySlug);

router.get("/blogs", getPublicBlogs);
router.get("/blogs/:slug", getPublicBlogBySlug);

router.post("/leads", leadSubmitLimiter, submitLead);

router.get("/gallery", getPublicGallery);
router.get("/testimonials", getPublicTestimonials);

export default router;
