// utils/nhlApiService.js
const axios = require('axios');


console.log('API URL:', `https://api-web.nhle.com/v1/schedule/${formattedDate}`);
console.log('Today:', today);
console.log('Formatted date:', formattedDate);
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
                homeScore: game.homeTeam.score || 0,
                awayScore: game.awayTeam.score || 0,
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
    
    const gameData = {
      gameId: gameId,
      homeTeam: landingData.homeTeam.name.default,
      awayTeam: landingData.awayTeam.name.default,
      homeScore: landingData.homeTeam.score || 0,
      awayScore: landingData.awayTeam.score || 0,
      date: landingData.gameDate || landingData.startTimeUTC,
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

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function extractPeriodScores(gameData) {
  const periodScores = [];
  
  if (gameData && gameData.summary && gameData.summary.scoring) {
    for (const period in gameData.summary.scoring) {
      if (Object.prototype.hasOwnProperty.call(gameData.summary.scoring, period)) {
        periodScores.push({
          period: getPeriodName(period),
          homeScore: gameData.summary.scoring[period].homeScore || 0,
          awayScore: gameData.summary.scoring[period].awayScore || 0
        });
      }
    }
  }
  
  if (periodScores.length === 0 && gameData) {
    periodScores.push({
      period: '1st',
      homeScore: gameData.homeTeam?.score || 0,
      awayScore: gameData.awayTeam?.score || 0
    });
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
  
  if (gameData && gameData.summary && gameData.summary.scoring) {
    for (const period in gameData.summary.scoring) {
      if (Object.prototype.hasOwnProperty.call(gameData.summary.scoring, period) && 
          gameData.summary.scoring[period].goals) {
        
        gameData.summary.scoring[period].goals.forEach(goal => {
          const firstName = goal.firstName?.default || '';
          const lastName = goal.lastName?.default || '';
          const team = goal.teamAbbrev?.default || 'Unknown';
          
          scoringPlays.push({
            period: getPeriodName(period),
            periodTime: goal.timeInPeriod || '00:00',
            team: team,
            description: `${firstName} ${lastName} (${goal.goalsToDate || 0}) ${goal.shotType || ''}`
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