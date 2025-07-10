import express from "express";
import {
  getCurrentWeather,
  getForecast,
  getWeatherHistory,
  getWeatherAlerts,
} from "../controllers/weather.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/current/:lat/:lon", getCurrentWeather);
router.get("/forecast/:lat/:lon", getForecast);

// Protected routes
router.use(protect);

router.get("/history/:lat/:lon", getWeatherHistory);
router.get("/alerts/:lat/:lon", getWeatherAlerts);

export default router;
