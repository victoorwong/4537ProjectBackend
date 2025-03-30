const mongoose = require("mongoose");
const SummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  nhlGameId: {
    type: Number,
    required: false 
  },
  gameDetails: {
    homeTeam: {
      type: String,
      required: true
    },
    awayTeam: {
      type: String,
      required: true
    },
    homeScore: {
      type: Number,
      required: true
    },
    awayScore: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    venue: {
      type: String,
      required: false 
    }
  },
  summary: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Summary", SummarySchema);