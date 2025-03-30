// middleware/logEndpointStats.js
const EndpointStats = require("../models/EndPoints");

exports.logEndPoints = async (req, res, next) => {
  const method = req.method;
  const path = req.route?.path || req.originalUrl;

  if (path.includes(".") || path === "/favicon.ico") return next();

  try {
    await EndpointStats.findOneAndUpdate(
      { method, path },
      { $inc: { count: 1 } },
      { upsert: true }
    );
  } catch (err) {
    console.error("Endpoint logging error:", err);
  }

  next();
};
