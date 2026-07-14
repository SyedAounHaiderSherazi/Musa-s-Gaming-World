/* Main App - Routes and Layout */
import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame } from './context/GameContext'
import { startBGMusic, stopBGMusic, playHover } from './utils/sounds'
import { playByContext, stopMusic as stopMP3Music } from './utils/musicPlayer'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CinematicIntro from './components/ui/CinematicIntro'
import LoadingScreen from './components/ui/LoadingScreen'
import FloatingParticles from './components/ui/FloatingParticles'
import FloatingBalloons from './components/ui/FloatingBalloons'
import NPCCompanion from './components/ui/NPCCompanion'
import GlobalPlayerProfile from './components/ui/GlobalPlayerProfile'
import EasterEgg from './components/ui/EasterEgg'
import ChatBubble from './components/ui/ChatBubble'
import BackToTop from './components/ui/BackToTop'
import AchievementUnlock from './components/ui/AchievementUnlock'
import ScrollProgress from './components/ui/ScrollProgress'
import AvatarSelection from './pages/AvatarSelection'
import Home from './pages/Home'
import AboutMe from './pages/AboutMe'
import MiniGames from './pages/MiniGames'
import FightingGames from './pages/FightingGames'
import MeetMusa from './pages/MeetMusa'
import RobloxCorner from './pages/RobloxCorner'
import FunZone from './pages/FunZone'
import DrawingPad from './pages/DrawingPad'
import Achievements from './pages/Achievements'
import Gallery from './pages/Gallery'
import PlayerProfilePage from './pages/PlayerProfilePage'
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
  const { markPageVisited, updateDailyStreak, latestUnlock, clearLatestUnlock } = useGame()
  const location = useLocation()

  const handleIntroComplete = useCallback(() => setIntroComplete(true), [])
  const handleLoadingComplete = useCallback(() => setLoading(false), [])
  const handleAvatarComplete = useCallback(() => setAvatarSelected(true), [])

  useEffect(() => {
    updateDailyStreak()
  }, [updateDailyStreak])

  // Auto-switch music based on route context
  useEffect(() => {
    const path = location.pathname
    if (path === '/music') {
      stopBGMusic()
    } else if (path.startsWith('/fighting')) {
      stopBGMusic()
      playByContext('battle')
    } else if (path === '/surprise') {
      stopBGMusic()
      playByContext('secret')
    } else if (path === '/fun-zone' || path === '/meet-musa') {
      stopBGMusic()
      playByContext('happy')
    } else {
      stopMP3Music(false)
      startBGMusic()
    }
    return () => { stopBGMusic(); stopMP3Music(false) }
  }, [location.pathname])

  // Restart BG music when intro completes
  useEffect(() => {
    if (introComplete) {
      stopBGMusic()
      playByContext('intro')
      const t = setTimeout(() => startBGMusic(), 3000)
      return () => clearTimeout(t)
    }
  }, [introComplete])

  // Global hover sound listener
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
      '/fighting': 'fighting', '/meet-musa': 'meet-musa',
      '/roblox': 'roblox', '/fun-zone': 'fun-zone', '/drawing': 'drawing',
      '/achievements': 'achievements', '/gallery': 'gallery',
      '/music': 'music', '/surprise': 'surprise', '/wheel': 'wheel',
      '/profile': 'profile',
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
      <GlobalPlayerProfile />
      <EasterEgg />
      <ChatBubble />
      <BackToTop />
      <ScrollProgress />
      <AchievementUnlock
        achievement={latestUnlock}
        xpEarned={latestUnlock?.xpEarned}
        coinsEarned={latestUnlock?.coinsEarned}
        onClose={clearLatestUnlock}
      />
      <Navbar />

      <Routes>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutMe /></PageWrapper>} />
        <Route path="/games" element={<PageWrapper><MiniGames /></PageWrapper>} />
        <Route path="/fighting" element={<PageWrapper><FightingGames /></PageWrapper>} />
        <Route path="/meet-musa" element={<PageWrapper><MeetMusa /></PageWrapper>} />
        <Route path="/roblox" element={<PageWrapper><RobloxCorner /></PageWrapper>} />
        <Route path="/fun-zone" element={<PageWrapper><FunZone /></PageWrapper>} />
        <Route path="/drawing" element={<PageWrapper><DrawingPad /></PageWrapper>} />
        <Route path="/achievements" element={<PageWrapper><Achievements /></PageWrapper>} />
        <Route path="/gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><PlayerProfilePage /></PageWrapper>} />
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
