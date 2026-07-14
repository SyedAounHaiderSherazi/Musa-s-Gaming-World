import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function HoverboardRace({ onWin }) {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const keysRef = useRef({})
  const [gameState, setGameState] = useState('start')
  const [lap, setLap] = useState(0)
  const [position, setPosition] = useState(1)

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 500
    canvas.height = 500
    const ctx = canvas.getContext('2d')

    const trackCX = 250, trackCY = 250, trackRX = 180, trackRY = 130
    const checkpoints = [0, 0.25, 0.5, 0.75]

    const makeBot = (color, speed, angleOffset) => ({
      angle: angleOffset, speed, color, lap: 0, lastCheckpoint: -1, boostTimer: 0, x: 0, y: 0,
      drift: 0, trail: []
    })

    const g = {
      player: { angle: 0, speed: 0, x: 0, y: 0, lap: 0, lastCheckpoint: -1, boostTimer: 0, color: '#00d4ff', trail: [] },
      bots: [
        makeBot('#ff0044', 2.2, Math.PI * 0.33),
        makeBot('#ffee00', 2.0, Math.PI * 0.66),
        makeBot('#00ff88', 1.8, Math.PI),
      ],
      trackCX, trackCY, trackRX, trackRY, checkpoints,
      boostPads: [
        { angle: 0.15, active: true, timer: 0 },
        { angle: 0.65, active: true, timer: 0 },
        { angle: 1.15, active: true, timer: 0 },
      ],
      totalLaps: 3,
      frame: 0,
      raceOver: false,
      won: false,
      positions: [],
    }
    gameRef.current = g
    return g
  }, [])

  const getTrackPos = useCallback((angle, g) => {
    return {
      x: g.trackCX + Math.cos(angle) * g.trackRX,
      y: g.trackCY + Math.sin(angle) * g.trackRY,
    }
  }, [])

  const update = useCallback(() => {
    const g = gameRef.current
    if (!g || g.raceOver) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    g.frame++
    const keys = keysRef.current
    const p = g.player

    const accel = 0.12
    const friction = 0.97
    const maxSpeed = 3.5
    const turnSpeed = 0.035

    if (keys.KeyW || keys.ArrowUp) p.speed = Math.min(p.speed + accel, maxSpeed)
    if (keys.KeyS || keys.ArrowDown) p.speed = Math.max(p.speed - 0.08, -maxSpeed * 0.4)
    if (keys.KeyA || keys.ArrowLeft) p.angle -= turnSpeed * (p.speed > 0 ? 1 : -0.5)
    if (keys.KeyD || keys.ArrowRight) p.angle += turnSpeed * (p.speed > 0 ? 1 : -0.5)
    p.speed *= friction
    p.angle += 0

    const pp = getTrackPos(p.angle, g)
    p.x = pp.x; p.y = pp.y

    const distFromCenter = Math.sqrt((pp.x - g.trackCX) ** 2 + (pp.y - g.trackCY) ** 2)
    const idealDist = g.trackRX * 0.7
    if (Math.abs(distFromCenter - idealDist * 1.1) > 30) p.speed *= 0.98

    p.trail.push({ x: pp.x, y: pp.y, life: 12 })
    if (p.trail.length > 15) p.trail.shift()

    const cpIdx = g.checkpoints.findIndex((cp, i) => {
      const prev = i === 0 ? 0.95 : g.checkpoints[i - 1]
      return p.angle >= cp - 0.05 && p.angle <= cp + 0.08 && p.lastCheckpoint === i - 1
    })
    if (cpIdx !== -1) {
      const oldCheckpoint = p.lastCheckpoint
      p.lastCheckpoint = cpIdx
      if (cpIdx === 0 && oldCheckpoint === g.checkpoints.length - 1) {
        p.lap++
        setLap(p.lap)
        if (p.lap >= g.totalLaps) {
          g.raceOver = true; g.won = true
          setTimeout(() => { setGameState('win'); onWin?.() }, 600)
        }
      }
    }

    g.boostPads.forEach(bp => {
      if (!bp.active) { bp.timer++; if (bp.timer > 180) { bp.active = true; bp.timer = 0 } return }
      const diff = Math.abs(p.angle % (Math.PI * 2) - bp.angle)
      if (diff < 0.08) { p.boostTimer = 60; p.speed = Math.min(p.speed + 1.5, maxSpeed + 1) }
    })

    g.bots.forEach(bot => {
      const botAccel = bot.speed + (bot.boostTimer > 0 ? 1 : 0)
      bot.angle += botAccel * 0.018
      bot.angle += Math.sin(g.frame * 0.01 + bot.angle * 3) * 0.003
      const bp = getTrackPos(bot.angle, g)
      bot.x = bp.x; bot.y = bp.y
      if (bot.boostTimer > 0) bot.boostTimer--
      bot.trail.push({ x: bp.x, y: bp.y, life: 10 })
      if (bot.trail.length > 10) bot.trail.shift()

      g.boostPads.forEach(bpad => {
        if (!bpad.active) return
        if (Math.abs(bot.angle % (Math.PI * 2) - bpad.angle) < 0.1) {
          bot.boostTimer = 40; bpad.active = false; bpad.timer = 0
        }
      })

      const bcp = g.checkpoints.findIndex((cp, i) => {
        return bot.angle >= cp - 0.06 && bot.angle <= cp + 0.08
      })
      if (bcp !== -1 && bcp !== bot.lastCheckpoint) {
        const oldBotCheckpoint = bot.lastCheckpoint
        bot.lastCheckpoint = bcp
        if (bcp === 0 && oldBotCheckpoint === g.checkpoints.length - 1) bot.lap++
      }
    })

    if (p.boostTimer > 0) p.boostTimer--

    const allRacers = [{ type: 'player', lap: p.lap, angle: p.angle }, ...g.bots.map((b, i) => ({ type: 'bot', idx: i, lap: b.lap, angle: b.angle }))]
    allRacers.sort((a, b) => b.lap - a.lap || b.angle - a.angle)
    const pos = allRacers.findIndex(r => r.type === 'player') + 1
    setPosition(pos)

    p.trail.forEach(t => t.life--)
    p.trail = p.trail.filter(t => t.life > 0)
    g.bots.forEach(b => { b.trail.forEach(t => t.life--); b.trail = b.trail.filter(t => t.life > 0) })

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0a0820'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(0,212,255,0.15)'
    ctx.lineWidth = 60
    ctx.beginPath()
    ctx.ellipse(g.trackCX, g.trackCY, g.trackRX, g.trackRY, 0, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(0,212,255,0.4)'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.ellipse(g.trackCX, g.trackCY, g.trackRX, g.trackRY, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 3
    const sa = g.checkpoints[0]
    ctx.beginPath()
    ctx.moveTo(g.trackCX + Math.cos(sa) * (g.trackRX - 30), g.trackCY + Math.sin(sa) * (g.trackRY - 30))
    ctx.lineTo(g.trackCX + Math.cos(sa) * (g.trackRX + 30), g.trackCY + Math.sin(sa) * (g.trackRY + 30))
    ctx.stroke()

    g.boostPads.forEach(bp => {
      const bx = g.trackCX + Math.cos(bp.angle) * g.trackRX
      const by = g.trackCY + Math.sin(bp.angle) * g.trackRY
      ctx.save()
      ctx.translate(bx, by)
      ctx.rotate(bp.angle)
      if (bp.active) {
        ctx.shadowBlur = 12; ctx.shadowColor = '#ffee00'
        ctx.fillStyle = '#ffee00'
        ctx.fillRect(-12, -8, 24, 16)
        ctx.fillStyle = '#ff8800'
        ctx.fillRect(-6, -5, 12, 10)
        ctx.shadowBlur = 0
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.fillRect(-12, -8, 24, 16)
      }
      ctx.restore()
    })

    g.bots.forEach(bot => {
      bot.trail.forEach(t => {
        ctx.globalAlpha = t.life / 10 * 0.3
        ctx.fillStyle = bot.color
        ctx.beginPath(); ctx.arc(t.x, t.y, 3, 0, Math.PI * 2); ctx.fill()
      })
      ctx.globalAlpha = 1
      ctx.shadowBlur = 12; ctx.shadowColor = bot.color
      ctx.fillStyle = bot.color
      ctx.beginPath()
      ctx.save()
      ctx.translate(bot.x, bot.y)
      ctx.rotate(bot.angle)
      ctx.fillRect(-10, -6, 20, 12)
      ctx.fillStyle = '#fff'
      ctx.fillRect(6, -3, 4, 6)
      ctx.restore()
      ctx.shadowBlur = 0
    })

    p.trail.forEach(t => {
      ctx.globalAlpha = t.life / 12 * 0.4
      ctx.fillStyle = '#00d4ff'
      ctx.beginPath(); ctx.arc(t.x, t.y, 3, 0, Math.PI * 2); ctx.fill()
    })
    ctx.globalAlpha = 1

    ctx.shadowBlur = 18; ctx.shadowColor = p.boostTimer > 0 ? '#ffee00' : '#00d4ff'
    ctx.fillStyle = p.boostTimer > 0 ? '#ffee00' : '#00d4ff'
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.angle)
    ctx.fillRect(-12, -7, 24, 14)
    ctx.fillStyle = '#fff'
    ctx.fillRect(7, -4, 5, 8)
    ctx.restore()
    ctx.shadowBlur = 0

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px monospace'
    ctx.fillText(`Lap: ${Math.min(p.lap + 1, g.totalLaps)}/${g.totalLaps}`, 10, 22)
    ctx.fillText(`Pos: #${pos}`, 10, 40)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '11px monospace'
    ctx.fillText('WASD / Arrow keys', canvas.width - 140, canvas.height - 10)
  }, [getTrackPos, onWin])

  const startGame = useCallback(() => {
    initGame()
    setLap(0)
    setPosition(1)
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
    const down = (e) => { keysRef.current[e.code] = true; if (e.code === 'Space') e.preventDefault() }
    const up = (e) => { keysRef.current[e.code] = false }
    const start = (e) => {
      if ((gameState === 'start' || gameState === 'over') && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); startGame() }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('keydown', start)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('keydown', start) }
  }, [gameState, startGame])

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="text-xl font-bold text-[#ffee00] mb-1">Hoverboard Race</h2>
        <p className="text-gray-400 text-xs">WASD to move &bull; 3 laps &bull; Hit yellow boost pads!</p>
      </motion.div>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative rounded-xl overflow-hidden border-2 border-[#ffee00]/30">
        <canvas ref={canvasRef} className="block bg-[#0a0820]" />
        {gameState === 'start' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <motion.h3 animate={{ textShadow: ['0 0 10px #ffee00', '0 0 20px #00d4ff', '0 0 10px #ffee00'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-bold text-[#ffee00] mb-4">HOVERBOARD RACE</motion.h3>
            <p className="text-gray-300 text-sm mb-1">Race against 3 AI bots</p>
            <p className="text-gray-400 text-xs mb-4">Complete 3 laps to win!</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
              START (Space)
            </motion.button>
          </motion.div>
        )}
        {gameState === 'win' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <motion.h3 animate={{ color: ['#00ff88', '#ffee00', '#00ff88'] }} transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl font-bold mb-2">VICTORY!</motion.h3>
            <p className="text-white text-lg mb-1">Position: #{position}</p>
            <p className="text-gray-400 text-sm mb-3">Completed {3} laps!</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-white font-bold text-sm border-none cursor-pointer">
              RACE AGAIN
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
