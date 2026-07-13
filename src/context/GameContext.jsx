/* Game context for global state management */
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { usePlayerData } from '../hooks/usePlayerData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { setSoundEnabled, playLevelUp, startBGMusic, stopBGMusic } from '../utils/sounds'

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

  // Sync dark mode to body class
  useEffect(() => {
    document.body.classList.remove('dark', 'light')
    document.body.classList.add(darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Sync sound toggle to sound utility + BG music
  useEffect(() => {
    setSoundEnabled(soundOn)
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

  const value = useMemo(() => ({
    ...player,
    player,
    unlockAchievement: (id) => { player.addAchievement(id); playLevelUp() },
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
  }), [player, darkMode, toggleDarkMode, soundOn, toggleSound, showLoading, visitedPages, markPageVisited, treasureFound, findTreasure, wheelSpins, incrementWheelSpins, dailyRewardClaimed, claimDailyReward])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within a GameProvider')
  return context
}
