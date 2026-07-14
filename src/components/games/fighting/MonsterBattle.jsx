import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 800, H = 450, GROUND = 360, GRAVITY = 0.5
const BUTTON = 'px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer'

const MONSTERS = {
  fire: { name: 'Blazebite', bodyColor: '#ff3300', accentColor: '#ffaa00', eyeColor: '#ffff00', special: 'Flame Burst', specialColor: '#ff6600', shape: 'round' },
  ice: { name: 'Frostclaw', bodyColor: '#0066ff', accentColor: '#88ddff', eyeColor: '#ffffff', special: 'Ice Shard', specialColor: '#88ddff', shape: 'spiky' },
  electric: { name: 'Sparkfang', bodyColor: '#ffcc00', accentColor: '#ffff88', eyeColor: '#ff8800', special: 'Thunder Zap', specialColor: '#ffff00', shape: 'round' },
}

function monster(x, type) {
  const m = MONSTERS[type]
  return {
    x, y: GROUND, vx: 0, vy: 0, w: 60, h: 65, hp: 100, maxHp: 100,
    type, ...m, energy: 0, attacking: false, attackTimer: 0, hitCD: 0,
    blocking: false, blockTimer: 0, facing: 1, grounded: true, wins: 0,
    shieldActive: false, shieldTimer: 0, eyeBlink: 0
  }
}

export default function MonsterBattle({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('menu')
  const [difficulty, setDifficulty] = useState('easy')
  const [selectedMonster, setSelectedMonster] = useState('fire')
  const [round, setRound] = useState(1)
  const [playerWins, setPlayerWins] = useState(0)
  const [aiWins, setAiWins] = useState(0)
  const [roundMsg, setRoundMsg] = useState('')
  const gameRef = useRef({})
  const keysRef = useRef({})
  const particlesRef = useRef([])
  const textsRef = useRef([])
  const confettiRef = useRef([])
  const puffsRef = useRef([])
  const timerRef = useRef(99)
  const timerTickRef = useRef(0)
  const pauseRef = useRef(false)
  const roundEndRef = useRef(0)
  const roundRef = useRef(round)
  const roundMsgRef = useRef(roundMsg)

  useEffect(() => { roundRef.current = round }, [round])
  useEffect(() => { roundMsgRef.current = roundMsg }, [roundMsg])

  const spawnP = useCallback((x, y, color, n = 8) => {
    for (let i = 0; i < n; i++) particlesRef.current.push({ x, y, vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7, life: 1, color, size: Math.random() * 6 + 3, type: Math.random() > 0.5 ? 'star' : 'circle' })
  }, [])

  const spawnPuff = useCallback((x, y) => {
    for (let i = 0; i < 5; i++) puffsRef.current.push({ x: x + (Math.random() - 0.5) * 20, y: y + (Math.random() - 0.5) * 10, size: Math.random() * 15 + 5, life: 1 })
  }, [])

  const spawnT = useCallback((x, y, text, color = '#fff') => {
    textsRef.current.push({ x, y, text, color, life: 1, vy: -2 })
  }, [])

  const spawnConfetti = useCallback(() => {
    for (let i = 0; i < 80; i++) confettiRef.current.push({ x: Math.random() * W, y: -20, vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 2, life: 1, color: `hsl(${Math.random() * 360},100%,60%)`, size: Math.random() * 8 + 4, rot: Math.random() * 6 })
  }, [])

  const resetRound = useCallback(() => {
    const g = gameRef.current
    g.player = monster(150, selectedMonster)
    const aiTypes = ['fire', 'ice', 'electric'].filter(t => t !== selectedMonster)
    g.enemy = monster(600, aiTypes[Math.floor(Math.random() * aiTypes.length)])
    g.player.facing = 1; g.enemy.facing = -1
    timerRef.current = 99; timerTickRef.current = 0
    particlesRef.current = []; textsRef.current = []; puffsRef.current = []
    roundEndRef.current = 0; pauseRef.current = false
  }, [selectedMonster])

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
      if ((keysRef.current['c'] || keysRef.current['C']) && p.grounded) { p.vy = -11; p.grounded = false }

      if (p.attackTimer > 0) { p.attackTimer--; if (p.attackTimer <= 0) p.attacking = false }
      if (p.hitCD > 0) p.hitCD--
      if (p.shieldTimer > 0) { p.shieldTimer--; if (p.shieldTimer <= 0) p.shieldActive = false }
      if (p.blockTimer > 0) { p.blockTimer--; if (p.blockTimer <= 0) p.blocking = false }

      // Normal attack (Z) - Claw swipe
      if ((keysRef.current['z'] || keysRef.current['Z']) && p.attackTimer <= 0 && !p.blocking) {
        p.attacking = true; p.attackTimer = 11
        if (Math.abs(p.x - e.x) < 80 && p.hitCD <= 0) {
          const dmg = e.blocking ? 3 : 8
          e.hp = Math.max(0, e.hp - dmg); e.vx = p.facing * 5
          p.energy = Math.min(100, p.energy + 10)
          spawnP(e.x, e.y - 30, p.accentColor, 8)
          spawnT(e.x, e.y - 65, 'CLAW!', '#ff4444')
          spawnPuff(e.x, e.y - 20)
          p.hitCD = 12
        }
      }

      // Special (X) - Different per monster
      if ((keysRef.current['x'] || keysRef.current['X']) && p.attackTimer <= 0 && p.energy >= 30 && !p.blocking) {
        p.attacking = true; p.attackTimer = 15
        p.energy -= 30
        spawnT(p.x + p.facing * 60, p.y - 50, p.special, p.specialColor)
        if (Math.abs(p.x - e.x) < 200) {
          const dmg = 18
          e.hp = Math.max(0, e.hp - dmg)
          if (p.type === 'fire') { spawnP(e.x, e.y - 30, '#ff6600', 15); spawnP(e.x, e.y - 30, '#ff0000', 10); e.vx = p.facing * 8 }
          else if (p.type === 'ice') { spawnP(e.x, e.y - 30, '#88ddff', 15); e.vx = p.facing * 2; e.frozen = true; setTimeout(() => { if (e) e.frozen = false }, 2000) }
          else { spawnP(e.x, e.y - 30, '#ffff00', 15); spawnP(e.x, e.y - 30, '#ffffff', 10); e.vy = -10 }
          spawnPuff(e.x, e.y - 20)
          p.hitCD = 18
        }
      }

      // Shield (V)
      if ((keysRef.current['v'] || keysRef.current['V']) && p.energy >= 20 && !p.shieldActive) {
        p.shieldActive = true; p.shieldTimer = 60; p.energy -= 20
        spawnPuff(p.x, p.y - 30)
      }

      // AI
      aiSt.timer--
      if (aiSt.timer <= 0) {
        aiSt.timer = aiDelay() / 16
        const dist = Math.abs(p.x - e.x)
        const r = Math.random()
        if (dist < 80) aiSt.action = r < 0.4 ? 'attack' : r < 0.6 ? 'special' : r < 0.8 ? 'block' : 'retreat'
        else if (dist < 200) aiSt.action = r < 0.3 ? 'approach' : r < 0.5 ? 'attack' : 'idle'
        else aiSt.action = r < 0.6 ? 'approach' : 'idle'
      }

      e.vx = 0; e.blocking = false
      if (e.frozen) { e.vx = 0 }
      else if (aiSt.action === 'approach') { e.vx = e.x > p.x ? -3.5 : 3.5; e.facing = e.x > p.x ? -1 : 1 }
      else if (aiSt.action === 'retreat') { e.vx = e.x > p.x ? 3.5 : -3.5 }
      else if (aiSt.action === 'block') { e.blocking = true }
      else if (aiSt.action === 'attack' && e.attackTimer <= 0) {
        e.attacking = true; e.attackTimer = 12
        e.facing = e.x > p.x ? -1 : 1
        if (Math.abs(e.x - p.x) < 80 && e.hitCD <= 0) {
          const dmg = (p.blocking || p.shieldActive) ? aiDmg() * 0.2 : aiDmg()
          if (!p.shieldActive) { p.hp = Math.max(0, p.hp - dmg); p.vx = e.facing * 5 }
          spawnP(p.x, p.y - 30, e.accentColor, 6)
          spawnPuff(p.x, p.y - 20)
          e.hitCD = 15
        }
      } else if (aiSt.action === 'special' && e.attackTimer <= 0 && e.energy >= 30) {
        e.attacking = true; e.attackTimer = 15; e.energy -= 30
        e.facing = e.x > p.x ? -1 : 1
        if (Math.abs(e.x - p.x) < 200 && !p.shieldActive) {
          p.hp = Math.max(0, p.hp - 16)
          spawnP(p.x, p.y - 30, e.specialColor, 12)
          spawnPuff(p.x, p.y - 20)
        }
        spawnT(e.x + e.facing * 60, e.y - 50, e.special, e.specialColor)
        e.hitCD = 18
      }
      if (e.attackTimer > 0) { e.attackTimer--; if (e.attackTimer <= 0) e.attacking = false }
      if (e.hitCD > 0) e.hitCD--

      // Physics
      ;[p, e].forEach(f => {
        f.vy = (f.vy || 0) + GRAVITY
        f.x += f.vx; f.y += f.vy
        if (f.y >= GROUND) { f.y = GROUND; f.vy = 0; f.grounded = true }
        f.x = Math.max(40, Math.min(W - 40, f.x))
      })

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

    const drawStar = (cx, cy, sp, oR, iR, col) => {
      ctx.save(); ctx.beginPath()
      let rot = -Math.PI / 2, step = Math.PI / sp
      ctx.moveTo(cx, cy - oR)
      for (let i = 0; i < sp; i++) { ctx.lineTo(cx + Math.cos(rot) * oR, cy + Math.sin(rot) * oR); rot += step; ctx.lineTo(cx + Math.cos(rot) * iR, cy + Math.sin(rot) * iR); rot += step }
      ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore()
    }

    const drawMonster = (m, isP) => {
      const bx = m.x - m.w / 2, by = m.y - m.h

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath(); ctx.ellipse(m.x, GROUND + 15, m.w / 2, 6, 0, 0, Math.PI * 2); ctx.fill()

      // Body
      ctx.fillStyle = m.bodyColor
      ctx.beginPath()
      if (m.shape === 'round') {
        ctx.arc(m.x, by + m.h / 2 + 5, m.w / 2, 0, Math.PI * 2)
      } else {
        // Spiky
        ctx.moveTo(m.x, by - 5)
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2
          const r1 = m.w / 2 + (i % 2 === 0 ? 10 : 0)
          ctx.lineTo(m.x + Math.cos(a) * r1, by + m.h / 2 + 5 + Math.sin(a) * r1)
        }
      }
      ctx.closePath(); ctx.fill()

      // Accent belly
      ctx.fillStyle = m.accentColor
      ctx.globalAlpha = 0.4
      ctx.beginPath(); ctx.arc(m.x, by + m.h / 2 + 10, m.w / 3, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1

      // Eyes
      const eyeOff = m.facing * 4
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(m.x - 10 + eyeOff, by + 18, 8, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(m.x + 10 + eyeOff, by + 18, 8, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = m.eyeColor
      ctx.beginPath(); ctx.arc(m.x - 10 + eyeOff + m.facing * 2, by + 18, 4, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(m.x + 10 + eyeOff + m.facing * 2, by + 18, 4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.arc(m.x - 10 + eyeOff + m.facing * 3, by + 18, 2, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(m.x + 10 + eyeOff + m.facing * 3, by + 18, 2, 0, Math.PI * 2); ctx.fill()

      // Mouth
      if (m.attacking) {
        ctx.fillStyle = '#000'
        ctx.beginPath(); ctx.arc(m.x + eyeOff, by + 35, 8, 0, Math.PI); ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.fillRect(m.x - 4 + eyeOff, by + 35, 3, 4)
        ctx.fillRect(m.x + 3 + eyeOff, by + 35, 3, 4)
      } else {
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(m.x + eyeOff, by + 32, 6, 0.1, Math.PI - 0.1); ctx.stroke()
      }

      // Arms/Claws
      ctx.fillStyle = m.bodyColor
      if (m.attacking) {
        // Extended claw
        ctx.fillRect(bx - 15, by + 28, 20, 8)
        ctx.fillRect(bx + m.w - 5, by + 28, 20, 8)
        // Claw marks
        ctx.strokeStyle = m.accentColor; ctx.lineWidth = 3
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          ctx.moveTo(m.x + m.facing * 45, by + 25 + i * 5)
          ctx.lineTo(m.x + m.facing * 65, by + 22 + i * 5)
          ctx.stroke()
        }
      } else {
        ctx.fillRect(bx - 10, by + 30, 15, 10)
        ctx.fillRect(bx + m.w - 5, by + 30, 15, 10)
      }

      // Feet
      ctx.fillStyle = m.bodyColor
      ctx.beginPath(); ctx.ellipse(m.x - 12, by + m.h + 2, 10, 5, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(m.x + 12, by + m.h + 2, 10, 5, 0, 0, Math.PI * 2); ctx.fill()

      // Shield
      if (m.shieldActive) {
        ctx.strokeStyle = m.accentColor; ctx.lineWidth = 3
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.2
        ctx.beginPath(); ctx.arc(m.x, by + m.h / 2, m.w / 2 + 15, 0, Math.PI * 2); ctx.stroke()
        ctx.globalAlpha = 0.1
        ctx.fillStyle = m.accentColor
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Frozen effect
      if (m.frozen) {
        ctx.globalAlpha = 0.3
        ctx.fillStyle = '#88ddff'
        ctx.fillRect(bx - 5, by - 5, m.w + 10, m.h + 10)
        ctx.globalAlpha = 1
      }
    }

    const draw = () => {
      const g = gameRef.current
      const p = g.player, e = g.enemy
      if (!p || !e) return

      // BG
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#0a1a0a')
      grad.addColorStop(1, '#0a2a1a')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

      // Grass tufts
      ctx.fillStyle = '#1a4a1a'
      for (let i = 0; i < 20; i++) {
        const gx = (i * 43 + 10) % W
        ctx.beginPath(); ctx.moveTo(gx, GROUND + 15); ctx.lineTo(gx - 5, GROUND + 5); ctx.lineTo(gx + 5, GROUND + 5); ctx.fill()
      }

      // Ground
      ctx.fillStyle = '#0d2a15'
      ctx.fillRect(0, GROUND + 15, W, H - GROUND)
      ctx.strokeStyle = '#2a6a3a'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, GROUND + 15); ctx.lineTo(W, GROUND + 15); ctx.stroke()

      // Puffs
      puffsRef.current = puffsRef.current.filter(pf => {
        pf.size += 0.5; pf.life -= 0.03; pf.y -= 0.5
        if (pf.life <= 0) return false
        ctx.globalAlpha = pf.life * 0.4
        ctx.fillStyle = '#aaa'
        ctx.beginPath(); ctx.arc(pf.x, pf.y, pf.size, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        return true
      })

      drawMonster(p, true)
      drawMonster(e, false)

      // Particles
      particlesRef.current = particlesRef.current.filter(pt => {
        pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.03
        if (pt.life <= 0) return false
        ctx.globalAlpha = pt.life
        if (pt.type === 'star') drawStar(pt.x, pt.y, 5, pt.size, pt.size / 2, pt.color)
        else { ctx.fillStyle = pt.color; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2); ctx.fill() }
        ctx.globalAlpha = 1
        return true
      })

      textsRef.current = textsRef.current.filter(t => {
        t.y += t.vy; t.life -= 0.02
        if (t.life <= 0) return false
        ctx.globalAlpha = t.life
        ctx.fillStyle = t.color; ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center'
        ctx.fillText(t.text, t.x, t.y)
        ctx.globalAlpha = 1
        return true
      })

      // UI
      const drawBar = (x, y, w, h, val, max, color, name, left) => {
        ctx.fillStyle = '#111'; ctx.fillRect(x, y, w, h)
        const r = Math.max(0, val / max)
        ctx.fillStyle = r > 0.5 ? color : r > 0.25 ? '#ffaa00' : '#ff3333'
        left ? ctx.fillRect(x, y, w * r, h) : ctx.fillRect(x + w * (1 - r), y, w * r, h)
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = left ? 'left' : 'right'
        ctx.fillText(name, left ? x : x + w, y - 5)
      }
      drawBar(20, 25, 280, 20, p.hp, p.maxHp, p.bodyColor, `${MONSTERS[p.type].name} (You)`, true)
      drawBar(W - 300, 25, 280, 20, e.hp, e.maxHp, e.bodyColor, MONSTERS[e.type].name, false)

      // Energy
      ctx.fillStyle = '#222'; ctx.fillRect(20, 52, 160, 7)
      ctx.fillStyle = p.energy >= 30 ? '#00ff88' : '#ffaa00'
      ctx.fillRect(20, 52, p.energy * 1.6, 7)
      ctx.fillStyle = '#888'; ctx.font = '8px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`ENERGY ${Math.round(p.energy)}%`, 20, 50)

      ctx.fillStyle = '#222'; ctx.fillRect(W - 180, 52, 160, 7)
      ctx.fillStyle = e.bodyColor; ctx.fillRect(W - 180, 52, e.energy * 1.6, 7)

      // Timer
      ctx.fillStyle = '#0a1a0a'; ctx.fillRect(W / 2 - 22, 12, 44, 32)
      ctx.strokeStyle = '#ffdd00'; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - 22, 12, 44, 32)
      ctx.fillStyle = timerRef.current <= 10 ? '#ff3333' : '#ffdd00'
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center'
      ctx.fillText(timerRef.current.toString(), W / 2, 36)

      ctx.fillStyle = '#aaa'; ctx.font = '11px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`Round ${roundRef.current}  |  You: ${gameRef.current.playerWins}  AI: ${gameRef.current.aiWins}`, W / 2, 55)

      // Type indicators
      ctx.fillStyle = p.bodyColor; ctx.font = '10px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`[${p.type.toUpperCase()}]`, 20, 75)
      ctx.fillStyle = e.bodyColor; ctx.textAlign = 'right'
      ctx.fillText(`[${e.type.toUpperCase()}]`, W - 20, 75)

      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
      ctx.fillText('← → Move | Z Claw | X Special | C Jump | V Shield | P Pause', W / 2, H - 8)

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
  }, [gameState, difficulty, onWin, spawnP, spawnPuff, spawnT, spawnConfetti, resetRound, aiDelay, aiDmg])

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-black/60 border border-[#00ff88]/30 w-full max-w-[820px]">
            <h2 className="text-3xl font-bold text-[#00ff88]">👾 MONSTER BATTLE</h2>
            <p className="text-gray-400 text-sm">Friendly monsters duke it out! Choose your element!</p>
            <div className="flex gap-3">
              {Object.entries(MONSTERS).map(([key, m]) => (
                <button key={key} onClick={() => setSelectedMonster(key)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${selectedMonster === key ? 'border-white bg-white/10 scale-105' : 'border-gray-600 hover:border-gray-400'}`}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: m.bodyColor, border: `3px solid ${m.accentColor}` }}>
                    <span className="text-xl">👀</span>
                  </div>
                  <span className="text-white font-bold text-sm">{m.name}</span>
                  <span className="text-xs" style={{ color: m.accentColor }}>{m.special}</span>
                  <span className="text-xs text-gray-400">{key === 'fire' ? '🔴 High DMG' : key === 'ice' ? '🔵 Slows' : '🟡 Stuns'}</span>
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
            <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-[#00ff88]/30" />
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
            <h2 className="text-4xl font-bold text-[#00ff88]">🎉 MONSTER CHAMPION! 🎉</h2>
            <p className="text-gray-300">Your monster is the strongest!</p>
            <div className="flex gap-3">
              <button onClick={() => startGame(difficulty)} className={BUTTON}>Play Again</button>
              <button onClick={() => setGameState('menu')} className={BUTTON}>Menu</button>
            </div>
          </motion.div>
        )}
        {gameState === 'lose' && (
          <motion.div key="lose" initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-black/70 border border-[#ff4444]/50">
            <h2 className="text-4xl font-bold text-[#ff4444]">DEFEATED</h2>
            <p className="text-gray-300">Your monster needs more training!</p>
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
