/* Number Guessing Game */
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NumberGuessing({ onWin }) {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1)
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState([])
  const [won, setWon] = useState(false)
  const [hint, setHint] = useState('')
  const winFiredRef = useRef(false)

  const makeGuess = useCallback(() => {
    const num = parseInt(guess)
    if (isNaN(num) || num < 1 || num > 100) return

    setAttempts(prev => [...prev, num])

    if (num === target) {
      setWon(true)
      setHint('🎉 Correct!')
      if (onWin && !winFiredRef.current) {
        winFiredRef.current = true
        onWin()
      }
    } else if (num < target) {
      setHint('📈 Too low! Try higher.')
    } else {
      setHint('📉 Too high! Try lower.')
    }
    setGuess('')
  }, [guess, target, onWin])

  const reset = () => {
    setGuess('')
    setAttempts([])
    setWon(false)
    setHint('')
    setTarget(Math.floor(Math.random() * 100) + 1)
    winFiredRef.current = false
  }

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-4 text-sm">
        <span className="text-[#ff00ff] font-bold">🎯 Guess: 1-100</span>
        <span className="text-[#00d4ff] font-bold">🔄 Attempts: {attempts.length}</span>
      </div>

      <AnimatePresence mode="wait">
        {hint && (
          <motion.p
            key={hint}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-lg font-bold mb-4"
            style={{ color: won ? '#00ff88' : '#ffee00' }}
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>

      {!won && (
        <div className="flex justify-center gap-2 mb-4">
          <input
            type="number"
            min="1"
            max="100"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && makeGuess()}
            placeholder="Enter number..."
            className="w-32 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.1)] border border-[rgba(0,212,255,0.3)] text-white text-center text-lg font-bold outline-none focus:border-[#00d4ff]"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={makeGuess}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold border-none cursor-pointer"
          >
            Go!
          </motion.button>
        </div>
      )}

      {/* Attempt history */}
      {attempts.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4 max-w-[300px] mx-auto">
          {attempts.map((a, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 rounded-lg text-sm font-bold"
              style={{
                background: a === target ? 'rgba(0,255,136,0.2)' : a < target ? 'rgba(0,212,255,0.15)' : 'rgba(255,0,68,0.15)',
                color: a === target ? '#00ff88' : a < target ? '#00d4ff' : '#ff0044',
                border: `1px solid ${a === target ? 'rgba(0,255,136,0.3)' : a < target ? 'rgba(0,212,255,0.2)' : 'rgba(255,0,68,0.2)'}`,
              }}
            >
              {a}
            </motion.span>
          ))}
        </div>
      )}

      {won && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-4"
        >
          <p className="text-[#00ff88] font-bold text-xl">
            🎉 You got it in {attempts.length} attempts!
          </p>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={reset}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer"
      >
        🔄 New Number
      </motion.button>
    </div>
  )
}
