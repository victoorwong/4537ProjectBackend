// utils/nhlApiService.js
const axios = require('axios');

// Get recent NHL games
async function getRecentGames(limit = 10) {
  try {
    const today = new Date();
    const formattedDate = formatDate(today);
    
    const response = await axios.get(
      `https://api-web.nhle.com/v1/schedule/${formattedDate}`
    );
    
    const data = response.data;
    const games = [];
    
    // Process each date
    if (data.gameWeek && Array.isArray(data.gameWeek)) {
      data.gameWeek.forEach(day => {
        if (day.games && Array.isArray(day.games)) {
          day.games.forEach(game => {
            if (game.gameState === 'FINAL' || game.gameState === 'OFF') {
              games.push({
                gameId: game.id,
                date: game.startTimeUTC,
                homeTeam: game.homeTeam.name.default,
                awayTeam: game.awayTeam.name.default,
                homeScore: game.homeTeam.score,
                awayScore: game.awayTeam.score,
                venue: game.venue?.default || 'Unknown Venue'
              });
            }
          });
        }
      });
    }
    
    return games.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent NHL games:', error);
    throw error;
  }
}

async function getGameDetails(gameId) {
  try {
    const landingResponse = await axios.get(`https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`);
    const landingData = landingResponse.data;
    const boxscoreResponse = await axios.get(`https://api-web.nhle.com/v1/gamecenter/${gameId}/boxscore`);
    const boxscoreData = boxscoreResponse.data;
    
    const gameData = {
      gameId: gameId,
      homeTeam: landingData.homeTeam.name.default,
      awayTeam: landingData.awayTeam.name.default,
      homeScore: landingData.homeTeam.score,
      awayScore: landingData.awayTeam.score,
      date: landingData.gameDate,
      venue: landingData.venue?.default || 'Unknown Venue',
      periodScores: extractPeriodScores(landingData),
      scoringPlays: extractScoringPlays(landingData),
      homeShots: landingData.homeTeam.sog || 0,
      awayShots: landingData.awayTeam.sog || 0
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
  const periodScores = [];
  
  if (gameData.summary && gameData.summary.scoring) {
    for (const period in gameData.summary.scoring) {
      if (Object.prototype.hasOwnProperty.call(gameData.summary.scoring, period)) {
        periodScores.push({
          period: getPeriodName(period),
          homeScore: gameData.summary.scoring[period].homeScore,
          awayScore: gameData.summary.scoring[period].awayScore
        });
      }
    }
  }
  
  return periodScores;
}

function getPeriodName(period) {
  switch(period) {
    case '1': return '1st';
    case '2': return '2nd';
    case '3': return '3rd';
    case 'OT': return 'OT';
    case 'SO': return 'SO';
    default: return period;
  }
}

function extractScoringPlays(gameData) {
  const scoringPlays = [];
  
  if (gameData.summary && gameData.summary.scoring) {
    for (const period in gameData.summary.scoring) {
      if (Object.prototype.hasOwnProperty.call(gameData.summary.scoring, period) && 
          gameData.summary.scoring[period].goals) {
        
        gameData.summary.scoring[period].goals.forEach(goal => {
          scoringPlays.push({
            period: getPeriodName(period),
            periodTime: goal.timeInPeriod,
            team: goal.teamAbbrev.default,
            description: `${goal.firstName.default} ${goal.lastName.default} (${goal.goalsToDate}) ${goal.shotType}`
          });
        });
      }
    }
  }
  
  return scoringPlays;
}

module.exports = {
  getRecentGames,
  getGameDetails
};