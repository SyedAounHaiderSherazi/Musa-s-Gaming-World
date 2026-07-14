/* EasterEgg - Random popup with profile picture and fun messages */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MusaAvatar from './MusaAvatar'

const MESSAGES = [
  "Let's play!",
  "You found a secret!",
  "Awesome!",
  "Great job!",
  "Keep going!",
  "You're doing great!",
  "High five!",
  "You're a star!",
  "Let's go!",
  "Woohoo!",
]

const POSITIONS = [
  { bottom: 80, left: 20 },
  { bottom: 120, left: 30 },
  { bottom: 90, right: 20 },
  { bottom: 140, right: 30 },
]

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function EasterEgg() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [position, setPosition] = useState(POSITIONS[0])

  const show = useCallback(() => {
    setMessage(MESSAGES[randomBetween(0, MESSAGES.length - 1)])
    setPosition(POSITIONS[randomBetween(0, POSITIONS.length - 1)])
    setVisible(true)

    const hideTimer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(hideTimer)
  }, [])

  useEffect(() => {
    let timer
    let cleanup

    const schedule = () => {
      const delay = randomBetween(45000, 90000)
      timer = setTimeout(() => {
        cleanup = show()
        schedule()
      }, delay)
    }

    schedule()

    return () => {
      clearTimeout(timer)
      if (cleanup) cleanup()
    }
  }, [show])

  const dismiss = () => {
    setVisible(false)
  }

  const style = {
    bottom: position.bottom,
    left: position.left,
    right: position.right,
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed z-[70] pointer-events-auto"
          style={style}
          initial={{ y: 40, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        >
          <motion.div
            className="flex items-end gap-2"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: 2, ease: 'easeInOut' }}
          >
            {/* Avatar */}
            <MusaAvatar src="/images/musa/avatar.jpeg" size={48} glowing />

            {/* Speech bubble */}
            <div className="relative bg-white rounded-2xl rounded-br-none px-4 py-2 max-w-[160px]">
              <p className="text-gray-800 text-sm font-bold">{message}</p>
              {/* Tail/pointer */}
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-white translate-x-1 translate-y-1"
                style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
              />
            </div>

            {/* Dismiss button */}
            <button
              onClick={dismiss}
              className="text-white/40 hover:text-white/80 text-xs ml-1 transition-colors"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
