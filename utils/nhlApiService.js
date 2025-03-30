// utils/nhlApiService.js
const axios = require('axios');

// Get recent NHL games
async function getRecentGames(limit = 10) {
  try {
    // Get current date and format it for the API
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const startDate = formatDate(oneWeekAgo);
    const endDate = formatDate(today);
    
    // Fetch schedule for the past week
    const response = await axios.get(
      `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${startDate}&endDate=${endDate}`
    );
    
    const data = response.data;
    const games = [];
    
    // Process each date
    data.dates.forEach(date => {
      // Process each game on that date
      date.games.forEach(game => {
        // Only include completed games
        if (game.status.detailedState === 'Final') {
          games.push({
            gameId: game.gamePk,
            date: game.gameDate,
            homeTeam: game.teams.home.team.name,
            awayTeam: game.teams.away.team.name,
            homeScore: game.teams.home.score,
            awayScore: game.teams.away.score,
            venue: game.venue ? game.venue.name : 'Unknown Venue'
          });
        }
      });
    });
    
    // Return the most recent games up to the limit
    return games.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent NHL games:', error);
    throw error;
  }
}

// Get detailed game data
async function getGameDetails(gameId) {
  try {
    const response = await axios.get(`https://statsapi.web.nhl.com/api/v1/game/${gameId}/feed/live`);
    
    const data = response.data;
    
    // Extract game data
    const gameData = {
      gameId: data.gamePk,
      homeTeam: data.gameData.teams.home.name,
      awayTeam: data.gameData.teams.away.name,
      homeScore: data.liveData.linescore.teams.home.goals,
      awayScore: data.liveData.linescore.teams.away.goals,
      date: data.gameData.datetime.dateTime,
      venue: data.gameData.venue.name,
      periodScores: extractPeriodScores(data),
      scoringPlays: extractScoringPlays(data),
      homeShots: data.liveData.boxscore.teams.home.teamStats?.teamSkaterStats?.shots || 0,
      awayShots: data.liveData.boxscore.teams.away.teamStats?.teamSkaterStats?.shots || 0
    };
    
    return gameData;
  } catch (error) {
    console.error(`Error fetching details for game ${gameId}:`, error);
    throw error;
  }
}

// Helper functions
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function extractPeriodScores(gameData) {
  const periods = gameData.liveData.linescore.periods;
  return periods.map(period => ({
    period: period.ordinalNum,
    homeScore: period.home.goals,
    awayScore: period.away.goals
  }));
}

function extractScoringPlays(gameData) {
  const scoringPlays = [];
  const scoringIndices = gameData.liveData.plays.scoringPlays;
  
  scoringIndices.forEach(index => {
    const play = gameData.liveData.plays.allPlays[index];
    scoringPlays.push({
      period: play.about.period,
      periodTime: play.about.periodTime,
      team: play.team?.name || 'Unknown Team',
      description: play.result.description
    });
  });
  
  return scoringPlays;
}

module.exports = {
  getRecentGames,
  getGameDetails
};