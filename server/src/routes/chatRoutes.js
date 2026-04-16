import express from "express";
import { getChatToken } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Protected route
router.get("/token", protect, getChatToken);

export default router;
