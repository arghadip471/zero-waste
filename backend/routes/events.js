// inside events.js
import express from "express";
const router = express.Router();
import Event from "../models/Event.js";
import FoodItem from "../models/FoodItem.js";
import User from "../models/User.js";

function getDurationMs(hours, minutes, seconds) {
  return ((Number(hours) || 0) * 3600 +
          (Number(minutes) || 0) * 60 +
          (Number(seconds) || 0)) * 1000;
}

// ✅ GET /api/events/event_fetch
router.get("/event_fetch", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    const now = Date.now();

    for (let ev of events) {
      const startTime = new Date(ev.date).getTime();
      const durationMs = getDurationMs(ev.durationHours, ev.durationMinutes, ev.durationSeconds);
      const endTime = startTime + durationMs;

      let newStatus;
      if (now < startTime) {
        newStatus = "Upcoming";
      } else if (now >= startTime && now < endTime) {
        newStatus = "Ongoing";
      } else {
        newStatus = "Completed";
      }

      if (ev.status !== newStatus) {
        ev.status = newStatus;
        await ev.save();

        // ✅ FIX: use req.app.get("io")
        const io = req.app.get("io");
        io.emit("newNotification", {
          type:
            newStatus === "Upcoming" ? "event_reminder" :
            newStatus === "Ongoing" ? "event_ongoing" :
            "event_end",
          message: `Event "${ev.name}" is now ${newStatus}`,
          createdAt: new Date()
        });
      }
    }

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ✅ POST /api/events/event_add
router.post("/event_add", async (req, res) => {
  try {
    const { name, date, location, durationHours, durationMinutes, durationSeconds } = req.body;

    const startTime = new Date(date).getTime();
    const now = Date.now();
    const durationMs = getDurationMs(durationHours, durationMinutes, durationSeconds);
    const endTime = startTime + durationMs;

    let initialStatus = "Upcoming";
    if (now >= startTime && now < endTime) {
      initialStatus = "Ongoing";
    } else if (now >= endTime) {
      initialStatus = "Completed";
    }

    const newEvent = new Event({
      name,
      date: new Date(date),
      location,
      durationHours,
      durationMinutes,
      durationSeconds,
      status: initialStatus,
      foodLogged: false,
      estimatedSurplus: null
    });

    const event = await newEvent.save();

    // ✅ FIX: use req.app.get("io")
    const io = req.app.get("io");
    io.emit("newNotification", {
      type: "event_start",
      message: `📢 New Event Added: "${event.name}" at ${event.location}`,
      createdAt: new Date()
    });

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ✅ POST /api/events/event_log_food/:id
router.post("/event_log_food/:id", async (req, res) => {
  try {
    const { foodType, quantity, description, safeForHours, pickupLocation, category } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.status !== "Completed")
      return res.status(400).json({ msg: "Can only log food for completed events" });

    event.foodLogged = true;
    event.foodDetails = {
      foodType,
      quantity,
      description,
      safeForHours,
      pickupLocation,
      loggedAt: new Date(),
      claimed: false,
      category
    };

    await event.save();

    // ✅ FIX: use req.app.get("io")
    const io = req.app.get("io");
    io.emit("newNotification", {
      type: "new_food",
      message: `🍽️ ${quantity} of ${foodType} available at ${pickupLocation}`,
      foodItem: {
        name: foodType,
        quantity: String(quantity),
        location: pickupLocation,
        pickupWindow: `${safeForHours}h safe`,
        safetyTag: category
      },
      createdAt: new Date()
    });

    res.json({ msg: "Food log updated successfully", event });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/completed_with_food", async (req, res) => {
  try {
    const completedEvents = await Event.find({
      status: "Completed",
      foodLogged: true
    }).sort({ date: -1 });

    res.json(completedEvents);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ✅ PATCH /api/events/claim-surplus/:id
router.patch("/claim-surplus/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (!event.foodDetails) return res.status(400).json({ msg: "No surplus food to claim" });

    if (event.foodDetails.claimed) {
      return res.status(400).json({ msg: "Surplus food already claimed" });
    }

    event.foodDetails.claimed = true;
    await event.save();

    const user = await User.findById(userId);

    const foodItem = await FoodItem.create({
      name: event.foodDetails.foodType,
      description: event.foodDetails.description || "",
      quantity: event.foodDetails.quantity,
      expiryTime: `${event.foodDetails.safeForHours} hours`,
      safetyHours: event.foodDetails.safeForHours,
      createdBy: userId,
      status: "claimed",
      claimedBy: user.name || "anonymous",
      claimedAt: new Date(),
      pickupLocation: event.foodDetails.pickupLocation,
      freshnessStatus: "fresh",
      category: "cooked_meals"
    });

    // ✅ FIX: use req.app.get("io")
    const io = req.app.get("io");
    io.emit("newNotification", {
      type: "food_claimed",
      message: `✅ ${user.name} claimed ${event.foodDetails.foodType}`,
      createdAt: new Date()
    });

    res.json({ msg: "Surplus food claimed successfully", event, foodItem });
  } catch (err) {
    console.error("Error claiming surplus food:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// ✅ DELETE /api/events/:id
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    res.json({ msg: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


export default router;
