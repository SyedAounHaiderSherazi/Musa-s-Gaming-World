import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const W = 320, H = 300, CASTLE_X = 30
const TOWER_COST = 30
const TOWER_RANGE = 80

export default function CastleDefense({ onWin }) {
  const canvasRef = useRef(null)
  const [gold, setGold] = useState(50)
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [wave, setWave] = useState(1)
  const towersRef = useRef([])
  const enemiesRef = useRef([])
  const bulletsRef = useRef([])
  const particlesRef = useRef([])
  const goldRef = useRef(50)
  const scoreRef = useRef(0)
  const waveRef = useRef(1)
  const hpRef = useRef(100)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const waveTimerRef = useRef(null)
  const winFiredRef = useRef(false)

  const startGame = () => {
    goldRef.current = 50; scoreRef.current = 0; waveRef.current = 1; hpRef.current = 100
    setGold(50); setScore(0); setWave(1)
    setGameOver(false); setStarted(true)
    towersRef.current = []; enemiesRef.current = []; bulletsRef.current = []; particlesRef.current = []
    winFiredRef.current = false
  }

  const spawnEnemy = useCallback(() => {
    const tier = Math.min(2, Math.floor(waveRef.current / 3))
    const types = [
      { emoji: '🐛', size: 20, speed: 1 + Math.random() * 0.5, hp: 3, color: '#00ff88', reward: 10 },
      { emoji: '🐜', size: 22, speed: 1.5 + Math.random() * 0.5, hp: 5, color: '#ff8800', reward: 15 },
      { emoji: '🐛', size: 26, speed: 0.8, hp: 10, color: '#ff0044', reward: 25 },
    ]
    const t = types[Math.min(tier, types.length - 1)]
    enemiesRef.current.push({ x: W + 20, y: 30 + Math.random() * (H - 60), ...t, maxHp: t.hp })
  }, [])

  useEffect(() => {
    if (!started || gameOver) return
    spawnRef.current = setInterval(spawnEnemy, 2000 - waveRef.current * 100)
    waveTimerRef.current = setInterval(() => {
      waveRef.current += 1
      setWave(waveRef.current)
      goldRef.current += 20
      setGold(goldRef.current)
    }, 20000)
    return () => { clearInterval(spawnRef.current); clearInterval(waveTimerRef.current) }
  }, [started, gameOver, spawnEnemy])

  useEffect(() => {
    if (!started || gameOver) return
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#0a1a0a')
      grad.addColorStop(1, '#1a0a1a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Ground
      ctx.fillStyle = '#1a2a1a'
      ctx.fillRect(0, H - 20, W, 20)

      // Castle
      ctx.fillStyle = '#444'
      ctx.fillRect(0, 20, CASTLE_X + 10, H - 40)
      ctx.fillStyle = '#555'
      ctx.fillRect(0, 20, CASTLE_X + 10, 15)
      ctx.font = '20px serif'
      ctx.textAlign = 'center'
      ctx.fillText('🏰', CASTLE_X / 2, H / 2)

      // HP bar
      ctx.fillStyle = '#333'
      ctx.fillRect(CASTLE_X + 15, 25, 60, 8)
      ctx.fillStyle = hpRef.current > 30 ? '#00ff88' : '#ff0044'
      ctx.fillRect(CASTLE_X + 15, 25, 60 * (hpRef.current / 100), 8)

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

      // Towers
      towersRef.current.forEach(t => {
        ctx.font = '22px serif'
        ctx.textAlign = 'center'
        ctx.fillText('🗼', t.x, t.y)
        ctx.strokeStyle = 'rgba(0,212,255,0.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(t.x, t.y, TOWER_RANGE, 0, Math.PI * 2)
        ctx.stroke()
        // Auto-shoot
        t.cooldown = Math.max(0, (t.cooldown || 0) - 1)
        if (t.cooldown <= 0) {
          const nearest = enemiesRef.current
            .filter(e => e.hp > 0)
            .map(e => ({ e, dist: Math.sqrt((e.x - t.x) ** 2 + (e.y - t.y) ** 2) }))
            .filter(o => o.dist < TOWER_RANGE)
            .sort((a, b) => a.dist - b.dist)[0]
          if (nearest) {
            const dx = nearest.e.x - t.x, dy = nearest.e.y - t.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            bulletsRef.current.push({ x: t.x, y: t.y, vx: (dx / dist) * 5, vy: (dy / dist) * 5 })
            t.cooldown = 30
          }
        }
      })

      // Enemies
      enemiesRef.current.forEach(e => {
        e.x -= e.speed
        if (e.x < CASTLE_X) {
          hpRef.current = Math.max(0, hpRef.current - 10)
          e.hp = 0
          if (hpRef.current <= 0) { setGameOver(true); setStarted(false) }
        }
        if (e.hp > 0) {
          ctx.font = `${e.size}px serif`
          ctx.textAlign = 'center'
          ctx.fillText(e.emoji, e.x, e.y)
          const bw = 28, bh = 3
          ctx.fillStyle = '#333'
          ctx.fillRect(e.x - bw / 2, e.y - e.size - 6, bw, bh)
          ctx.fillStyle = '#00ff88'
          ctx.fillRect(e.x - bw / 2, e.y - e.size - 6, bw * (e.hp / e.maxHp), bh)
        }
      })
      enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0)

      // Bullets
      bulletsRef.current = bulletsRef.current.filter(b => {
        b.x += b.vx; b.y += b.vy
        ctx.fillStyle = '#ffee00'
        ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill()
        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const e = enemiesRef.current[i]
          if (Math.abs(b.x - e.x) < e.size && Math.abs(b.y - e.y) < e.size) {
            e.hp -= 2
            if (e.hp <= 0) {
              goldRef.current += e.reward
              scoreRef.current += e.reward
              setGold(goldRef.current)
              setScore(scoreRef.current)
              for (let j = 0; j < 6; j++) {
                particlesRef.current.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, color: e.color, size: 3, life: 1 })
              }
            }
            return false
          }
        }
        return b.x > 0 && b.x < W + 10
      })

      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver])

  useEffect(() => {
    if (wave >= 5 && !gameOver && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      setGameOver(true)
      setStarted(false)
      onWin()
    }
  }, [wave, gameOver, onWin])

  const handleClick = useCallback((e) => {
    if (!started || gameOver) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = W / rect.width, scaleY = H / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY
    if (mx < CASTLE_X + 20) return
    if (goldRef.current < TOWER_COST) return
    // Check not too close to existing tower
    const tooClose = towersRef.current.some(t => Math.sqrt((t.x - mx) ** 2 + (t.y - my) ** 2) < 30)
    if (tooClose) return
    goldRef.current -= TOWER_COST
    setGold(goldRef.current)
    towersRef.current.push({ x: mx, y: my, cooldown: 0 })
  }, [started, gameOver])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-4 mb-3 text-sm flex-wrap">
        <span className="text-[#ffee00] font-bold">🪙 {gold}</span>
        <span className="text-[#00ff88] font-bold">🏆 {score}</span>
        <span className="text-[#aa00ff] font-bold">🌊 Wave {wave}</span>
      </div>
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,255,136,0.3)]">
        <canvas ref={canvasRef} width={W} height={H} onClick={handleClick}
          className="block max-w-full cursor-pointer" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-center">
              <div className="text-5xl mb-2">🏰</div>
              <p className="text-white font-bold text-sm">Click to place towers (30 gold each)</p>
              <p className="text-white/50 text-xs mt-1">Defend the castle from bugs!</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <p className="text-[#ff0044] font-bold text-xl mb-2">🏰 Castle Fallen!</p>
              <p className="text-white/80 text-sm">Score: {score} | Wave: {wave}</p>
            </div>
          </div>
        )}
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
        disabled={started && !gameOver}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50">
        {gameOver ? '🔄 Retry' : started ? '⏳ Defending...' : '🏰 Start Defending!'}
      </motion.button>
    </div>
  )
}
