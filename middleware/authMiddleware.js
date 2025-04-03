const jwt = require("jsonwebtoken");
const { User, ApiUsage } = require("../models/User");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, isAdmin: decoded.isAdmin };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const trackApiUsage = async (req, res, next) => {
  try {
    // Get user from database
    const user = await User.findById(req.user.userId).populate("apiUsage");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Access ApiUsage through the populated field
    const apiUsage = user.apiUsage;
    if (!apiUsage) {
      return res.status(404).json({ message: "API usage data not found" });
    }

    // Decrement remaining API calls
    apiUsage.apiCallsRemaining = Math.max(0, apiUsage.apiCallsRemaining - 1);
    await apiUsage.save();

    // Check if user has exceeded free API calls limit
    if (apiUsage.apiCallsRemaining <= 0) {
      req.apiLimitExceeded = true;
    }

    next();
  } catch (error) {
    console.error("API tracking error:", error);
    next(error);
  }
};

module.exports = {
  authMiddleware,
  trackApiUsage,
};
