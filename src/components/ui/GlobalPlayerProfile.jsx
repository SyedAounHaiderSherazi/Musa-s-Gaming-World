/* GlobalPlayerProfile - Floating player card visible on every page */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import MusaAvatar from './MusaAvatar'
import GlassPanel from './GlassPanel'

export default function GlobalPlayerProfile() {
  const { player, level, xp, coins, achievements, gamesPlayed, dailyStreak, xpForCurrentLevel, xpForNextLevel, XP_PER_LEVEL } = useGame()
  const [showFullProfile, setShowFullProfile] = useState(false)
  const xpPercent = Math.round((xpForCurrentLevel / xpForNextLevel) * 100)

  const fullStats = [
    { label: 'Level', value: level, icon: '⭐', color: '#00ff88' },
    { label: 'XP Progress', value: `${xpForCurrentLevel}/${xpForNextLevel}`, icon: '📈', color: '#00d4ff' },
    { label: 'Coins', value: coins, icon: '🪙', color: '#ffee00' },
    { label: 'Achievements', value: achievements?.length || 0, icon: '🏆', color: '#ff00ff' },
    { label: 'Games Played', value: gamesPlayed, icon: '🎮', color: '#00d4ff' },
    { label: 'Daily Streak', value: `${dailyStreak || 0}🔥`, icon: '', color: '#ff8800' },
  ]

  return (
    <>
      {/* Desktop Card - top right */}
      <motion.div
        className="fixed top-20 right-4 z-[80] hidden md:block"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <GlassPanel className="p-4 w-64 cursor-pointer" onClick={() => setShowFullProfile(true)}>
          {/* Animated border glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, #00d4ff, #ff00ff, #00ff88, #ffee00, #00d4ff)',
              filter: 'blur(8px)',
              animation: 'spin 4s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <MusaAvatar src="/images/musa/avatar.jpeg" size={48} glowing ring ringColor="#00d4ff" />
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold text-sm truncate">Syed Musa Hassan</p>
                <p className="text-[#00ff88] text-xs font-semibold">Level {level}</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88] shrink-0" style={{ boxShadow: '0 0 8px #00ff88' }} />
            </div>

            {/* XP Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-white/50 mb-1">
                <span>XP</span>
                <span>{xpForCurrentLevel}/{xpForNextLevel}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #00d4ff, #ff00ff, #00ff88)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Coins */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-sm">🪙</span>
              <span className="text-[#ffee00] font-bold text-xs">{coins.toLocaleString()}</span>
            </div>
          </div>
        </GlassPanel>
      </motion.div>

      {/* Mobile Pill - bottom right */}
      <motion.div
        className="fixed bottom-4 right-4 z-[80] md:hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <motion.div
          className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full cursor-pointer"
          style={{
            background: 'rgba(10,10,46,0.85)',
            border: '1px solid rgba(0,212,255,0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 20px rgba(0,212,255,0.15)',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFullProfile(true)}
        >
          <MusaAvatar src="/images/musa/avatar.jpeg" size={32} glowing ring ringColor="#00d4ff" />
          <span className="text-white text-xs font-bold">Lv.{level}</span>
          <span className="text-[#ffee00] text-xs">🪙{coins}</span>
          <div className="w-2 h-2 rounded-full bg-[#00ff88] shrink-0" style={{ boxShadow: '0 0 6px #00ff88' }} />
        </motion.div>
      </motion.div>

      {/* Full Profile Modal */}
      <AnimatePresence>
        {showFullProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowFullProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              <GlassPanel className="p-6 w-full max-w-sm text-center" glow>
                {/* Animated border */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
                  style={{
                    background: 'conic-gradient(from 0deg, #00d4ff, #ff00ff, #00ff88, #ffee00, #00d4ff)',
                    filter: 'blur(10px)',
                    animation: 'spin 4s linear infinite',
                  }}
                />

                <div className="relative z-10">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <MusaAvatar src="/images/musa/avatar.jpeg" size={96} glowing ring ringColor="#00d4ff" />
                  </div>

                  {/* Name & Level */}
                  <h2 className="text-xl font-bold text-white mb-1">Syed Musa Hassan</h2>
                  <p className="text-[#00ff88] font-semibold text-sm mb-4">Level {level}</p>

                  {/* XP Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-white/50 mb-1.5">
                      <span>Experience</span>
                      <span className="text-[#00d4ff] font-bold">{xpForCurrentLevel} / {xpForNextLevel} XP</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #00d4ff, #ff00ff, #00ff88)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPercent}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {fullStats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        className="bg-white/5 rounded-xl p-3 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                      >
                        {stat.icon && <div className="text-lg mb-1">{stat.icon}</div>}
                        <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-[10px] text-white/40">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Close */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFullProfile(false)}
                    className="px-6 py-2 rounded-xl font-bold text-white border-none cursor-pointer text-sm"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #ff00ff)' }}
                  >
                    Close
                  </motion.button>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
