import express from "express";
import {
  createFarm,
  getFarms,
  getFarm,
  updateFarm,
  deleteFarm,
  shareFarm,
  getFarmAnalytics,
} from "../controllers/farm.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createFarm);
router.get("/", getFarms);
router.get("/:id", getFarm);
router.put("/:id", updateFarm);
router.delete("/:id", deleteFarm);
router.post("/:id/share", shareFarm);
router.get("/:id/analytics", getFarmAnalytics);

export default router;
