import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";

dotenv.config();

const httpServer = createServer(app);

// Socket.io for real-time chat
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  // Join a stock's chat room
  socket.on("join-stock", (symbol) => {
    socket.join(symbol);
  });

  // Send a chat message to everyone in the room
  socket.on("chat-message", ({ symbol, message, user }) => {
    io.to(symbol).emit("chat-message", {
      message,
      user,
      timestamp: new Date().toLocaleTimeString(),
    });
  });

  // Leave a stock's chat room
  socket.on("leave-stock", (symbol) => {
    socket.leave(symbol);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
