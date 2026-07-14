/* Fruit Slice - Canvas Arcade Game */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 400, H = 500
const FRUIT_TYPES = [
  { emoji: '🍎', color: '#ff0044', points: 10 },
  { emoji: '🍊', color: '#ff8800', points: 10 },
  { emoji: '🍋', color: '#ffee00', points: 10 },
  { emoji: '🍉', color: '#00ff88', points: 15 },
  { emoji: '🍇', color: '#ff00ff', points: 15 },
  { emoji: '🥝', color: '#00d4ff', points: 20 },
  { emoji: '🍑', color: '#ff6688', points: 10 },
]
const BOMB = { emoji: '💣', color: '#ff0000', points: 0 }

export default function FruitSlice({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('idle')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)

  const fruitsRef = useRef([])
  const trailsRef = useRef([])
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const stateRef = useRef('idle')
  const frameRef = useRef(null)
  const lastMouseRef = useRef(null)
  const spawnTimerRef = useRef(0)
  const winRef = useRef(false)

  const spawnFruit = useCallback(() => {
    const isBomb = Math.random() < 0.15
    const type = isBomb ? BOMB : FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)]
    const x = 60 + Math.random() * (W - 120)
    const vy = -(6 + Math.random() * 4)
    const vx = (Math.random() - 0.5) * 3
    fruitsRef.current.push({
      x, y: H + 20,
      vx, vy,
      gravity: 0.18,
      radius: 22,
      ...type,
      sliced: false,
      alpha: 1,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 0.15,
    })
  }, [])

  const startGame = useCallback(() => {
    fruitsRef.current = []
    trailsRef.current = []
    scoreRef.current = 0
    livesRef.current = 3
    spawnTimerRef.current = 0
    winRef.current = false
    setScore(0)
    setLives(3)
    stateRef.current = 'playing'
    setGameState('playing')
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      spawnTimerRef.current++
      if (spawnTimerRef.current % 40 === 0) spawnFruit()
      if (spawnTimerRef.current > 200 && spawnTimerRef.current % 25 === 0) spawnFruit()

      for (const f of fruitsRef.current) {
        f.vy += f.gravity
        f.x += f.vx
        f.y += f.vy
        f.rotation += f.rotSpeed
        if (f.y > H + 60 && !f.sliced) {
          if (f.points > 0) {
            livesRef.current--
            setLives(livesRef.current)
            if (livesRef.current <= 0) {
              stateRef.current = 'over'
              setGameState('over')
              return
            }
          }
        }
      }

      trailsRef.current = trailsRef.current.filter(t => {
        t.alpha -= 0.06
        return t.alpha > 0
      })

      fruitsRef.current = fruitsRef.current.filter(f => f.y < H + 80 && f.alpha > 0)

      // Win condition: score 150
      if (scoreRef.current >= 150) {
        stateRef.current = 'won'
        setGameState('won')
        return
      }

      // Draw
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, W, H)

      // Trail
      for (const t of trailsRef.current) {
        ctx.strokeStyle = `rgba(255,255,255,${t.alpha * 0.8})`
        ctx.lineWidth = 3
        ctx.shadowColor = '#00d4ff'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.moveTo(t.x1, t.y1)
        ctx.lineTo(t.x2, t.y2)
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      // Fruits
      ctx.font = '36px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const f of fruitsRef.current) {
        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.rotate(f.rotation)
        ctx.globalAlpha = f.alpha
        if (f.sliced) {
          ctx.globalAlpha *= 0.6
        }
        ctx.fillText(f.emoji, 0, 0)
        ctx.restore()
      }
      ctx.globalAlpha = 1

      // Score text
      ctx.fillStyle = '#ffee00'
      ctx.font = 'bold 14px monospace'
      ctx.textAlign = 'center'

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [gameState, spawnFruit])

  useEffect(() => {
    const getPos = (e) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      return {
        x: ((e.clientX || e.touches?.[0]?.clientX || 0) - rect.left) * (W / rect.width),
        y: ((e.clientY || e.touches?.[0]?.clientY || 0) - rect.top) * (H / rect.height),
      }
    }
    const handleMove = (e) => {
      if (stateRef.current !== 'playing') return
      const pos = getPos(e)
      if (!pos) return
      if (lastMouseRef.current) {
        trailsRef.current.push({
          x1: lastMouseRef.current.x, y1: lastMouseRef.current.y,
          x2: pos.x, y2: pos.y,
          alpha: 1,
        })
      }
      lastMouseRef.current = pos

      for (const f of fruitsRef.current) {
        if (f.sliced) continue
        const dx = pos.x - f.x
        const dy = pos.y - f.y
        if (Math.sqrt(dx * dx + dy * dy) < f.radius + 18) {
          if (f.points === 0) {
            livesRef.current = 0
            setLives(0)
            f.sliced = true
            f.alpha = 0.5
            stateRef.current = 'over'
            setGameState('over')
            return
          }
          f.sliced = true
          scoreRef.current += f.points
          setScore(scoreRef.current)
          // Split effect
          fruitsRef.current.push({
            ...f, x: f.x - 8, y: f.y - 5,
            vx: f.vx - 2, vy: f.vy - 1,
            radius: 16, sliced: true,
            emoji: '🍊',
          })
        }
      }
    }
    const handleUp = () => { lastMouseRef.current = null }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchend', handleUp)
    }
  }, [])

  useEffect(() => {
    if (gameState === 'won' && onWin && !winRef.current) {
      winRef.current = true
      onWin()
    }
  }, [gameState, onWin])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#ffee00] font-bold">Score: {score}/150</span>
        <span className="text-[#ff0044] font-bold">Lives: {lives}</span>
      </div>

      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: W, height: H, maxWidth: '100%', cursor: 'crosshair' }}>
        <canvas ref={canvasRef} width={W} height={H} className="w-full h-full" />

        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="text-5xl mb-3">🔪</div>
                <p className="text-[#ff00ff] font-bold text-xl mb-1">FRUIT SLICE</p>
                <p className="text-white/60 text-xs mb-3">Slice fruits, avoid bombs!</p>
                <p className="text-white/40 text-xs">Swipe across fruits to slice them</p>
              </div>
            </motion.div>
          )}
          {gameState === 'won' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <p className="text-[#00ff88] font-bold text-3xl">FANTASTIC!</p>
                <p className="text-white/60 text-sm mt-2">Score: {score}</p>
              </div>
            </motion.div>
          )}
          {gameState === 'over' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <p className="text-[#ff0044] font-bold text-2xl mb-2">GAME OVER</p>
                <p className="text-white/60 text-sm">Score: {score}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={startGame}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer"
      >
        {gameState === 'idle' ? '▶ Start' : '🔄 Restart'}
      </motion.button>
    </div>
  )
}
