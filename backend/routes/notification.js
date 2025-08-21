// routes/notification.js
import express from "express";
import Notification from "../models/Notification.js"; // ✅ use model, no duplicate schema

const router = express.Router();

/**
 * ✅ Create a new notification (generic)
 */
router.post("/", async (req, res) => {
  try {
    const { type, message } = req.body;

    if (!type || !message) {
      return res.status(400).json({ error: "Type and message are required" });
    }

    const notification = new Notification({ type, message });
    await notification.save();

    // 🔔 Emit via socket
    const io = req.app.get("io");
    if (io) io.emit("newNotification", notification);

    res.status(201).json(notification);
  } catch (err) {
    console.error("❌ Error creating notification:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ Auto Notifications
 */

// 🍲 New Food Added
router.post("/food-added", async (req, res) => {
  try {
    const notification = await Notification.create({
      type: "food",
      message: "🍲 New food item has been added!"
    });

    const io = req.app.get("io");
    if (io) io.emit("newNotification", notification);

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Food Claimed
router.post("/food-claimed", async (req, res) => {
  try {
    const notification = await Notification.create({
      type: "food",
      message: "✅ A food item has been claimed!"
    });

    const io = req.app.get("io");
    if (io) io.emit("newNotification", notification);

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📢 Event Created
router.post("/event-created", async (req, res) => {
  try {
    const notification = await Notification.create({
      type: "event",
      message: "📢 A new event has been created!"
    });

    const io = req.app.get("io");
    if (io) io.emit("newNotification", notification);

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Event Started
router.post("/event-started", async (req, res) => {
  try {
    const notification = await Notification.create({
      type: "event",
      message: "🚀 An event has started!"
    });

    const io = req.app.get("io");
    if (io) io.emit("newNotification", notification);

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🏁 Event Ended
router.post("/event-ended", async (req, res) => {
  try {
    const notification = await Notification.create({
      type: "event",
      message: "🏁 An event has ended!"
    });

    const io = req.app.get("io");
    if (io) io.emit("newNotification", notification);

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ Get all notifications (latest first)
 */
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ Mark notification as read
 */
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    console.error("❌ Error marking notification as read:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
