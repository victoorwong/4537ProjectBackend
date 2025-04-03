const jwt = require("jsonwebtoken");
const { User, ApiUsage } = require("../models/User");
const messages = require("../utils/messages");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: messages.noTokenProvided });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, isAdmin: decoded.isAdmin };
    next();
  } catch (err) {
    return res.status(401).json({ message: messages.invalidToken });
  }
};

const trackApiUsage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate("apiUsage");
    if (!user) {
      return res.status(404).json({ message: messages.userNotFound });
    }

    let apiUsage = user.apiUsage;

    // If no ApiUsage entry exists, create one
    if (!apiUsage) {
      apiUsage = new ApiUsage({
        userId: user._id,
        apiCallsRemaining: 20, // Default limit
      });
      await apiUsage.save();

      // Update User with reference
      user.apiUsage = apiUsage._id;
      await user.save();
    }

    // Block request if API limit is exceeded
    if (apiUsage.apiCallsRemaining <= 0) {
      return res.status(403).json({ message: messages.apiLimitExceeded });
    }

    // Decrement remaining API calls
    apiUsage.apiCallsRemaining -= 1;
    await apiUsage.save();

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
