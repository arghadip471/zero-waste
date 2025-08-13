import express from "express";
import FoodItem from "../models/FoodItem.js";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

// Add new food item
router.post("/add-food", async (req, res) => {
  try {
    const {
      name,
      description,
      quantity,
      expiryTime,
      safetyHours,
      pickupLocation,
      category,
      userId
    } = req.body;

    // Basic validation
    if (!name || !description || !quantity || !expiryTime || !safetyHours || !userId || !pickupLocation || !category) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const newFoodItem = new FoodItem({
      name,
      description,
      quantity,
      expiryTime,
      safetyHours,
      pickupLocation,
      category,
      createdAt: new Date(),
      createdBy: userId,
      status: "available",
      freshnessStatus: "fresh",
      claimedBy: null,
    });

    await newFoodItem.save();

    res.status(201).json({
      message: "Food item added successfully",
      foodItem: formatFoodItem(newFoodItem),
    });
  } catch (error) {
    console.error("Error adding food item:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// Fetch all food items
router.get("/food-items", async (req, res) => {
  const {userId} = req.query;
  try {
    const matchStage = userId
      ? { $match: { createdBy: new mongoose.Types.ObjectId(userId) } }
      : { $match: {} };

    const items = await FoodItem.aggregate([
      matchStage,
      {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy"
      }
      },
      {
      $unwind: {
        path: "$createdBy",
        preserveNullAndEmptyArrays: true
      }
      },
      {
      $sort: { createdAt: -1 }
      },
      {
      $project: {
        "createdBy.password": 0,
        "createdBy.__v": 0
      }
      }
    ]);

    res.json(items.map(formatFoodItem));
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Claim a food item
router.patch("/claim-food/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const foodItem = await FoodItem.findById(id);
    if (!foodItem) return res.status(404).json({ message: "Food item not found" });

    if (foodItem.status === "claimed") {
      return res.status(400).json({ message: "Food item already claimed" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    foodItem.status = "claimed";
    foodItem.claimedBy = user.name || "anonymous";
    foodItem.claimedAt = new Date();
    await foodItem.save();

    res.json({
      message: "Food item claimed successfully",
      foodItem: formatFoodItem(foodItem),
    });
  } catch (error) {
    console.error("Error claiming food item:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// Helper to format items consistently
function formatFoodItem(item) {
  return {
    id: item._id.toString(),
    name: item.name,
    description: item.description || "",
    quantity: item.quantity,
    expiryTime: item.expiryTime,
    safetyHours: Number(item.safetyHours),
    createdAt: item.createdAt,
    status: item.status || "available",
    claimedBy: item.claimedBy || null,
    pickupLocation: item.pickupLocation,
    freshnessStatus: calculateFreshness(item.createdAt, item.safetyHours),
    category: item.category,
    createdBy: item.createdBy || "anonymous",
  };
}

// Freshness helper
function calculateFreshness(createdAt, safeForHours) {
  const now = new Date();
  const elapsedHours = (now - new Date(createdAt)) / (1000 * 60 * 60);
  if (elapsedHours <= safeForHours / 2) return "fresh";
  if (elapsedHours < safeForHours) return "good";
  return "expired";
}

export default router;
