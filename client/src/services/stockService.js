import { apiFetch } from "../utils/api";

//Stock endpoints

export const getMarketNews = () => apiFetch("/api/stocks/news/market");

export const getStockDetails = (symbol) => apiFetch(`/api/stocks/${symbol}`);

export const getStockHistory = (symbol) =>
  apiFetch(`/api/stocks/${symbol}/history`);

export const getStockNews = (symbol) => apiFetch(`/api/stocks/${symbol}/news`);

//Watchlist endpoints

export const getWatchlist = () => apiFetch("/api/watchlist");

export const addToWatchlist = (symbol, companyName) =>
  apiFetch("/api/watchlist", {
    method: "POST",
    body: JSON.stringify({
      symbol: symbol.toUpperCase(),
      companyName: companyName || "",
    }),
  });

export const removeFromWatchlist = (symbol) =>
  apiFetch(`/api/watchlist/${symbol.toUpperCase()}`, {
    method: "DELETE",
  });

//Portfolio endpoints

export const getPortfolio = () => apiFetch("/api/portfolio");

export const addToPortfolio = (symbol, companyName, quantity, purchasePrice) =>
  apiFetch("/api/portfolio", {
    method: "POST",
    body: JSON.stringify({
      symbol: symbol.toUpperCase(),
      companyName: companyName || "",
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
    }),
  });

export const updatePortfolioHolding = (id, quantity, purchasePrice) =>
  apiFetch(`/api/portfolio/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
    }),
  });

export const removeFromPortfolio = (id) =>
  apiFetch(`/api/portfolio/${id}`, {
    method: "DELETE",
  });
