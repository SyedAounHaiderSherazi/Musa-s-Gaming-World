import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const W = 320, H = 420, PLAYER_SIZE = 28, BULLET_SPEED = 6

export default function RobotBattle({ onWin }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(100)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [wave, setWave] = useState(1)
  const playerRef = useRef({ x: W / 2, y: H - 50 })
  const bulletsRef = useRef([])
  const enemiesRef = useRef([])
  const particlesRef = useRef([])
  const keysRef = useRef({})
  const scoreRef = useRef(0)
  const healthRef = useRef(100)
  const waveRef = useRef(1)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const winFiredRef = useRef(false)

  const startGame = () => {
    playerRef.current = { x: W / 2, y: H - 50 }
    scoreRef.current = 0; healthRef.current = 100; waveRef.current = 1
    setScore(0); setHealth(100); setWave(1)
    setGameOver(false); setStarted(true)
    bulletsRef.current = []; enemiesRef.current = []; particlesRef.current = []
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
    const types = [
      { emoji: '🤖', size: 26, speed: 1, hp: 1, color: '#00d4ff' },
      { emoji: '🦾', size: 30, speed: 0.7, hp: 2, color: '#ff00ff' },
      { emoji: '👾', size: 22, speed: 1.5, hp: 1, color: '#ff8800' },
    ]
    const t = types[Math.floor(Math.random() * Math.min(types.length, 1 + Math.floor(waveRef.current / 2)))]
    enemiesRef.current.push({
      x: 30 + Math.random() * (W - 60),
      y: -30,
      ...t,
      maxHp: t.hp,
    })
  }, [])

  useEffect(() => {
    if (!started || gameOver) return
    spawnRef.current = setInterval(spawnEnemy, 1000 - waveRef.current * 50)
    const waveTimer = setInterval(() => {
      waveRef.current += 1
      setWave(waveRef.current)
    }, 12000)
    return () => { clearInterval(spawnRef.current); clearInterval(waveTimer) }
  }, [started, gameOver, spawnEnemy])

  useEffect(() => {
    if (!started || gameOver) return
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const keys = keysRef.current
      const p = playerRef.current
      const spd = 4
      if (keys['KeyA'] || keys['ArrowLeft']) p.x = Math.max(PLAYER_SIZE, p.x - spd)
      if (keys['KeyD'] || keys['ArrowRight']) p.x = Math.min(W - PLAYER_SIZE, p.x + spd)
      if (keys['KeyW'] || keys['ArrowUp']) p.y = Math.max(PLAYER_SIZE, p.y - spd)
      if (keys['KeyS'] || keys['ArrowDown']) p.y = Math.min(H - PLAYER_SIZE, p.y + spd)
      if (keys['Space']) {
        keys['Space'] = false
        bulletsRef.current.push({ x: p.x, y: p.y - PLAYER_SIZE, vx: 0, vy: -BULLET_SPEED })
      }

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0a0a1a'
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

      // Enemies
      enemiesRef.current.forEach(e => {
        e.y += e.speed
        if (e.y > H + 30) {
          healthRef.current = Math.max(0, healthRef.current - 10)
          setHealth(healthRef.current)
          if (healthRef.current <= 0) { setGameOver(true); setStarted(false) }
        }
        ctx.font = `${e.size}px serif`
        ctx.textAlign = 'center'
        ctx.fillText(e.emoji, e.x, e.y)
        if (e.hp < e.maxHp) {
          const bw = 30, bh = 3
          ctx.fillStyle = '#333'
          ctx.fillRect(e.x - bw / 2, e.y - e.size - 8, bw, bh)
          ctx.fillStyle = '#00ff88'
          ctx.fillRect(e.x - bw / 2, e.y - e.size - 8, bw * (e.hp / e.maxHp), bh)
        }
      })
      enemiesRef.current = enemiesRef.current.filter(e => e.y < H + 40)

      // Bullets
      bulletsRef.current = bulletsRef.current.filter(b => {
        b.x += b.vx; b.y += b.vy
        ctx.fillStyle = '#ffee00'
        ctx.shadowColor = '#ffee00'; ctx.shadowBlur = 6
        ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0

        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const e = enemiesRef.current[i]
          if (Math.abs(b.x - e.x) < e.size && Math.abs(b.y - e.y) < e.size) {
            e.hp--
            if (e.hp <= 0) {
              scoreRef.current += 15
              setScore(scoreRef.current)
              for (let j = 0; j < 8; j++) {
                particlesRef.current.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, color: e.color, size: 4, life: 1 })
              }
              enemiesRef.current.splice(i, 1)
            }
            return false
          }
        }
        return b.y > -10
      })

      // Player
      ctx.font = `${PLAYER_SIZE}px serif`
      ctx.textAlign = 'center'
      ctx.fillText('🤖', p.x, p.y)

      // Health bar
      ctx.fillStyle = '#333'
      ctx.fillRect(10, H - 14, W - 20, 8)
      ctx.fillStyle = healthRef.current > 30 ? '#00ff88' : '#ff0044'
      ctx.fillRect(10, H - 14, (W - 20) * (healthRef.current / 100), 8)

      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver])

  useEffect(() => {
    if (score >= 150 && !gameOver && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      setGameOver(true)
      setStarted(false)
      onWin()
    }
  }, [score, gameOver, onWin])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-4 mb-3 text-sm flex-wrap">
        <span className="text-[#ffee00] font-bold">🎯 {score}</span>
        <span className="text-[#00ff88] font-bold">❤️ {health}%</span>
        <span className="text-[#aa00ff] font-bold">🌊 Wave {wave}</span>
      </div>
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.3)]">
        <canvas ref={canvasRef} width={W} height={H} className="block max-w-full" tabIndex={0} />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-center">
              <div className="text-5xl mb-2">🤖</div>
              <p className="text-white font-bold text-sm">WASD/Arrows to move, Space to shoot!</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <p className="text-[#ff0044] font-bold text-xl mb-2">💥 Destroyed!</p>
              <p className="text-white/80 text-sm">Score: {score} | Wave: {wave}</p>
            </div>
          </div>
        )}
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
        disabled={started}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#aa00ff] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50">
        {gameOver ? '🔄 Retry' : started ? '⏳ Fighting...' : '🤖 Start Battle!'}
      </motion.button>
    </div>
  )
}
