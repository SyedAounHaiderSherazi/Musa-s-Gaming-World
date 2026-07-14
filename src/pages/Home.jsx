/* Home / Lobby Page - The central game hub */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { playClick, playCelebration } from '../utils/sounds'
import GlassPanel from '../components/ui/GlassPanel'
import Confetti, { useConfetti } from '../components/ui/Confetti'
import Fireworks from '../components/ui/Fireworks'
import MusaAvatar from '../components/ui/MusaAvatar'

const PORTALS = [
  { path: '/games', icon: '🎮', title: 'Mini Games', desc: '50+ awesome games!', color: '#00d4ff', gradient: 'from-[#00d4ff] to-[#0088ff]' },
  { path: '/fighting', icon: '⚔️', title: 'Fighting Games', desc: 'Cartoon battles!', color: '#ff0044', gradient: 'from-[#ff0044] to-[#ff00ff]' },
  { path: '/meet-musa', icon: '😎', title: 'Meet Musa', desc: 'Get to know me!', color: '#00ff88', gradient: 'from-[#00ff88] to-[#00aa88]' },
  { path: '/fun-zone', icon: '🧩', title: 'Fun Zone', desc: 'Jokes, facts, and magic!', color: '#ff00ff', gradient: 'from-[#ff00ff] to-[#aa00ff]' },
  { path: '/drawing', icon: '✏️', title: 'Drawing Studio', desc: 'Create awesome art!', color: '#00ff88', gradient: 'from-[#00ff88] to-[#00aa88]' },
  { path: '/achievements', icon: '🏆', title: 'Achievement Hall', desc: 'View your badges!', color: '#ffee00', gradient: 'from-[#ffee00] to-[#ff8800]' },
  { path: '/roblox', icon: '⭐', title: 'Roblox Favorites', desc: 'Top Roblox games!', color: '#ff8800', gradient: 'from-[#ff8800] to-[#ff0044]' },
  { path: '/gallery', icon: '📸', title: 'Gallery', desc: 'Fun image collection!', color: '#aa00ff', gradient: 'from-[#aa00ff] to-[#ff00ff]' },
  { path: '/about', icon: '👤', title: 'About Me', desc: 'Get to know Musa!', color: '#00d4ff', gradient: 'from-[#00d4ff] to-[#00ff88]' },
  { path: '/music', icon: '🎵', title: 'Music Room', desc: 'Chill tunes and beats!', color: '#ff0044', gradient: 'from-[#ff0044] to-[#ff00ff]' },
  { path: '/wheel', icon: '🎡', title: 'Lucky Wheel', desc: 'Spin and win prizes!', color: '#00d4ff', gradient: 'from-[#00d4ff] to-[#ff00ff]' },
]

const SECRET_PATH = '/surprise'

export default function Home() {
  const navigate = useNavigate()
  const { addCoins, addXP, dailyRewardClaimed, claimDailyReward, player } = useGame()
  const [showDailyReward, setShowDailyReward] = useState(false)
  const [dailyRewardContent, setDailyRewardContent] = useState(null)
  const confetti = useConfetti()
  const [fireworksActive, setFireworksActive] = useState(false)

  const claimDaily = () => {
    playCelebration()
    const coinsEarned = Math.floor(Math.random() * 50) + 10
    const xpEarned = Math.floor(Math.random() * 30) + 5
    addCoins(coinsEarned)
    addXP(xpEarned)
    claimDailyReward()
    setDailyRewardContent({ coins: coinsEarned, xp: xpEarned })
    setShowDailyReward(true)
    confetti.fire()
    setTimeout(() => setFireworksActive(true), 500)
    setTimeout(() => setFireworksActive(false), 3000)
  }

  const today = new Date().toDateString()
  const canClaimDaily = dailyRewardClaimed !== today

  const [secretClicks, setSecretClicks] = useState(0)
  const handleSecretClick = () => {
    const newCount = secretClicks + 1
    setSecretClicks(newCount)
    if (newCount >= 5) {
      navigate(SECRET_PATH)
      setSecretClicks(0)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 relative">
      <Confetti active={confetti.active} />
      <Fireworks active={fireworksActive} />

      {/* Hero Section - Musa as the main character */}
      <motion.section
        className="max-w-6xl mx-auto mb-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Left: Hero Portrait */}
          <div className="relative shrink-0">
            {/* Animated background ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #00d4ff, #ff00ff, #00ff88, #ffee00, #00d4ff)',
                filter: 'blur(20px)',
                opacity: 0.3,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            {/* Floating particles around portrait */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00'][i % 4],
                  left: `${50 + 55 * Math.cos(i * Math.PI / 4)}%`,
                  top: `${50 + 55 * Math.sin(i * Math.PI / 4)}%`,
                }}
                animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
              />
            ))}

            {/* The portrait */}
            <MusaAvatar src="/images/musa/avatar.jpeg" size={192} glowing ring ringColor="#00d4ff" floating />
          </div>

          {/* Right: Welcome text */}
          <div className="text-center md:text-left">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ fontFamily: "'Fredoka One', cursive" }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-gradient">Welcome,</span>
              <br />
              <span className="text-gradient-warm">Syed Musa Hassan!</span>
            </motion.h1>
            <motion.p
              className="text-white/60 text-lg mb-6 max-w-md"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              Ready for another adventure? Play <span className="text-[#ff00ff] font-bold">50+ games</span>,
              earn coins, and unlock achievements!
            </motion.p>
            <motion.button
              className="px-8 py-4 rounded-xl font-bold text-white text-lg cursor-pointer border-none"
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #ff00ff)',
                boxShadow: '0 0 30px rgba(0,212,255,0.3), 0 0 60px rgba(255,0,255,0.15)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(255,0,255,0.25)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigate('/games')}
            >
              🚀 Start Playing!
            </motion.button>
          </div>
        </div>

        {/* Daily Reward */}
        {canClaimDaily && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={claimDaily}
              className="px-6 py-3 rounded-2xl font-bold text-white border-none cursor-pointer text-base"
              style={{
                background: 'linear-gradient(135deg, #ffee00, #ff8800)',
                boxShadow: '0 0 30px rgba(255,238,0,0.3)',
              }}
            >
              🎁 Claim Daily Reward!
            </motion.button>
          </motion.div>
        )}

        <AnimatePresence>
          {showDailyReward && dailyRewardContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDailyReward(false)}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="bg-[rgba(10,10,46,0.95)] rounded-3xl p-8 text-center border border-[rgba(255,238,0,0.3)] max-w-sm mx-4"
                onClick={e => e.stopPropagation()}
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🎁
                </motion.div>
                <h2 className="text-2xl font-bold text-[#ffee00] mb-4">Daily Reward!</h2>
                <div className="flex justify-center gap-6 mb-4">
                  <div>
                    <div className="text-3xl mb-1">🪙</div>
                    <div className="text-[#ffee00] font-bold text-xl">+{dailyRewardContent.coins}</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-1">⭐</div>
                    <div className="text-[#00ff88] font-bold text-xl">+{dailyRewardContent.xp} XP</div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDailyReward(false)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold border-none cursor-pointer"
                >
                  Awesome! 🎉
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Portal Grid */}
      <div className="max-w-6xl mx-auto mb-12">
        <motion.h2
          className="text-2xl font-bold text-center mb-8 text-white/80"
          style={{ fontFamily: "'Fredoka One', cursive" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          🌟 Choose Your Adventure 🌟
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PORTALS.map((portal, i) => (
            <motion.div
              key={portal.path}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, type: 'spring', stiffness: 200 }}
            >
              <GlassPanel
                className="cursor-pointer text-center h-full"
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: `0 0 40px ${portal.color}30`,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playClick(); navigate(portal.path) }}
              >
                <motion.div
                  className="text-5xl mb-3 inline-block"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  {portal.icon}
                </motion.div>
                <h3 className="text-white font-bold text-base mb-1">{portal.title}</h3>
                <p className="text-white/50 text-xs">{portal.desc}</p>
                <motion.div
                  className="h-1 rounded-full mt-3 mx-auto w-12"
                  style={{ background: portal.color }}
                  whileHover={{ width: '80%' }}
                />
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Treasure Chest */}
      <div className="max-w-6xl mx-auto mb-8 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-white/30 text-xs mb-3">Hint: Something secret hides here... click the logo 5 times!</p>
          <motion.span
            className="text-4xl cursor-pointer inline-block select-none"
            onClick={handleSecretClick}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔮
          </motion.span>
        </motion.div>
      </div>

      {/* Fun Stats Banner */}
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <GlassPanel className="flex flex-wrap justify-center gap-8" hover={false}>
          {[
            { label: 'Level', value: player?.level || 1, icon: '⭐', color: '#00ff88' },
            { label: 'Coins', value: player?.coins || 0, icon: '🪙', color: '#ffee00' },
            { label: 'Games Played', value: player?.gamesPlayed || 0, icon: '🎮', color: '#00d4ff' },
            { label: 'Badges', value: player?.achievements?.length || 0, icon: '🏆', color: '#ff00ff' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              whileHover={{ scale: 1.1, y: -3 }}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-white/40 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </GlassPanel>
      </motion.div>

      {/* Replay Intro Button */}
      <motion.div
        className="max-w-4xl mx-auto mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            localStorage.removeItem('musa-intro-skipped')
            window.location.reload()
          }}
          className="px-5 py-2 rounded-full text-white/40 text-xs font-bold tracking-wider cursor-pointer border border-white/10"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(4px)',
          }}
        >
          🎬 Replay Intro
        </motion.button>
      </motion.div>
    </div>
  )
}
