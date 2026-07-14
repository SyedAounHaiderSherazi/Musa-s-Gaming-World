import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const W = 320, H = 360
const ROWS = 5, COLS = 8, ALIEN_SIZE = 24, ALIEN_PAD = 8, ALIEN_TOP = 40

export default function AlienInvaders({ onWin }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [wavesCleared, setWavesCleared] = useState(0)
  const playerRef = useRef({ x: W / 2, y: H - 40 })
  const aliensRef = useRef([])
  const bulletsRef = useRef([])
  const alienBulletsRef = useRef([])
  const dirRef = useRef(1)
  const particlesRef = useRef([])
  const keysRef = useRef({})
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const wavesClearedRef = useRef(0)
  const frameRef = useRef(null)
  const winFiredRef = useRef(false)

  const initAliens = useCallback(() => {
    const aliens = []
    const emojis = ['👾', '👽', '🛸']
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        aliens.push({
          x: 30 + c * (ALIEN_SIZE + ALIEN_PAD),
          y: ALIEN_TOP + r * (ALIEN_SIZE + ALIEN_PAD),
          alive: true,
          emoji: emojis[r % 3],
          row: r,
        })
      }
    }
    aliensRef.current = aliens
  }, [])

  const startGame = () => {
    playerRef.current = { x: W / 2, y: H - 40 }
    scoreRef.current = 0; livesRef.current = 3; wavesClearedRef.current = 0
    setScore(0); setLives(3); setWavesCleared(0)
    setGameOver(false); setStarted(true)
    bulletsRef.current = []; alienBulletsRef.current = []; particlesRef.current = []
    dirRef.current = 1
    initAliens()
    winFiredRef.current = false
  }

  useEffect(() => {
    const down = (e) => { keysRef.current[e.code] = true }
    const up = (e) => { keysRef.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useEffect(() => {
    if (!started || gameOver) return
    let shootCooldown = 0
    let alienShootTimer = 0

    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const keys = keysRef.current
      const p = playerRef.current
      const spd = 4
      if (keys['KeyA'] || keys['ArrowLeft']) p.x = Math.max(15, p.x - spd)
      if (keys['KeyD'] || keys['ArrowRight']) p.x = Math.min(W - 15, p.x + spd)
      if (keys['Space'] && shootCooldown <= 0) {
        bulletsRef.current.push({ x: p.x, y: p.y - 14, vy: -6 })
        shootCooldown = 12
      }
      shootCooldown--

      ctx.fillStyle = '#05051a'
      ctx.fillRect(0, 0, W, H)

      // Particles
      particlesRef.current = particlesRef.current.filter(pt => {
        pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.03
        if (pt.life <= 0) return false
        ctx.globalAlpha = pt.life
        ctx.fillStyle = pt.color
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        return true
      })

      // Move aliens
      let hitEdge = false
      const liveAliens = aliensRef.current.filter(a => a.alive)
      liveAliens.forEach(a => {
        a.x += dirRef.current * 0.8
        if (a.x > W - 20 || a.x < 20) hitEdge = true
      })
      if (hitEdge) {
        dirRef.current *= -1
        liveAliens.forEach(a => a.y += 12)
      }

      // Alien shooting
      alienShootTimer++
      if (alienShootTimer > 60 && liveAliens.length > 0) {
        alienShootTimer = 0
        const shooter = liveAliens[Math.floor(Math.random() * liveAliens.length)]
        alienBulletsRef.current.push({ x: shooter.x, y: shooter.y + 12, vy: 3 + Math.random() })
      }

      // Draw aliens
      ctx.font = `${ALIEN_SIZE}px serif`
      ctx.textAlign = 'center'
      liveAliens.forEach(a => {
        ctx.fillText(a.emoji, a.x, a.y)
        // Check if aliens reached bottom
        if (a.y > H - 60) {
          setGameOver(true)
          setStarted(false)
        }
      })

      // Player bullets
      bulletsRef.current = bulletsRef.current.filter(b => {
        b.y += b.vy
        ctx.fillStyle = '#00d4ff'
        ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 6
        ctx.fillRect(b.x - 2, b.y - 5, 4, 10)
        ctx.shadowBlur = 0

        for (let i = aliensRef.current.length - 1; i >= 0; i--) {
          const a = aliensRef.current[i]
          if (a.alive && Math.abs(b.x - a.x) < ALIEN_SIZE / 2 && Math.abs(b.y - a.y) < ALIEN_SIZE / 2) {
            a.alive = false
            scoreRef.current += 10
            setScore(scoreRef.current)
            for (let j = 0; j < 8; j++) {
              particlesRef.current.push({ x: a.x, y: a.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, color: '#00ff88', size: 4, life: 1 })
            }
            return false
          }
        }
        return b.y > -10
      })

      // Alien bullets
      alienBulletsRef.current = alienBulletsRef.current.filter(b => {
        b.y += b.vy
        ctx.fillStyle = '#ff0044'
        ctx.shadowColor = '#ff0044'; ctx.shadowBlur = 4
        ctx.fillRect(b.x - 2, b.y - 4, 4, 8)
        ctx.shadowBlur = 0

        if (Math.abs(b.x - p.x) < 14 && Math.abs(b.y - p.y) < 14) {
          livesRef.current -= 1
          setLives(livesRef.current)
          if (livesRef.current <= 0) { setGameOver(true); setStarted(false) }
          for (let j = 0; j < 6; j++) {
            particlesRef.current.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, color: '#ff0044', size: 3, life: 1 })
          }
          return false
        }
        return b.y < H + 10
      })

      // Player
      ctx.font = '28px serif'
      ctx.textAlign = 'center'
      ctx.fillText('🛡️', p.x, p.y)

      // Win check
      if (liveAliens.length === 0 && !gameOver) {
        scoreRef.current += 50
        setScore(scoreRef.current)
        setWavesCleared(prev => prev + 1)
        wavesClearedRef.current += 1
        setTimeout(() => initAliens(), 1000)
      }

      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#ff0044'
      ctx.textAlign = 'left'
      ctx.fillText('❤️'.repeat(livesRef.current), 8, 18)

      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver, initAliens])

  useEffect(() => {
    if (wavesCleared >= 3 && !gameOver && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      setGameOver(true)
      setStarted(false)
      onWin()
    }
  }, [wavesCleared, gameOver, onWin])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#00ff88] font-bold">👾 Score: {score}</span>
        <span className="text-[#ff0044] font-bold">❤️ Lives: {lives}</span>
      </div>
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,255,136,0.3)]">
        <canvas ref={canvasRef} width={W} height={H} className="block max-w-full" tabIndex={0} />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-center">
              <div className="text-5xl mb-2">👾</div>
              <p className="text-white font-bold text-sm">WASD/Arrows to move, Space to shoot!</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <p className="text-[#ff0044] font-bold text-xl mb-2">👾 Overrun!</p>
              <p className="text-white/80 text-sm">Score: {score}</p>
            </div>
          </div>
        )}
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
        disabled={started && !gameOver}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#ffee00] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50">
        {gameOver ? '🔄 Retry' : started ? '⏳ Defending...' : '👾 Start Invading!'}
      </motion.button>
    </div>
  )
}
