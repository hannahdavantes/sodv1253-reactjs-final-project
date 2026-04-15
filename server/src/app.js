import express from "express";
import cors from "cors";
import { poolPromise } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .query("SELECT GETDATE() AS CurrentTime");

    res.json({
      message: "API is running",
      dbTime: result.recordset[0].CurrentTime,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

export default app;
