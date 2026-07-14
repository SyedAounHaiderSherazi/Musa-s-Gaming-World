import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const W = 320, H = 420

export default function ZombieSurvival({ onWin }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(100)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [wave, setWave] = useState(1)
  const zombiesRef = useRef([])
  const bulletsRef = useRef([])
  const particlesRef = useRef([])
  const scoreRef = useRef(0)
  const healthRef = useRef(100)
  const waveRef = useRef(1)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const waveRef2 = useRef(null)
  const winFiredRef = useRef(false)

  const startGame = () => {
    scoreRef.current = 0
    healthRef.current = 100
    waveRef.current = 1
    setScore(0)
    setHealth(100)
    setWave(1)
    setGameOver(false)
    setStarted(true)
    zombiesRef.current = []
    bulletsRef.current = []
    particlesRef.current = []
    winFiredRef.current = false
  }

  const spawnZombie = useCallback(() => {
    const side = Math.floor(Math.random() * 4)
    let x, y, vx, vy
    if (side === 0) { x = -20; y = Math.random() * H; }
    else if (side === 1) { x = W + 20; y = Math.random() * H; }
    else if (side === 2) { x = Math.random() * W; y = -20; }
    else { x = Math.random() * W; y = H + 20; }
    const speed = 0.5 + waveRef.current * 0.2 + Math.random() * 0.5
    const hp = 1 + Math.floor(waveRef.current / 3)
    zombiesRef.current.push({ x, y, speed, hp, maxHp: hp, size: 28, emoji: ['🧟','🎃','👻','👾'][Math.floor(Math.random() * 4)] })
  }, [])

  useEffect(() => {
    if (!started || gameOver) return
    spawnRef.current = setInterval(spawnZombie, 1200 - waveRef.current * 80)
    waveRef2.current = setInterval(() => {
      waveRef.current += 1
      setWave(waveRef.current)
    }, 15000)
    return () => { clearInterval(spawnRef.current); clearInterval(waveRef2.current) }
  }, [started, gameOver, spawnZombie])

  useEffect(() => {
    if (!started || gameOver) return
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, W, H)

      // particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.04
        if (p.life <= 0) return false
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        return true
      })

      const cx = W / 2, cy = H / 2
      // Move zombies toward center
      zombiesRef.current.forEach(z => {
        const dx = cx - z.x, dy = cy - z.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        z.x += (dx / dist) * z.speed
        z.y += (dy / dist) * z.speed

        // check if zombie reached center
        if (dist < 30) {
          healthRef.current = Math.max(0, healthRef.current - 1)
          setHealth(healthRef.current)
          z.hp = 0
          for (let j = 0; j < 6; j++) {
            particlesRef.current.push({ x: z.x, y: z.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, color: '#ff0044', size: 3, life: 1 })
          }
          if (healthRef.current <= 0) {
            setGameOver(true)
            setStarted(false)
          }
        }

        if (z.hp > 0) {
          ctx.font = `${z.size}px serif`
          ctx.textAlign = 'center'
          ctx.fillText(z.emoji, z.x, z.y)
          // health bar
          if (z.hp < z.maxHp) {
            const bw = 30, bh = 4
            ctx.fillStyle = '#333'
            ctx.fillRect(z.x - bw / 2, z.y - z.size - 8, bw, bh)
            ctx.fillStyle = '#00ff88'
            ctx.fillRect(z.x - bw / 2, z.y - z.size - 8, bw * (z.hp / z.maxHp), bh)
          }
        }
      })
      zombiesRef.current = zombiesRef.current.filter(z => z.hp > 0)

      // Bullets
      bulletsRef.current = bulletsRef.current.filter(b => {
        b.x += b.vx; b.y += b.vy
        ctx.fillStyle = b.color
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill()
        ctx.shadowColor = b.color; ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0

        for (let i = zombiesRef.current.length - 1; i >= 0; i--) {
          const z = zombiesRef.current[i]
          const dx = b.x - z.x, dy = b.y - z.y
          if (Math.sqrt(dx * dx + dy * dy) < z.size) {
            z.hp--
            for (let j = 0; j < 5; j++) {
              particlesRef.current.push({ x: z.x, y: z.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, color: '#00d4ff', size: 3, life: 1 })
            }
            if (z.hp <= 0) {
              scoreRef.current += 10
              setScore(scoreRef.current)
              for (let j = 0; j < 8; j++) {
                particlesRef.current.push({ x: z.x, y: z.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, color: '#ffee00', size: 4, life: 1 })
              }
            }
            return false
          }
        }
        return b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10
      })

      // Center crosshair
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx - 25, cy); ctx.lineTo(cx + 25, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - 25); ctx.lineTo(cx, cy + 25); ctx.stroke()

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
    if (!started) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = W / rect.width, scaleY = H / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY
    const cx = W / 2, cy = H / 2
    const dx = mx - cx, dy = my - cy
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    const speed = 6
    const colors = ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800']
    bulletsRef.current.push({
      x: cx, y: cy,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
    })
  }, [started])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-4 mb-3 text-sm flex-wrap">
        <span className="text-[#00ff88] font-bold">🎯 {score}</span>
        <span className="text-[#ff0044] font-bold">❤️ {health}%</span>
        <span className="text-[#aa00ff] font-bold">🌊 Wave {wave}</span>
      </div>
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,255,136,0.3)]">
        <canvas ref={canvasRef} width={W} height={H} onClick={handleClick}
          className="block max-w-full cursor-crosshair" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-center">
              <div className="text-5xl mb-2">🧟</div>
              <p className="text-white font-bold text-sm">Click to shoot paintballs!</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <p className="text-[#ff0044] font-bold text-xl mb-2">💀 Overrun!</p>
              <p className="text-white/80 text-sm">Score: {score} | Wave: {wave}</p>
            </div>
          </div>
        )}
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
        disabled={started}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50">
        {gameOver ? '🔄 Retry' : started ? '⏳ Fighting...' : '🧟 Start Survival!'}
      </motion.button>
    </div>
  )
}
