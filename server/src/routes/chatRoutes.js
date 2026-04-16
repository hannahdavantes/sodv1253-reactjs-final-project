import express from "express";
import {
  getChatToken,
  getStockChatToken,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Protected route
router.get("/token", protect, getChatToken);
router.get("/token/:symbol", protect, getStockChatToken);

export default router;
