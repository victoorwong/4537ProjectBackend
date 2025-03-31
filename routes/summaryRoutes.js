const express = require("express");
const { generateGameSummary, getUserSummaries, deleteSummary, generateNhlSummary} = require("../controllers/summaryController");
const { authMiddleware, trackApiUsage } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/generate", authMiddleware, trackApiUsage, generateGameSummary);
router.get("/", authMiddleware, getUserSummaries);
router.delete("/:id", authMiddleware, deleteSummary);
router.post("/generate-nhl", authMiddleware, generateNhlSummary);

module.exports = router;