/* Animated Navbar with hamburger for mobile */
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { playClick } from '../../utils/sounds'
import PlayerProfile from '../ui/PlayerProfile'

const NAV_LINKS = [
  { path: '/', label: 'Lobby', icon: '🏠' },
  { path: '/games', label: 'Games', icon: '🎮' },
  { path: '/fun-zone', label: 'Fun Zone', icon: '🧩' },
  { path: '/roblox', label: 'Roblox', icon: '⭐' },
  { path: '/wheel', label: 'Wheel', icon: '🎡' },
  { path: '/gallery', label: 'Gallery', icon: '📸' },
  { path: '/drawing', label: 'Drawing', icon: '✏️' },
  { path: '/achievements', label: 'Achievements', icon: '🏆' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { darkMode, toggleDarkMode, soundOn, toggleSound, player } = useGame()
  const navigate = useNavigate()

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-[90] px-4 py-2"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,46,0.8)] rounded-2xl px-4 py-2 border border-[rgba(0,212,255,0.15)]">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
          >
            <span className="text-2xl">🎮</span>
            <span className="text-gradient font-bold text-lg hidden sm:inline" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Musa's World
            </span>
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1
                  ${isActive
                    ? 'bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
                  }
                `}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { playClick(); toggleDarkMode() }}
              className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-lg cursor-pointer border-none"
            >
              {darkMode ? '🌙' : '☀️'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { playClick(); toggleSound() }}
              className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-lg cursor-pointer border-none"
            >
              {soundOn ? '🔊' : '🔇'}
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-1 bg-[rgba(255,238,0,0.15)] rounded-full px-3 py-1.5 cursor-pointer border-none"
              >
                <span className="text-sm">🪙</span>
                <span className="text-[#ffee00] font-bold text-sm">{player?.coins || 0}</span>
                <span className="text-white/40 mx-1">|</span>
                <span className="text-sm">⭐</span>
                <span className="text-[#00ff88] font-bold text-sm">Lvl {player?.level || 1}</span>
              </motion.button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 z-50"
                  >
                    <PlayerProfile />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-full bg-[rgba(255,255,255,0.1)] flex flex-col items-center justify-center gap-1 cursor-pointer border-none"
            >
              <motion.span
                className="w-4 h-0.5 bg-white block"
                animate={mobileOpen ? { rotate: 45, y: 3 } : { rotate: 0, y: 0 }}
              />
              <motion.span
                className="w-4 h-0.5 bg-white block"
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              />
              <motion.span
                className="w-4 h-0.5 bg-white block"
                animate={mobileOpen ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }}
              />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-4 right-4 z-[85] bg-[rgba(10,10,46,0.95)] backdrop-blur-xl rounded-2xl p-4 border border-[rgba(0,212,255,0.2)] lg:hidden"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <NavLink
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all mb-1
                    ${isActive
                      ? 'bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white'
                      : 'text-white/70 hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
                    }
                  `}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              </motion.div>
            ))}
            <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)]">
              <PlayerProfile compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
