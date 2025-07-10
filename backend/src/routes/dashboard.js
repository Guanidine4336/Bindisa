import express from "express";
import {
  getDashboardStats,
  getRecentActivity,
  getWeatherSummary,
  getCropStatus,
} from "../controllers/dashboard.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/stats", getDashboardStats);
router.get("/activity", getRecentActivity);
router.get("/weather", getWeatherSummary);
router.get("/crops", getCropStatus);

export default router;
