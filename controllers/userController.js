const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      userId: user._id,
      email: user.email,
      apiCallsRemaining: user.apiCallsRemaining,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (email) user.email = email;
    
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
};