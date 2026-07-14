import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function ObstacleRunner({ onWin }) {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const [gameState, setGameState] = useState('start')
  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(0)

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 400
    canvas.height = 500

    const laneW = canvas.width / 3
    const g = {
      player: { lane: 1, targetLane: 1, x: laneW + laneW / 2 - 20, y: 380, w: 40, h: 50, jumping: false, jumpY: 0, jumpV: 0 },
      obstacles: [],
      coinItems: [],
      particles: [],
      speed: 3,
      distance: 0,
      coinCount: 0,
      frame: 0,
      spawnTimer: 0,
      coinTimer: 0,
      laneW,
      trackOffset: 0,
      dead: false,
      winDistance: 3000,
      won: false,
    }
    gameRef.current = g
    return g
  }, [])

  const update = useCallback(() => {
    const g = gameRef.current
    if (!g || g.dead || g.won) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    g.frame++
    g.speed = 3 + g.distance * 0.0008
    g.distance += g.speed * 0.15
    g.trackOffset = (g.trackOffset + g.speed) % 40

    const p = g.player
    const targetX = p.targetLane * g.laneW + g.laneW / 2 - p.w / 2
    p.x += (targetX - p.x) * 0.15
    p.lane = p.targetLane

    if (p.jumping) {
      p.jumpV += 0.7
      p.jumpY += p.jumpV
      if (p.jumpY >= 0) { p.jumpY = 0; p.jumping = false; p.jumpV = 0 }
    }

    g.spawnTimer++
    if (g.spawnTimer > 50 - Math.min(g.distance * 0.01, 20)) {
      const lane = Math.floor(Math.random() * 3)
      g.obstacles.push({ lane, x: lane * g.laneW + g.laneW / 2 - 20, y: -50, w: 40, h: 40, type: Math.floor(Math.random() * 3) })
      g.spawnTimer = 0
    }

    g.coinTimer++
    if (g.coinTimer > 35) {
      const lane = Math.floor(Math.random() * 3)
      if (!g.obstacles.find(o => o.lane === lane && o.y < 50)) {
        g.coinItems.push({ lane, x: lane * g.laneW + g.laneW / 2 - 10, y: -30, w: 20, h: 20 })
      }
      g.coinTimer = 0
    }

    g.obstacles.forEach(o => { o.y += g.speed })
    g.obstacles = g.obstacles.filter(o => o.y < 560)
    g.coinItems.forEach(c => { c.y += g.speed })
    g.coinItems = g.coinItems.filter(c => c.y < 560)

    for (const o of g.obstacles) {
      const py = p.y + p.jumpY
      if (Math.abs(p.x - o.x) < 30 && Math.abs(py - o.y) < 35) {
        g.dead = true
        for (let i = 0; i < 20; i++) g.particles.push({ x: p.x + p.w / 2, y: p.y + p.h / 2, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 25, color: ['#ff0044', '#ff8800', '#ffee00'][Math.floor(Math.random() * 3)] })
      }
    }

    for (let i = g.coinItems.length - 1; i >= 0; i--) {
      const c = g.coinItems[i]
      const py = p.y + p.jumpY
      if (Math.abs(p.x - c.x) < 28 && Math.abs(py - c.y) < 30) {
        g.coinCount++
        for (let j = 0; j < 8; j++) g.particles.push({ x: c.x + 10, y: c.y + 10, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 18, color: '#ffee00' })
        g.coinItems.splice(i, 1)
      }
    }

    g.particles.forEach(pt => { pt.x += pt.vx; pt.y += pt.vy; pt.life-- })
    g.particles = g.particles.filter(pt => pt.life > 0)

    if (g.distance >= g.winDistance && !g.won) {
      g.won = true
      setCoins(g.coinCount)
      setTimeout(() => { setGameState('win'); onWin?.() }, 500)
    }
    setScore(Math.floor(g.distance) + g.coinCount * 10)
    setCoins(g.coinCount)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0a0820'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < 3; i++) {
      const lx = i * g.laneW
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0,212,255,0.04)' : 'rgba(255,0,255,0.04)'
      ctx.fillRect(lx, 0, g.laneW, canvas.height)
      ctx.strokeStyle = 'rgba(0,212,255,0.2)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, canvas.height); ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(0,212,255,0.15)'
    ctx.setLineDash([10, 10])
    ctx.lineDashOffset = -g.trackOffset
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(i * g.laneW, 0); ctx.lineTo(i * g.laneW, canvas.height); ctx.stroke()
    }
    ctx.setLineDash([])

    g.obstacles.forEach(o => {
      ctx.shadowBlur = 10
      if (o.type === 0) {
        ctx.shadowColor = '#ff0044'
        ctx.fillStyle = '#ff0044'
        ctx.fillRect(o.x + 5, o.y, 30, 40)
        ctx.fillRect(o.x, o.y + 10, 40, 8)
      } else if (o.type === 1) {
        ctx.shadowColor = '#ff8800'
        ctx.fillStyle = '#ff8800'
        ctx.beginPath()
        ctx.moveTo(o.x + 20, o.y); ctx.lineTo(o.x + 40, o.y + 40); ctx.lineTo(o.x, o.y + 40)
        ctx.fill()
      } else {
        ctx.shadowColor = '#ff00ff'
        ctx.fillStyle = '#ff00ff'
        ctx.fillRect(o.x, o.y + 5, 40, 30)
        ctx.fillRect(o.x + 10, o.y, 20, 40)
      }
      ctx.shadowBlur = 0
    })

    g.coinItems.forEach(c => {
      ctx.shadowBlur = 8; ctx.shadowColor = '#ffee00'
      ctx.fillStyle = '#ffee00'
      ctx.beginPath()
      ctx.arc(c.x + 10, c.y + 10, 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#cc9900'
      ctx.beginPath()
      ctx.arc(c.x + 10, c.y + 10, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    })

    const py = p.y + p.jumpY
    ctx.shadowBlur = 15; ctx.shadowColor = '#00ff88'
    ctx.fillStyle = '#00ff88'
    ctx.fillRect(p.x, py, p.w, p.h)
    ctx.fillStyle = '#fff'
    ctx.fillRect(p.x + 8, py + 6, 10, 8)
    ctx.fillRect(p.x + 22, py + 6, 10, 8)
    ctx.fillStyle = '#0a0820'
    ctx.fillRect(p.x + 11, py + 8, 4, 4)
    ctx.fillRect(p.x + 25, py + 8, 4, 4)
    ctx.shadowBlur = 0

    if (p.jumping) {
      for (let i = 0; i < 3; i++) g.particles.push({ x: p.x + p.w / 2, y: py + p.h, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2, life: 12, color: '#00ff88' })
    }

    g.particles.forEach(pt => {
      ctx.globalAlpha = pt.life / 25
      ctx.fillStyle = pt.color
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2); ctx.fill()
    })
    ctx.globalAlpha = 1

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px monospace'
    ctx.fillText(`Score: ${Math.floor(g.distance) + g.coinCount * 10}`, 10, 22)
    ctx.fillStyle = '#ffee00'
    ctx.fillText(`Coins: ${g.coinCount}`, 10, 40)
    const progress = Math.min(g.distance / g.winDistance * 100, 100)
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fillRect(canvas.width - 120, 10, 110, 8)
    ctx.fillStyle = '#00ff88'
    ctx.fillRect(canvas.width - 120, 10, progress * 1.1, 8)

    if (g.dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ff0044'
      ctx.font = 'bold 32px monospace'
      ctx.textAlign = 'center'
      ctx.shadowBlur = 15; ctx.shadowColor = '#ff0044'
      ctx.fillText('CRASHED!', canvas.width / 2, canvas.height / 2 - 20)
      ctx.shadowBlur = 0
      ctx.fillStyle = '#fff'
      ctx.font = '16px monospace'
      ctx.fillText(`Score: ${Math.floor(g.distance) + g.coinCount * 10}`, canvas.width / 2, canvas.height / 2 + 15)
      ctx.fillText(`Coins: ${g.coinCount}`, canvas.width / 2, canvas.height / 2 + 40)
      ctx.textAlign = 'left'
      setTimeout(() => setGameState('over'), 800)
    }
  }, [onWin])

  const moveLane = useCallback((dir) => {
    const g = gameRef.current
    if (!g || g.dead) return
    g.player.targetLane = Math.max(0, Math.min(2, g.player.targetLane + dir))
  }, [])

  const jump = useCallback(() => {
    const g = gameRef.current
    if (!g || g.dead || g.player.jumping) return
    g.player.jumping = true
    g.player.jumpV = -12
  }, [])

  const startGame = useCallback(() => {
    initGame()
    setScore(0)
    setCoins(0)
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
      if (gameState === 'playing') {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); moveLane(-1) }
        else if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); moveLane(1) }
        else if (e.code === 'Space') { e.preventDefault(); jump() }
      } else if (gameState === 'start' || gameState === 'over') {
        if (e.code === 'Space') { e.preventDefault(); startGame() }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [gameState, moveLane, jump, startGame])

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="text-xl font-bold text-[#ff00ff] mb-1">Obstacle Runner</h2>
        <p className="text-gray-400 text-xs">&uarr;/&darr; switch lanes &bull; Space jump &bull; Collect coins</p>
      </motion.div>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative rounded-xl overflow-hidden border-2 border-[#ff00ff]/30"
        onClick={() => { if (gameState === 'playing') jump(); else startGame() }} style={{ touchAction: 'manipulation' }}>
        <canvas ref={canvasRef} className="block bg-[#0a0820]" />
        {gameState === 'start' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <motion.h3 animate={{ textShadow: ['0 0 10px #ff00ff', '0 0 20px #00d4ff', '0 0 10px #ff00ff'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-bold text-[#ff00ff] mb-4">OBSTACLE RUNNER</motion.h3>
            <p className="text-gray-300 text-sm mb-1">Dodge obstacles in 3 lanes</p>
            <p className="text-gray-400 text-xs mb-4">Collect coins for bonus points!</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
              START (Space)
            </motion.button>
          </motion.div>
        )}
        {gameState === 'over' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <h3 className="text-2xl font-bold text-[#ff0044] mb-2">GAME OVER</h3>
            <p className="text-white text-lg">Score: {score}</p>
            <p className="text-[#ffee00] text-sm mb-3">Coins: {coins}</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
              RETRY
            </motion.button>
          </motion.div>
        )}
        {gameState === 'win' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <motion.h3 animate={{ color: ['#00ff88', '#ffee00', '#00ff88'] }} transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl font-bold mb-2">YOU WIN!</motion.h3>
            <p className="text-white text-lg mb-1">Score: {score}</p>
            <p className="text-[#ffee00] text-sm mb-3">Coins: {coins}</p>
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
