import sql from "mssql";
import { poolPromise } from "../config/db.js";

// GET /api/watchlist - get user's watchlist
export const getWatchlist = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .query("SELECT * FROM Watchlist WHERE UserId = @userId ORDER BY AddedAt DESC");

    res.json({ watchlist: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/watchlist - add stock to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { symbol, companyName } = req.body;

    if (!symbol) {
      return res.status(400).json({ message: "Symbol is required" });
    }

    const pool = await poolPromise;

    // Check if already in watchlist
    const existing = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("symbol", sql.NVarChar, symbol.toUpperCase())
      .query("SELECT * FROM Watchlist WHERE UserId = @userId AND Symbol = @symbol");

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: "Stock already in watchlist" });
    }

    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("symbol", sql.NVarChar, symbol.toUpperCase())
      .input("companyName", sql.NVarChar, companyName || symbol.toUpperCase())
      .query("INSERT INTO Watchlist (UserId, Symbol, CompanyName) VALUES (@userId, @symbol, @companyName)");

    res.status(201).json({ message: "Added to watchlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/watchlist/:symbol - remove stock from watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.params;

    const pool = await poolPromise;
    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("symbol", sql.NVarChar, symbol.toUpperCase())
      .query("DELETE FROM Watchlist WHERE UserId = @userId AND Symbol = @symbol");

    res.json({ message: "Removed from watchlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/portfolio - add stock to portfolio
export const addToPortfolio = async (req, res) => {
  try {
    const { symbol, companyName, quantity, purchasePrice } = req.body;

    if (!symbol || !quantity || !purchasePrice) {
      return res.status(400).json({ message: "Symbol, quantity and purchase price are required" });
    }

    const pool = await poolPromise;
    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("symbol", sql.NVarChar, symbol.toUpperCase())
      .input("companyName", sql.NVarChar, companyName || symbol.toUpperCase())
      .input("quantity", sql.Decimal(10, 2), quantity)
      .input("purchasePrice", sql.Decimal(10, 2), purchasePrice)
      .query(`
        INSERT INTO Portfolio (UserId, Symbol, CompanyName, Quantity, PurchasePrice)
        VALUES (@userId, @symbol, @companyName, @quantity, @purchasePrice)
      `);

    res.status(201).json({ message: "Added to portfolio" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
