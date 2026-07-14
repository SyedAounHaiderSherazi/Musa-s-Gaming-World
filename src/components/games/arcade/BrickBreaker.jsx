/* Brick Breaker - Canvas Arcade Game */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 400, H = 500
const BRICK_ROWS = 6, BRICK_COLS = 8
const BRICK_W = W / BRICK_COLS - 4, BRICK_H = 18
const BRICK_COLORS = ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800', '#00d4ff']

const makeBricks = () => {
  const bricks = []
  const pattern = [
    [1,1,1,1,1,1,1,1],
    [1,2,1,2,1,2,1,1],
    [1,1,1,1,1,1,1,1],
    [2,1,3,1,3,1,1,2],
    [1,1,1,1,1,1,1,1],
    [1,2,1,1,1,2,1,1],
  ]
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      const type = pattern[r]?.[c] || 1
      bricks.push({
        x: c * (BRICK_W + 4) + 2,
        y: r * (BRICK_H + 4) + 50,
        w: BRICK_W, h: BRICK_H,
        color: type === 3 ? '#ffd700' : BRICK_COLORS[r % BRICK_COLORS.length],
        alive: true,
        type,
        points: type === 3 ? 50 : 10,
      })
    }
  }
  return bricks
}

export default function BrickBreaker({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('idle')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)

  const paddleRef = useRef({ x: W / 2 - 50, w: 100, h: 12 })
  const ballRef = useRef({ x: W / 2, y: H - 40, dx: 0, dy: 0, r: 6, launched: false })
  const bricksRef = useRef(makeBricks())
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const speedRef = useRef(1)
  const stateRef = useRef('idle')
  const frameRef = useRef(null)
  const winRef = useRef(false)
  const mouseRef = useRef(null)
  const keysRef = useRef({ left: false, right: false })

  const resetBall = useCallback(() => {
    ballRef.current = {
      x: paddleRef.current.x + paddleRef.current.w / 2,
      y: H - 40, dx: 0, dy: 0, r: 6, launched: false,
    }
  }, [])

  const startGame = useCallback(() => {
    scoreRef.current = 0
    livesRef.current = 3
    speedRef.current = 1
    paddleRef.current = { x: W / 2 - 50, w: 100, h: 12 }
    bricksRef.current = makeBricks()
    resetBall()
    winRef.current = false
    setScore(0)
    setLives(3)
    stateRef.current = 'playing'
    setGameState('playing')
  }, [resetBall])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      const paddle = paddleRef.current
      const ball = ballRef.current

      // Paddle movement
      if (mouseRef.current !== null) {
        paddle.x = mouseRef.current - paddle.w / 2
      } else {
        if (keysRef.current.left) paddle.x -= 7
        if (keysRef.current.right) paddle.x += 7
      }
      paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x))

      if (!ball.launched) {
        ball.x = paddle.x + paddle.w / 2
        ball.y = H - 40
      } else {
        const spd = speedRef.current
        ball.x += ball.dx * spd
        ball.y += ball.dy * spd

        // Wall bounces
        if (ball.x - ball.r < 0 || ball.x + ball.r > W) ball.dx *= -1
        if (ball.y - ball.r < 0) ball.dy *= -1

        // Paddle bounce
        if (ball.dy > 0 && ball.y + ball.r >= H - paddle.h - 8 && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
          ball.dy = -Math.abs(ball.dy)
          ball.dx = ((ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2)) * 5
        }

        // Bottom
        if (ball.y > H + 10) {
          livesRef.current--
          setLives(livesRef.current)
          if (livesRef.current <= 0) {
            stateRef.current = 'over'
            setGameState('over')
            return
          }
          resetBall()
        }

        // Brick collisions
        for (const brick of bricksRef.current) {
          if (!brick.alive) continue
          if (ball.x + ball.r > brick.x && ball.x - ball.r < brick.x + brick.w &&
              ball.y + ball.r > brick.y && ball.y - ball.r < brick.y + brick.h) {
            ball.dy *= -1
            brick.alive = false
            scoreRef.current += brick.points
            setScore(scoreRef.current)
            speedRef.current = 1 + scoreRef.current * 0.003
            break
          }
        }

        // Win check
        if (bricksRef.current.every(b => !b.alive)) {
          stateRef.current = 'won'
          setGameState('won')
          return
        }
      }

      // Draw
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, W, H)

      // Bricks
      for (const brick of bricksRef.current) {
        if (!brick.alive) continue
        ctx.fillStyle = brick.color
        ctx.shadowColor = brick.color
        ctx.shadowBlur = brick.type === 3 ? 12 : 5
        ctx.beginPath()
        ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 3)
        ctx.fill()
        if (brick.type === 3) {
          ctx.fillStyle = '#000'
          ctx.font = 'bold 9px monospace'
          ctx.textAlign = 'center'
          ctx.fillText('★', brick.x + brick.w / 2, brick.y + brick.h / 2 + 3)
        }
      }
      ctx.shadowBlur = 0

      // Paddle
      ctx.fillStyle = '#00d4ff'
      ctx.shadowColor = '#00d4ff'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.roundRect(paddle.x, H - paddle.h - 8, paddle.w, paddle.h, 6)
      ctx.fill()
      ctx.shadowBlur = 0

      // Ball
      ctx.fillStyle = '#ffee00'
      ctx.shadowColor = '#ffee00'
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      if (!ball.launched) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('Click or Space to launch', W / 2, H / 2 + 30)
      }

      // Speed indicator
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`Speed: ${speedRef.current.toFixed(1)}x`, W - 15, 18)

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [gameState, resetBall])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'ArrowLeft') keysRef.current.left = true
      if (e.code === 'ArrowRight') keysRef.current.right = true
      if (e.code === 'Space') {
        e.preventDefault()
        if (stateRef.current === 'playing' && !ballRef.current.launched) {
          ballRef.current.launched = true
          ballRef.current.dx = (Math.random() > 0.5 ? 1 : -1) * 4
          ballRef.current.dy = -4
        }
      }
    }
    const handleUp = (e) => {
      if (e.code === 'ArrowLeft') keysRef.current.left = false
      if (e.code === 'ArrowRight') keysRef.current.right = false
    }
    const handleClick = () => {
      if (stateRef.current === 'playing' && !ballRef.current.launched) {
        ballRef.current.launched = true
        ballRef.current.dx = (Math.random() > 0.5 ? 1 : -1) * 4
        ballRef.current.dy = -4
      }
    }
    const handleMove = (e) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = ((e.clientX || e.touches?.[0]?.clientX || 0) - rect.left) * (W / rect.width)
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleUp)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keyup', handleUp)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('click', handleClick)
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
        <span className="text-[#00d4ff] font-bold">Score: {score}</span>
        <span className="text-[#ff0044] font-bold">Lives: {lives}</span>
        <span className="text-[#ffee00] font-bold">★ = 50pts</span>
      </div>

      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: W, height: H, maxWidth: '100%' }}>
        <canvas ref={canvasRef} width={W} height={H} className="w-full h-full" />

        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="text-5xl mb-3">💎</div>
                <p className="text-[#ff00ff] font-bold text-xl mb-1">BRICK BREAKER</p>
                <p className="text-white/60 text-xs mb-3">Break all bricks! Gold ★ = 50pts!</p>
                <p className="text-white/40 text-xs">Mouse or arrows to move, click to launch</p>
              </div>
            </motion.div>
          )}
          {gameState === 'won' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <motion.p animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 0.4 }}
                  className="text-[#ffd700] font-bold text-3xl">ALL CLEARED!</motion.p>
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
