import sql from "mssql";
import { poolPromise } from "../config/db.js";

// GET /api/portfolio
export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM Portfolio WHERE UserId = @userId");

    res.json({ success: true, portfolio: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/portfolio
export const addToPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, companyName, quantity, purchasePrice } = req.body;

    if (!symbol || quantity == null || purchasePrice == null) {
      return res.status(400).json({
        message: "symbol, quantity, and purchasePrice are required",
      });
    }

    if (quantity <= 0 || purchasePrice <= 0) {
      return res.status(400).json({
        message: "quantity and purchasePrice must be positive numbers",
      });
    }

    const pool = await poolPromise;

    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("symbol", sql.NVarChar, symbol.toUpperCase())
      .input("displaySymbol", sql.NVarChar, symbol.toUpperCase())
      .input("description", sql.NVarChar, companyName || "")
      .input("quantity", sql.Decimal(10, 2), quantity)
      .input("purchasePrice", sql.Decimal(10, 2), purchasePrice).query(`
        INSERT INTO Portfolio (UserId, Symbol, DisplaySymbol, Description, Quantity, PurchasePrice)
        VALUES (@userId, @symbol, @displaySymbol, @description, @quantity, @purchasePrice)
      `);

    res.status(201).json({ message: "Stock added to portfolio" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/portfolio/:id
export const updatePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity, purchasePrice } = req.body;

    if (quantity == null && purchasePrice == null) {
      return res.status(400).json({
        message: "Provide at least quantity or purchasePrice to update",
      });
    }

    if (quantity != null && quantity <= 0) {
      return res.status(400).json({
        message: "quantity must be a positive number",
      });
    }

    const pool = await poolPromise;

    const request = pool
      .request()
      .input("userId", sql.Int, userId)
      .input("id", sql.Int, id);

    let setClauses = [];
    if (quantity != null) {
      request.input("quantity", sql.Decimal(10, 2), quantity);
      setClauses.push("Quantity = @quantity");
    }
    if (purchasePrice != null) {
      request.input("purchasePrice", sql.Decimal(10, 2), purchasePrice);
      setClauses.push("PurchasePrice = @purchasePrice");
    }

    const result = await request.query(`
      UPDATE Portfolio SET ${setClauses.join(", ")}
      WHERE Id = @id AND UserId = @userId
    `);

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({ message: "Holding not found in portfolio" });
    }

    res.json({ message: "Portfolio holding updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/portfolio/:id
export const removeFromPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("id", sql.Int, id)
      .query("DELETE FROM Portfolio WHERE Id = @id AND UserId = @userId");

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({ message: "Holding not found in portfolio" });
    }

    res.json({ message: "Stock removed from portfolio" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
