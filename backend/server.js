import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import foodRoutes from "./routes/food.js";
import dotenv from "dotenv" 

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/zero_waste", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes)

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
