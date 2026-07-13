/* Surprise / Secret Room Page */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Confetti, { useConfetti } from '../components/ui/Confetti'
import Fireworks from '../components/ui/Fireworks'
import GlassPanel from '../components/ui/GlassPanel'
import { useGame } from '../context/GameContext'
import { playCelebration, playPop } from '../utils/sounds'

const DANCING_EMOJIS = ['💃', '🕺', '🎉', '🎊', '🥳', '😍', '🤩', '😎', '🌈', '✨', '💎', '🔥', '⭐', '🦄', '🍕', '🎮']

const RAINBOW_COLORS = ['#ff0000', '#ff8800', '#ffee00', '#00ff88', '#00d4ff', '#aa00ff', '#ff00ff']

export default function SurpriseRoom() {
  const [showConfetti, setShowConfetti] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [dancingEmojis, setDancingEmojis] = useState([])
  const [rainbowMode, setRainbowMode] = useState(false)
  const { addXP, addCoins, unlockAchievement } = useGame()
  const confetti = useConfetti()
  const rewardGivenRef = useRef(false)

  useEffect(() => {
    unlockAchievement('secret_room')
    confetti.fire()
    setShowConfetti(true)
    setTimeout(() => setShowFireworks(true), 500)

    const interval = setInterval(() => {
      const newEmoji = {
        id: Math.random(),
        emoji: DANCING_EMOJIS[Math.floor(Math.random() * DANCING_EMOJIS.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
      }
      setDancingEmojis(prev => [...prev.slice(-30), newEmoji])
    }, 300)

    if (!rewardGivenRef.current) {
      rewardGivenRef.current = true
      addXP(50)
      addCoins(100)
    }

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`min-h-screen pt-24 pb-8 px-4 relative overflow-hidden ${rainbowMode ? 'animate-rainbow' : ''}`}
      style={{
        background: rainbowMode
          ? undefined
          : 'linear-gradient(135deg, #0a0a2e 0%, #2a0a4e 25%, #0a2a4e 50%, #4a0a3e 75%, #0a0a2e 100%)',
      }}>
      <Confetti active={showConfetti} duration={5000} intensity={100} />
      <Fireworks active={showFireworks} count={10} />

      {dancingEmojis.map(e => (
        <motion.div key={e.id} className="absolute text-3xl pointer-events-none z-10"
          style={{ left: `${e.x}%`, top: `${e.y}%` }}
          initial={{ scale: 0, rotate: 0, opacity: 1 }}
          animate={{ scale: [0, 1.5, 0], rotate: [0, 360], opacity: [1, 1, 0], y: [0, -50] }}
          transition={{ duration: 2 }}>
          {e.emoji}
        </motion.div>
      ))}

      <div className="fixed inset-0 pointer-events-none z-0">
        {RAINBOW_COLORS.map((color, i) => (
          <motion.div key={i} className="absolute h-2 rounded-full opacity-10"
            style={{ background: color, top: `${15 * i}%`, left: '-10%', right: '-10%' }}
            animate={{ x: ['-10%', '10%', '-10%'] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
      </div>

      <div className="relative z-20 max-w-4xl mx-auto text-center">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient animate-rainbow">🎉 SECRET ROOM! 🎉</span>
          </h1>
        </motion.div>

        <motion.p className="text-white/80 text-lg mb-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          You found the hidden secret room! 🥳
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🎆', label: 'Fireworks!' },
            { icon: '🌈', label: 'Rainbows!' },
            { icon: '💃', label: 'Dancing!' },
            { icon: '🎊', label: 'Party!' },
            { icon: '💎', label: '+100 Coins!' },
            { icon: '⭐', label: '+50 XP!' },
            { icon: '🏆', label: 'Secret Badge!' },
            { icon: '🔮', label: 'Mystery!' },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + 0.1 * i }}>
              <GlassPanel className="text-center" whileHover={{ scale: 1.1, rotate: Math.random() * 10 - 5 }}>
                <motion.div className="text-4xl mb-2"
                  animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}>
                  {item.icon}
                </motion.div>
                <p className="text-white/70 text-xs font-bold">{item.label}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { playCelebration(); confetti.fire(); setShowFireworks(true); setTimeout(() => setShowFireworks(false), 3000) }}
            className="px-6 py-3 rounded-xl font-bold text-white border-none cursor-pointer text-sm"
            style={{ background: 'linear-gradient(135deg, #ff00ff, #ff0044)' }}>
            🎉 More Confetti!
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { playPop(); setRainbowMode(!rainbowMode) }}
            className="px-6 py-3 rounded-xl font-bold text-white border-none cursor-pointer text-sm"
            style={{ background: 'linear-gradient(135deg, #aa00ff, #00d4ff)' }}>
            🌈 Rainbow Mode!
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { playCelebration(); setShowFireworks(true) }}
            className="px-6 py-3 rounded-xl font-bold text-white border-none cursor-pointer text-sm"
            style={{ background: 'linear-gradient(135deg, #ffee00, #ff8800)' }}>
            🎆 Fireworks!
          </motion.button>
        </div>

        <motion.div className="mt-12"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <p className="text-white/40 text-sm italic">
            "The secret to happiness is believing you're awesome!" 🌟
          </p>
        </motion.div>
      </div>
    </div>
  )
}
