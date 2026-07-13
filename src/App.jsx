/* Main App - Routes and Layout */
import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame } from './context/GameContext'
import { startBGMusic, stopBGMusic, playHover } from './utils/sounds'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CinematicIntro from './components/ui/CinematicIntro'
import LoadingScreen from './components/ui/LoadingScreen'
import FloatingParticles from './components/ui/FloatingParticles'
import FloatingBalloons from './components/ui/FloatingBalloons'
import NPCCompanion from './components/ui/NPCCompanion'
import ChatBubble from './components/ui/ChatBubble'
import BackToTop from './components/ui/BackToTop'
import ScrollProgress from './components/ui/ScrollProgress'
import AvatarSelection from './pages/AvatarSelection'
import Home from './pages/Home'
import AboutMe from './pages/AboutMe'
import MiniGames from './pages/MiniGames'
import RobloxCorner from './pages/RobloxCorner'
import FunZone from './pages/FunZone'
import DrawingPad from './pages/DrawingPad'
import Achievements from './pages/Achievements'
import Gallery from './pages/Gallery'
import MusicRoom from './pages/MusicRoom'
import SurpriseRoom from './pages/SurpriseRoom'
import LuckyWheel from './pages/LuckyWheel'

function PageWrapper({ children }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

function AppContent() {
  const [introComplete, setIntroComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarSelected, setAvatarSelected] = useState(() => {
    return localStorage.getItem('musa-avatar-selected') === 'true'
  })
  const { markPageVisited, updateDailyStreak } = useGame()
  const location = useLocation()

  const handleIntroComplete = useCallback(() => setIntroComplete(true), [])
  const handleLoadingComplete = useCallback(() => setLoading(false), [])
  const handleAvatarComplete = useCallback(() => setAvatarSelected(true), [])

  useEffect(() => {
    updateDailyStreak()
  }, [updateDailyStreak])

  // Start/stop ambient BG music based on route
  useEffect(() => {
    if (location.pathname === '/music') {
      stopBGMusic()
    } else {
      startBGMusic()
    }
    return () => stopBGMusic()
  }, [location.pathname])

  // Restart BG music when intro completes (AudioContext is now live after tap-to-start)
  useEffect(() => {
    if (introComplete) {
      stopBGMusic()
      startBGMusic()
    }
  }, [introComplete])

  // Global hover sound listener (delegated)
  useEffect(() => {
    const handler = (e) => {
      const el = e.target.closest('button, a, [role="button"], .cursor-pointer, input[type="range"]')
      if (el) playHover()
    }
    document.addEventListener('mouseover', handler, { passive: true })
    return () => document.removeEventListener('mouseover', handler)
  }, [])

  useEffect(() => {
    const path = location.pathname
    const pageMap = {
      '/': 'home', '/about': 'about', '/games': 'games',
      '/roblox': 'roblox', '/fun-zone': 'fun-zone', '/drawing': 'drawing',
      '/achievements': 'achievements', '/gallery': 'gallery',
      '/music': 'music', '/surprise': 'surprise', '/wheel': 'wheel',
    }
    if (pageMap[path]) markPageVisited(pageMap[path])
  }, [location.pathname, markPageVisited])

  if (!introComplete) {
    return <CinematicIntro onComplete={handleIntroComplete} />
  }

  if (loading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  if (!avatarSelected) {
    return <AvatarSelection onComplete={handleAvatarComplete} />
  }

  return (
    <div className="relative min-h-screen">
      <FloatingParticles />
      <FloatingBalloons />
      <NPCCompanion />
      <ChatBubble />
      <BackToTop />
      <ScrollProgress />
      <Navbar />

      <Routes>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutMe /></PageWrapper>} />
        <Route path="/games" element={<PageWrapper><MiniGames /></PageWrapper>} />
        <Route path="/roblox" element={<PageWrapper><RobloxCorner /></PageWrapper>} />
        <Route path="/fun-zone" element={<PageWrapper><FunZone /></PageWrapper>} />
        <Route path="/drawing" element={<PageWrapper><DrawingPad /></PageWrapper>} />
        <Route path="/achievements" element={<PageWrapper><Achievements /></PageWrapper>} />
        <Route path="/gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
        <Route path="/music" element={<PageWrapper><MusicRoom /></PageWrapper>} />
        <Route path="/surprise" element={<PageWrapper><SurpriseRoom /></PageWrapper>} />
        <Route path="/wheel" element={<PageWrapper><LuckyWheel /></PageWrapper>} />
        <Route path="*" element={
          <PageWrapper>
            <div className="min-h-screen pt-24 text-center">
              <motion.div className="text-8xl mb-4" animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity }}>🤔</motion.div>
              <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Fredoka One', cursive" }}>404 - Lost in the Game!</h1>
              <p className="text-white/60">This level doesn't exist yet...</p>
            </div>
          </PageWrapper>
        } />
      </Routes>

      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </BrowserRouter>
  )
}
