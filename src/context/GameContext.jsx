/* Game context for global state management */
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { usePlayerData } from '../hooks/usePlayerData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { setSoundEnabled, playLevelUp, startBGMusic, stopBGMusic } from '../utils/sounds'
import { setSfxEnabled, playSfx } from '../utils/sfx'
import { ACHIEVEMENTS } from '../utils/achievements'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const player = usePlayerData()
  const [darkMode, setDarkMode] = useLocalStorage('musa-dark-mode', true)
  const [soundOn, setSoundOn] = useLocalStorage('musa-sound', true)
  const [showLoading, setShowLoading] = useState(true)
  const [visitedPages, setVisitedPages] = useLocalStorage('musa-visited-pages', [])
  const [treasureFound, setTreasureFound] = useLocalStorage('musa-treasures', [])
  const [wheelSpins, setWheelSpins] = useLocalStorage('musa-wheel-spins', 0)
  const [dailyRewardClaimed, setDailyRewardClaimed] = useLocalStorage('musa-daily-reward', null)
  const [highScores, setHighScores] = useLocalStorage('musa-high-scores', {})
  const [completedGames, setCompletedGames] = useLocalStorage('musa-completed-games', [])
  const [gameSettings, setGameSettings] = useLocalStorage('musa-game-settings', {
    difficulty: 'easy',
    musicVolume: 0.5,
    sfxVolume: 0.7,
    showControls: true,
  })
  const [lastVisitedRoom, setLastVisitedRoom] = useLocalStorage('musa-last-room', '/')
  const [latestUnlock, setLatestUnlock] = useState(null)

  // Sync dark mode to body class
  useEffect(() => {
    document.body.classList.remove('dark', 'light')
    document.body.classList.add(darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Sync sound toggle to sound utility + BG music
  useEffect(() => {
    setSoundEnabled(soundOn)
    setSfxEnabled(soundOn)
    if (soundOn) {
      startBGMusic()
    } else {
      stopBGMusic()
    }
  }, [soundOn])

  const markPageVisited = useCallback((page) => {
    setVisitedPages(prev => {
      if (prev.includes(page)) return prev
      return [...prev, page]
    })
  }, [setVisitedPages])

  const findTreasure = useCallback((id) => {
    setTreasureFound(prev => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [setTreasureFound])

  const incrementWheelSpins = useCallback(() => {
    setWheelSpins(prev => prev + 1)
  }, [setWheelSpins])

  const claimDailyReward = useCallback(() => {
    const today = new Date().toDateString()
    setDailyRewardClaimed(today)
  }, [setDailyRewardClaimed])

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev)
  }, [setDarkMode])

  const toggleSound = useCallback(() => {
    setSoundOn(prev => !prev)
  }, [setSoundOn])

  // High scores
  const setHighScore = useCallback((gameId, score) => {
    setHighScores(prev => {
      if (!prev[gameId] || score > prev[gameId]) {
        return { ...prev, [gameId]: score }
      }
      return prev
    })
  }, [setHighScores])

  const getHighScore = useCallback((gameId) => {
    return highScores[gameId] || 0
  }, [highScores])

  // Completed games
  const completeGame = useCallback((gameId) => {
    setCompletedGames(prev => {
      if (prev.includes(gameId)) return prev
      return [...prev, gameId]
    })
  }, [setCompletedGames])

  // Game settings
  const updateGameSettings = useCallback((updates) => {
    setGameSettings(prev => ({ ...prev, ...updates }))
  }, [setGameSettings])

  // Save last room
  const saveLastRoom = useCallback((room) => {
    setLastVisitedRoom(room)
  }, [setLastVisitedRoom])

  const value = useMemo(() => ({
    ...player,
    player,
    unlockAchievement: (id) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === id)
      if (achievement && !player.achievements.includes(id)) {
        player.addAchievement(id)
        playLevelUp()
        playSfx('achievement')
        setLatestUnlock({ ...achievement, xpEarned: 10, coinsEarned: 5 })
      }
    },
    latestUnlock,
    clearLatestUnlock: () => setLatestUnlock(null),
    toggleFavoriteGame: player.toggleFavoriteGame,
    darkMode,
    toggleDarkMode,
    soundOn,
    toggleSound,
    showLoading,
    setShowLoading,
    visitedPages,
    markPageVisited,
    treasureFound,
    findTreasure,
    wheelSpins,
    incrementWheelSpins,
    dailyRewardClaimed,
    claimDailyReward,
    highScores,
    setHighScore,
    getHighScore,
    completedGames,
    completeGame,
    gameSettings,
    updateGameSettings,
    lastVisitedRoom,
    saveLastRoom,
  }), [player, darkMode, toggleDarkMode, soundOn, toggleSound, showLoading, visitedPages, markPageVisited, treasureFound, findTreasure, wheelSpins, incrementWheelSpins, dailyRewardClaimed, claimDailyReward, highScores, setHighScore, getHighScore, completedGames, completeGame, gameSettings, updateGameSettings, lastVisitedRoom, saveLastRoom, latestUnlock])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within a GameProvider')
  return context
}
