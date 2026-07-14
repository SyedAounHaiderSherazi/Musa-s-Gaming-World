import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function CartoonCarRacing({ onWin }) {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const keysRef = useRef({})
  const [gameState, setGameState] = useState('start')
  const [lap, setLap] = useState(0)
  const [position, setPosition] = useState(1)
  const positionRef = useRef(1)

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 550
    canvas.height = 500

    const waypoints = [
      { x: 275, y: 80 }, { x: 440, y: 100 }, { x: 480, y: 200 },
      { x: 460, y: 320 }, { x: 380, y: 400 }, { x: 275, y: 430 },
      { x: 160, y: 400 }, { x: 100, y: 320 }, { x: 80, y: 200 },
      { x: 110, y: 100 },
    ]

    const makeCar = (color, emoji, speed, wpOffset) => ({
      x: 275, y: 80, angle: 0, speed: 0, maxSpeed: speed,
      color, emoji, wpIdx: wpOffset, lap: 0, lastWp: wpOffset,
      finished: false, trail: [],
    })

    const g = {
      player: makeCar('#00d4ff', '🏎️', 4.0, 0),
      bots: [
        makeCar('#ff0044', '🚗', 3.5, 1),
        makeCar('#ffee00', '🚕', 3.3, 2),
      ],
      waypoints,
      totalLaps: 3,
      frame: 0,
      raceOver: false,
      won: false,
      countdown: 180,
      countdownText: '3',
    }
    g.player.x = waypoints[0].x
    g.player.y = waypoints[0].y
    g.player.angle = Math.atan2(waypoints[1].y - waypoints[0].y, waypoints[1].x - waypoints[0].x)

    g.bots.forEach((b, i) => {
      b.x = waypoints[0].x + (i + 1) * 20 - 10
      b.y = waypoints[0].y - (i + 1) * 15
      b.angle = Math.atan2(waypoints[1].y - waypoints[0].y, waypoints[1].x - waypoints[0].x)
    })

    gameRef.current = g
    return g
  }, [])

  const getWaypointTarget = useCallback((car, g) => {
    return g.waypoints[(car.wpIdx + 1) % g.waypoints.length]
  }, [])

  const update = useCallback(() => {
    const g = gameRef.current
    if (!g || g.raceOver) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    g.frame++

    if (g.countdown > 0) {
      g.countdown--
      if (g.countdown > 120) g.countdownText = '3'
      else if (g.countdown > 60) g.countdownText = '2'
      else if (g.countdown > 0) g.countdownText = '1'
      else g.countdownText = 'GO!'
      if (g.countdown <= 0) g.countdownText = ''

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0a0820'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawTrack(ctx, g)
      drawAllCars(ctx, g)

      if (g.countdown > 0) {
        ctx.fillStyle = g.countdownText === 'GO!' ? '#00ff88' : '#fff'
        ctx.font = 'bold 60px monospace'
        ctx.textAlign = 'center'
        ctx.shadowBlur = 20; ctx.shadowColor = g.countdownText === 'GO!' ? '#00ff88' : '#ffee00'
        ctx.fillText(g.countdownText, canvas.width / 2, canvas.height / 2)
        ctx.shadowBlur = 0
        ctx.textAlign = 'left'
      }
      return
    }

    const keys = keysRef.current
    const p = g.player
    const accel = 0.15
    const brake = 0.1
    const friction = 0.98
    const turnSpeed = 0.04

    if (keys.ArrowUp || keys.KeyW) p.speed = Math.min(p.speed + accel, p.maxSpeed)
    else if (keys.ArrowDown || keys.KeyS) p.speed = Math.max(p.speed - brake, -p.maxSpeed * 0.3)
    else p.speed *= friction
    if (Math.abs(p.speed) < 0.05) p.speed = 0
    if (keys.ArrowLeft || keys.KeyA) p.angle -= turnSpeed * Math.min(Math.abs(p.speed) / 2, 1) * (p.speed >= 0 ? 1 : -1)
    if (keys.ArrowRight || keys.KeyD) p.angle += turnSpeed * Math.min(Math.abs(p.speed) / 2, 1) * (p.speed >= 0 ? 1 : -1)

    p.x += Math.cos(p.angle) * p.speed
    p.y += Math.sin(p.angle) * p.speed
    p.x = Math.max(15, Math.min(canvas.width - 15, p.x))
    p.y = Math.max(15, Math.min(canvas.height - 15, p.y))

    p.trail.push({ x: p.x, y: p.y, life: 10 })
    if (p.trail.length > 12) p.trail.shift()

    const target = g.waypoints[(p.wpIdx + 1) % g.waypoints.length]
    const dx = target.x - p.x, dy = target.y - p.y
    if (Math.sqrt(dx * dx + dy * dy) < 35) {
      p.wpIdx = (p.wpIdx + 1) % g.waypoints.length
      if (p.wpIdx === 0) {
        p.lap++
        setLap(p.lap)
        if (p.lap >= g.totalLaps) {
          p.finished = true
          checkRaceEnd(g)
        }
      }
    }

    g.bots.forEach(bot => {
      if (bot.finished) return
      const bt = g.waypoints[(bot.wpIdx + 1) % g.waypoints.length]
      const bdx = bt.x - bot.x, bdy = bt.y - bot.y
      const targetAngle = Math.atan2(bdy, bdx)
      let angleDiff = targetAngle - bot.angle
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
      bot.angle += angleDiff * 0.08
      bot.speed = bot.maxSpeed * (0.7 + Math.sin(g.frame * 0.02 + bot.wpIdx) * 0.3)
      bot.x += Math.cos(bot.angle) * bot.speed
      bot.y += Math.sin(bot.angle) * bot.speed
      bot.trail.push({ x: bot.x, y: bot.y, life: 8 })
      if (bot.trail.length > 8) bot.trail.shift()

      if (Math.sqrt(bdx * bdx + bdy * bdy) < 35) {
        bot.wpIdx = (bot.wpIdx + 1) % g.waypoints.length
        if (bot.wpIdx === 0) { bot.lap++; if (bot.lap >= g.totalLaps) { bot.finished = true; checkRaceEnd(g) } }
      }
    })

    const allRacers = [
      { type: 'player', lap: p.lap, wpIdx: p.wpIdx, finished: p.finished },
      ...g.bots.map((b, i) => ({ type: 'bot', idx: i, lap: b.lap, wpIdx: b.wpIdx, finished: b.finished }))
    ]
    allRacers.sort((a, b) => b.lap - a.lap || b.wpIdx - a.wpIdx)
    positionRef.current = allRacers.findIndex(r => r.type === 'player') + 1
    setPosition(positionRef.current)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0a0820'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawTrack(ctx, g)
    drawAllCars(ctx, g)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px monospace'
    ctx.fillText(`Lap: ${Math.min(p.lap + 1, g.totalLaps)}/${g.totalLaps}`, 10, 22)
    ctx.fillText(`Pos: #${positionRef.current}`, 10, 40)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '10px monospace'
    ctx.fillText('Arrow keys / WASD', canvas.width - 130, canvas.height - 8)
  }, [getWaypointTarget, onWin])

  const drawTrack = (ctx, g) => {
    ctx.strokeStyle = 'rgba(0,212,255,0.12)'
    ctx.lineWidth = 50
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(g.waypoints[0].x, g.waypoints[0].y)
    g.waypoints.forEach((wp, i) => {
      if (i > 0) ctx.lineTo(wp.x, wp.y)
    })
    ctx.closePath()
    ctx.stroke()

    ctx.strokeStyle = 'rgba(0,212,255,0.3)'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(g.waypoints[0].x, g.waypoints[0].y)
    g.waypoints.forEach((wp, i) => { if (i > 0) ctx.lineTo(wp.x, wp.y) })
    ctx.closePath()
    ctx.stroke()
    ctx.setLineDash([])

    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 3
    const s = g.waypoints[0], e = g.waypoints[1]
    const sa = Math.atan2(e.y - s.y, e.x - s.x) + Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(s.x + Math.cos(sa) * 25, s.y + Math.sin(sa) * 25)
    ctx.lineTo(s.x - Math.cos(sa) * 25, s.y - Math.sin(sa) * 25)
    ctx.stroke()
  }

  const drawAllCars = (ctx, g) => {
    const p = g.player
    p.trail.forEach(t => { ctx.globalAlpha = t.life / 10 * 0.2; ctx.fillStyle = '#00d4ff'; ctx.beginPath(); ctx.arc(t.x, t.y, 2, 0, Math.PI * 2); ctx.fill() })
    ctx.globalAlpha = 1

    g.bots.forEach(bot => {
      bot.trail.forEach(t => { ctx.globalAlpha = t.life / 8 * 0.15; ctx.fillStyle = bot.color; ctx.beginPath(); ctx.arc(t.x, t.y, 2, 0, Math.PI * 2); ctx.fill() })
      ctx.globalAlpha = 1
      drawCar(ctx, bot)
    })
    drawCar(ctx, p)
  }

  const drawCar = (ctx, car) => {
    ctx.save()
    ctx.translate(car.x, car.y)
    ctx.rotate(car.angle)
    ctx.shadowBlur = 10
    ctx.shadowColor = car.color
    ctx.fillStyle = car.color
    ctx.beginPath()
    ctx.roundRect(-14, -8, 28, 16, 4)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillRect(6, -5, 6, 10)
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(-12, -6, 5, 4)
    ctx.fillRect(-12, 2, 5, 4)
    ctx.shadowBlur = 0
    ctx.restore()

    ctx.font = '14px serif'
    ctx.textAlign = 'center'
    ctx.fillText(car.emoji, car.x, car.y - 14)
    ctx.textAlign = 'left'
  }

  const checkRaceEnd = useCallback((g) => {
    const allFinished = g.player.finished && g.bots.every(b => b.finished)
    if (allFinished || g.player.finished) {
      g.raceOver = true
      g.won = true
      setTimeout(() => { setGameState('win'); onWin?.() }, 600)
    }
  }, [onWin])

  const startGame = useCallback(() => {
    initGame()
    setLap(0)
    positionRef.current = 1
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
    const down = (e) => { keysRef.current[e.code] = true; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault() }
    const up = (e) => { keysRef.current[e.code] = false }
    const startH = (e) => {
      if ((gameState === 'start' || gameState === 'over') && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); startGame() }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('keydown', startH)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('keydown', startH) }
  }, [gameState, startGame])

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="text-xl font-bold text-[#ff8800] mb-1">Cartoon Car Racing</h2>
        <p className="text-gray-400 text-xs">Arrow keys / WASD &bull; 3 laps &bull; Beat 2 AI cars!</p>
      </motion.div>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative rounded-xl overflow-hidden border-2 border-[#ff8800]/30">
        <canvas ref={canvasRef} className="block bg-[#0a0820]" />
        {gameState === 'start' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <motion.h3 animate={{ textShadow: ['0 0 10px #ff8800', '0 0 20px #ff00ff', '0 0 10px #ff8800'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-bold text-[#ff8800] mb-4">CARTOON RACING</motion.h3>
            <p className="text-4xl mb-3">🏎️ 🚗 🚕</p>
            <p className="text-gray-300 text-sm mb-1">Race around the track</p>
            <p className="text-gray-400 text-xs mb-4">Complete 3 laps first to win!</p>
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
              className="text-2xl font-bold mb-2">🏆 YOU WIN!</motion.h3>
            <p className="text-white text-lg mb-1">Position: #{position}</p>
            <p className="text-gray-400 text-sm mb-3">Completed {3} laps!</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff8800] to-[#ffee00] text-white font-bold text-sm border-none cursor-pointer">
              RACE AGAIN
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
