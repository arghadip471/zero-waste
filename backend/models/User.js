import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: { 
    type: String, 
    required: true, 
    enum: ["admin", "canteen", "ngo"], 
    default: "ngo" 
  },

  // 🔹 OTP fields
  otp: { type: String }, // store as string so we can include leading zeros
  otpExpires: { type: Date }, // expiry time for OTP
  isVerified: { type: Boolean, default: false } // true after OTP verification
}, { timestamps: true }); // adds createdAt & updatedAt

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
