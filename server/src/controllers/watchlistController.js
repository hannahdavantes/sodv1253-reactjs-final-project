import { getPool, sql } from "../config/db.js";

export const getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM Watchlist WHERE UserId = @userId");

    res.json({ success: true, watchlist: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, companyName } = req.body;

    if (!symbol) {
      return res.status(400).json({ message: "Stock symbol is required" });
    }

    const pool = await getPool();

    const existing = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("symbol", sql.NVarChar, symbol)
      .query(
        "SELECT Id FROM Watchlist WHERE UserId = @userId AND Symbol = @symbol",
      );

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: "Stock already in watchlist" });
    }

    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("symbol", sql.NVarChar, symbol.toUpperCase())
      .input("companyName", sql.NVarChar, companyName || "").query(`
    INSERT INTO Watchlist (UserId, Symbol, CompanyName)
    VALUES (@userId, @symbol, @companyName)
  `);

    res.status(201).json({ message: "Stock added to watchlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol } = req.params;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("symbol", sql.NVarChar, symbol.toUpperCase())
      .query(
        "DELETE FROM Watchlist WHERE UserId = @userId AND Symbol = @symbol",
      );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Stock not found in watchlist" });
    }

    res.json({ message: "Stock removed from watchlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
