import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function VolcanoRun({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('start')
  const [score, setScore] = useState(0)
  const gameRef = useRef({})

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width
    const H = canvas.height
    gameRef.current = {
      runner: { x: 60, y: H - 60, w: 20, h: 24, vy: 0, grounded: true },
      obstacles: [],
      gems: [],
      bg: { offset: 0 },
      speed: 3,
      distance: 0,
      gemsCollected: 0,
      keys: {},
      running: true,
      spawnTimer: 0,
      gemTimer: 0,
      particles: [],
    }
    setScore(0)
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const g = gameRef.current

    const handleKey = (e) => {
      g.keys[e.code] = e.type === 'keydown'
      if ((e.code === 'Space' || e.code === 'ArrowUp') && e.type === 'keydown' && g.runner.grounded) {
        g.runner.vy = -9
        g.runner.grounded = false
      }
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKey)

    let frameId
    let lastTime = 0
    const loop = (timestamp) => {
      if (!g.running) return
      const dt = Math.min((timestamp - lastTime) / 16, 3)
      lastTime = timestamp

      g.runner.vy += 0.45 * dt
      g.runner.y += g.runner.vy * dt
      if (g.runner.y + g.runner.h >= H - 40) {
        g.runner.y = H - 40 - g.runner.h
        g.runner.vy = 0
        g.runner.grounded = true
      }

      g.speed += 0.001 * dt
      g.distance += g.speed * dt

      g.bg.offset = (g.bg.offset + g.speed * dt) % 100

      g.spawnTimer += dt
      if (g.spawnTimer > 50 / g.speed) {
        g.spawnTimer = 0
        const type = Math.random() > 0.3 ? 'rock' : 'lavaPool'
        g.obstacles.push({
          x: W + 20,
          y: type === 'rock' ? H - 40 - (20 + Math.random() * 20) : H - 40 - 8,
          w: type === 'rock' ? 20 + Math.random() * 15 : 30 + Math.random() * 20,
          h: type === 'rock' ? 20 + Math.random() * 20 : 8,
          type,
        })
      }

      g.gemTimer += dt
      if (g.gemTimer > 80) {
        g.gemTimer = 0
        g.gems.push({
          x: W + 20,
          y: H - 100 - Math.random() * 150,
          r: 8,
          collected: false,
        })
      }

      g.obstacles.forEach(o => { o.x -= g.speed * dt })
      g.gems.forEach(gem => { gem.x -= g.speed * dt })
      g.obstacles = g.obstacles.filter(o => o.x + o.w > -20)
      g.gems = g.gems.filter(gem => gem.x + gem.r > -20)

      g.obstacles.forEach(o => {
        if (g.runner.x + g.runner.w > o.x && g.runner.x < o.x + o.w &&
            g.runner.y + g.runner.h > o.y && g.runner.y < o.y + o.h) {
          g.running = false
          setGameState('lost')
          return
        }
      })

      g.gems.forEach(gem => {
        if (!gem.collected) {
          const dx = g.runner.x + g.runner.w / 2 - gem.x
          const dy = g.runner.y + g.runner.h / 2 - gem.y
          if (Math.sqrt(dx * dx + dy * dy) < gem.r + 12) {
            gem.collected = true
            g.gemsCollected++
            for (let i = 0; i < 6; i++) {
              g.particles.push({
                x: gem.x, y: gem.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 20, color: '#ffee00',
              })
            }
          }
        }
      })

      g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= dt })
      g.particles = g.particles.filter(p => p.life > 0)

      const distScore = Math.floor(g.distance / 10)
      setScore(distScore + g.gemsCollected * 5)

      if (distScore + g.gemsCollected * 5 >= 500) {
        g.running = false
        setGameState('won')
        if (onWin) onWin()
        return
      }

      ctx.clearRect(0, 0, W, H)

      ctx.fillStyle = '#1a0a0a'
      ctx.fillRect(0, 0, W, H)

      for (let i = 0; i < 5; i++) {
        const mx = ((i * 80 - g.bg.offset * 2) % (W + 40)) - 20
        ctx.fillStyle = '#331100'
        ctx.beginPath()
        ctx.moveTo(mx, H - 38)
        ctx.lineTo(mx + 20, H - 80)
        ctx.lineTo(mx + 40, H - 38)
        ctx.fill()
      }

      ctx.fillStyle = '#441100'
      ctx.fillRect(0, H - 40, W, 40)
      ctx.fillStyle = '#ff440044'
      ctx.fillRect(0, H - 42, W, 4)

      g.obstacles.forEach(o => {
        ctx.fillStyle = o.type === 'rock' ? '#884400' : '#ff2200'
        ctx.beginPath()
        ctx.roundRect(o.x, o.y, o.w, o.h, o.type === 'rock' ? 4 : 2)
        ctx.fill()
        if (o.type === 'lavaPool') {
          ctx.fillStyle = '#ff440066'
          ctx.fillRect(o.x - 2, o.y - 3, o.w + 4, 3)
        }
      })

      g.gems.forEach(gem => {
        if (!gem.collected) {
          ctx.fillStyle = '#ffee00'
          ctx.shadowColor = '#ffee00'
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(gem.x, gem.y, gem.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.fillStyle = '#ffffff'
          ctx.font = '10px sans-serif'
          ctx.fillText('💎', gem.x - 5, gem.y + 4)
        }
      })

      g.particles.forEach(p => {
        ctx.globalAlpha = p.life / 20
        ctx.fillStyle = p.color
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
      })
      ctx.globalAlpha = 1

      ctx.fillStyle = '#00d4ff'
      ctx.shadowColor = '#00d4ff'
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.roundRect(g.runner.x, g.runner.y, g.runner.w, g.runner.h, 4)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = '#fff'
      ctx.font = '12px sans-serif'
      ctx.fillText('🏃', g.runner.x + 1, g.runner.y + 17)

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px Nunito'
      ctx.textAlign = 'left'
      ctx.fillText(`Distance: ${Math.floor(g.distance / 10)}m  💎${g.gemsCollected}`, 10, 25)

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
          <div className="text-6xl mb-4">🌋</div>
          <h2 className="text-xl font-bold text-white mb-2">Volcano Run!</h2>
          <p className="text-white/60 text-sm mb-4">Run through the volcanic landscape! Jump obstacles, collect gems!</p>
          <p className="text-white/40 text-xs mb-4">Space/Up to jump • Reach 500 points to win!</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ff4400] to-[#ff8800] text-white font-bold text-sm border-none cursor-pointer">
            Start Running 🌋
          </motion.button>
        </motion.div>
      )}
      {gameState === 'playing' && (
        <canvas ref={canvasRef} width={360} height={300}
          className="rounded-xl border border-[rgba(255,68,0,0.3)] mx-auto"
          style={{ background: '#1a0a0a', touchAction: 'none' }}
        />
      )}
      {(gameState === 'won' || gameState === 'lost') && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4">
          <div className="text-5xl mb-3">{gameState === 'won' ? '🏆' : '💥'}</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: gameState === 'won' ? '#00ff88' : '#ff0044' }}>
            {gameState === 'won' ? 'Epic Run Complete!' : 'Game Over!'}
          </h2>
          <p className="text-white/70 text-sm mb-4">Score: {score}</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
            Run Again 🔄
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
