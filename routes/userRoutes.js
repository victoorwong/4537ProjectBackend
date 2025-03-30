// user routes
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User"); // Import User model

const router = express.Router();

// Get user profile (protected route)
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isAdmin) {
      const allUsers = await User.find({}, "email userData apiCallsRemaining");
      return res.json({ isAdmin: true, allUserData: allUsers });
    } else {
      return res.json({
        isAdmin: false,
        userData: user.userData,
        apiCallsRemaining: user.apiCallsRemaining,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
