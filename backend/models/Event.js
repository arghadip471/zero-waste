import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },

  durationHours: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 0 },
  durationSeconds: { type: Number, default: 0 },

  attendees: { type: Number, default: 0 },
  type: { type: String, default: "General" },
  status: { type: String, default: "Upcoming" },

  foodLogged: { type: Boolean, default: false },
  estimatedSurplus: { type: String, default: null },

  foodDetails: {
    foodType: String,
    quantity: String,
    description: String,
    safeForHours: Number,
    pickupLocation: String,
    loggedAt: Date,
    claimed: { type: Boolean, default: false }, // ✅ Added claimed flag
    category: String
  }
});

export default mongoose.model("Event", EventSchema);
