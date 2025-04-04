const nhlApiService = require("../utils/nhlApiService");
const messages = require("../utils/messages");

// Get recent NHL games
const getRecentGames = async (req, res) => {
  console.log("Get recent games API hit");
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const games = await nhlApiService.getRecentGames(limit);

    res.status(200).json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: messages.errorFetchingGames });
  }
};

// Get specific game details
const getGameDetails = async (req, res) => {
  try {
    const gameId = req.params.id;
    const gameDetails = await nhlApiService.getGameDetails(gameId);

    res.status(200).json({
      success: true,
      data: gameDetails,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: messages.errorFetchingGameDetails });
  }
};

module.exports = {
  getRecentGames,
  getGameDetails,
};
