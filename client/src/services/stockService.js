import { apiFetch } from "../utils/api";

export const getMarketNews = () =>
  apiFetch("/api/stocks/news/market");

export const getStockDetails = (symbol) =>
  apiFetch(`/api/stocks/${symbol}`);

export const getStockHistory = (symbol) =>
  apiFetch(`/api/stocks/${symbol}/history`);

export const getStockNews = (symbol) =>
  apiFetch(`/api/stocks/${symbol}/news`);

export const addToWatchlist = (symbol, companyName) =>
  apiFetch("/api/watchlist", {
    method: "POST",
    body: JSON.stringify({ symbol, companyName }),
  });

export const addToPortfolio = (symbol, companyName, quantity, purchasePrice) =>
  apiFetch("/api/watchlist/portfolio", {
    method: "POST",
    body: JSON.stringify({ symbol, companyName, quantity, purchasePrice }),
  });
