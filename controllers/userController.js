const User = require("../models/User");
const bcrypt = require("bcryptjs");
const EndPoints = require("../models/EndPoints");
const messages = require("../utils/messages");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: messages.userNotFound });
    }

    if (user.isAdmin) {
      const allUsers = await User.find(
        {},
        "email userData apiCallsRemaining getRequests postRequests"
      );
      const endpointStats = await EndPoints.find({});
      return res.json({
        email: user.email,
        isAdmin: true,
        userData: allUsers,
        apiCallsRemaining: user.apiCallsRemaining,
        endpointStats,
        message: messages.welcomeAdmin(req.user.userId),
      });
    }

    return res.json({
      email: user.email,
      isAdmin: false,
      userData: user.userData,
      apiCallsRemaining: user.apiCallsRemaining,
      getRequests: user.getRequests,
      postRequests: user.postRequests,
      message: messages.welcomeUser(req.user.userId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: messages.serverError });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: messages.userNotFound });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: messages.emailInUse });
      }
      user.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: messages.profileUpdated,
      user: {
        userId: user._id,
        email: user.email,
        apiCallsRemaining: user.apiCallsRemaining,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: messages.serverError });
  }
};
