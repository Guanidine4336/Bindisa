import express from "express";
import {
  getCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
  getCropRecommendations,
  getCropCalendar,
} from "../controllers/crop.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getCrops);
router.get("/:id", getCrop);
router.get("/recommendations/:soilType/:climate", getCropRecommendations);
router.get("/calendar/:cropName/:location", getCropCalendar);

// Protected routes
router.use(protect);

// Admin/Expert routes
router.post("/", authorize("admin", "expert"), createCrop);
router.put("/:id", authorize("admin", "expert"), updateCrop);
router.delete("/:id", authorize("admin"), deleteCrop);

export default router;
