const jwt = require("jsonwebtoken");
const User = require("../models/User");
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const trackApiUsage = async (req, res, next) => {
  try {
    // Get user from database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Decrement remaining API calls
    user.apiCallsRemaining = Math.max(0, user.apiCallsRemaining - 1);
    await user.save();
    
    // Check if user has exceeded free API calls limit
    if (user.apiCallsRemaining <= 0) {
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
  trackApiUsage
};