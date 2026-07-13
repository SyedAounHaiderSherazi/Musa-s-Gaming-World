/* Player data management with XP, coins, level system */
import { useLocalStorage } from './useLocalStorage'

const XP_PER_LEVEL = 100

export function usePlayerData() {
  const [playerData, setPlayerData] = useLocalStorage('musa-player-data', {
    name: 'Player',
    avatar: null,
    xp: 0,
    coins: 0,
    level: 1,
    gamesPlayed: 0,
    dailyStreak: 0,
    lastLogin: null,
    achievements: [],
    totalClicks: 0,
    drawingsSaved: 0,
    favoriteGames: [],
  })

  const addXP = (amount) => {
    setPlayerData(prev => {
      const newXp = prev.xp + amount
      const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1
      return { ...prev, xp: newXp, level: newLevel }
    })
  }

  const addCoins = (amount) => {
    setPlayerData(prev => ({ ...prev, coins: prev.coins + amount }))
  }

  const incrementGamesPlayed = () => {
    setPlayerData(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }))
  }

  const toggleFavoriteGame = (gameId) => {
    setPlayerData(prev => {
      const favs = prev.favoriteGames || []
      const updated = favs.includes(gameId)
        ? favs.filter(id => id !== gameId)
        : [...favs, gameId]
      return { ...prev, favoriteGames: updated }
    })
  }

  const addAchievement = (achievementId) => {
    setPlayerData(prev => {
      if (prev.achievements.includes(achievementId)) return prev
      return { ...prev, achievements: [...prev.achievements, achievementId] }
    })
  }

  const updateDailyStreak = () => {
    setPlayerData(prev => {
      const today = new Date().toDateString()
      if (prev.lastLogin === today) return prev

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const isConsecutive = prev.lastLogin === yesterday.toDateString()

      return {
        ...prev,
        dailyStreak: isConsecutive ? prev.dailyStreak + 1 : 1,
        lastLogin: today,
      }
    })
  }

  const xpForCurrentLevel = playerData.xp % XP_PER_LEVEL
  const xpForNextLevel = XP_PER_LEVEL

  return {
    ...playerData,
    setPlayer: setPlayerData,
    addXP,
    addCoins,
    incrementGamesPlayed,
    addAchievement,
    toggleFavoriteGame,
    updateDailyStreak,
    xpForCurrentLevel,
    xpForNextLevel,
    XP_PER_LEVEL,
  }
}
