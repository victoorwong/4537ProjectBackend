const mongoose = require("mongoose");

const UsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  apiCallsRemaining: { type: Number, default: 20 },
});

module.exports = mongoose.model("Usage", UsageSchema);
