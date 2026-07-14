/* Pinball - Canvas Arcade Game */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 300, H = 550
const BALL_R = 8
const FLIPPER_W = 60, FLIPPER_H = 12
const GRAVITY = 0.15
const WIN_SCORE = 200

const makeBumpers = () => [
  { x: 150, y: 140, r: 22, color: '#00d4ff', points: 30 },
  { x: 80, y: 200, r: 18, color: '#ff00ff', points: 20 },
  { x: 220, y: 200, r: 18, color: '#00ff88', points: 20 },
  { x: 150, y: 280, r: 20, color: '#ffee00', points: 25 },
  { x: 60, y: 330, r: 14, color: '#ff8800', points: 15 },
  { x: 240, y: 330, r: 14, color: '#ff8800', points: 15 },
]

const makeWalls = () => [
  { x1: 10, y1: 100, x2: 10, y2: H },
  { x1: W - 10, y1: 100, x2: W - 10, y2: H },
  { x1: 10, y1: 100, x2: 80, y2: 50 },
  { x1: W - 10, y1: 100, x2: W - 80, y2: 50 },
]

export default function Pinball({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('idle')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)

  const ballRef = useRef({ x: 150, y: 100, vx: 0, vy: 0, active: false })
  const bumpersRef = useRef(makeBumpers())
  const wallsRef = useRef(makeWalls())
  const leftFlipperRef = useRef({ angle: 0.3, targetAngle: 0.3 })
  const rightFlipperRef = useRef({ angle: Math.PI - 0.3, targetAngle: Math.PI - 0.3 })
  const keysRef = useRef({ left: false, right: false })
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const stateRef = useRef('idle')
  const frameRef = useRef(null)
  const winRef = useRef(false)
  const bumperFlashRef = useRef([])

  const resetBall = useCallback(() => {
    ballRef.current = { x: 280, y: 150, vx: -1, vy: 0, active: false }
    setTimeout(() => {
      if (stateRef.current === 'playing') {
        ballRef.current.active = true
        ballRef.current.vy = 2
      }
    }, 800)
  }, [])

  const startGame = useCallback(() => {
    scoreRef.current = 0
    livesRef.current = 3
    bumpersRef.current = makeBumpers()
    bumperFlashRef.current = []
    winRef.current = false
    setScore(0)
    setLives(3)
    stateRef.current = 'playing'
    setGameState('playing')
    resetBall()
  }, [resetBall])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      const ball = ballRef.current
      const lf = leftFlipperRef.current
      const rf = rightFlipperRef.current

      // Flipper control
      lf.targetAngle = keysRef.current.left ? -0.4 : 0.3
      rf.targetAngle = keysRef.current.right ? Math.PI + 0.4 : Math.PI - 0.3
      lf.angle += (lf.targetAngle - lf.angle) * 0.35
      rf.angle += (rf.targetAngle - rf.angle) * 0.35

      if (ball.active) {
        ball.vy += GRAVITY
        ball.x += ball.vx
        ball.y += ball.vy

        // Wall bounces
        if (ball.x - BALL_R < 10) { ball.x = 10 + BALL_R; ball.vx = Math.abs(ball.vx) * 0.9 }
        if (ball.x + BALL_R > W - 10) { ball.x = W - 10 - BALL_R; ball.vx = -Math.abs(ball.vx) * 0.9 }
        if (ball.y - BALL_R < 10) { ball.y = 10 + BALL_R; ball.vy = Math.abs(ball.vy) * 0.9 }

        // Bumper collisions
        for (const b of bumpersRef.current) {
          const dx = ball.x - b.x
          const dy = ball.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < BALL_R + b.r) {
            const nx = dx / dist
            const ny = dy / dist
            ball.vx = nx * 5
            ball.vy = ny * 5
            ball.x = b.x + nx * (BALL_R + b.r + 2)
            ball.y = b.y + ny * (BALL_R + b.r + 2)
            scoreRef.current += b.points
            setScore(scoreRef.current)
            bumperFlashRef.current.push({ idx: bumpersRef.current.indexOf(b), timer: 10 })
          }
        }

        // Flipper collision
        const fLeftPivot = { x: 70, y: H - 80 }
        const fRightPivot = { x: W - 70, y: H - 80 }
        const checkFlipper = (pivot, angle, side) => {
          const endX = pivot.x + Math.cos(angle) * FLIPPER_W
          const endY = pivot.y + Math.sin(angle) * FLIPPER_W
          const dx = endX - pivot.x
          const dy = endY - pivot.y
          const len = Math.sqrt(dx * dx + dy * dy)
          const proj = ((ball.x - pivot.x) * dx + (ball.y - pivot.y) * dy) / (len * len)
          if (proj >= -0.1 && proj <= 1.1) {
            const closestX = pivot.x + dx * proj
            const closestY = pivot.y + dy * proj
            const d = Math.sqrt((ball.x - closestX) ** 2 + (ball.y - closestY) ** 2)
            if (d < BALL_R + FLIPPER_H / 2) {
              const isActive = side === 'left' ? keysRef.current.left : keysRef.current.right
              ball.vy = -Math.abs(ball.vy) * 1.2 - (isActive ? 3 : 0)
              ball.vx += (isActive ? (side === 'left' ? 2 : -2) : 0)
              ball.y = closestY - BALL_R - FLIPPER_H / 2
            }
          }
        }
        checkFlipper(fLeftPivot, lf.angle, 'left')
        checkFlipper(fRightPivot, rf.angle, 'right')

        // Ball drained
        if (ball.y > H + 20) {
          livesRef.current--
          setLives(livesRef.current)
          if (livesRef.current <= 0) {
            stateRef.current = 'over'
            setGameState('over')
            return
          }
          resetBall()
        }
      }

      bumperFlashRef.current = bumperFlashRef.current.filter(f => { f.timer--; return f.timer > 0 })

      // Win
      if (scoreRef.current >= WIN_SCORE) {
        stateRef.current = 'won'
        setGameState('won')
        return
      }

      // Draw
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, W, H)

      // Walls
      ctx.strokeStyle = 'rgba(0,212,255,0.3)'
      ctx.lineWidth = 3
      for (const w of wallsRef.current) {
        ctx.beginPath()
        ctx.moveTo(w.x1, w.y1)
        ctx.lineTo(w.x2, w.y2)
        ctx.stroke()
      }

      // Drain walls
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath()
      ctx.moveTo(10, H - 50)
      ctx.lineTo(60, H - 15)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(W - 10, H - 50)
      ctx.lineTo(W - 60, H - 15)
      ctx.stroke()

      // Bumpers
      for (let i = 0; i < bumpersRef.current.length; i++) {
        const b = bumpersRef.current[i]
        const flashing = bumperFlashRef.current.some(f => f.idx === i)
        ctx.fillStyle = flashing ? '#fff' : b.color
        ctx.shadowColor = b.color
        ctx.shadowBlur = flashing ? 20 : 8
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#000'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(b.points, b.x, b.y + 3)
      }

      // Flippers
      const drawFlipper = (pivot, angle) => {
        const ex = pivot.x + Math.cos(angle) * FLIPPER_W
        const ey = pivot.y + Math.sin(angle) * FLIPPER_W
        ctx.strokeStyle = '#00d4ff'
        ctx.lineWidth = FLIPPER_H
        ctx.lineCap = 'round'
        ctx.shadowColor = '#00d4ff'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.moveTo(pivot.x, pivot.y)
        ctx.lineTo(ex, ey)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
      drawFlipper({ x: 70, y: H - 80 }, lf.angle)
      drawFlipper({ x: W - 70, y: H - 80 }, rf.angle)

      // Ball
      if (ball.active || ball.y < H) {
        ctx.fillStyle = '#ffee00'
        ctx.shadowColor = '#ffee00'
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [gameState, resetBall])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyZ') keysRef.current.left = true
      if (e.code === 'ArrowRight' || e.code === 'KeyM' || e.code === 'Slash') keysRef.current.right = true
    }
    const handleUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyZ') keysRef.current.left = false
      if (e.code === 'ArrowRight' || e.code === 'KeyM' || e.code === 'Slash') keysRef.current.right = false
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keyup', handleUp)
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
        <span className="text-[#ffee00] font-bold">Score: {score}/{WIN_SCORE}</span>
        <span className="text-[#ff0044] font-bold">Lives: {lives}</span>
      </div>

      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: W, height: H, maxWidth: '100%' }}>
        <canvas ref={canvasRef} width={W} height={H} className="w-full h-full" />

        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="text-5xl mb-3">🎱</div>
                <p className="text-[#00d4ff] font-bold text-xl mb-1">PINBALL</p>
                <p className="text-white/60 text-xs mb-3">Score {WIN_SCORE} points to win!</p>
                <p className="text-white/40 text-xs">Left/Right arrows for flippers</p>
              </div>
            </motion.div>
          )}
          {gameState === 'won' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <motion.p animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}
                  className="text-[#00ff88] font-bold text-3xl">HIGH SCORE!</motion.p>
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

      <div className="flex justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer"
        >
          {gameState === 'idle' ? '▶ Start' : '🔄 Restart'}
        </motion.button>
        {gameState === 'playing' && (
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onMouseDown={() => { keysRef.current.left = true }}
              onMouseUp={() => { keysRef.current.left = false }}
              onTouchStart={() => { keysRef.current.left = true }}
              onTouchEnd={() => { keysRef.current.left = false }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffee00] to-[#ff8800] text-white font-bold text-sm border-none cursor-pointer"
            >◀ Left</motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onMouseDown={() => { keysRef.current.right = true }}
              onMouseUp={() => { keysRef.current.right = false }}
              onTouchStart={() => { keysRef.current.right = true }}
              onTouchEnd={() => { keysRef.current.right = false }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff8800] to-[#ffee00] text-white font-bold text-sm border-none cursor-pointer"
            >Right ▶</motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
