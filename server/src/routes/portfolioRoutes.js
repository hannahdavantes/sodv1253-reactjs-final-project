import express from "express";
import {
  getPortfolio,
  addToPortfolio,
  updatePortfolio,
  removeFromPortfolio,
} from "../controllers/portfolioController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getPortfolio);
router.post("/", protect, addToPortfolio);
router.patch("/:id", protect, updatePortfolio);
router.delete("/:id", protect, removeFromPortfolio);

export default router;
