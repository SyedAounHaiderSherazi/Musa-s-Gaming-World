/* Platform Jumper - Side-scrolling platformer */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const CW = 420, CH = 350, GRAVITY = 0.55, JUMP = -10.5, PLAYER_W = 22, PLAYER_H = 28
const NEON = { blue: '#00d4ff', pink: '#ff00ff', green: '#00ff88', yellow: '#ffee00', orange: '#ff8800', red: '#ff0044' }

const LEVELS = [
  [
    { x: 0, y: 310, w: 120, h: 16 }, { x: 160, y: 260, w: 80, h: 16 }, { x: 280, y: 210, w: 80, h: 16 },
    { x: 80, y: 170, w: 80, h: 16 }, { x: 200, y: 130, w: 100, h: 16 }, { x: 350, y: 310, w: 70, h: 16 },
  ],
  [
    { x: 0, y: 310, w: 100, h: 16 }, { x: 140, y: 270, w: 60, h: 16 }, { x: 240, y: 230, w: 60, h: 16 },
    { x: 100, y: 190, w: 60, h: 16 }, { x: 200, y: 150, w: 60, h: 16 }, { x: 310, y: 120, w: 80, h: 16 },
    { x: 370, y: 270, w: 50, h: 16 },
  ],
  [
    { x: 0, y: 310, w: 80, h: 16 }, { x: 120, y: 275, w: 50, h: 16 }, { x: 200, y: 240, w: 50, h: 16 },
    { x: 280, y: 205, w: 50, h: 16 }, { x: 150, y: 165, w: 60, h: 16 }, { x: 260, y: 130, w: 60, h: 16 },
    { x: 370, y: 90, w: 50, h: 16 },
  ],
]

function generateStars(platforms) {
  const stars = []
  platforms.forEach(p => {
    if (Math.random() < 0.5) {
      stars.push({ x: p.x + p.w / 2, y: p.y - 30, collected: false })
    }
  })
  return stars
}

function generateSpikes(platforms, level) {
  const spikes = []
  const count = 3 + level * 2
  for (let i = 0; i < count; i++) {
    const p = platforms[Math.floor(Math.random() * platforms.length)]
    spikes.push({ x: p.x + Math.random() * (p.w - 12), y: p.y - 8, w: 12, h: 8 })
  }
  return spikes
}

export default function PlatformJumper({ onWin }) {
  const canvasRef = useRef(null)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(0)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [msg, setMsg] = useState('')
  const winFiredRef = useRef(false)
  const stateRef = useRef({})
  const frameRef = useRef(null)

  const initLevel = useCallback((lvl) => {
    const platforms = LEVELS[lvl % LEVELS.length]
    const stars = generateStars(platforms)
    const spikes = generateSpikes(platforms, lvl)
    stateRef.current = {
      player: { x: 20, y: 280, vx: 0, vy: 0, grounded: false },
      platforms, stars, spikes, level: lvl,
      keys: {}, score: stateRef.current.score || 0, lives: stateRef.current.lives || 3,
      cameraX: 0, invincible: 0,
    }
  }, [])

  const startGame = useCallback(() => {
    stateRef.current = { score: 0, lives: 3 }
    initLevel(0)
    setScore(0); setLives(3); setLevel(0); setStarted(true); setGameOver(false); setWon(false); setMsg('')
    winFiredRef.current = false
  }, [initLevel])

  useEffect(() => {
    if (!started) return
    const handleKey = (e) => {
      const k = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(k)) e.preventDefault()
      stateRef.current.keys[k] = true
      if ((k === ' ' || k === 'arrowup' || k === 'w') && stateRef.current.player.grounded) {
        stateRef.current.player.vy = JUMP
        stateRef.current.player.grounded = false
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
      if (s.keys['a'] || s.keys['arrowleft']) p.vx = -3.5
      else if (s.keys['d'] || s.keys['arrowright']) p.vx = 3.5
      else p.vx *= 0.8
      p.vy += GRAVITY
      p.x += p.vx; p.y += p.vy

      if (p.x < 0) p.x = 0
      if (p.x > CW - PLAYER_W) p.x = CW - PLAYER_W

      p.grounded = false
      for (const plat of s.platforms) {
        if (p.x + PLAYER_W > plat.x && p.x < plat.x + plat.w &&
            p.y + PLAYER_H >= plat.y && p.y + PLAYER_H <= plat.y + 12 && p.vy >= 0) {
          p.y = plat.y - PLAYER_H; p.vy = 0; p.grounded = true
        }
      }

      for (const star of s.stars) {
        if (!star.collected && Math.hypot(p.x + PLAYER_W / 2 - star.x, p.y + PLAYER_H / 2 - star.y) < 18) {
          star.collected = true; s.score += 10; setScore(s.score)
        }
      }

      if (s.invincible > 0) s.invincible--
      for (const spike of s.spikes) {
        if (s.invincible <= 0 && p.x + PLAYER_W > spike.x && p.x < spike.x + spike.w &&
            p.y + PLAYER_H > spike.y && p.y < spike.y + spike.h) {
          s.lives--; setLives(s.lives); s.invincible = 60; p.y -= 40
          if (s.lives <= 0) {
            s.gameOver = true; setGameOver(true); setMsg('No lives left!')
            cancelAnimationFrame(frameRef.current); return
          }
        }
      }

      const allStars = s.stars.every(st => st.collected)
      if (allStars) {
        if (s.level >= 2) {
          s.won = true; setWon(true); setMsg('All levels complete!')
          if (onWin && !winFiredRef.current) { winFiredRef.current = true; onWin() }
          cancelAnimationFrame(frameRef.current); return
        } else {
          const nl = s.level + 1
          initLevel(nl); setLevel(nl); setMsg(`Level ${nl + 1}!`)
          setTimeout(() => setMsg(''), 2000)
        }
      }

      if (p.y > CH + 40) {
        s.lives--; setLives(s.lives)
        if (s.lives <= 0) {
          s.gameOver = true; setGameOver(true); setMsg('Fell off!')
          cancelAnimationFrame(frameRef.current); return
        }
        p.x = 20; p.y = 200; p.vy = 0
      }

      s.cameraX = Math.max(0, Math.min(CW, p.x - CW / 3))

      ctx.clearRect(0, 0, CW, CH)
      const bg = ctx.createLinearGradient(0, 0, 0, CH)
      bg.addColorStop(0, '#0a0a2e'); bg.addColorStop(1, '#1a0a3e')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH)

      ctx.save(); ctx.translate(-s.cameraX, 0)

      s.platforms.forEach(plat => {
        const pg = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.h)
        pg.addColorStop(0, '#1a3a5a'); pg.addColorStop(1, '#0a1a3a')
        ctx.fillStyle = pg; ctx.fillRect(plat.x, plat.y, plat.w, plat.h)
        ctx.strokeStyle = NEON.blue; ctx.lineWidth = 1; ctx.strokeRect(plat.x, plat.y, plat.w, plat.h)
      })

      s.spikes.forEach(spike => {
        ctx.fillStyle = NEON.red
        ctx.beginPath(); ctx.moveTo(spike.x, spike.y + spike.h); ctx.lineTo(spike.x + spike.w / 2, spike.y); ctx.lineTo(spike.x + spike.w, spike.y + spike.h); ctx.closePath()
        ctx.fill()
      })

      s.stars.forEach(star => {
        if (star.collected) return
        const t = performance.now() / 300
        ctx.fillStyle = NEON.yellow; ctx.shadowColor = NEON.yellow; ctx.shadowBlur = 10 + Math.sin(t) * 4
        ctx.font = '18px serif'; ctx.fillText('⭐', star.x - 9, star.y + 6)
        ctx.shadowBlur = 0
      })

      if (s.invincible <= 0 || Math.floor(s.invincible / 4) % 2 === 0) {
        ctx.fillStyle = NEON.green; ctx.shadowColor = NEON.green; ctx.shadowBlur = 12
        ctx.fillRect(p.x, p.y, PLAYER_W, PLAYER_H)
        ctx.shadowBlur = 0
      }

      ctx.restore()

      if (!s.gameOver && !s.won) frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver, won, onWin, initLevel])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#ff0044] font-bold">❤️ {lives}</span>
        <span className="text-[#ffee00] font-bold">⭐ {score}</span>
        <span className="text-[#aa00ff] font-bold">Level {level + 1}</span>
      </div>
      {msg && <p className="text-[#00ff88] font-bold text-sm mb-2">{msg}</p>}
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: CW, height: CH }}>
        <canvas ref={canvasRef} width={CW} height={CH} style={{ display: 'block' }} />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-center">
              <div className="text-4xl mb-2">🏃</div>
              <p className="text-white font-bold text-sm">Collect all stars! Avoid spikes!</p>
              <p className="text-white/50 text-xs mt-1">Arrow keys to move, Space/Up to jump</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ff0044] font-bold text-xl mb-1">💀 Game Over!</p>
              <p className="text-white text-sm">Score: {score} | Level {level + 1}</p>
            </motion.div>
          </div>
        )}
        {won && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ffee00] font-bold text-xl mb-1">🏆 You Win!</p>
              <p className="text-white text-sm">Final Score: {score}</p>
            </motion.div>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={startGame} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-white font-bold text-sm border-none cursor-pointer">
          {gameOver || won ? '🔄 Retry' : '▶️ Start'}
        </motion.button>
      </div>
    </div>
  )
}
