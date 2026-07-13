/* Floating chat bubble with random fun messages */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  "Hey! Ready to play some games? 🎮",
  "You're awesome! Keep being you! ⭐",
  "Did you try the Snake game yet? 🐍",
  "You're on a streak! Keep going! 🔥",
  "Time to draw something cool! 🎨",
  "Welcome back, champion! 🏆",
  "Have you collected all the treasures? 💎",
  "Pro tip: Check the secret room! 🤫",
  "You're leveling up so fast! 🚀",
  "Don't forget to spin the wheel! 🎡",
  "Roblox is awesome, right? 🎯",
  "You're the best gamer ever! 🎮",
  "Try clicking 100 times in 10 seconds! ⚡",
  "Memory games make your brain stronger! 🧠",
  "I believe in you! You can do it! 💪",
  "Have you found the Easter egg yet? 🥚",
  "Your drawings are gonna be epic! 🖌️",
  "Daily rewards are waiting for you! 🎁",
]

export default function ChatBubble() {
  const [message, setMessage] = useState(MESSAGES[0])
  const [show, setShow] = useState(false)
  const [minimized, setMinimized] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const hideTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
      setMessage(randomMsg)
      if (minimized) {
        setShow(true)
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = setTimeout(() => setShow(false), 4000)
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [minimized])

  if (!show && minimized) return null

  return (
    <motion.div
      className="fixed bottom-24 left-4 z-50"
      initial={{ opacity: 0, y: 50, scale: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0 }}
    >
      <AnimatePresence mode="wait">
        {!minimized && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-[#1a1a4e] to-[#2a1a5e] text-white rounded-2xl p-4 max-w-[260px] shadow-xl border border-[rgba(0,212,255,0.3)] mb-2 relative"
          >
            <button
              onClick={() => setMinimized(true)}
              className="absolute top-1 right-2 text-white/50 hover:text-white text-sm cursor-pointer"
            >
              ✕
            </button>
            <p className="text-sm font-medium pr-4">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setMinimized(!minimized)
          setShow(true)
        }}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff00ff] to-[#00d4ff] text-2xl flex items-center justify-center shadow-lg cursor-pointer border-2 border-white/30"
        style={{ boxShadow: '0 0 20px rgba(255,0,255,0.3)' }}
      >
        {minimized ? '💬' : '🤖'}
      </motion.button>
    </motion.div>
  )
}
