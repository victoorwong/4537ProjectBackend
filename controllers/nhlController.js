// controllers/nhlController.js
const nhlApiService = require('../utils/nhlApiService');

// Get recent NHL games
exports.getRecentGames = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const games = await nhlApiService.getRecentGames(limit);
    
    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching NHL games" });
  }
};

// Get specific game details
exports.getGameDetails = async (req, res) => {
  try {
    const gameId = req.params.id;
    const gameDetails = await nhlApiService.getGameDetails(gameId);
    
    res.status(200).json({
      success: true,
      data: gameDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching game details" });
  }
};

// routes/nhlRoutes.js
const express = require("express");
const { getRecentGames, getGameDetails } = require("../controllers/nhlController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/games", authMiddleware, getRecentGames);
router.get("/game/:id", authMiddleware, getGameDetails);

module.exports = router;