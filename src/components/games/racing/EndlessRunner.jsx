import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function EndlessRunner({ onWin }) {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const [gameState, setGameState] = useState('start')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 600
    canvas.height = 350

    const g = {
      player: { x: 80, y: 250, w: 30, h: 40, vy: 0, jumps: 0, maxJumps: 2, grounded: true },
      obstacles: [],
      particles: [],
      ground: 290,
      speed: 4,
      distance: 0,
      frame: 0,
      dayTime: 0,
      nightAlpha: 0,
      spawnTimer: 0,
      stars: Array.from({ length: 40 }, () => ({ x: Math.random() * 600, y: Math.random() * 180, s: Math.random() * 2 + 0.5, b: Math.random() })),
      clouds: Array.from({ length: 5 }, (_, i) => ({ x: i * 150 + Math.random() * 80, y: 40 + Math.random() * 60, w: 60 + Math.random() * 40 })),
      groundTiles: Array.from({ length: 20 }, (_, i) => ({ x: i * 35, h: 8 + Math.random() * 12 })),
      dead: false,
      won: false,
      winDistance: 2000,
    }
    gameRef.current = g
    return g
  }, [])

  const spawnObstacle = useCallback((g) => {
    const types = ['cactus', 'rock', 'bird']
    const type = types[Math.floor(Math.random() * types.length)]
    const obs = { x: 620, type }
    if (type === 'cactus') { obs.y = g.ground - 35; obs.w = 20; obs.h = 35 }
    else if (type === 'rock') { obs.y = g.ground - 22; obs.w = 28; obs.h = 22 }
    else { obs.y = g.ground - 60 - Math.random() * 40; obs.w = 30; obs.h = 20 }
    g.obstacles.push(obs)
  }, [])

  const update = useCallback(() => {
    const g = gameRef.current
    if (!g || g.dead || g.won) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    g.frame++
    g.dayTime += 0.003
    g.nightAlpha = (Math.sin(g.dayTime) + 1) / 2 * 0.35
    g.speed = 4 + g.distance * 0.001
    g.distance += g.speed * 0.1
    g.spawnTimer++
    if (g.spawnTimer > 60 - Math.min(g.distance * 0.02, 25)) {
      spawnObstacle(g)
      g.spawnTimer = 0
    }

    const p = g.player
    p.vy += 0.55
    p.y += p.vy
    if (p.y >= g.ground - p.h) { p.y = g.ground - p.h; p.vy = 0; p.jumps = 0; p.grounded = true }

    g.obstacles.forEach(o => o.x -= g.speed)
    g.obstacles = g.obstacles.filter(o => o.x > -50)
    g.clouds.forEach(c => { c.x -= g.speed * 0.2; if (c.x < -100) c.x = 650 })
    g.groundTiles.forEach(t => { t.x -= g.speed; if (t.x < -35) { t.x += 700; t.h = 8 + Math.random() * 12 } })

    for (const o of g.obstacles) {
      if (p.x + p.w > o.x + 4 && p.x < o.x + o.w - 4 && p.y + p.h > o.y + 4 && p.y < o.y + o.h - 4) {
        g.dead = true
        for (let i = 0; i < 15; i++) g.particles.push({ x: p.x + p.w / 2, y: p.y + p.h / 2, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 30, color: ['#00d4ff', '#ff00ff', '#00ff88'][Math.floor(Math.random() * 3)] })
      }
    }

    g.particles.forEach(pt => { pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.15; pt.life-- })
    g.particles = g.particles.filter(pt => pt.life > 0)

    if (g.distance >= g.winDistance && !g.won) {
      g.won = true
      setTimeout(() => { setGameState('win'); onWin?.() }, 500)
    }
    setScore(Math.floor(g.distance))

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    skyGrad.addColorStop(0, `rgba(10,5,30,${0.6 + g.nightAlpha})`)
    skyGrad.addColorStop(1, `rgba(20,10,50,${0.4 + g.nightAlpha})`)
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    g.stars.forEach(s => {
      s.b = 0.4 + Math.sin(g.frame * 0.02 + s.x) * 0.4
      ctx.globalAlpha = s.b * g.nightAlpha * 2
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill()
    })
    ctx.globalAlpha = 1

    g.clouds.forEach(c => {
      ctx.fillStyle = `rgba(180,180,220,${0.15 + g.nightAlpha * 0.1})`
      ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w / 2, 14, 0, 0, Math.PI * 2); ctx.fill()
    })

    ctx.fillStyle = '#1a1030'
    ctx.fillRect(0, g.ground, canvas.width, canvas.height - g.ground)
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 2
    ctx.shadowBlur = 8; ctx.shadowColor = '#00d4ff'
    ctx.beginPath(); ctx.moveTo(0, g.ground); ctx.lineTo(canvas.width, g.ground); ctx.stroke()
    ctx.shadowBlur = 0

    g.groundTiles.forEach(t => {
      ctx.fillStyle = 'rgba(0,212,255,0.15)'
      ctx.fillRect(t.x, g.ground + 4, 20, t.h)
    })

    g.obstacles.forEach(o => {
      ctx.shadowBlur = 10
      if (o.type === 'cactus') {
        ctx.shadowColor = '#00ff88'
        ctx.fillStyle = '#00ff88'
        ctx.fillRect(o.x + 7, o.y, 6, o.h)
        ctx.fillRect(o.x, o.y + 8, 20, 5)
        ctx.fillRect(o.x + 2, o.y + 16, 4, 12)
        ctx.fillRect(o.x + 14, o.y + 12, 4, 16)
      } else if (o.type === 'rock') {
        ctx.shadowColor = '#ff8800'
        ctx.fillStyle = '#ff8800'
        ctx.beginPath()
        ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, o.w / 2, o.h / 2, 0, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.shadowColor = '#ff0044'
        ctx.fillStyle = '#ff0044'
        ctx.fillRect(o.x, o.y + 5, o.w, 10)
        ctx.fillRect(o.x + 3, o.y, 8, 20)
        ctx.fillRect(o.x + o.w - 11, o.y, 8, 20)
        const wingOff = Math.sin(g.frame * 0.15) * 4
        ctx.fillRect(o.x - 3, o.y + 3 + wingOff, 8, 4)
        ctx.fillRect(o.x + o.w - 5, o.y + 3 - wingOff, 8, 4)
      }
      ctx.shadowBlur = 0
    })

    ctx.fillStyle = '#00d4ff'
    ctx.shadowBlur = 12; ctx.shadowColor = '#00d4ff'
    ctx.fillRect(p.x, p.y, p.w, p.h)
    ctx.fillStyle = '#fff'
    ctx.fillRect(p.x + 6, p.y + 6, 8, 6)
    ctx.shadowBlur = 0

    if (!p.grounded) {
      for (let i = 0; i < 2; i++) {
        g.particles.push({ x: p.x + p.w / 2, y: p.y + p.h, vx: (Math.random() - 0.5) * 2, vy: Math.random() * 2, life: 15, color: '#00d4ff' })
      }
    }

    g.particles.forEach(pt => {
      ctx.globalAlpha = pt.life / 30
      ctx.fillStyle = pt.color
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2); ctx.fill()
    })
    ctx.globalAlpha = 1

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px monospace'
    ctx.fillText(`Distance: ${Math.floor(g.distance)}m`, 15, 25)
    const progress = Math.min(g.distance / g.winDistance * 100, 100)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillRect(15, 35, 150, 8)
    const pbGrad = ctx.createLinearGradient(15, 0, 165, 0)
    pbGrad.addColorStop(0, '#00d4ff'); pbGrad.addColorStop(1, '#00ff88')
    ctx.fillStyle = pbGrad
    ctx.fillRect(15, 35, progress * 1.5, 8)

    if (g.dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ff0044'
      ctx.font = 'bold 36px monospace'
      ctx.textAlign = 'center'
      ctx.shadowBlur = 15; ctx.shadowColor = '#ff0044'
      ctx.fillText('CRASHED!', canvas.width / 2, canvas.height / 2 - 10)
      ctx.shadowBlur = 0
      ctx.fillStyle = '#fff'
      ctx.font = '18px monospace'
      ctx.fillText(`Distance: ${Math.floor(g.distance)}m`, canvas.width / 2, canvas.height / 2 + 25)
      ctx.textAlign = 'left'
      setTimeout(() => setGameState('over'), 800)
    }
  }, [spawnObstacle, onWin])

  const jump = useCallback(() => {
    const g = gameRef.current
    if (!g || g.dead) return
    const p = g.player
    if (p.jumps < p.maxJumps) {
      p.vy = -10
      p.jumps++
      p.grounded = false
    }
  }, [])

  const startGame = useCallback(() => {
    initGame()
    setScore(0)
    setGameState('playing')
  }, [initGame])

  useEffect(() => {
    if (gameState !== 'playing') return
    let raf
    const loop = () => { update(); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [gameState, update])

  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (gameState === 'playing') jump()
        else if (gameState === 'start' || gameState === 'over') startGame()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [gameState, jump, startGame])

  const handleTap = () => {
    if (gameState === 'playing') jump()
    else if (gameState === 'start' || gameState === 'over') startGame()
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="text-xl font-bold text-[#00d4ff] mb-1">Endless Runner</h2>
        <p className="text-gray-400 text-xs">Space/Tap to jump &bull; Double-jump! &bull; Reach {2000}m to win</p>
      </motion.div>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative rounded-xl overflow-hidden border-2 border-[#00d4ff]/30"
        onClick={handleTap} style={{ touchAction: 'manipulation' }}>
        <canvas ref={canvasRef} className="block bg-[#0a0520]" />
        {gameState === 'start' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <motion.h3 animate={{ textShadow: ['0 0 10px #00d4ff', '0 0 20px #ff00ff', '0 0 10px #00d4ff'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-bold text-[#00d4ff] mb-4">ENDLESS RUNNER</motion.h3>
            <p className="text-gray-300 text-sm mb-1">Jump over cacti, rocks & birds</p>
            <p className="text-gray-400 text-xs mb-4">Double-jump allowed!</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
              START (Space)
            </motion.button>
          </motion.div>
        )}
        {gameState === 'over' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <h3 className="text-2xl font-bold text-[#ff0044] mb-2">CRASHED!</h3>
            <p className="text-white text-lg mb-1">{Math.floor(score)}m</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer mt-3">
              RETRY
            </motion.button>
          </motion.div>
        )}
        {gameState === 'win' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <motion.h3 animate={{ color: ['#00ff88', '#ffee00', '#00ff88'] }} transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl font-bold mb-2">YOU WIN!</motion.h3>
            <p className="text-white text-lg mb-3">Reached {2000}m!</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-white font-bold text-sm border-none cursor-pointer">
              PLAY AGAIN
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
