import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  addToPortfolio,
} from "../controllers/watchlistController.js";

const router = express.Router();

// Watchlist routes
router.get("/", protect, getWatchlist);
router.post("/", protect, addToWatchlist);
router.delete("/:symbol", protect, removeFromWatchlist);

// Portfolio route
router.post("/portfolio", protect, addToPortfolio);

export default router;
