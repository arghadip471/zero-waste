import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // instead of foodName
  description: { type: String, required: false },
  quantity: { type: String, required: true },
  expiryTime: { type: String, required: true }, // e.g., "2 hours"
  safetyHours: { type: Number, required: true }, // equivalent to safeForHours
  createdAt: { type: Date, default: Date.now },
  createdBy: {   type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null}, // user who claimed the item, if any }, // canteen or NGO name
  status: { type: String, default: "available" }, // available, claimed, expired
  claimedBy: {
    type: String,
    default: null // user who claimed the item, if any
  },
  claimedAt:{ type: Date, default: null },
  pickupLocation: { type: String, required: true },
  freshnessStatus: { type: String, default: "fresh" }, // fresh, good, stale
  category: { type: String, required: true } // cooked_meals, baked_items, etc.
});

const FoodItem =  (mongoose.models.FoodItem) ||
  mongoose.model("FoodItem", foodItemSchema);

export default FoodItem;

