/* Whack-a-Mole Game */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

const GRID_SIZE = 9
const GAME_DURATION = 20

export default function WhackAMole({ onWin }) {
  const [moles, setMoles] = useState(Array(GRID_SIZE).fill(false))
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [playing, setPlaying] = useState(false)
  const [whacked, setWhacked] = useState(null)
  const timerRef = useRef(null)
  const moleTimerRef = useRef(null)
  const winFiredRef = useRef(false)

  const startGame = () => {
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setPlaying(true)
    setMoles(Array(GRID_SIZE).fill(false))
    winFiredRef.current = false
  }

  useEffect(() => {
    if (!playing) return
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
  }, [playing])

  useEffect(() => {
    if (!playing) return
    moleTimerRef.current = setInterval(() => {
      setMoles(prev => {
        const newMoles = Array(GRID_SIZE).fill(false)
        const count = 1 + Math.floor(Math.random() * 3)
        for (let i = 0; i < count; i++) {
          const pos = Math.floor(Math.random() * GRID_SIZE)
          newMoles[pos] = true
        }
        return newMoles
      })
    }, 800)
    return () => clearInterval(moleTimerRef.current)
  }, [playing])

  useEffect(() => {
    if (!playing && timeLeft === 0 && score > 0) {
      if (score >= 10 && onWin && !winFiredRef.current) {
        winFiredRef.current = true
        onWin()
      }
    }
  }, [playing, timeLeft, score, onWin])

  const whackTimeoutRef = useRef(null)

  const whack = useCallback((i) => {
    if (!playing || !moles[i]) return
    setScore(s => s + 1)
    setWhacked(i)
    if (whackTimeoutRef.current) clearTimeout(whackTimeoutRef.current)
    whackTimeoutRef.current = setTimeout(() => setWhacked(null), 200)
    setMoles(prev => prev.map((m, idx) => idx === i ? false : m))
  }, [playing, moles])

  useEffect(() => {
    return () => {
      if (whackTimeoutRef.current) clearTimeout(whackTimeoutRef.current)
    }
  }, [])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-4 text-sm">
        <span className="text-[#00ff88] font-bold">🎯 Score: {score}</span>
        <span className="text-[#ff0044] font-bold">⏱️ {timeLeft}s</span>
      </div>

      {!playing && timeLeft === 0 ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-4"
        >
          <p className="text-[#ffee00] font-bold text-xl mb-2">
            {score >= 15 ? '🏆 Amazing!' : score >= 10 ? '🎉 Great Job!' : score >= 5 ? '👍 Good Try!' : '😅 Keep Practicing!'}
          </p>
          <p className="text-white/60">Final Score: {score}</p>
        </motion.div>
      ) : !playing ? (
        <div className="mb-4">
          <p className="text-white/60">Click moles before they hide!</p>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto mb-4">
        {moles.map((hasMole, i) => (
          <motion.button
            key={i}
            whileHover={playing ? { scale: 1.05 } : {}}
            whileTap={playing ? { scale: 0.9 } : {}}
            onClick={() => whack(i)}
            className="aspect-square rounded-2xl text-4xl cursor-pointer border-none flex items-center justify-center relative overflow-hidden"
            style={{
              background: hasMole
                ? 'linear-gradient(135deg, rgba(255,136,0,0.2), rgba(255,0,68,0.2))'
                : 'rgba(255,255,255,0.05)',
              border: `2px solid ${hasMole ? 'rgba(255,136,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <motion.span
              animate={whacked === i ? { scale: [1, 1.5, 0] } : hasMole ? { y: [0, -5, 0] } : {}}
              transition={{ duration: whacked === i ? 0.2 : 0.5, repeat: hasMole && whacked !== i ? Infinity : 0 }}
            >
              {hasMole ? '🐹' : '🕳️'}
            </motion.span>
            {whacked === i && (
              <motion.span
                initial={{ scale: 0, y: 0 }}
                animate={{ scale: 1, y: -30 }}
                className="absolute text-sm font-bold text-[#ffee00]"
              >
                +1
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={startGame}
        disabled={playing}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ff8800] to-[#ff0044] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50"
      >
        {playing ? '⏳ Playing...' : '🔨 Start Whacking!'}
      </motion.button>
    </div>
  )
}
