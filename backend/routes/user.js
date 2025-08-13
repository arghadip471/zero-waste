// routes/userRoutes.js
import express from "express";
import User from "../models/User.js"; // Mongoose model

const router = express.Router();

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("name email"); // only fetch name & email

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
