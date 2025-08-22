import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },

    durationHours: { type: Number, default: 0 },
    durationMinutes: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },

    // ✅ Relation with Food items
    foodItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem",
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
