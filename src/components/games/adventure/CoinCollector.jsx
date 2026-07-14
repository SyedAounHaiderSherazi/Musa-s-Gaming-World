/* Coin Collector - Top-down canvas game */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const W = 400, H = 400, PLAYER_R = 12, COIN_R = 8, OBS_R = 14
const NEON = { blue: '#00d4ff', pink: '#ff00ff', green: '#00ff88', yellow: '#ffee00', orange: '#ff8800', red: '#ff0044' }

export default function CoinCollector({ onWin }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    player: { x: 200, y: 200 },
    coins: [], obstacles: [], keys: {},
    score: 0, time: 0, collected: 0, totalCoins: 10,
    gameOver: false, won: false, started: false,
  })
  const frameRef = useRef(null)
  const timerRef = useRef(null)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(0)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [collected, setCollected] = useState(0)
  const winFiredRef = useRef(false)

  const spawnCoins = useCallback((obstacles) => {
    const coins = []
    for (let i = 0; i < 10; i++) {
      let c, ok
      do {
        c = { x: 20 + Math.random() * (W - 40), y: 20 + Math.random() * (H - 40) }
        ok = !obstacles.some(o => Math.hypot(o.x - c.x, o.y - c.y) < OBS_R + COIN_R + 10)
      } while (!ok)
      coins.push(c)
    }
    return coins
  }, [])

  const spawnObstacles = useCallback(() => {
    const obs = []
    for (let i = 0; i < 6; i++) {
      let o, ok
      do {
        o = { x: 40 + Math.random() * (W - 80), y: 40 + Math.random() * (H - 80) }
        ok = Math.hypot(o.x - 200, o.y - 200) > 60
      } while (!ok)
      obs.push({ ...o, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5 })
    }
    return obs
  }, [])

  const reset = useCallback(() => {
    const obs = spawnObstacles()
    const coins = spawnCoins(obs)
    stateRef.current = {
      player: { x: 200, y: 200 }, coins, obstacles: obs, keys: {},
      score: 0, time: 0, collected: 0, totalCoins: 10,
      gameOver: false, won: false, started: false,
    }
    setScore(0); setTime(0); setStarted(false); setGameOver(false); setWon(false); setCollected(0)
    winFiredRef.current = false
  }, [spawnObstacles, spawnCoins])

  const startGame = useCallback(() => {
    reset()
    setTimeout(() => {
      stateRef.current.started = true
      setStarted(true)
    }, 50)
  }, [reset])

  useEffect(() => {
    if (!started) return
    timerRef.current = setInterval(() => {
      setTime(t => t + 1)
      stateRef.current.time++
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started])

  useEffect(() => {
    const handleKey = (e) => {
      const k = e.key.toLowerCase()
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault()
      stateRef.current.keys[k] = true
    }
    const handleUp = (e) => {
      stateRef.current.keys[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleUp)
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleUp) }
  }, [])

  useEffect(() => {
    if (!started || gameOver || won) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    let lastTime = performance.now()

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 16, 3)
      lastTime = now
      const s = stateRef.current
      if (s.gameOver || s.won) return

      const spd = 3.5 * dt
      if (s.keys['w'] || s.keys['arrowup']) s.player.y -= spd
      if (s.keys['s'] || s.keys['arrowdown']) s.player.y += spd
      if (s.keys['a'] || s.keys['arrowleft']) s.player.x -= spd
      if (s.keys['d'] || s.keys['arrowright']) s.player.x += spd
      s.player.x = Math.max(PLAYER_R, Math.min(W - PLAYER_R, s.player.x))
      s.player.y = Math.max(PLAYER_R, Math.min(H - PLAYER_R, s.player.y))

      s.obstacles.forEach(o => {
        o.x += o.vx * dt; o.y += o.vy * dt
        if (o.x < OBS_R || o.x > W - OBS_R) o.vx *= -1
        if (o.y < OBS_R || o.y > H - OBS_R) o.vy *= -1
        o.x = Math.max(OBS_R, Math.min(W - OBS_R, o.x))
        o.y = Math.max(OBS_R, Math.min(H - OBS_R, o.y))
      })

      for (const o of s.obstacles) {
        if (Math.hypot(s.player.x - o.x, s.player.y - o.y) < PLAYER_R + OBS_R - 4) {
          s.gameOver = true; setGameOver(true)
          clearInterval(timerRef.current)
          frameRef.current = requestAnimationFrame(() => draw(ctx, s))
          return
        }
      }

      s.coins = s.coins.filter(c => {
        if (Math.hypot(s.player.x - c.x, s.player.y - c.y) < PLAYER_R + COIN_R) {
          s.score += 10; s.collected++
          setScore(s.score); setCollected(s.collected)
          if (s.collected >= s.totalCoins) {
            s.won = true; setWon(true)
            clearInterval(timerRef.current)
            if (onWin && !winFiredRef.current) { winFiredRef.current = true; onWin() }
          }
          return false
        }
        return true
      })

      draw(ctx, s)
      if (!s.gameOver && !s.won) frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver, won, onWin])

  const draw = (ctx, s) => {
    ctx.clearRect(0, 0, W, H)
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#0a0a2e'); g.addColorStop(1, '#1a0a3e')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(0,212,255,0.08)'
    for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke() }
    for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke() }

    s.obstacles.forEach(o => {
      ctx.beginPath(); ctx.arc(o.x, o.y, OBS_R, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,0,68,0.7)'; ctx.fill()
      ctx.shadowColor = NEON.red; ctx.shadowBlur = 12
      ctx.strokeStyle = NEON.red; ctx.lineWidth = 2; ctx.stroke()
      ctx.shadowBlur = 0
    })

    const t = performance.now() / 400
    s.coins.forEach(c => {
      const glow = 8 + Math.sin(t + c.x) * 4
      ctx.beginPath(); ctx.arc(c.x, c.y, COIN_R, 0, Math.PI * 2)
      ctx.fillStyle = NEON.yellow; ctx.fill()
      ctx.shadowColor = NEON.yellow; ctx.shadowBlur = glow
      ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 2; ctx.stroke()
      ctx.shadowBlur = 0
    })

    ctx.beginPath(); ctx.arc(s.player.x, s.player.y, PLAYER_R, 0, Math.PI * 2)
    const pg = ctx.createRadialGradient(s.player.x, s.player.y, 0, s.player.x, s.player.y, PLAYER_R)
    pg.addColorStop(0, NEON.green); pg.addColorStop(1, '#00aa55')
    ctx.fillStyle = pg; ctx.fill()
    ctx.shadowColor = NEON.green; ctx.shadowBlur = 16
    ctx.strokeStyle = NEON.green; ctx.lineWidth = 2; ctx.stroke()
    ctx.shadowBlur = 0
  }

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#ffee00] font-bold">🪙 {collected}/10</span>
        <span className="text-[#00ff88] font-bold">⭐ {score}</span>
        <span className="text-[#00d4ff] font-bold">⏱️ {time}s</span>
      </div>
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: W, height: H }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block' }} />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-center">
              <div className="text-4xl mb-2">🪙</div>
              <p className="text-white font-bold text-sm">Collect all coins! Avoid red obstacles!</p>
              <p className="text-white/50 text-xs mt-1">WASD or Arrow keys to move</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ff0044] font-bold text-xl mb-1">💀 Hit an obstacle!</p>
              <p className="text-white text-sm">Score: {score} | Collected: {collected}/10</p>
            </motion.div>
          </div>
        )}
        {won && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ffee00] font-bold text-xl mb-1">🏆 All Coins Collected!</p>
              <p className="text-white text-sm">Score: {score} in {time}s</p>
            </motion.div>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={startGame} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ffee00] to-[#ff8800] text-white font-bold text-sm border-none cursor-pointer">
          {gameOver || won ? '🔄 Retry' : '▶️ Start'}
        </motion.button>
      </div>
    </div>
  )
}
