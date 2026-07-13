/* NPC Companion - follows cursor and gives tips */
import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const TIPS = [
  "Try all the mini-games! 🎮",
  "Draw something awesome! 🎨",
  "Check your achievements! 🏆",
  "Spin the lucky wheel! 🎡",
  "Find the secret room! 🔮",
  "You're doing great! ⭐",
  "Collect more coins! 💰",
  "Level up to unlock more! 🚀",
  "Visit every day for rewards! 🎁",
  "Have fun exploring! 🗺️",
]

export default function NPCCompanion() {
  const [tip, setTip] = useState(TIPS[0])
  const [showTip, setShowTip] = useState(false)
  const [bounce, setBounce] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })
  const tipIndex = useRef(0)

  useEffect(() => {
    const handleMouse = (e) => {
      mouseX.set(e.clientX + 30)
      mouseY.set(e.clientY + 30)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [mouseX, mouseY])

  useEffect(() => {
    const timeouts = []
    const interval = setInterval(() => {
      tipIndex.current = (tipIndex.current + 1) % TIPS.length
      setTip(TIPS[tipIndex.current])
      setShowTip(true)
      setBounce(true)
      timeouts.push(setTimeout(() => setShowTip(false), 3000))
      timeouts.push(setTimeout(() => setBounce(false), 500))
    }, 12000)
    return () => {
      clearInterval(interval)
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [])

  return (
    <motion.div
      className="fixed z-50 pointer-events-none select-none"
      style={{ x: springX, y: springY }}
    >
      {showTip && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          className="absolute -top-16 -left-20 bg-[rgba(10,10,46,0.9)] text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap border border-[rgba(0,212,255,0.3)] backdrop-blur-md shadow-lg"
        >
          {tip}
          <div className="absolute -bottom-1 left-10 w-2 h-2 bg-[rgba(10,10,46,0.9)] rotate-45 border-r border-b border-[rgba(0,212,255,0.3)]" />
        </motion.div>
      )}
      <motion.div
        animate={bounce ? {
          y: [0, -10, 0],
          rotate: [0, -10, 10, 0],
        } : {}}
        transition={{ duration: 0.5 }}
        className="text-3xl cursor-default"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.5))',
        }}
      >
        🤖
      </motion.div>
    </motion.div>
  )
}
