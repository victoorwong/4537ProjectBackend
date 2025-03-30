const mongoose = require("mongoose");

const EndpointStatsSchema = new mongoose.Schema({
  method: { type: String, required: true },
  path: { type: String, required: true },
  count: { type: Number, default: 0 },
});

EndpointStatsSchema.index({ method: 1, path: 1 }, { unique: true });

module.exports = mongoose.model("EndpointStats", EndpointStatsSchema);
