import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function LavaEscape({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('start')
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(0)
  const gameRef = useRef({})

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width
    const H = canvas.height
    const g = {
      player: { x: W / 2, y: H - 80, w: 20, h: 20, vy: 0, onGround: false, jumpCount: 0 },
      platforms: [],
      lavaY: H - 20,
      lavaSpeed: 0.3,
      cameraY: 0,
      score: 0,
      time: 0,
      keys: {},
      particles: [],
      running: true,
    }
    for (let i = 0; i < 15; i++) {
      g.platforms.push({
        x: Math.random() * (W - 80) + 20,
        y: H - 100 - i * 80,
        w: 60 + Math.random() * 40,
        h: 12,
        color: ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00'][Math.floor(Math.random() * 4)],
        type: Math.random() > 0.85 ? 'moving' : 'static',
        dir: Math.random() > 0.5 ? 1 : -1,
        speed: 0.5 + Math.random() * 1,
      })
    }
    gameRef.current = g
    setScore(0)
    setTime(0)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const g = gameRef.current

    const handleKey = (e) => {
      g.keys[e.code] = e.type === 'keydown'
      if ((e.code === 'Space' || e.code === 'ArrowUp') && e.type === 'keydown') {
        if (g.player.jumpCount < 2) {
          g.player.vy = -7
          g.player.jumpCount++
          g.player.onGround = false
        }
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

      g.player.vy += 0.35 * dt
      g.player.y += g.player.vy * dt

      if (g.player.x < 0) g.player.x = 0
      if (g.player.x + g.player.w > W) g.player.x = W - g.player.w
      if (g.keys['ArrowLeft'] || g.keys['KeyA']) g.player.x -= 3 * dt
      if (g.keys['ArrowRight'] || g.keys['KeyD']) g.player.x += 3 * dt

      g.platforms.forEach(p => {
        if (p.type === 'moving') {
          p.x += p.speed * p.dir * dt
          if (p.x <= 0 || p.x + p.w >= W) p.dir *= -1
        }
      })

      g.platforms.forEach(p => {
        if (g.player.vy > 0 &&
            g.player.x + g.player.w > p.x && g.player.x < p.x + p.w &&
            g.player.y + g.player.h > p.y && g.player.y + g.player.h < p.y + p.h + 8) {
          g.player.y = p.y - g.player.h
          g.player.vy = 0
          g.player.onGround = true
          g.player.jumpCount = 0
        }
      })

      const targetCamY = g.player.y - H / 2
      if (targetCamY < g.cameraY) {
        g.cameraY += (targetCamY - g.cameraY) * 0.1 * dt
      }

      g.lavaY -= g.lavaSpeed * dt
      g.lavaSpeed += 0.0005 * dt
      g.time += dt / 60

      while (g.platforms.length < 15) {
        const topY = Math.min(...g.platforms.map(p => p.y)) - 80
        g.platforms.push({
          x: Math.random() * (W - 80) + 20,
          y: topY,
          w: 60 + Math.random() * 40,
          h: 12,
          color: ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00'][Math.floor(Math.random() * 4)],
          type: Math.random() > 0.85 ? 'moving' : 'static',
          dir: Math.random() > 0.5 ? 1 : -1,
          speed: 0.5 + Math.random() * 1,
        })
      }

      g.platforms = g.platforms.filter(p => p.y - g.cameraY < H + 100)

      const elapsed = Math.floor(g.time)
      if (elapsed > g.score) {
        g.score = elapsed
        setScore(g.score)
        setTime(elapsed)
      }

      if (g.player.y - g.cameraY > H) {
        g.running = false
        setGameState('lost')
        return
      }
      if (g.cameraY < -2000) {
        g.running = false
        setGameState('won')
        if (onWin) onWin()
        return
      }

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0a0a2e'
      ctx.fillRect(0, 0, W, H)

      const lavaScreenY = g.lavaY - g.cameraY
      const grad = ctx.createLinearGradient(0, lavaScreenY, 0, H)
      grad.addColorStop(0, '#ff4400')
      grad.addColorStop(0.5, '#ff0044')
      grad.addColorStop(1, '#ff8800')
      ctx.fillStyle = grad
      ctx.fillRect(0, lavaScreenY, W, H - lavaScreenY + 100)

      for (let i = 0; i < 8; i++) {
        const bx = (i * 60 + timestamp * 0.02) % W
        const by = lavaScreenY - 5 + Math.sin(timestamp * 0.005 + i) * 8
        ctx.fillStyle = '#ffee00'
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.arc(bx, by, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      g.platforms.forEach(p => {
        const sy = p.y - g.cameraY
        if (sy > -20 && sy < H + 20) {
          ctx.fillStyle = p.color + '40'
          ctx.strokeStyle = p.color
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.roundRect(p.x, sy, p.w, p.h, 4)
          ctx.fill()
          ctx.stroke()
        }
      })

      const py = g.player.y - g.cameraY
      ctx.fillStyle = '#00d4ff'
      ctx.shadowColor = '#00d4ff'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.roundRect(g.player.x, py, g.player.w, g.player.h, 4)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = '#ffffff'
      ctx.font = '10px sans-serif'
      ctx.fillText('🐰', g.player.x + 1, py + 14)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px Nunito'
      ctx.textAlign = 'center'
      ctx.fillText(`Height: ${g.score}m`, W / 2, 30)

      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keyup', handleKey)
    }
  }, [gameState, onWin])

  const startGame = () => {
    initGame()
    setGameState('playing')
  }

  return (
    <div className="text-center">
      {gameState === 'start' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-6xl mb-4">🌋</div>
          <h2 className="text-xl font-bold text-white mb-2">Lava Escape!</h2>
          <p className="text-white/60 text-sm mb-4">Jump between platforms and escape the rising lava!</p>
          <p className="text-white/40 text-xs mb-4">Arrow keys to move • Space/Up to jump (double jump!)</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ff4400] to-[#ff8800] text-white font-bold text-sm border-none cursor-pointer">
            Start Game 🌋
          </motion.button>
        </motion.div>
      )}
      {gameState === 'playing' && (
        <canvas ref={canvasRef} width={320} height={480}
          className="rounded-xl border border-[rgba(255,68,0,0.3)] mx-auto"
          style={{ background: '#0a0a2e', touchAction: 'none' }}
        />
      )}
      {(gameState === 'won' || gameState === 'lost') && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4">
          <div className="text-5xl mb-3">{gameState === 'won' ? '🎉' : '💀'}</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: gameState === 'won' ? '#00ff88' : '#ff0044' }}>
            {gameState === 'won' ? 'You Escaped!' : 'Lava Got You!'}
          </h2>
          <p className="text-white/70 text-sm mb-4">Height reached: {score}m</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
            Try Again 🔄
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
