/* Parkour Challenge - Auto-running obstacle course */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const CW = 420, CH = 280, GRAVITY = 0.6, JUMP = -11, PW = 20, PH = 26
const NEON = { blue: '#00d4ff', pink: '#ff00ff', green: '#00ff88', yellow: '#ffee00', orange: '#ff8800', red: '#ff0044' }

export default function ParkourChallenge({ onWin }) {
  const canvasRef = useRef(null)
  const [distance, setDistance] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [lives, setLives] = useState(3)
  const [speed, setSpeed] = useState(4)
  const winFiredRef = useRef(false)
  const stateRef = useRef({})
  const frameRef = useRef(null)

  const initGame = useCallback(() => {
    stateRef.current = {
      player: { x: 80, y: CH - 60, vy: 0, grounded: false, jumpsLeft: 2 },
      obstacles: [], platforms: [],
      dist: 0, speed: 4, lives: 3, cameraX: 0, invincible: 0,
      spawnTimer: 0, platTimer: 0, keys: {}, lastY: CH - 60, highScore: 0,
    }
    setDistance(0); setStarted(true); setGameOver(false); setWon(false); setLives(3); setSpeed(4)
    winFiredRef.current = false
  }, [])

  const startGame = useCallback(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    if (!started) return
    const handleKey = (e) => {
      const k = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(k)) e.preventDefault()
      stateRef.current.keys[k] = true
      if (k === ' ' || k === 'arrowup' || k === 'w') {
        const p = stateRef.current.player
        if (p.jumpsLeft > 0) {
          p.vy = JUMP
          p.jumpsLeft--
          p.grounded = false
        }
      }
    }
    const handleUp = (e) => { stateRef.current.keys[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleUp)
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleUp) }
  }, [started])

  useEffect(() => {
    if (!started || gameOver || won) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const loop = () => {
      const s = stateRef.current
      if (s.gameOver || s.won) return
      const p = s.player

      s.dist += s.speed * 0.15
      s.speed = 4 + s.dist * 0.004
      setSpeed(s.speed)
      if (s.dist >= 2000) {
        s.won = true; setWon(true)
        if (onWin && !winFiredRef.current) { winFiredRef.current = true; onWin() }
        cancelAnimationFrame(frameRef.current); return
      }

      p.vy += GRAVITY
      p.y += p.vy
      if (p.y >= CH - 34) {
        p.y = CH - 34; p.vy = 0; p.grounded = true; p.jumpsLeft = 2
      }
      if (p.y < -50) { p.y = -50; p.vy = 0 }

      for (const plat of s.platforms) {
        const relX = plat.x - s.cameraX
        if (p.x + PW > relX && p.x < relX + plat.w && p.y + PH >= plat.y && p.y + PH <= plat.y + 10 && p.vy >= 0) {
          p.y = plat.y - PH; p.vy = 0; p.grounded = true; p.jumpsLeft = 2
        }
      }

      s.spawnTimer++
      const spawnRate = Math.max(30, 80 - Math.floor(s.dist / 100))
      if (s.spawnTimer >= spawnRate) {
        s.spawnTimer = 0
        const type = Math.random()
        if (type < 0.5) {
          s.obstacles.push({ x: s.cameraX + CW + 50, y: CH - 28, w: 18, h: 28, type: 'spike' })
        } else if (type < 0.8) {
          s.obstacles.push({ x: s.cameraX + CW + 50, y: CH - 50, w: 16, h: 50, type: 'tall' })
        } else {
          s.obstacles.push({ x: s.cameraX + CW + 50, y: CH - 22, w: 60, h: 22, type: 'gap' })
        }
      }

      s.platTimer++
      if (s.platTimer >= 100) {
        s.platTimer = 0
        const py = CH - 60 - Math.random() * 120
        s.platforms.push({ x: s.cameraX + CW + 50, y: py, w: 70 + Math.random() * 50, h: 10 })
      }

      if (s.invincible > 0) s.invincible--
      s.obstacles = s.obstacles.filter(o => {
        const relX = o.x - s.cameraX
        if (relX < -80) return false
        if (s.invincible <= 0 && p.x + PW > relX + 4 && p.x < relX + o.w - 4 && p.y + PH > o.y + 4 && p.y < o.y + o.h) {
          s.lives--; setLives(s.lives); s.invincible = 90
          if (s.lives <= 0) {
            s.gameOver = true; setGameOver(true)
            if (s.dist > s.highScore) setHighScore(Math.floor(s.dist))
            cancelAnimationFrame(frameRef.current); return false
          }
        }
        return true
      })
      s.platforms = s.platforms.filter(pl => (pl.x + pl.w - s.cameraX) > -100)

      setDistance(Math.floor(s.dist))

      s.cameraX += s.speed
      ctx.clearRect(0, 0, CW, CH)
      const bg = ctx.createLinearGradient(0, 0, 0, CH)
      bg.addColorStop(0, '#0a0a2e'); bg.addColorStop(1, '#1a0a3e')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH)

      ctx.fillStyle = '#1a1a4a'
      for (let i = 0; i < CW + 40; i += 40) {
        const gx = i - (s.cameraX % 40)
        ctx.fillRect(gx, CH - 4, 38, 4)
      }
      ctx.fillStyle = 'rgba(0,212,255,0.08)'
      for (let i = 0; i < CW + 60; i += 60) {
        const gx = i - (s.cameraX % 60)
        ctx.fillRect(gx, 0, 1, CH)
      }

      s.platforms.forEach(plat => {
        const rx = plat.x - s.cameraX
        ctx.fillStyle = '#1a3a5a'; ctx.fillRect(rx, plat.y, plat.w, plat.h)
        ctx.strokeStyle = NEON.blue; ctx.lineWidth = 1; ctx.strokeRect(rx, plat.y, plat.w, plat.h)
      })

      s.obstacles.forEach(o => {
        const rx = o.x - s.cameraX
        if (o.type === 'spike') {
          ctx.fillStyle = NEON.red
          ctx.beginPath(); ctx.moveTo(rx, o.y + o.h); ctx.lineTo(rx + o.w / 2, o.y); ctx.lineTo(rx + o.w, o.y + o.h); ctx.closePath(); ctx.fill()
        } else {
          ctx.fillStyle = NEON.orange; ctx.fillRect(rx, o.y, o.w, o.h)
          ctx.shadowColor = NEON.orange; ctx.shadowBlur = 6; ctx.fillRect(rx, o.y, o.w, o.h); ctx.shadowBlur = 0
        }
      })

      if (s.invincible <= 0 || Math.floor(s.invincible / 3) % 2 === 0) {
        ctx.fillStyle = NEON.green; ctx.shadowColor = NEON.green; ctx.shadowBlur = 12
        ctx.fillRect(p.x, p.y, PW, PH)
        ctx.shadowBlur = 0
      }

      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 12px monospace'
      ctx.fillText(`${Math.floor(s.dist)}m`, 10, 20)

      if (!s.gameOver && !s.won) frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver, won, onWin])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#ff0044] font-bold">❤️ {lives}</span>
        <span className="text-[#ffee00] font-bold">📏 {distance}m</span>
        <span className="text-[#00d4ff] font-bold">⚡ {speed.toFixed(1)}x</span>
        {highScore > 0 && <span className="text-[#ff00ff] font-bold">🏆 {highScore}m</span>}
      </div>
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: CW, height: CH }}>
        <canvas ref={canvasRef} width={CW} height={CH} style={{ display: 'block' }} />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-center">
              <div className="text-4xl mb-2">🏃</div>
              <p className="text-white font-bold text-sm">Reach 2000m to win!</p>
              <p className="text-white/50 text-xs mt-1">Space to jump (double jump available)</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ff0044] font-bold text-xl mb-1">💀 Crash!</p>
              <p className="text-white text-sm">Distance: {distance}m</p>
            </motion.div>
          </div>
        )}
        {won && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ffee00] font-bold text-xl mb-1">🏆 Distance Champion!</p>
              <p className="text-white text-sm">{distance}m completed!</p>
            </motion.div>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={startGame} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ff8800] to-[#ff0044] text-white font-bold text-sm border-none cursor-pointer">
          {gameOver || won ? '🔄 Retry' : '▶️ Start'}
        </motion.button>
      </div>
    </div>
  )
}
