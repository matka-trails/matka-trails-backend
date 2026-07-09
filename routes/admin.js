import express from "express";
import { protect } from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/dashboardController.js";
import {
  getAdminDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getDestinationGallery,
  addDestinationGalleryImage,
  removeDestinationGalleryImage,
} from "../controllers/destinationController.js";
import {
  getAdminPackages,
  getAdminPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from "../controllers/packageController.js";
import {
  getItinerary,
  addItineraryDay,
  updateItineraryDay,
  deleteItineraryDay,
  bulkReplaceItinerary,
} from "../controllers/itineraryController.js";
import {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  addPackageTestimonial,
  deletePackageTestimonial,
  getPackageTestimonials,
} from "../controllers/reviewController.js";
import {
  getAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  bulkReplaceFaqs,
} from "../controllers/faqController.js";
import {
  getLeads,
  updateLead,
  deleteLead,
} from "../controllers/leadController.js";
import {
  getAdminGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "../controllers/galleryController.js";
import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/videoTestimonialController.js";
import {
  getAdminTextTestimonials,
  createTextTestimonial,
  updateTextTestimonial,
  deleteTextTestimonial,
} from "../controllers/textTestimonialController.js";
import { getUploadSignature, uploadPdf } from "../controllers/uploadController.js";
import { getAdmins, createAdmin } from "../controllers/adminUserController.js";
import {
  getAdminHeroConfig,
  updateHeroConfig,
  addHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from "../controllers/heroController.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboardStats);

router.get("/accounts", getAdmins);
router.post("/accounts", createAdmin);

router.get("/destinations", getAdminDestinations);
router.post("/destinations", createDestination);
router.patch("/destinations/:id", updateDestination);
router.delete("/destinations/:id", deleteDestination);

router.get("/destinations/:id/gallery", getDestinationGallery);
router.post("/destinations/:id/gallery", addDestinationGalleryImage);
router.delete("/destinations/:id/gallery/:imageId", removeDestinationGalleryImage);

router.get("/packages", getAdminPackages);
router.get("/packages/:id", getAdminPackageById);
router.post("/packages", createPackage);
router.patch("/packages/:id", updatePackage);
router.delete("/packages/:id", deletePackage);

router.get("/packages/:packageId/itinerary", getItinerary);
router.post("/packages/:packageId/itinerary", addItineraryDay);
router.put("/packages/:packageId/itinerary/bulk", bulkReplaceItinerary);
router.put("/packages/:packageId/itinerary/:dayId", updateItineraryDay);
router.delete("/packages/:packageId/itinerary/:dayId", deleteItineraryDay);

router.get("/packages/:packageId/reviews", getReviews);
router.post("/packages/:packageId/reviews", addReview);
router.patch("/packages/:packageId/reviews/:reviewId", updateReview);
router.delete("/packages/:packageId/reviews/:reviewId", deleteReview);

router.get("/packages/:packageId/testimonials", getPackageTestimonials);
router.post("/packages/:packageId/testimonials", addPackageTestimonial);
router.delete("/packages/:packageId/testimonials/:testimonialId", deletePackageTestimonial);

router.get("/blogs", getAdminBlogs);
router.get("/blogs/:id", getAdminBlogById);
router.post("/blogs", createBlog);
router.patch("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);

router.get("/faqs", getFaqs);
router.post("/faqs", createFaq);
router.put("/faqs/bulk", bulkReplaceFaqs);
router.put("/faqs/:id", updateFaq);
router.delete("/faqs/:id", deleteFaq);

router.get("/leads", getLeads);
router.patch("/leads/:id", updateLead);
router.delete("/leads/:id", deleteLead);

router.get("/gallery", getAdminGallery);
router.post("/gallery", createGalleryItem);
router.patch("/gallery/:id", updateGalleryItem);
router.delete("/gallery/:id", deleteGalleryItem);

router.get("/testimonials", getAdminTestimonials);
router.post("/testimonials", createTestimonial);
router.patch("/testimonials/:id", updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);

router.get("/text-testimonials", getAdminTextTestimonials);
router.post("/text-testimonials", createTextTestimonial);
router.patch("/text-testimonials/:id", updateTextTestimonial);
router.delete("/text-testimonials/:id", deleteTextTestimonial);

router.post("/upload", getUploadSignature);
router.post("/upload/pdf", uploadPdf);

router.get("/hero", getAdminHeroConfig);
router.patch("/hero", updateHeroConfig);
router.post("/hero/slides", addHeroSlide);
router.patch("/hero/slides/:slideId", updateHeroSlide);
router.delete("/hero/slides/:slideId", deleteHeroSlide);

export default router;
