// userRoutes.js
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getUserProfile } = require("../controllers/userController"); // ✅ Import the controller

const router = express.Router();

// Use the controller instead of inline function
router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;
