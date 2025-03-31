// routes/nhlRoutes.js
const express = require("express");
const { getRecentGames, getGameDetails } = require("../controllers/nhlController");
const router = express.Router();

router.get("/games", getRecentGames);
router.get("/game/:id", getGameDetails);

module.exports = router;