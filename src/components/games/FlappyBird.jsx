/* Flappy Bird Clone */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

const GAME_WIDTH = 300
const GAME_HEIGHT = 400
const BIRD_SIZE = 24
const PIPE_WIDTH = 40
const GAP = 120
const GRAVITY = 0.6
const JUMP_FORCE = -9

export default function FlappyBird({ onWin }) {
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2)
  const [pipes, setPipes] = useState([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const velocityRef = useRef(0)
  const frameRef = useRef(null)
  const pipeTimerRef = useRef(null)
  const birdRef = useRef(GAME_HEIGHT / 2)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const pipesRef = useRef([])

  const jump = useCallback(() => {
    if (gameOverRef.current) return
    velocityRef.current = JUMP_FORCE
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [jump])

  const startGame = () => {
    birdRef.current = GAME_HEIGHT / 2
    setBirdY(GAME_HEIGHT / 2)
    velocityRef.current = 0
    scoreRef.current = 0
    setScore(0)
    pipesRef.current = []
    setPipes([])
    gameOverRef.current = false
    setGameOver(false)
    winFiredRef.current = false
    setStarted(true)
    jump()
  }

  useEffect(() => {
    if (!started || gameOver) return

    const gameLoop = () => {
      // Bird physics
      velocityRef.current += GRAVITY
      birdRef.current += velocityRef.current
      setBirdY(birdRef.current)

      // Move pipes
      pipesRef.current = pipesRef.current
        .map(p => ({ ...p, x: p.x - 2.5 }))
        .filter(p => p.x > -PIPE_WIDTH)

      // Check collision
      const bird = { x: 50, y: birdRef.current, size: BIRD_SIZE }
      for (const pipe of pipesRef.current) {
        const topPipe = { x: pipe.x, y: 0, w: PIPE_WIDTH, h: pipe.gapY }
        const bottomPipe = { x: pipe.x, y: pipe.gapY + GAP, w: PIPE_WIDTH, h: GAME_HEIGHT }

        if (
          bird.x + bird.size > topPipe.x && bird.x < topPipe.x + topPipe.w &&
          (bird.y < topPipe.h || bird.y + bird.size > bottomPipe.y)
        ) {
          gameOverRef.current = true
          setGameOver(true)
          return
        }

        if (!pipe.scored && pipe.x + PIPE_WIDTH < bird.x) {
          pipe.scored = true
          scoreRef.current += 1
          setScore(scoreRef.current)
        }
      }

      // Floor/ceiling collision
      if (birdRef.current > GAME_HEIGHT - BIRD_SIZE || birdRef.current < 0) {
        gameOverRef.current = true
        setGameOver(true)
        return
      }

      setPipes([...pipesRef.current])
      frameRef.current = requestAnimationFrame(gameLoop)
    }

    frameRef.current = requestAnimationFrame(gameLoop)

    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver])

  // Pipe spawner
  useEffect(() => {
    if (!started || gameOver) return
    pipeTimerRef.current = setInterval(() => {
      const gapY = 60 + Math.random() * (GAME_HEIGHT - GAP - 120)
      pipesRef.current.push({ x: GAME_WIDTH, gapY, scored: false })
    }, 2000)
    return () => clearInterval(pipeTimerRef.current)
  }, [started, gameOver])

  const winFiredRef = useRef(false)

  useEffect(() => {
    if (gameOver && score >= 5 && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      onWin()
    }
  }, [gameOver, score, onWin])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#ffee00] font-bold">🪙 Score: {score}</span>
      </div>

      <div
        className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)] cursor-pointer"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, background: 'linear-gradient(180deg, #1a0a3e 0%, #0a1a3e 100%)' }}
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump() }}
      >
        {/* Bird */}
        <motion.div
          className="absolute text-2xl z-10"
          style={{ left: 50, top: birdY }}
          animate={gameOver ? { rotate: 90 } : velocityRef.current < 0 ? { rotate: -15 } : { rotate: 20 }}
        >
          🐤
        </motion.div>

        {/* Pipes */}
        {pipes.map((pipe, i) => (
          <div key={i}>
            {/* Top pipe */}
            <div
              className="absolute"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.gapY,
                background: 'linear-gradient(180deg, #00cc66, #009944)',
                borderRadius: '0 0 4px 4px',
                boxShadow: '2px 0 8px rgba(0,204,102,0.3)',
              }}
            />
            {/* Bottom pipe */}
            <div
              className="absolute"
              style={{
                left: pipe.x,
                top: pipe.gapY + GAP,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - pipe.gapY - GAP,
                background: 'linear-gradient(180deg, #009944, #00cc66)',
                borderRadius: '4px 4px 0 0',
                boxShadow: '2px 0 8px rgba(0,204,102,0.3)',
              }}
            />
          </div>
        ))}

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#004422] border-t-2 border-[#006633]" />

        {/* Overlays */}
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-center"
            >
              <div className="text-4xl mb-2">🐤</div>
              <p className="text-white font-bold">Tap to Start!</p>
            </motion.div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <p className="text-[#ff0044] font-bold text-xl mb-2">💀 Game Over!</p>
              <p className="text-white text-sm">Score: {score}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ffee00] to-[#ff8800] text-white font-bold text-sm border-none cursor-pointer"
        >
          {gameOver ? '🔄 Retry' : '▶️ Start'}
        </motion.button>
      </div>
    </div>
  )
}
