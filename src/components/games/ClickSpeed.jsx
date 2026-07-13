/* Click Speed Challenge */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function ClickSpeed({ onWin }) {
  const [clicks, setClicks] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const timerRef = useRef(null)
  const winFiredRef = useRef(false)
  const cps = timeLeft > 0 && started ? (clicks / (10 - timeLeft)).toFixed(1) : 0

  const start = () => {
    setClicks(0)
    setTimeLeft(10)
    setStarted(true)
    setFinished(false)
    winFiredRef.current = false
  }

  useEffect(() => {
    if (!started) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started])

  useEffect(() => {
    if (started && timeLeft === 0) {
      setStarted(false)
      setFinished(true)
    }
  }, [started, timeLeft])

  useEffect(() => {
    if (finished && clicks >= 80 && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      onWin()
    }
  }, [finished, clicks, onWin])

  const handleClick = () => {
    if (!started) return
    setClicks(c => c + 1)
  }

  const getRating = () => {
    if (clicks >= 100) return { text: '⚡ SUPERSONIC!', color: '#ff00ff' }
    if (clicks >= 80) return { text: '🔥 Speed Demon!', color: '#ff8800' }
    if (clicks >= 60) return { text: '⚡ Fast Clicker!', color: '#ffee00' }
    if (clicks >= 40) return { text: '👍 Good Speed!', color: '#00ff88' }
    return { text: '🐢 Keep Practicing!', color: '#00d4ff' }
  }

  const rating = getRating()

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-4 text-sm">
        <span className="text-[#00d4ff] font-bold">⏱️ {timeLeft}s</span>
        <span className="text-[#ffee00] font-bold">👆 {clicks} clicks</span>
        {started && <span className="text-[#ff00ff] font-bold">⚡ {cps} CPS</span>}
      </div>

      {/* Click zone */}
      <motion.button
        whileHover={started ? { scale: 1.05 } : {}}
        whileTap={started ? { scale: 0.9 } : {}}
        onClick={handleClick}
        disabled={!started}
        className="w-48 h-48 rounded-full text-6xl cursor-pointer border-none mx-auto flex items-center justify-center mb-4 relative overflow-hidden"
        style={{
          background: started
            ? 'linear-gradient(135deg, #00d4ff, #ff00ff)'
            : 'rgba(255,255,255,0.05)',
          boxShadow: started ? '0 0 40px rgba(0,212,255,0.3)' : 'none',
        }}
      >
        <span className="text-5xl select-none">{started ? '👆' : '🎯'}</span>
        {started && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}
      </motion.button>

      {finished && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="mb-4"
        >
          <p className="font-bold text-2xl mb-2" style={{ color: rating.color }}>
            {rating.text}
          </p>
          <p className="text-white/60 text-sm">
            {clicks} clicks in 10 seconds ({cps} clicks/sec)
          </p>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={start}
        disabled={started}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50"
      >
        {started ? '⏳ Click the button!' : '▶️ Start Challenge'}
      </motion.button>
    </div>
  )
}
