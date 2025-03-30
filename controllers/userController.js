// user related logic
const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let data;

    if (user.isAdmin) {
      const allUsers = await User.find({}, "email userData apiCallsRemaining");
      data = allUsers;
    } else {
      data = user.userData;
    }

    res.json({
      email: user.email,
      isAdmin: user.isAdmin,
      userData: data,
      apiCallsRemaining: user.apiCallsRemaining,
      message: `Welcome User ID: ${req.user.userId}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
