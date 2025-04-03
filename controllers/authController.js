const { User } = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const messages = require("../utils/messages");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: messages.invalidEmailFormat });
    }

    if (!password) {
      return res.status(400).json({ message: messages.noPassword });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: messages.userExists });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: messages.registrationSuccess });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: messages.serverError });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: messages.invalidCredentials });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: messages.invalidCredentials });

    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: messages.loginSuccess, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: messages.serverError });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token").json({ message: messages.logoutSuccess });
};
