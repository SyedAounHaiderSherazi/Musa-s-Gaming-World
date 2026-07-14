import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const W = 320, H = 420, PLAYER_W = 28, PLAYER_H = 28, BULLET_SPEED = 7

export default function SpaceShooter({ onWin }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const playerRef = useRef({ x: W / 2, y: H - 50 })
  const bulletsRef = useRef([])
  const enemiesRef = useRef([])
  const powerUpsRef = useRef([])
  const particlesRef = useRef([])
  const starsRef = useRef(Array.from({ length: 60 }, () => ({
    x: Math.random() * W, y: Math.random() * H, s: 0.5 + Math.random() * 1.5, sp: 0.3 + Math.random() * 1
  })))
  const keysRef = useRef({})
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const winFiredRef = useRef(false)

  const startGame = () => {
    playerRef.current = { x: W / 2, y: H - 50 }
    scoreRef.current = 0; livesRef.current = 3
    setScore(0); setLives(3)
    setGameOver(false); setStarted(true)
    bulletsRef.current = []; enemiesRef.current = []; particlesRef.current = []; powerUpsRef.current = []
    winFiredRef.current = false
  }

  useEffect(() => {
    const down = (e) => { keysRef.current[e.code] = true }
    const up = (e) => { keysRef.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  const spawnEnemy = useCallback(() => {
    enemiesRef.current.push({
      x: 20 + Math.random() * (W - 40),
      y: -20,
      speed: 1 + Math.random() * 1.5,
      hp: 1,
      size: 22,
      emoji: ['🛸', '👾', '🚀', '🛸'][Math.floor(Math.random() * 4)],
    })
  }, [])

  useEffect(() => {
    if (!started || gameOver) return
    spawnRef.current = setInterval(spawnEnemy, 800)
    return () => clearInterval(spawnRef.current)
  }, [started, gameOver, spawnEnemy])

  useEffect(() => {
    if (!started || gameOver) return
    let shootCooldown = 0
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const keys = keysRef.current
      const p = playerRef.current
      const spd = 4
      if (keys['KeyA'] || keys['ArrowLeft']) p.x = Math.max(PLAYER_W / 2, p.x - spd)
      if (keys['KeyD'] || keys['ArrowRight']) p.x = Math.min(W - PLAYER_W / 2, p.x + spd)
      if (keys['KeyW'] || keys['ArrowUp']) p.y = Math.max(PLAYER_H / 2, p.y - spd)
      if (keys['KeyS'] || keys['ArrowDown']) p.y = Math.min(H - PLAYER_H / 2, p.y + spd)
      if (keys['Space'] && shootCooldown <= 0) {
        bulletsRef.current.push({ x: p.x, y: p.y - PLAYER_H / 2, vx: 0, vy: -BULLET_SPEED })
        shootCooldown = 10
      }
      shootCooldown--

      ctx.fillStyle = '#05051a'
      ctx.fillRect(0, 0, W, H)

      // Stars
      starsRef.current.forEach(s => {
        s.y += s.sp
        if (s.y > H) { s.y = 0; s.x = Math.random() * W }
        ctx.fillStyle = `rgba(255,255,255,${0.3 + s.s * 0.2})`
        ctx.fillRect(s.x, s.y, s.s, s.s)
      })

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

      // Enemies
      enemiesRef.current.forEach(e => {
        e.y += e.speed
        if (e.y > H + 30 && !e.passed) {
          e.passed = true
          livesRef.current = Math.max(0, livesRef.current - 1)
          setLives(livesRef.current)
          if (livesRef.current <= 0) { setGameOver(true); setStarted(false) }
        }
        ctx.font = `${e.size}px serif`
        ctx.textAlign = 'center'
        ctx.fillText(e.emoji, e.x, e.y)
      })
      enemiesRef.current = enemiesRef.current.filter(e => e.y < H + 40)

      // Bullets
      bulletsRef.current = bulletsRef.current.filter(b => {
        b.x += b.vx; b.y += b.vy
        ctx.fillStyle = '#00d4ff'
        ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 8
        ctx.fillRect(b.x - 2, b.y - 6, 4, 12)
        ctx.shadowBlur = 0

        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const e = enemiesRef.current[i]
          if (Math.abs(b.x - e.x) < e.size && Math.abs(b.y - e.y) < e.size) {
            e.hp--
            if (e.hp <= 0) {
              scoreRef.current += 10
              setScore(scoreRef.current)
              for (let j = 0; j < 10; j++) {
                particlesRef.current.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, color: '#ff00ff', size: 4, life: 1 })
              }
              if (Math.random() < 0.15) {
                powerUpsRef.current.push({ x: e.x, y: e.y, type: Math.random() < 0.5 ? '❤️' : '⭐', vy: 1.5 })
              }
              enemiesRef.current.splice(i, 1)
            }
            return false
          }
        }
        return b.y > -10
      })

      // Power-ups
      powerUpsRef.current = powerUpsRef.current.filter(pu => {
        pu.y += pu.vy
        ctx.font = '18px serif'
        ctx.textAlign = 'center'
        ctx.fillText(pu.type, pu.x, pu.y)
        const dx = pu.x - p.x, dy = pu.y - p.y
        if (Math.sqrt(dx * dx + dy * dy) < 24) {
          if (pu.type === '❤️') { livesRef.current = Math.min(5, livesRef.current + 1); setLives(livesRef.current) }
          else { scoreRef.current += 50; setScore(scoreRef.current) }
          return false
        }
        return pu.y < H + 20
      })

      // Player ship
      ctx.font = `${PLAYER_W}px serif`
      ctx.textAlign = 'center'
      ctx.fillText('🚀', p.x, p.y)

      // Lives display
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#ff0044'
      ctx.textAlign = 'left'
      ctx.fillText('❤️'.repeat(livesRef.current), 8, 18)

      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver])

  useEffect(() => {
    if (gameOver && score >= 100 && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      onWin()
    }
  }, [gameOver, score, onWin])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#00d4ff] font-bold">🚀 Score: {score}</span>
        <span className="text-[#ff0044] font-bold">❤️ Lives: {lives}</span>
      </div>
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.3)]">
        <canvas ref={canvasRef} width={W} height={H} className="block max-w-full" tabIndex={0} />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-center">
              <div className="text-5xl mb-2">🚀</div>
              <p className="text-white font-bold text-sm">WASD/Arrows to move, Space to shoot!</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <p className="text-[#ff0044] font-bold text-xl mb-2">💥 Shot Down!</p>
              <p className="text-white/80 text-sm">Score: {score}</p>
            </div>
          </div>
        )}
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
        disabled={started && !gameOver}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#aa00ff] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50">
        {gameOver ? '🔄 Retry' : started ? '⏳ Flying...' : '🚀 Launch!'}
      </motion.button>
    </div>
  )
}
