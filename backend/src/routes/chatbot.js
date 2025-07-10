import express from "express";
import {
  sendMessage,
  getConversation,
  getConversations,
  createSession,
  endSession,
  rateConversation,
  escalateToExpert,
} from "../controllers/chatbot.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/session", createSession);
router.post("/message", optionalAuth, sendMessage);

// Protected routes
router.use(protect);

router.get("/conversations", getConversations);
router.get("/conversation/:sessionId", getConversation);
router.post("/conversation/:sessionId/end", endSession);
router.post("/conversation/:sessionId/rate", rateConversation);
router.post("/conversation/:sessionId/escalate", escalateToExpert);

export default router;
