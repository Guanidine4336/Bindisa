import express from "express";
import {
  createAnalysis,
  getAnalyses,
  getAnalysis,
  updateAnalysis,
  deleteAnalysis,
  analyzeParameters,
  getRecommendations,
  shareAnalysis,
  getSuitableCrops,
} from "../controllers/soilAnalysis.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/analyze", optionalAuth, analyzeParameters);
router.get("/crops/:ph/:nitrogen/:phosphorus/:potassium", getSuitableCrops);

// Protected routes
router.use(protect);

router.post("/", createAnalysis);
router.get("/", getAnalyses);
router.get("/:id", getAnalysis);
router.put("/:id", updateAnalysis);
router.delete("/:id", deleteAnalysis);
router.get("/:id/recommendations", getRecommendations);
router.post("/:id/share", shareAnalysis);

export default router;
