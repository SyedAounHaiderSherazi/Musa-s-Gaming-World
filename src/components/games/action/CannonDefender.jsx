import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const W = 320, H = 300
const ENEMY_TYPES = [
  { emoji: '👹', size: 24, speed: 1, hp: 1, color: '#ff0044', points: 10 },
  { emoji: '👺', size: 28, speed: 0.7, hp: 2, color: '#ff8800', points: 20 },
  { emoji: '🐲', size: 32, speed: 0.5, hp: 4, color: '#aa00ff', points: 40 },
]

export default function CannonDefender({ onWin }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(5)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const mouseRef = useRef({ x: 0, y: H / 2 })
  const cannonRef = useRef({ x: 40, y: H / 2 })
  const bulletsRef = useRef([])
  const enemiesRef = useRef([])
  const particlesRef = useRef([])
  const scoreRef = useRef(0)
  const livesRef = useRef(5)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const winFiredRef = useRef(false)

  const startGame = () => {
    scoreRef.current = 0; livesRef.current = 5
    setScore(0); setLives(5)
    setGameOver(false); setStarted(true)
    cannonRef.current = { x: 40, y: H / 2 }
    bulletsRef.current = []; enemiesRef.current = []; particlesRef.current = []
    winFiredRef.current = false
  }

  const spawnEnemy = useCallback(() => {
    const tier = Math.min(2, Math.floor(scoreRef.current / 100))
    const t = ENEMY_TYPES[Math.floor(Math.random() * (tier + 1))]
    enemiesRef.current.push({
      x: W + 20,
      y: 20 + Math.random() * (H - 40),
      ...t,
      maxHp: t.hp,
    })
  }, [])

  useEffect(() => {
    if (!started || gameOver) return
    spawnRef.current = setInterval(spawnEnemy, 1200)
    return () => clearInterval(spawnRef.current)
  }, [started, gameOver, spawnEnemy])

  useEffect(() => {
    if (!started || gameOver) return
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)
      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#0a0a2e')
      grad.addColorStop(1, '#1a0a2e')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      const cannon = cannonRef.current
      // Cannon aims toward mouse
      const angle = Math.atan2(mouseRef.current.y - cannon.y, mouseRef.current.x - cannon.x)
      cannon.y += (mouseRef.current.y - cannon.y) * 0.05
      cannon.y = Math.max(20, Math.min(H - 20, cannon.y))

      // Draw cannon
      ctx.save()
      ctx.translate(cannon.x, cannon.y)
      ctx.rotate(angle)
      ctx.fillStyle = '#555'
      ctx.fillRect(0, -6, 30, 12)
      ctx.fillStyle = '#333'
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#00d4ff'
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      // Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.03
        if (p.life <= 0) return false
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        return true
      })

      // Enemies
      enemiesRef.current.forEach(e => {
        e.x -= e.speed
        if (e.x < -20 && !e.passed) {
          e.passed = true
          livesRef.current = Math.max(0, livesRef.current - 1)
          setLives(livesRef.current)
          if (livesRef.current <= 0) { setGameOver(true); setStarted(false) }
        }
        ctx.font = `${e.size}px serif`
        ctx.textAlign = 'center'
        ctx.fillText(e.emoji, e.x, e.y)
        if (e.hp < e.maxHp) {
          const bw = 28, bh = 3
          ctx.fillStyle = '#333'
          ctx.fillRect(e.x - bw / 2, e.y - e.size - 6, bw, bh)
          ctx.fillStyle = '#ff0044'
          ctx.fillRect(e.x - bw / 2, e.y - e.size - 6, bw * (e.hp / e.maxHp), bh)
        }
      })
      enemiesRef.current = enemiesRef.current.filter(e => e.x > -60)

      // Bullets
      bulletsRef.current = bulletsRef.current.filter(b => {
        b.x += b.vx; b.y += b.vy
        ctx.fillStyle = '#ffee00'
        ctx.shadowColor = '#ffee00'; ctx.shadowBlur = 6
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0

        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const e = enemiesRef.current[i]
          if (Math.abs(b.x - e.x) < e.size && Math.abs(b.y - e.y) < e.size) {
            e.hp--
            if (e.hp <= 0) {
              scoreRef.current += e.points
              setScore(scoreRef.current)
              for (let j = 0; j < 10; j++) {
                particlesRef.current.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, color: e.color, size: 4, life: 1 })
              }
              enemiesRef.current.splice(i, 1)
            }
            return false
          }
        }
        return b.x < W + 10
      })

      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver])

  useEffect(() => {
    if (gameOver && score >= 50 && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      onWin()
    }
  }, [gameOver, score, onWin])

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    mouseRef.current = {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height),
    }
  }, [])

  const handleClick = useCallback(() => {
    if (!started || gameOver) return
    const cannon = cannonRef.current
    const angle = Math.atan2(mouseRef.current.y - cannon.y, mouseRef.current.x - cannon.x)
    bulletsRef.current.push({
      x: cannon.x + Math.cos(angle) * 30,
      y: cannon.y + Math.sin(angle) * 30,
      vx: Math.cos(angle) * 8,
      vy: Math.sin(angle) * 8,
    })
  }, [started, gameOver])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') { e.preventDefault(); handleClick() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleClick])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#ffee00] font-bold">🎯 Score: {score}</span>
        <span className="text-[#ff0044] font-bold">❤️ Lives: {lives}</span>
      </div>
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(255,136,0,0.3)]">
        <canvas ref={canvasRef} width={W} height={H}
          onMouseMove={handleMouseMove} onClick={handleClick}
          className="block max-w-full cursor-crosshair" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-center">
              <div className="text-5xl mb-2">💣</div>
              <p className="text-white font-bold text-sm">Mouse to aim, click to fire!</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <p className="text-[#ff0044] font-bold text-xl mb-2">💥 Base Destroyed!</p>
              <p className="text-white/80 text-sm">Score: {score}</p>
            </div>
          </div>
        )}
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
        disabled={started && !gameOver}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ff8800] to-[#ff0044] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50">
        {gameOver ? '🔄 Retry' : started ? '⏳ Defending...' : '💣 Start Defending!'}
      </motion.button>
    </div>
  )
}
