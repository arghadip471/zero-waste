import express from "express";
import FoodItem from "../models/FoodItem.js";
import mongoose from "mongoose";

const router = express.Router();

// 📌 Constants (adjust according to real-world data)
const WATER_PER_SERVING_LITERS = 2; // liters saved per serving
const CARBON_PER_SERVING_KG = 2.5;    // kg CO₂e saved per serving
const BUCKET_CAPACITY_LITERS = 10;    // liters per bucket
const CARBON_PER_CAR_YEAR_KG = 4600;  // average kg CO₂ emitted per car per year

router.get("/stats", async (req, res) => {
  try {
    // 📌 Total food saved (items)
    const totalFood = await FoodItem.countDocuments();

    // 📌 This month's food saved
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthFood = await FoodItem.countDocuments({ createdAt: { $gte: startOfMonth } });

    // 📌 Category breakdown
    const topCategories = await FoodItem.aggregate([
  {
    $group: {
      _id: "$category",
      totalKg: {
        $sum: {
          $cond: [
            { $regexMatch: { input: "$quantity", regex: /^[0-9]+$/ } }, // only numeric quantities
            { $toDouble: "$quantity" },
            0
          ]
        }
      }
    }
  },
  { $sort: { totalKg: -1 } },
  { $limit: 5 },
  {
    $group: {
      _id: null,
      categories: { $push: "$$ROOT" },
      totalWeight: { $sum: "$totalKg" }
    }
  },
  { $unwind: "$categories" },
  {
    $project: {
      category: "$categories._id",
      totalKg: "$categories.totalKg",
      percentage: {
        $round: [
          { $multiply: [{ $divide: ["$categories.totalKg", "$totalWeight"] }, 100] },
          0
        ]
      }
    }
  },
  { $sort: { totalKg: -1 } }
]);


    // 📌 People served (quantity = servings)
    const totalServings = await FoodItem.aggregate([
      {
        $group: {
          _id: null,
          servings: {
            $sum: {
              $cond: [
                { $regexMatch: { input: "$quantity", regex: /^[0-9]+$/ } },
                { $toInt: "$quantity" },
                0
              ]
            }
          }
        }
      }
    ]);

    const servingsTotal = totalServings[0]?.servings || 0;

    // 📌 Waste reduction %
    const claimedCount = await FoodItem.countDocuments({ status: "claimed" });
    const wasteReduction = totalFood > 0 ? (claimedCount / totalFood) * 100 : 0;

    // 💧 Water saved
    const totalWaterSavedLiters = servingsTotal * WATER_PER_SERVING_LITERS;
    const totalBucketsSaved = totalWaterSavedLiters / BUCKET_CAPACITY_LITERS;
    

    // 🌱 Carbon saved
    const totalCarbonSavedKg = servingsTotal * CARBON_PER_SERVING_KG;
    const carsOffStreetTotal = totalCarbonSavedKg / CARBON_PER_CAR_YEAR_KG;
   

    // 📤 Send response
    res.json({
      foodSaved: { total: totalFood, thisMonth: thisMonthFood, trend: 0 },
      peopleServed: { total: servingsTotal, thisMonth: 0, trend: 0 },
      categories: topCategories.map(cat => ({
        category: cat.category,
        totalKg: cat.totalKg,
        percentage: cat.percentage
      })),
      wasteReduction: { percentage: wasteReduction, target: 80 },
      waterSaved: {
        totalLiters: totalWaterSavedLiters,
        totalBuckets: totalBucketsSaved
      },
      carbonSaved: {
        totalKg: totalCarbonSavedKg,
        carsOffStreetTotal: Number(carsOffStreetTotal.toFixed(3))
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

export default router;
