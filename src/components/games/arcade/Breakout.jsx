/* Breakout - Canvas Arcade Game */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 400, H = 500
const BRICK_ROWS = 5, BRICK_COLS = 8
const BRICK_W = W / BRICK_COLS - 4, BRICK_H = 18
const BRICK_COLORS = ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800']

const makeBricks = (level) => {
  const bricks = []
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: c * (BRICK_W + 4) + 2,
        y: r * (BRICK_H + 4) + 40,
        w: BRICK_W, h: BRICK_H,
        color: BRICK_COLORS[r % BRICK_COLORS.length],
        hits: level > 1 && r < 2 ? 2 : 1,
        alive: true,
      })
    }
  }
  return bricks
}

export default function Breakout({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('idle')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)

  const paddleRef = useRef({ x: W / 2 - 50, w: 100, h: 12 })
  const ballRef = useRef({ x: W / 2, y: H - 40, dx: 3, dy: -3, r: 6, launched: false })
  const bricksRef = useRef(makeBricks(1))
  const powerRef = useRef([])
  const multiBallsRef = useRef([])
  const keysRef = useRef({ left: false, right: false })
  const mouseRef = useRef(null)
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const levelRef = useRef(1)
  const stateRef = useRef('idle')
  const frameRef = useRef(null)
  const winRef = useRef(false)

  const resetBall = useCallback(() => {
    ballRef.current = { x: paddleRef.current.x + paddleRef.current.w / 2, y: H - 40, dx: 3 * (Math.random() > 0.5 ? 1 : -1), dy: -3, r: 6, launched: false }
    multiBallsRef.current = []
    powerRef.current = []
  }, [])

  const startGame = useCallback(() => {
    scoreRef.current = 0
    livesRef.current = 3
    levelRef.current = 1
    paddleRef.current = { x: W / 2 - 50, w: 100, h: 12 }
    bricksRef.current = makeBricks(1)
    resetBall()
    winRef.current = false
    setScore(0)
    setLives(3)
    setLevel(1)
    stateRef.current = 'playing'
    setGameState('playing')
  }, [resetBall])

  const nextLevel = useCallback(() => {
    levelRef.current += 1
    bricksRef.current = makeBricks(levelRef.current)
    resetBall()
    setLevel(levelRef.current)
  }, [resetBall])

  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      const paddle = paddleRef.current
      const ball = ballRef.current

      if (mouseRef.current !== null) {
        paddle.x = mouseRef.current - paddle.w / 2
      } else {
        if (keysRef.current.left) paddle.x -= 6
        if (keysRef.current.right) paddle.x += 6
      }
      paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x))

      if (!ball.launched) {
        ball.x = paddle.x + paddle.w / 2
        ball.y = H - 40
      }

      if (ball.launched) {
        const allBalls = [ball, ...multiBallsRef.current]
        for (const b of allBalls) {
          b.x += b.dx
          b.y += b.dy
          if (b.x - b.r < 0 || b.x + b.r > W) b.dx *= -1
          if (b.y - b.r < 0) b.dy *= -1

          if (b.y + b.r > H) {
            if (allBalls.length <= 1 && b === ball) {
              livesRef.current--
              setLives(livesRef.current)
              if (livesRef.current <= 0) {
                stateRef.current = 'over'
                setGameState('over')
                return
              }
              resetBall()
              break
            }
            multiBallsRef.current = multiBallsRef.current.filter(mb => mb !== b)
            continue
          }

          if (b.dy > 0 && b.y + b.r >= H - paddle.h - 8 && b.x >= paddle.x && b.x <= paddle.x + paddle.w) {
            b.dy = -Math.abs(b.dy)
            b.dx = ((b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2)) * 5
          }

          for (const brick of bricksRef.current) {
            if (!brick.alive) continue
            if (b.x + b.r > brick.x && b.x - b.r < brick.x + brick.w && b.y + b.r > brick.y && b.y - b.r < brick.y + brick.h) {
              b.dy *= -1
              brick.hits--
              if (brick.hits <= 0) {
                brick.alive = false
                scoreRef.current += 10
                setScore(scoreRef.current)
                if (Math.random() < 0.15) {
                  powerRef.current.push({ x: brick.x + brick.w / 2, y: brick.y, type: Math.random() > 0.5 ? 'wide' : 'multi', dy: 2 })
                }
              }
              break
            }
          }
        }

        for (const p of powerRef.current) {
          p.y += p.dy
          if (p.y > H) continue
          if (p.y + 10 >= H - paddle.h - 8 && p.x >= paddle.x && p.x <= paddle.x + paddle.w) {
            if (p.type === 'wide') {
              paddle.w = Math.min(180, paddle.w + 30)
            } else {
              for (let i = 0; i < 2; i++) {
                multiBallsRef.current.push({
                  x: ball.x, y: ball.y,
                  dx: ball.dx + (i === 0 ? -1 : 1),
                  dy: ball.dy,
                  r: 6, launched: true,
                })
              }
            }
          }
        }
        powerRef.current = powerRef.current.filter(p => p.y < H)
      }

      const aliveBricks = bricksRef.current.filter(b => b.alive).length
      if (aliveBricks === 0) {
        if (levelRef.current >= 3) {
          stateRef.current = 'won'
          setGameState('won')
          return
        }
        nextLevel()
      }

      // Draw
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, W, H)

      for (const brick of bricksRef.current) {
        if (!brick.alive) continue
        ctx.fillStyle = brick.color
        ctx.shadowColor = brick.color
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 3)
        ctx.fill()
        if (brick.hits > 1) {
          ctx.fillStyle = '#fff'
          ctx.font = '10px monospace'
          ctx.fillText(brick.hits, brick.x + brick.w / 2 - 3, brick.y + brick.h / 2 + 3)
        }
      }
      ctx.shadowBlur = 0

      for (const p of powerRef.current) {
        ctx.fillStyle = p.type === 'wide' ? '#00ff88' : '#ffee00'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#000'
        ctx.font = '8px monospace'
        ctx.fillText(p.type === 'wide' ? 'W' : 'M', p.x - 3, p.y + 3)
      }

      ctx.fillStyle = '#00d4ff'
      ctx.shadowColor = '#00d4ff'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.roundRect(paddle.x, H - paddle.h - 8, paddle.w, paddle.h, 6)
      ctx.fill()
      ctx.shadowBlur = 0

      const drawBall = (b) => {
        ctx.fillStyle = '#ffee00'
        ctx.shadowColor = '#ffee00'
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
      drawBall(ball)
      for (const mb of multiBallsRef.current) drawBall(mb)

      if (!ball.launched) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '12px monospace'
        ctx.fillText('Click or press Space to launch', W / 2 - 110, H / 2 + 40)
      }

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [gameState, resetBall, nextLevel])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'ArrowLeft') keysRef.current.left = true
      if (e.code === 'ArrowRight') keysRef.current.right = true
      if (e.code === 'Space') {
        e.preventDefault()
        if (stateRef.current === 'playing' && !ballRef.current.launched) {
          ballRef.current.launched = true
          ballRef.current.dy = -4
        }
      }
    }
    const handleUp = (e) => {
      if (e.code === 'ArrowLeft') keysRef.current.left = false
      if (e.code === 'ArrowRight') keysRef.current.right = false
    }
    const handleMove = (e) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = ((e.clientX || e.touches?.[0]?.clientX || 0) - rect.left) * (W / rect.width)
    }
    const handleLaunch = () => {
      if (stateRef.current === 'playing' && !ballRef.current.launched) {
        ballRef.current.launched = true
        ballRef.current.dy = -4
      }
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleUp)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('click', handleLaunch)
    window.addEventListener('touchstart', handleLaunch)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keyup', handleUp)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('click', handleLaunch)
      window.removeEventListener('touchstart', handleLaunch)
    }
  }, [])

  useEffect(() => {
    if ((gameState === 'won') && onWin && !winRef.current) {
      winRef.current = true
      onWin()
    }
  }, [gameState, onWin])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#00d4ff] font-bold">Score: {score}</span>
        <span className="text-[#ff0044] font-bold">Lives: {lives}</span>
        <span className="text-[#ffee00] font-bold">Level: {level}</span>
      </div>

      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: W, height: H, maxWidth: '100%' }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />

        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="text-5xl mb-3">🧱</div>
                <p className="text-[#00d4ff] font-bold text-xl mb-1">BREAKOUT</p>
                <p className="text-white/60 text-xs mb-4">Break all bricks! Clear 3 levels to win!</p>
                <p className="text-white/40 text-xs">Mouse or Arrow keys to move paddle</p>
              </motion.div>
            </motion.div>
          )}
          {gameState === 'won' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/70"
            >
              <div className="text-center">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                  <p className="text-[#00ff88] font-bold text-3xl">YOU WIN!</p>
                </motion.div>
                <p className="text-white/60 text-sm mt-2">Score: {score}</p>
              </div>
            </motion.div>
          )}
          {gameState === 'over' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/70"
            >
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
