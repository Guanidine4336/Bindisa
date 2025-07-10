import express from "express";
import {
  getExperts,
  getExpert,
  bookConsultation,
  getConsultations,
  updateConsultation,
} from "../controllers/expert.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getExperts);
router.get("/:id", getExpert);

// Protected routes
router.use(protect);

router.post("/consultation", bookConsultation);
router.get("/consultations", getConsultations);
router.put("/consultation/:id", authorize("expert"), updateConsultation);

export default router;
