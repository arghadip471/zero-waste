import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["admin", "canteen", "ngo"], default: "ngo" } 
});

const User =  (mongoose.models.User) ||
  mongoose.model("User", userSchema);

export default User;
