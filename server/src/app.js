import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";

const app = express();

app.use(
  cors({
    origin: "https://sodv1253-reactjs-final-project-uze6.vercel.app",
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/portfolio", portfolioRoutes);

export default app;
