// user routes
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User"); // Import User model
const bcrypt = require("bcryptjs"); // Import for password hashing
const router = express.Router();

// Get user profile (protected route)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      userId: user._id,
      email: user.email,
      apiCallsRemaining: user.apiCallsRemaining,
      isAdmin: user.isAdmin,
      message: `Welcome User ID: ${req.user.userId}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile (protected route)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    
    res.json({
      message: "Profile updated successfully",
      user: {
        userId: user._id,
        email: user.email,
        apiCallsRemaining: user.apiCallsRemaining
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;