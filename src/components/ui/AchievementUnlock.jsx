/* AchievementUnlock - Global overlay for achievement unlocks */
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MusaAvatar from './MusaAvatar'

const CONFETTI_COLORS = ['#ffee00', '#ff00ff', '#00ff88', '#00d4ff', '#ff8800', '#aa00ff']

function ConfettiParticle({ index }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
  const x = (Math.random() - 0.5) * 300
  const y = -(Math.random() * 200 + 100)
  const size = Math.random() * 6 + 4
  const delay = Math.random() * 0.4

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        top: '50%',
        left: '50%',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
      animate={{
        x: [0, x * 0.3, x],
        y: [0, y * 0.6, y + 80],
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.6],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 1.6,
        delay,
        ease: 'easeOut',
      }}
    />
  )
}

export default function AchievementUnlock({ achievement, xpEarned = 0, coinsEarned = 0, onClose }) {
  useEffect(() => {
    if (!achievement) return
    const timer = setTimeout(() => onClose?.(), 4000)
    return () => clearTimeout(timer)
  }, [achievement, onClose])

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Confetti layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </div>

          {/* Card */}
          <motion.div
            className="relative max-w-sm mx-4 text-center rounded-3xl p-8 overflow-hidden"
            style={{
              background: 'rgba(10,10,46,0.95)',
              border: '1px solid rgba(255,238,0,0.3)',
            }}
            initial={{ scale: 0.3, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            {/* Animated glow border */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, rgba(255,238,0,0.4), rgba(255,0,255,0.4), rgba(0,255,136,0.4), rgba(0,212,255,0.4), rgba(255,238,0,0.4))',
                mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                maskComposite: 'exclude',
                padding: '2px',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            {/* MusaAvatar */}
            <motion.div
              className="flex justify-center mb-3"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
            >
              <MusaAvatar src="/images/musa/avatar.jpeg" size={48} glowing />
            </motion.div>

            {/* Achievement icon */}
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1.3, 1], rotate: [0, 15, -15, 0] }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
            >
              {achievement.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-xl font-bold mb-2"
              style={{
                background: 'linear-gradient(90deg, #ffee00, #ff8800, #ff00ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              ACHIEVEMENT UNLOCKED!
            </motion.h2>

            {/* Name */}
            <motion.p
              className="text-white font-bold text-lg"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              {achievement.name}
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-white/60 text-sm mb-5"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              {achievement.desc}
            </motion.p>

            {/* Rewards */}
            <motion.div
              className="flex justify-center gap-6"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              <span className="text-[#00ff88] font-bold text-lg">+{xpEarned} XP</span>
              <span className="text-[#ffee00] font-bold text-lg">+{coinsEarned} 🪙</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
