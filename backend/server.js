// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import foodRoutes from "./routes/food.js";
import adminRoutes from "./routes/admin.js";
import eventRoutes from "./routes/events.js";
import userRoutes from "./routes/user.js";
import notificationRoutes from "./routes/notification.js";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

// Create HTTP server (needed for Socket.io)
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // 🔒 Later restrict this to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Make io globally accessible in routes
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://chowdhuryarghadip471:2dUxNfq3Qa7cT5eZ@cluster0.4mvbsij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/zero_waste'",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Zero Waste API is running...");
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  // Listen for custom notifications (if you send manually)
  socket.on("sendNotification", (data) => {
    console.log("📢 Notification received:", data);

    // Broadcast notification to all clients
    io.emit("receiveNotification", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start server with HTTP + WebSocket
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("======================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("✅ Socket.io server is running");
  console.log("======================================");
});
