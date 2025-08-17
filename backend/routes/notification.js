import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { type, message } = req.body;
    const notification = new Notification({ type, message });
    await notification.save();

    // Emit via socket.io
    const io = req.app.get("io");
    io.emit("newNotification", notification);

    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
