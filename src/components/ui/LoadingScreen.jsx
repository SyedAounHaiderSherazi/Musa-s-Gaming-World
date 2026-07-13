/* Loading Screen */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOADING_TIPS = [
  "Loading awesome games...",
  "Preparing the adventure...",
  "Spawning floating cubes...",
  "Mixing neon colors...",
  "Warming up the pixel engine...",
  "Almost there...",
]

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [tip, setTip] = useState(LOADING_TIPS[0])
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)])
    }, 1200)

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          clearInterval(tipInterval)
          setTimeout(() => onCompleteRef.current(), 500)
          return 100
        }
        return prev + 2
      })
    }, 40)

    return () => {
      clearInterval(tipInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 50%, #0a1a3e 100%)',
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Floating cubes background */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-lg opacity-20"
            style={{
              width: 20 + Math.random() * 40,
              height: 20 + Math.random() * 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800'][i % 5],
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Main content */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-8xl mb-8"
        >
          🎮
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4 text-center px-4"
          style={{ fontFamily: "'Fredoka One', cursive" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-gradient">Musa's Gaming World</span>
        </motion.h1>

        <motion.p
          className="text-white/60 mb-8 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {tip}
        </motion.p>

        {/* Progress bar */}
        <div className="w-80 max-w-[90vw] h-4 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.1)]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00d4ff, #ff00ff, #00ff88)',
              width: `${progress}%`,
            }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <motion.p
          className="text-white/40 mt-3 text-sm font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {progress}%
        </motion.p>

        {/* Animated dots */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ background: ['#00d4ff', '#ff00ff', '#00ff88'][i] }}
              animate={{ y: [0, -10, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
