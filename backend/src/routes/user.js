import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadAvatar,
  getUserProfile,
  updateUserProfile,
  getUserStats,
} from "../controllers/user.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// User profile routes
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.post("/avatar", uploadAvatar);
router.get("/stats", getUserStats);

// Admin routes
router.get("/", authorize("admin"), getUsers);
router.get("/:id", authorize("admin", "expert"), getUser);
router.put("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

export default router;
