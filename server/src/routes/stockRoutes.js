import express from "express";
import {
  getStockDetails,
  getStockHistory,
  getStockNews,
  getMarketNews,
} from "../controllers/stockController.js";

const router = express.Router();

// Must be before /:symbol to avoid being caught as a symbol
router.get("/news/market", getMarketNews);

router.get("/:symbol", getStockDetails);
router.get("/:symbol/history", getStockHistory);
router.get("/:symbol/news", getStockNews);

export default router;
