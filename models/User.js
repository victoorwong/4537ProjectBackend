const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  userData: { type: Array, default: [] },
  postRequests: { type: Number, default: 0 },
  getRequests: { type: Number, default: 0 },
  apiCallsRemaining: { type: Number, default: 20 }, // Ensure this is defined
  apiUsage: { type: mongoose.Schema.Types.ObjectId, ref: "ApiUsage" },
  createdAt: { type: Date, default: Date.now },
});

const ApiUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  apiCallsRemaining: { type: Number, default: 20 },
});

// Export both models properly
const User = mongoose.model("User", UserSchema);
const ApiUsage = mongoose.model("ApiUsage", ApiUsageSchema);

module.exports = { User, ApiUsage };
