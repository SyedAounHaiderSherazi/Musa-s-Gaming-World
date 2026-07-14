import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 800, H = 450, GROUND = 355, GRAVITY = 0.55
const BUTTON = 'px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer'

function robot(x, bodyColor, accentColor) {
  return {
    x, y: GROUND, vx: 0, vy: 0, w: 55, h: 75, hp: 100, maxHp: 100,
    bodyColor, accentColor, energy: 0, attacking: false, attackType: null,
    attackTimer: 0, hitCD: 0, blocking: false, blockTimer: 0,
    facing: 1, grounded: true, wins: 0, sparks: []
  }
}

export default function RobotBoxing({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('menu')
  const [difficulty, setDifficulty] = useState('easy')
  const [round, setRound] = useState(1)
  const [playerWins, setPlayerWins] = useState(0)
  const [aiWins, setAiWins] = useState(0)
  const [roundMsg, setRoundMsg] = useState('')
  const [robotSkin, setRobotSkin] = useState(0)
  const gameRef = useRef({})
  const keysRef = useRef({})
  const particlesRef = useRef([])
  const textsRef = useRef([])
  const confettiRef = useRef([])
  const sparksRef = useRef([])
  const timerRef = useRef(99)
  const timerTickRef = useRef(0)
  const pauseRef = useRef(false)
  const roundEndRef = useRef(0)
  const roundRef = useRef(round)
  const roundMsgRef = useRef(roundMsg)

  useEffect(() => { roundRef.current = round }, [round])
  useEffect(() => { roundMsgRef.current = roundMsg }, [roundMsg])

  const robotSkins = [
    { name: 'Blue Bot', body: '#0066cc', accent: '#00d4ff' },
    { name: 'Red Robot', body: '#cc2200', accent: '#ff4444' },
    { name: 'Green Mech', body: '#008833', accent: '#00ff88' },
    { name: 'Gold Unit', body: '#aa8800', accent: '#ffdd00' },
  ]

  const spawnParticles = useCallback((x, y, color, n = 8) => {
    for (let i = 0; i < n; i++) particlesRef.current.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1, color, size: Math.random() * 5 + 2 })
  }, [])

  const spawnSparks = useCallback((x, y, n = 6) => {
    for (let i = 0; i < n; i++) sparksRef.current.push({ x, y, vx: (Math.random() - 0.5) * 10, vy: -Math.random() * 6 - 2, life: 1, size: Math.random() * 3 + 1 })
  }, [])

  const spawnText = useCallback((x, y, text, color = '#fff') => {
    textsRef.current.push({ x, y, text, color, life: 1, vy: -2 })
  }, [])

  const spawnConfetti = useCallback(() => {
    for (let i = 0; i < 80; i++) confettiRef.current.push({ x: Math.random() * W, y: -20, vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 2, life: 1, color: `hsl(${Math.random() * 360},100%,60%)`, size: Math.random() * 8 + 4, rot: Math.random() * 6 })
  }, [])

  const resetRound = useCallback(() => {
    const skin = robotSkins[robotSkin]
    const g = gameRef.current
    g.player = robot(150, skin.body, skin.accent)
    g.enemy = robot(600, '#9900cc', '#dd66ff')
    g.player.facing = 1; g.enemy.facing = -1
    timerRef.current = 99; timerTickRef.current = 0
    particlesRef.current = []; textsRef.current = []; sparksRef.current = []
    roundEndRef.current = 0; pauseRef.current = false
  }, [robotSkin])

  const startGame = useCallback((diff) => {
    setDifficulty(diff); setRound(1); setPlayerWins(0); setAiWins(0)
    gameRef.current.playerWins = 0; gameRef.current.aiWins = 0
    resetRound()
    setGameState('playing'); setRoundMsg('ROUND 1')
    setTimeout(() => setRoundMsg('FIGHT!'), 1200)
  }, [resetRound])

  const aiDelay = useCallback(() => difficulty === 'easy' ? 600 : difficulty === 'medium' ? 350 : 150, [difficulty])
  const aiDmg = useCallback(() => difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 11, [difficulty])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const aiSt = { timer: 0, action: 'idle' }

    const onKey = (e) => {
      keysRef.current[e.key] = e.type === 'keydown'
      if (e.key.toLowerCase() === 'p' && e.type === 'keydown') {
        pauseRef.current = !pauseRef.current
        setGameState(prev => pauseRef.current ? 'paused' : 'playing')
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)

    const update = () => {
      if (pauseRef.current) return
      const g = gameRef.current
      const p = g.player, e = g.enemy
      if (!p || !e) return

      timerTickRef.current++
      if (timerTickRef.current >= 60) {
        timerTickRef.current = 0
        if (timerRef.current > 0) timerRef.current--
        if (timerRef.current <= 0) { if (p.hp > e.hp) e.hp = 0; else p.hp = 0 }
      }

      // Player
      p.vx = 0
      if (keysRef.current['ArrowLeft']) { p.vx = -4; p.facing = -1 }
      if (keysRef.current['ArrowRight']) { p.vx = 4; p.facing = 1 }
      if (keysRef.current['ArrowUp'] && p.grounded) { p.vy = -11; p.grounded = false }

      if (p.attackTimer > 0) { p.attackTimer--; if (p.attackTimer <= 0) { p.attacking = false; p.attackType = null } }
      if (p.hitCD > 0) p.hitCD--
      if (p.blockTimer > 0) { p.blockTimer--; if (p.blockTimer <= 0) p.blocking = false }

      // Punch (A)
      if ((keysRef.current['a'] || keysRef.current['A']) && p.attackTimer <= 0 && !p.blocking) {
        p.attacking = true; p.attackType = 'punch'; p.attackTimer = 11
        if (Math.abs(p.x - e.x) < 75 && p.hitCD <= 0) {
          const dmg = e.blocking ? 3 : 8
          e.hp = Math.max(0, e.hp - dmg); e.vx = p.facing * 5
          p.energy = Math.min(100, p.energy + 8)
          spawnSparks(e.x + p.facing * 25, e.y - 40, 8)
          spawnParticles(e.x, e.y - 35, '#ffdd00', 6)
          spawnText(e.x, e.y - 65, 'POW!', '#ff4444')
          p.hitCD = 12
        }
      }

      // Uppercut (S)
      if ((keysRef.current['s'] || keysRef.current['S']) && p.attackTimer <= 0 && !p.blocking) {
        p.attacking = true; p.attackType = 'uppercut'; p.attackTimer = 15
        if (Math.abs(p.x - e.x) < 70 && p.hitCD <= 0) {
          const dmg = e.blocking ? 4 : 14
          e.hp = Math.max(0, e.hp - dmg); e.vy = -12; e.vx = p.facing * 4
          p.energy = Math.min(100, p.energy + 15)
          spawnSparks(e.x, e.y - 50, 12)
          spawnParticles(e.x, e.y - 40, '#ff8800', 10)
          spawnText(e.x, e.y - 80, 'UPPER!', '#ffaa00')
          p.hitCD = 20
        }
      }

      // Block (D)
      if (keysRef.current['d'] || keysRef.current['D']) {
        p.blocking = true; p.blockTimer = 10
      }

      // Ultimate (Space)
      if (keysRef.current[' '] && p.energy >= 100 && p.attackTimer <= 0) {
        p.attacking = true; p.attackType = 'ultimate'; p.attackTimer = 30
        p.energy = 0
        // Robot beam
        spawnText(W / 2, H / 2, 'MEGA BEAM!', '#00ffff')
        for (let bx = p.x; bx < W; bx += 20) {
          spawnParticles(bx, p.y - 40, '#00ffff', 2)
          spawnParticles(bx, p.y - 30, '#0088ff', 1)
        }
        if (Math.abs(p.x - e.x) < 350) {
          e.hp = Math.max(0, e.hp - 35)
          e.vx = p.facing * 15
          spawnSparks(e.x, e.y - 30, 20)
          spawnParticles(e.x, e.y - 30, '#00ffff', 20)
        }
      }

      // AI
      aiSt.timer--
      if (aiSt.timer <= 0) {
        aiSt.timer = aiDelay() / 16
        const dist = Math.abs(p.x - e.x)
        const r = Math.random()
        if (dist < 80) aiSt.action = r < 0.35 ? 'punch' : r < 0.55 ? 'uppercut' : r < 0.75 ? 'block' : 'retreat'
        else if (dist < 200) aiSt.action = r < 0.3 ? 'approach' : r < 0.5 ? 'punch' : 'idle'
        else aiSt.action = r < 0.6 ? 'approach' : 'idle'
      }

      e.vx = 0; e.blocking = false
      if (aiSt.action === 'approach') { e.vx = e.x > p.x ? -3.5 : 3.5; e.facing = e.x > p.x ? -1 : 1 }
      else if (aiSt.action === 'retreat') { e.vx = e.x > p.x ? 3.5 : -3.5 }
      else if (aiSt.action === 'block') { e.blocking = true }
      else if (aiSt.action === 'punch' && e.attackTimer <= 0) {
        e.attacking = true; e.attackType = 'punch'; e.attackTimer = 12
        e.facing = e.x > p.x ? -1 : 1
        if (Math.abs(e.x - p.x) < 75 && e.hitCD <= 0) {
          const dmg = p.blocking ? aiDmg() * 0.3 : aiDmg()
          p.hp = Math.max(0, p.hp - dmg); p.vx = e.facing * 5
          e.energy = Math.min(100, e.energy + 8)
          spawnSparks(p.x, p.y - 40, 6)
          spawnParticles(p.x, p.y - 35, '#ff6600', 6)
          e.hitCD = 15
        }
      } else if (aiSt.action === 'uppercut' && e.attackTimer <= 0) {
        e.attacking = true; e.attackType = 'uppercut'; e.attackTimer = 15
        e.facing = e.x > p.x ? -1 : 1
        if (Math.abs(e.x - p.x) < 70 && e.hitCD <= 0) {
          const dmg = p.blocking ? aiDmg() * 0.3 : aiDmg() * 1.3
          p.hp = Math.max(0, p.hp - dmg); p.vy = -10; p.vx = e.facing * 4
          e.energy = Math.min(100, e.energy + 15)
          spawnSparks(p.x, p.y - 50, 10)
          spawnParticles(p.x, p.y - 40, '#ff4400', 8)
          e.hitCD = 18
        }
      }
      if (e.attackTimer > 0) { e.attackTimer--; if (e.attackTimer <= 0) { e.attacking = false; e.attackType = null } }
      if (e.hitCD > 0) e.hitCD--

      // Physics
      ;[p, e].forEach(f => {
        f.vy = (f.vy || 0) + GRAVITY
        f.x += f.vx; f.y += f.vy
        if (f.y >= GROUND) { f.y = GROUND; f.vy = 0; f.grounded = true }
        f.x = Math.max(35, Math.min(W - 35, f.x))
      })

      // Round end
      if (p.hp <= 0 || e.hp <= 0) {
        roundEndRef.current++
        if (roundEndRef.current === 1) {
          if (p.hp <= 0 && e.hp <= 0) setRoundMsg('DRAW!')
          else if (e.hp <= 0) { setRoundMsg('YOU WIN!'); gameRef.current.playerWins++; setPlayerWins(gameRef.current.playerWins) }
          else { setRoundMsg('AI WINS!'); gameRef.current.aiWins++; setAiWins(gameRef.current.aiWins) }
        }
        if (roundEndRef.current > 120) {
          if (gameRef.current.playerWins >= 2) { setGameState('win'); spawnConfetti(); if (onWin) onWin() }
          else if (gameRef.current.aiWins >= 2) setGameState('lose')
          else { setRound(r => r + 1); resetRound(); setGameState('playing'); setRoundMsg(`ROUND ${roundRef.current + 1}`); setTimeout(() => setRoundMsg('FIGHT!'), 1200) }
        }
      }
    }

    const drawGear = (cx, cy, r, teeth, color) => {
      ctx.save(); ctx.translate(cx, cy)
      ctx.fillStyle = color
      ctx.beginPath()
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i / (teeth * 2)) * Math.PI * 2
        const rad = i % 2 === 0 ? r : r * 0.7
        ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad)
      }
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    const drawRobot = (r, isP) => {
      const bx = r.x - r.w / 2, by = r.y - r.h

      // Legs
      ctx.fillStyle = '#333'
      ctx.fillRect(bx + 5, by + r.h - 20, 16, 20)
      ctx.fillRect(bx + r.w - 21, by + r.h - 20, 16, 20)
      ctx.fillStyle = '#555'
      ctx.fillRect(bx + 3, by + r.h - 5, 20, 5)
      ctx.fillRect(bx + r.w - 23, by + r.h - 5, 20, 5)

      // Body
      ctx.fillStyle = r.blocking ? '#44aa44' : r.bodyColor
      ctx.fillRect(bx + 2, by + 15, r.w - 4, r.h - 35)
      // Body detail
      ctx.fillStyle = r.accentColor
      ctx.fillRect(bx + r.w / 2 - 8, by + 25, 16, 8)
      ctx.fillStyle = r.energy >= 100 ? '#00ff88' : '#333'
      ctx.fillRect(bx + r.w / 2 - 8, by + 25, 16, 8)
      // Chest light
      ctx.fillStyle = r.energy >= 100 ? '#00ff88' : r.accentColor
      ctx.shadowColor = r.accentColor; ctx.shadowBlur = r.energy >= 100 ? 15 : 5
      ctx.beginPath(); ctx.arc(r.x, by + 29, 4, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0

      // Head
      ctx.fillStyle = '#444'
      ctx.fillRect(bx + 8, by, r.w - 16, 18)
      // Visor
      ctx.fillStyle = r.accentColor
      ctx.shadowColor = r.accentColor; ctx.shadowBlur = 8
      ctx.fillRect(bx + 12, by + 5, r.w - 24, 6)
      ctx.shadowBlur = 0
      // Eyes
      ctx.fillStyle = '#fff'
      ctx.fillRect(r.x - 6 + r.facing * 3, by + 6, 3, 4)
      ctx.fillRect(r.x + 4 + r.facing * 3, by + 6, 3, 4)

      // Arms
      if (r.attacking) {
        const armExtend = r.attackType === 'uppercut' ? -25 : 0
        ctx.fillStyle = '#555'
        ctx.fillRect(r.x + r.facing * 25, by + 22 + armExtend, r.facing * 30, 10)
        // Fist
        ctx.fillStyle = r.accentColor
        ctx.fillRect(r.x + r.facing * 52, by + 20 + armExtend, 12, 14)
        if (r.attackType === 'ultimate') {
          // Beam effect
          ctx.globalAlpha = 0.3
          ctx.fillStyle = '#00ffff'
          ctx.fillRect(r.x + r.facing * 60, by + 15, r.facing * (W / 2), 25)
          ctx.globalAlpha = 1
        }
      } else {
        ctx.fillStyle = '#555'
        ctx.fillRect(bx - 8, by + 22, 12, 25)
        ctx.fillRect(bx + r.w - 4, by + 22, 12, 25)
      }

      // Blocking shield
      if (r.blocking) {
        ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 3
        ctx.globalAlpha = 0.6
        ctx.beginPath(); ctx.arc(r.x, by + 35, 35, 0, Math.PI * 2); ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Gear decoration
      drawGear(bx + r.w / 2, by + r.h - 28, 6, 6, '#666')
    }

    const draw = () => {
      const g = gameRef.current
      const p = g.player, e = g.enemy
      if (!p || !e) return

      // BG
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#0a0a1a')
      grad.addColorStop(1, '#1a0a2a')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

      // Factory background
      ctx.fillStyle = '#111122'
      for (let i = 0; i < 5; i++) ctx.fillRect(i * 170 + 20, 100, 60, H - 200)

      // Ground
      ctx.fillStyle = '#151530'
      ctx.fillRect(0, GROUND + 15, W, H - GROUND)
      ctx.strokeStyle = '#333366'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, GROUND + 15); ctx.lineTo(W, GROUND + 15); ctx.stroke()

      drawRobot(p, true)
      drawRobot(e, false)

      // Sparks
      sparksRef.current = sparksRef.current.filter(s => {
        s.x += s.vx; s.y += s.vy; s.vy += 0.2; s.life -= 0.04
        if (s.life <= 0) return false
        ctx.globalAlpha = s.life
        ctx.fillStyle = `hsl(${40 + Math.random() * 30},100%,${60 + Math.random() * 30}%)`
        ctx.fillRect(s.x, s.y, s.size, s.size)
        ctx.globalAlpha = 1
        return true
      })

      // Particles
      particlesRef.current = particlesRef.current.filter(pt => {
        pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.03
        if (pt.life <= 0) return false
        ctx.globalAlpha = pt.life
        ctx.fillStyle = pt.color
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        return true
      })

      // Texts
      textsRef.current = textsRef.current.filter(t => {
        t.y += t.vy; t.life -= 0.02
        if (t.life <= 0) return false
        ctx.globalAlpha = t.life
        ctx.fillStyle = t.color; ctx.font = 'bold 24px monospace'; ctx.textAlign = 'center'
        ctx.fillText(t.text, t.x, t.y)
        ctx.globalAlpha = 1
        return true
      })

      // UI - Power meter style health bars
      const drawPowerBar = (x, y, w, h, val, max, color, name, left) => {
        ctx.fillStyle = '#0a0a1a'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4)
        ctx.fillStyle = '#111'; ctx.fillRect(x, y, w, h)
        const r = Math.max(0, val / max)
        // Segmented bar
        const segs = 20
        const segW = w / segs
        const filled = Math.ceil(r * segs)
        for (let i = 0; i < segs; i++) {
          const isFilled = left ? i < filled : i >= segs - filled
          if (isFilled) {
            const segRatio = i / segs
            ctx.fillStyle = segRatio > 0.7 ? '#ff3333' : segRatio > 0.4 ? '#ffaa00' : color
            ctx.fillRect(x + i * segW + 1, y + 1, segW - 2, h - 2)
          }
        }
        ctx.strokeStyle = '#444'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = left ? 'left' : 'right'
        ctx.fillText(`${name} ${Math.ceil(val)}%`, left ? x : x + w, y - 6)
      }

      drawPowerBar(20, 30, 300, 22, p.hp, p.maxHp, '#00d4ff', '🤖 YOU', true)
      drawPowerBar(W - 320, 30, 300, 22, e.hp, e.maxHp, '#dd66ff', '🤖 AI', false)

      // Energy bar
      ctx.fillStyle = '#222'; ctx.fillRect(20, 60, 160, 8)
      ctx.fillStyle = p.energy >= 100 ? '#00ff88' : '#ffdd00'
      ctx.fillRect(20, 60, p.energy * 1.6, 8)
      ctx.fillStyle = '#888'; ctx.font = '8px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`POWER ${Math.round(p.energy)}%${p.energy >= 100 ? ' [SPACE] ULTIMATE!' : ''}`, 20, 58)

      ctx.fillStyle = '#222'; ctx.fillRect(W - 180, 60, 160, 8)
      ctx.fillStyle = '#dd66ff'; ctx.fillRect(W - 180, 60, e.energy * 1.6, 8)

      // Timer
      ctx.fillStyle = '#0a0a1a'; ctx.fillRect(W / 2 - 22, 12, 44, 32)
      ctx.strokeStyle = '#ffdd00'; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - 22, 12, 44, 32)
      ctx.fillStyle = timerRef.current <= 10 ? '#ff3333' : '#ffdd00'
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center'
      ctx.fillText(timerRef.current.toString(), W / 2, 36)

      ctx.fillStyle = '#888'; ctx.font = '11px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`Round ${roundRef.current}  |  You: ${gameRef.current.playerWins}  AI: ${gameRef.current.aiWins}`, W / 2, 58)

      // Controls
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
      ctx.fillText('← → Move | ↑ Jump | A Punch | S Uppercut | D Block | SPACE Ultimate | P Pause', W / 2, H - 8)

      if (roundMsgRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, H / 2 - 40, W, 80)
        ctx.fillStyle = '#ffdd00'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center'
        ctx.fillText(roundMsgRef.current, W / 2, H / 2 + 12)
      }

      confettiRef.current = confettiRef.current.filter(c => {
        c.x += c.vx; c.y += c.vy; c.rot += 0.05; c.life -= 0.005
        if (c.life <= 0 || c.y > H) return false
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.globalAlpha = c.life
        ctx.fillStyle = c.color; ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2)
        ctx.restore()
        return true
      })
    }

    const loop = () => { update(); draw(); animId = requestAnimationFrame(loop) }
    animId = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey) }
  }, [gameState, difficulty, onWin, spawnParticles, spawnSparks, spawnText, spawnConfetti, resetRound, aiDelay, aiDmg, robotSkin])

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-black/60 border border-[#00d4ff]/30 w-full max-w-[820px]">
            <h2 className="text-3xl font-bold text-[#00d4ff]">🤖 ROBOT BOXING</h2>
            <p className="text-gray-400 text-sm">Mechanical mayhem! Punch, uppercut, and unleash robot beams!</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {robotSkins.map((s, i) => (
                <button key={s.name} onClick={() => setRobotSkin(i)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border cursor-pointer ${robotSkin === i ? 'border-[#00d4ff] bg-[#00d4ff]/10' : 'border-gray-600'}`}>
                  <div className="w-8 h-10 rounded" style={{ background: s.body, border: `2px solid ${s.accent}` }} />
                  <span className="text-xs text-white">{s.name}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              {['easy', 'medium', 'hard'].map(d => (
                <button key={d} onClick={() => startGame(d)} className={BUTTON}>{d.charAt(0).toUpperCase() + d.slice(1)}</button>
              ))}
            </div>
          </motion.div>
        )}
        {(gameState === 'playing' || gameState === 'paused') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
            <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-[#00d4ff]/30" />
            {gameState === 'paused' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl">
                <h3 className="text-3xl font-bold text-[#ffdd00] mb-4">PAUSED</h3>
                <div className="flex gap-3">
                  <button onClick={() => { pauseRef.current = false; setGameState('playing') }} className={BUTTON}>Resume</button>
                  <button onClick={() => setGameState('menu')} className={BUTTON}>Quit</button>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {gameState === 'win' && (
          <motion.div key="win" initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-black/70 border border-[#00ff88]/50">
            <h2 className="text-4xl font-bold text-[#00ff88]">🎉 CHAMPION BOT! 🎉</h2>
            <p className="text-gray-300">Your robot dominates the arena!</p>
            <div className="flex gap-3">
              <button onClick={() => startGame(difficulty)} className={BUTTON}>Play Again</button>
              <button onClick={() => setGameState('menu')} className={BUTTON}>Menu</button>
            </div>
          </motion.div>
        )}
        {gameState === 'lose' && (
          <motion.div key="lose" initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-black/70 border border-[#ff4444]/50">
            <h2 className="text-4xl font-bold text-[#ff4444]">SYSTEM FAILURE</h2>
            <p className="text-gray-300">Your robot was defeated!</p>
            <div className="flex gap-3">
              <button onClick={() => startGame(difficulty)} className={BUTTON}>Retry</button>
              <button onClick={() => setGameState('menu')} className={BUTTON}>Menu</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
