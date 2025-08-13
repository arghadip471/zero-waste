import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import foodRoutes from "./routes/food.js";
import adminRoutes from "./routes/admin.js";
import eventRoutes from "./routes/events.js";
import userRouthes from "./routes/user.js";
import dotenv from "dotenv" 

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://chowdhuryarghadip471:2dUxNfq3Qa7cT5eZ@cluster0.4mvbsij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/zero_waste", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRouthes);

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
