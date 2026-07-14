/* Lucky Wheel Page */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { playClick, playWhoosh, playCelebration } from '../utils/sounds'
import GlassPanel from '../components/ui/GlassPanel'
import Confetti, { useConfetti } from '../components/ui/Confetti'

const PRIZES = [
  { label: '10 Coins', icon: '🪙', color: '#ffee00', action: (game) => game.addCoins(10) },
  { label: '25 Coins', icon: '💰', color: '#ff8800', action: (game) => game.addCoins(25) },
  { label: '50 Coins', icon: '💎', color: '#ff00ff', action: (game) => game.addCoins(50) },
  { label: '20 XP', icon: '⭐', color: '#00ff88', action: (game) => game.addXP(20) },
  { label: '50 XP', icon: '🌟', color: '#00d4ff', action: (game) => game.addXP(50) },
  { label: '100 XP', icon: '🏆', color: '#aa00ff', action: (game) => game.addXP(100) },
  { label: 'Try Again!', icon: '😅', color: '#ffffff', action: () => {} },
  { label: '5 Coins', icon: '🪙', color: '#ffee00', action: (game) => game.addCoins(5) },
]

export default function LuckyWheel() {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState(null)
  const game = useGame()
  const confetti = useConfetti()

  const spin = () => {
    if (spinning) return
    playWhoosh()
    setSpinning(true)
    setResult(null)

    const selectedIndex = Math.floor(Math.random() * PRIZES.length)
    const segmentAngle = 360 / PRIZES.length
    const targetAngle = 360 - (selectedIndex * segmentAngle) - segmentAngle / 2
    const totalRotation = rotation + 360 * 5 + targetAngle

    setRotation(totalRotation)

    setTimeout(() => {
      setSpinning(false)
      setResult(PRIZES[selectedIndex])
      PRIZES[selectedIndex].action(game)
      game.incrementWheelSpins()
      if ((game.wheelSpins || 0) + 1 >= 5) game.unlockAchievement('lucky_spinner')
      if (selectedIndex !== 6) { playCelebration(); confetti.fire() }
    }, 4500)
  }

  const segmentAngle = 360 / PRIZES.length

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <Confetti active={confetti.active} />
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="text-6xl mb-4 inline-block"
            animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>🎡</motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Lucky Wheel</span>
          </h1>
          <p className="text-white/60 text-lg">Spin the wheel and win prizes!</p>
        </motion.div>

        <GlassPanel className="max-w-lg mx-auto text-center" glow>
          {/* Wheel */}
          <div className="relative w-72 h-72 mx-auto mb-6">
            {/* Pointer */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-3xl">▼</div>

            {/* Wheel */}
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[rgba(0,212,255,0.3)] relative"
              style={{ boxShadow: '0 0 30px rgba(0,212,255,0.2)' }}>
              <motion.div className="w-full h-full"
                animate={{ rotate: rotation }}
                transition={{ duration: 4.5, ease: [0.17, 0.67, 0.12, 0.99] }}>
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  {PRIZES.map((prize, i) => {
                    const startAngle = i * segmentAngle
                    const endAngle = startAngle + segmentAngle
                    const startRad = (startAngle - 90) * Math.PI / 180
                    const endRad = (endAngle - 90) * Math.PI / 180
                    const x1 = 150 + 140 * Math.cos(startRad)
                    const y1 = 150 + 140 * Math.sin(startRad)
                    const x2 = 150 + 140 * Math.cos(endRad)
                    const y2 = 150 + 140 * Math.sin(endRad)
                    const midRad = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180
                    const textX = 150 + 90 * Math.cos(midRad)
                    const textY = 150 + 90 * Math.sin(midRad)
                    const midAngle = (startAngle + endAngle) / 2

                    return (
                      <g key={i}>
                        <path
                          d={`M150,150 L${x1},${y1} A140,140 0 0,1 ${x2},${y2} Z`}
                          fill={prize.color + '30'}
                          stroke={prize.color}
                          strokeWidth="1"
                        />
                        <text x={textX} y={textY} textAnchor="middle" dominantBaseline="middle"
                          fontSize="12" fill="white" fontWeight="bold"
                          transform={`rotate(${midAngle}, ${textX}, ${textY})`}>
                          {prize.icon}
                        </text>
                      </g>
                    )
                  })}
                  <circle cx="150" cy="150" r="20" fill="#0a0a2e" stroke="#00d4ff" strokeWidth="2" />
                  <text x="150" y="155" textAnchor="middle" fontSize="14" fill="white">🎡</text>
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="mb-4 p-3 rounded-xl" style={{ background: result.color + '20', border: `1px solid ${result.color}40` }}>
              <p className="font-bold text-lg" style={{ color: result.color }}>
                {result.icon} {result.label}!
              </p>
            </motion.div>
          )}

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={spin} disabled={spinning}
            className="px-8 py-3 rounded-xl font-bold text-white border-none cursor-pointer disabled:opacity-50 text-lg"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #ff00ff)' }}>
            {spinning ? '⏳ Spinning...' : '🎡 Spin the Wheel!'}
          </motion.button>

          <p className="text-white/40 text-xs mt-3">Spins: {spinsRef.current} | Earn badges with 5+ spins!</p>
        </GlassPanel>
      </div>
    </div>
  )
}
