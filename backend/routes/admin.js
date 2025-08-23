import express from "express";
import FoodItem from "../models/FoodItem.js";

const router = express.Router();

// 📌 Constants (adjust according to real-world data)
const FOOD_SAVED_PER_PERSON_KG = 0.3; // 0.3 kg per serving/person
const WATER_PER_SERVING_LITERS = 2;   // old constant (for reference)
const CARBON_PER_SERVING_KG = 2.5;    // old constant (for reference)



const BUCKET_CAPACITY_LITERS = 10;
const CARBON_PER_CAR_YEAR_KG = 4600;

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
                { $regexMatch: { input: "$quantity", regex: /^[0-9]+$/ } },
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

    // 🍽 Food saved in kg
    const totalFoodSavedKg = servingsTotal * FOOD_SAVED_PER_PERSON_KG;

    // 💧 Water saved (based on food weight)
    const totalWaterSavedLiters = totalFoodSavedKg * WATER_PER_SERVING_LITERS ;
    const totalBucketsSaved = totalWaterSavedLiters / BUCKET_CAPACITY_LITERS;

    // 🌱 Carbon saved (based on food weight)
    const totalCarbonSavedKg = totalFoodSavedKg * CARBON_PER_SERVING_KG;
    const carsOffStreetTotal = totalCarbonSavedKg / CARBON_PER_CAR_YEAR_KG;

    // 📤 Send response
    res.json({
      foodSaved: { total: totalFoodSavedKg, thisMonth: thisMonthFood, trend: 0 },
      peopleServed: { total: servingsTotal },
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
