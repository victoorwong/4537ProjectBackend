const Summary = require("../models/Summary");
const User = require("../models/User");
const axios = require("axios");
const messages = require("../utils/messages");

async function generateSummary(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error(messages.summaryGenerationFailed);
  }
}

exports.generateGameSummary = async (req, res) => {
  try {
    const { homeTeam, awayTeam, homeScore, awayScore, date, highlights } =
      req.body;

    if (
      !homeTeam ||
      !awayTeam ||
      homeScore === undefined ||
      awayScore === undefined ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: messages.missingGameDetails,
      });
    }

    const user = await User.findById(req.user.userId);
    user.apiCallsRemaining -= 1;
    await user.save();

    const prompt = `Tell me the score and date for a hockey game based on the following information:
Game: ${homeTeam} vs ${awayTeam}
Final Score: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}
Date: ${date}
${highlights ? `Highlights: ${highlights}` : ""}

Hockey Game Summary:`;

    const summaryText = await generateSummary(prompt);

    const summary = await Summary.create({
      userId: req.user.userId,
      gameDetails: {
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        date: new Date(date),
      },
      summary: summaryText,
    });

    const response = {
      success: true,
      data: summary,
    };

    if (req.apiLimitExceeded) {
      response.warning = messages.apiLimitReached;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: messages.serverError });
  }
};

exports.getUserSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.user.userId });

    res.status(200).json({
      success: true,
      count: summaries.length,
      data: summaries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: messages.serverError });
  }
};

exports.deleteSummary = async (req, res) => {
  try {
    const summaryId = req.params.id;
    const summary = await Summary.findById(summaryId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: messages.summaryNotFound,
      });
    }

    if (summary.userId.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: messages.notAuthorizedToDelete,
      });
    }

    await Summary.findByIdAndDelete(summaryId);

    res.status(200).json({
      success: true,
      message: messages.summaryDeleted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: messages.serverError });
  }
};

exports.generateNhlSummary = async (req, res) => {
  try {
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: messages.missingGameId,
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user.isAdmin && user.apiCallsRemaining <= 0) {
      return res.status(403).json({
        success: false,
        message: messages.apiLimitReached,
      });
    }

    if (!user.isAdmin) {
      user.apiCallsRemaining -= 1;
      await user.save();
    }

    const nhlApiService = require("../utils/nhlApiService");
    const gameDetails = await nhlApiService.getGameDetails(gameId);

    const prompt = `Create a detailed hockey game summary for this NHL game:
      
Game: ${gameDetails.homeTeam} vs ${gameDetails.awayTeam}
Final Score: ${gameDetails.homeTeam} ${gameDetails.homeScore}, ${
      gameDetails.awayTeam
    } ${gameDetails.awayScore}
Date: ${new Date(gameDetails.date).toDateString()}
Venue: ${gameDetails.venue}

Period-by-Period Scoring:
${gameDetails.periodScores
  .map(
    (p) =>
      `${p.period}: ${gameDetails.homeTeam} ${p.homeScore}, ${gameDetails.awayTeam} ${p.awayScore}`
  )
  .join("\n")}

Shots on Goal: ${gameDetails.homeTeam} ${gameDetails.homeShots}, ${
      gameDetails.awayTeam
    } ${gameDetails.awayShots}

Key Plays:
${gameDetails.scoringPlays
  .map(
    (play) => `${play.period} Period, ${play.periodTime} - ${play.description}`
  )
  .join("\n")}

Please include information about key plays, player performances, and the flow of the game in your summary.`;

    const summaryText = await generateSummary(prompt);

    const summary = await Summary.create({
      userId: req.user.userId,
      gameDetails: {
        homeTeam: gameDetails.homeTeam,
        awayTeam: gameDetails.awayTeam,
        homeScore: gameDetails.homeScore,
        awayScore: gameDetails.awayScore,
        date: new Date(gameDetails.date),
      },
      summary: summaryText,
      nhlGameId: gameId,
    });

    const response = {
      success: true,
      data: summary,
    };

    if (!user.isAdmin && user.apiCallsRemaining <= 0) {
      response.warning = messages.apiLimitReached;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: messages.serverError });
  }
};
