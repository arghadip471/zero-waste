import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., new_food, food_claimed, event_created
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  foodItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem", default: null }, // link to food
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null }, // link to event
  createdAt: { type: Date, default: Date.now },
});

// Prevent OverwriteModelError
const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
