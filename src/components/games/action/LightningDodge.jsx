import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function LightningDodge({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('start')
  const [score, setScore] = useState(0)
  const [hp, setHp] = useState(5)
  const gameRef = useRef({})

  const initGame = useCallback(() => {
    gameRef.current = {
      player: { x: 160, y: 220, r: 12 },
      lightning: [],
      particles: [],
      keys: {},
      hp: 5,
      score: 0,
      timer: 0,
      spawnRate: 40,
      speed: 3,
      running: true,
      flash: 0,
      time: 0,
    }
    setScore(0)
    setHp(5)
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const g = gameRef.current

    const handleKey = (e) => { g.keys[e.code] = e.type === 'keydown' }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKey)

    let frameId
    let lastTime = 0
    const loop = (timestamp) => {
      if (!g.running) return
      const dt = Math.min((timestamp - lastTime) / 16, 3)
      lastTime = timestamp

      if (g.keys['ArrowLeft'] || g.keys['KeyA']) g.player.x -= 3.5 * dt
      if (g.keys['ArrowRight'] || g.keys['KeyD']) g.player.x += 3.5 * dt
      if (g.keys['ArrowUp'] || g.keys['KeyW']) g.player.y -= 3.5 * dt
      if (g.keys['ArrowDown'] || g.keys['KeyS']) g.player.y += 3.5 * dt
      g.player.x = Math.max(g.player.r, Math.min(W - g.player.r, g.player.x))
      g.player.y = Math.max(g.player.r, Math.min(H - g.player.r, g.player.y))

      g.timer += dt
      g.time += dt / 60
      g.speed = 3 + g.time * 0.05
      g.spawnRate = Math.max(10, 40 - g.time * 0.5)

      if (g.timer > g.spawnRate) {
        g.timer = 0
        const count = Math.min(3, 1 + Math.floor(g.time / 20))
        for (let i = 0; i < count; i++) {
          const x = Math.random() * W
          g.lightning.push({
            x, y: -10,
            targetY: H + 10,
            speed: g.speed + Math.random() * 2,
            width: 3,
            chain: [],
            warned: false,
            warningY: 0,
            active: true,
          })
          const segs = 5 + Math.floor(Math.random() * 4)
          for (let j = 0; j < segs; j++) {
            g.lightning[g.lightning.length - 1].chain.push({
              x: x + (Math.random() - 0.5) * 40,
              y: -10 - (j + 1) * 50,
            })
          }
        }
      }

      g.lightning.forEach(bolt => {
        if (!bolt.active) return
        bolt.y += bolt.speed * dt
        const dx = g.player.x - bolt.x
        const dy = g.player.y - bolt.y
        if (Math.sqrt(dx * dx + dy * dy) < g.player.r + bolt.width + 5) {
          g.hp--
          setHp(g.hp)
          g.flash = 10
          bolt.active = false
          for (let i = 0; i < 12; i++) {
            g.particles.push({
              x: bolt.x, y: bolt.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 20, color: '#ffee00',
            })
          }
          if (g.hp <= 0) {
            g.running = false
            setGameState('lost')
          }
        }
        if (bolt.y > H + 50) bolt.active = false
      })
      g.lightning = g.lightning.filter(b => b.active)

      g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= dt; p.vy += 0.1 })
      g.particles = g.particles.filter(p => p.life > 0)

      g.score = Math.floor(g.time)
      setScore(g.score)

      if (g.score >= 60) {
        g.running = false
        setGameState('won')
        if (onWin) onWin()
        return
      }

      if (g.flash > 0) g.flash -= dt

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0a0a2e'
      ctx.fillRect(0, 0, W, H)

      for (let i = 0; i < 6; i++) {
        const sx = (i * 70 + 10)
        ctx.strokeStyle = '#ffffff08'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(sx, 0)
        ctx.lineTo(sx, H)
        ctx.stroke()
      }

      g.lightning.forEach(bolt => {
        ctx.strokeStyle = '#ffee00'
        ctx.shadowColor = '#ffee00'
        ctx.shadowBlur = 15
        ctx.lineWidth = bolt.width
        ctx.beginPath()
        ctx.moveTo(bolt.x, bolt.y)
        let px = bolt.x
        let py = bolt.y
        bolt.chain.forEach(seg => {
          const progress = Math.max(0, Math.min(1, (bolt.y - seg.y) / (bolt.y + 50)))
          if (progress > 0) {
            ctx.lineTo(seg.x + (Math.random() - 0.5) * 5, seg.y + (bolt.y + 10) * 0)
            px = seg.x; py = seg.y
          }
        })
        ctx.stroke()
        ctx.shadowBlur = 0
      })

      g.particles.forEach(p => {
        ctx.globalAlpha = p.life / 20
        ctx.fillStyle = p.color
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
      })
      ctx.globalAlpha = 1

      if (g.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${g.flash / 10 * 0.3})`
        ctx.fillRect(0, 0, W, H)
      }

      ctx.fillStyle = '#00d4ff'
      ctx.shadowColor = '#00d4ff'
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(g.player.x, g.player.y, g.player.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = '#fff'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⚡', g.player.x, g.player.y + 5)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px Nunito'
      ctx.textAlign = 'center'
      ctx.fillText(`⏱ ${g.score}s / 60s`, W / 2, 25)

      for (let i = 0; i < g.hp; i++) {
        ctx.fillStyle = '#ff0044'
        ctx.font = '16px sans-serif'
        ctx.fillText('❤️', 10 + i * 22, H - 10)
      }

      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keyup', handleKey)
    }
  }, [gameState, onWin])

  const startGame = () => { initGame(); setGameState('playing') }

  return (
    <div className="text-center">
      {gameState === 'start' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-xl font-bold text-white mb-2">Lightning Dodge!</h2>
          <p className="text-white/60 text-sm mb-4">Dodge the lightning bolts for 60 seconds!</p>
          <p className="text-white/40 text-xs mb-4">WASD or Arrow keys to move</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ffee00] to-[#ff8800] text-white font-bold text-sm border-none cursor-pointer">
            Start Dodging ⚡
          </motion.button>
        </motion.div>
      )}
      {gameState === 'playing' && (
        <canvas ref={canvasRef} width={320} height={280}
          className="rounded-xl border border-[rgba(255,238,0,0.3)] mx-auto"
          style={{ background: '#0a0a2e', touchAction: 'none' }}
        />
      )}
      {(gameState === 'won' || gameState === 'lost') && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4">
          <div className="text-5xl mb-3">{gameState === 'won' ? '⚡🏆' : '💥'}</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: gameState === 'won' ? '#ffee00' : '#ff0044' }}>
            {gameState === 'won' ? 'Lightning Master!' : 'Struck Down!'}
          </h2>
          <p className="text-white/70 text-sm mb-4">Survived: {score}s</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
            Try Again 🔄
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
