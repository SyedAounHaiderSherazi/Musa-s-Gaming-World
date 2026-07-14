import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 800, H = 450, GRAVITY = 0.4
const BUTTON = 'px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer'

const PLATFORMS = [
  { x: 0, y: 380, w: 250, h: 15 },
  { x: 550, y: 380, w: 250, h: 15 },
  { x: 280, y: 300, w: 240, h: 12 },
  { x: 100, y: 220, w: 180, h: 12 },
  { x: 520, y: 220, w: 180, h: 12 },
  { x: 330, y: 150, w: 140, h: 12 },
]

function wizard(x, robeColor) {
  return {
    x, y: 370, vx: 0, vy: 0, w: 35, h: 60, hp: 100, maxHp: 100,
    robeColor, mana: 100, maxMana: 100, attacking: false, attackTimer: 0,
    hitCD: 0, blocking: false, shieldTimer: 0, facing: 1, grounded: false,
    wins: 0, slowed: false, slowTimer: 0, projectiles: []
  }
}

export default function WizardDuel({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('menu')
  const [difficulty, setDifficulty] = useState('easy')
  const [round, setRound] = useState(1)
  const [playerWins, setPlayerWins] = useState(0)
  const [aiWins, setAiWins] = useState(0)
  const [roundMsg, setRoundMsg] = useState('')
  const gameRef = useRef({})
  const keysRef = useRef({})
  const particlesRef = useRef([])
  const textsRef = useRef([])
  const confettiRef = useRef([])
  const projectilesRef = useRef([])
  const timerRef = useRef(99)
  const timerTickRef = useRef(0)
  const pauseRef = useRef(false)
  const roundEndRef = useRef(0)
  const roundRef = useRef(round)
  const roundMsgRef = useRef(roundMsg)

  useEffect(() => { roundRef.current = round }, [round])
  useEffect(() => { roundMsgRef.current = roundMsg }, [roundMsg])

  const spawnP = useCallback((x, y, color, n = 8) => {
    for (let i = 0; i < n; i++) particlesRef.current.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 1, color, size: Math.random() * 5 + 2 })
  }, [])

  const spawnT = useCallback((x, y, text, color = '#fff') => {
    textsRef.current.push({ x, y, text, color, life: 1, vy: -2 })
  }, [])

  const spawnConfetti = useCallback(() => {
    for (let i = 0; i < 80; i++) confettiRef.current.push({ x: Math.random() * W, y: -20, vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 2, life: 1, color: `hsl(${Math.random() * 360},100%,60%)`, size: Math.random() * 8 + 4, rot: Math.random() * 6 })
  }, [])

  const resetRound = useCallback(() => {
    const g = gameRef.current
    g.player = wizard(150, '#0088ff')
    g.enemy = wizard(600, '#ff0088')
    g.player.facing = 1; g.enemy.facing = -1
    projectilesRef.current = []
    timerRef.current = 99; timerTickRef.current = 0
    particlesRef.current = []; textsRef.current = []
    roundEndRef.current = 0; pauseRef.current = false
  }, [])

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

    const onPlatform = (f) => {
      for (const plat of PLATFORMS) {
        if (f.x > plat.x - 10 && f.x < plat.x + plat.w + 10 && f.y + f.h >= plat.y && f.y + f.h <= plat.y + plat.h + 10 && f.vy >= 0) {
          f.y = plat.y - f.h; f.vy = 0; f.grounded = true; return true
        }
      }
      return false
    }

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

      // Mana regen
      p.mana = Math.min(p.maxMana, p.mana + 0.15)
      e.mana = Math.min(e.maxMana, e.mana + 0.15)

      // Player
      const spd = p.slowed ? 2.5 : 4.5
      p.vx = 0
      if (keysRef.current['ArrowLeft']) { p.vx = -spd; p.facing = -1 }
      if (keysRef.current['ArrowRight']) { p.vx = spd; p.facing = 1 }
      if (keysRef.current['ArrowUp'] && p.grounded) { p.vy = -10; p.grounded = false }

      if (p.attackTimer > 0) p.attackTimer--
      if (p.hitCD > 0) p.hitCD--
      if (p.shieldTimer > 0) { p.shieldTimer--; if (p.shieldTimer <= 0) p.blocking = false }
      if (p.slowTimer > 0) { p.slowTimer--; if (p.slowTimer <= 0) p.slowed = false }

      // Fireball (Z) - medium speed, medium damage
      if ((keysRef.current['z'] || keysRef.current['Z']) && p.attackTimer <= 0 && p.mana >= 10) {
        p.attackTimer = 15; p.mana -= 10
        projectilesRef.current.push({ x: p.x + p.facing * 20, y: p.y, vx: p.facing * 7, vy: 0, owner: 'player', type: 'fireball', dmg: 10, size: 8, color: '#ff4400', trail: [] })
        spawnP(p.x + p.facing * 20, p.y, '#ff4400', 4)
      }

      // Ice bolt (X) - slower, slows enemy
      if ((keysRef.current['x'] || keysRef.current['X']) && p.attackTimer <= 0 && p.mana >= 15) {
        p.attackTimer = 18; p.mana -= 15
        projectilesRef.current.push({ x: p.x + p.facing * 20, y: p.y, vx: p.facing * 5, vy: 0, owner: 'player', type: 'ice', dmg: 7, size: 6, color: '#88ddff', trail: [] })
        spawnP(p.x + p.facing * 20, p.y, '#88ddff', 4)
      }

      // Lightning (C) - instant, short range
      if ((keysRef.current['c'] || keysRef.current['C']) && p.attackTimer <= 0 && p.mana >= 20) {
        p.attackTimer = 20; p.mana -= 20
        if (Math.abs(p.x - e.x) < 150) {
          e.hp = Math.max(0, e.hp - 15)
          e.vy = -5
          spawnP(e.x, e.y - 20, '#ffff00', 12)
          spawnT(e.x, e.y - 50, 'ZAP!', '#ffff00')
          // Lightning bolt visual
          for (let i = 0; i < 5; i++) {
            projectilesRef.current.push({ x: p.x + p.facing * (20 + i * 25), y: p.y - 10 + (Math.random() - 0.5) * 20, vx: 0, vy: 0, owner: 'none', type: 'lightning', dmg: 0, size: 3, color: '#ffff00', life: 10, trail: [] })
          }
        } else {
          spawnT(p.x + p.facing * 80, p.y - 30, 'MISS!', '#888')
        }
      }

      // Shield (V)
      if ((keysRef.current['v'] || keysRef.current['V']) && !p.blocking && p.mana >= 15) {
        p.blocking = true; p.shieldTimer = 60; p.mana -= 15
        spawnP(p.x, p.y - 20, '#00ff88', 6)
      }

      // Ultimate (Space)
      if (keysRef.current[' '] && p.mana >= 100 && p.attackTimer <= 0) {
        p.attackTimer = 40; p.mana = 0
        spawnT(W / 2, H / 2, 'ARCANE STORM!', '#ff00ff')
        // Multiple projectiles in all directions
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          projectilesRef.current.push({ x: p.x, y: p.y, vx: Math.cos(angle) * 6, vy: Math.sin(angle) * 6, owner: 'player', type: 'arcane', dmg: 12, size: 7, color: '#ff00ff', trail: [] })
        }
        spawnP(p.x, p.y - 20, '#ff00ff', 15)
      }

      // AI
      aiSt.timer--
      if (aiSt.timer <= 0) {
        aiSt.timer = aiDelay() / 16
        const dist = Math.abs(p.x - e.x)
        const r = Math.random()
        if (dist < 100) aiSt.action = r < 0.3 ? 'lightning' : r < 0.5 ? 'fireball' : r < 0.7 ? 'shield' : 'retreat'
        else if (dist < 200) aiSt.action = r < 0.3 ? 'fireball' : r < 0.5 ? 'ice' : r < 0.7 ? 'approach' : 'idle'
        else aiSt.action = r < 0.4 ? 'fireball' : r < 0.6 ? 'ice' : 'approach'
      }

      e.vx = 0; e.blocking = false
      if (e.slowed) e.vx = 0
      else if (aiSt.action === 'approach') { e.vx = e.x > p.x ? -3 : 3; e.facing = e.x > p.x ? -1 : 1 }
      else if (aiSt.action === 'retreat') { e.vx = e.x > p.x ? 3 : -3 }
      else if (aiSt.action === 'shield' && e.mana >= 15 && e.attackTimer <= 0) {
        e.blocking = true; e.shieldTimer = 60; e.mana -= 15
      } else if (aiSt.action === 'fireball' && e.attackTimer <= 0 && e.mana >= 10) {
        e.attackTimer = 20; e.mana -= 10; e.facing = e.x > p.x ? -1 : 1
        projectilesRef.current.push({ x: e.x + e.facing * 20, y: e.y, vx: e.facing * 6, vy: 0, owner: 'enemy', type: 'fireball', dmg: aiDmg(), size: 8, color: '#ff4400', trail: [] })
      } else if (aiSt.action === 'ice' && e.attackTimer <= 0 && e.mana >= 15) {
        e.attackTimer = 22; e.mana -= 15; e.facing = e.x > p.x ? -1 : 1
        projectilesRef.current.push({ x: e.x + e.facing * 20, y: e.y, vx: e.facing * 5, vy: 0, owner: 'enemy', type: 'ice', dmg: aiDmg() * 0.7, size: 6, color: '#88ddff', trail: [] })
      } else if (aiSt.action === 'lightning' && e.attackTimer <= 0 && e.mana >= 20) {
        e.attackTimer = 22; e.mana -= 20; e.facing = e.x > p.x ? -1 : 1
        if (Math.abs(e.x - p.x) < 150) {
          p.hp = Math.max(0, p.hp - aiDmg() * 1.2)
          spawnP(p.x, p.y - 20, '#ffff00', 10)
          spawnT(p.x, p.y - 50, 'ZAP!', '#ffff00')
        }
      }
      if (e.attackTimer > 0) e.attackTimer--
      if (e.hitCD > 0) e.hitCD--
      if (e.shieldTimer > 0) { e.shieldTimer--; if (e.shieldTimer <= 0) e.blocking = false }
      if (e.slowTimer > 0) { e.slowTimer--; if (e.slowTimer <= 0) e.slowed = false }

      // Projectiles
      projectilesRef.current = projectilesRef.current.filter(pr => {
        if (pr.life !== undefined) { pr.life--; if (pr.life <= 0) return false }
        pr.trail.push({ x: pr.x, y: pr.y, life: 1 })
        if (pr.trail.length > 8) pr.trail.shift()
        pr.x += pr.vx; pr.y += pr.vy

        if (pr.x < -30 || pr.x > W + 30 || pr.y < -30 || pr.y > H + 30) return false

        const target = pr.owner === 'player' ? e : (pr.owner === 'enemy' ? p : null)
        if (!target) return true

        if (Math.abs(pr.x - target.x) < 25 && Math.abs(pr.y - target.y) < 35) {
          if (target.blocking) {
            spawnP(pr.x, pr.y, '#00ff88', 6)
            spawnT(pr.x, pr.y - 20, 'BLOCKED!', '#00ff88')
          } else if (target.hitCD <= 0) {
            target.hp = Math.max(0, target.hp - pr.dmg)
            target.vx = pr.vx > 0 ? 3 : -3
            target.hitCD = 10
            if (pr.type === 'ice') { target.slowed = true; target.slowTimer = 120 }
            spawnP(pr.x, pr.y, pr.color, 8)
            spawnT(pr.x, pr.y - 20, `${Math.round(pr.dmg)}`, '#ffaa00')
            if (pr.owner === 'player') { p.mana = Math.min(p.maxMana, p.mana + 5) }
          }
          return false
        }
        return true
      })

      // Physics
      ;[p, e].forEach(f => {
        f.vy = (f.vy || 0) + GRAVITY
        f.x += f.vx; f.y += f.vy
        f.grounded = false
        onPlatform(f)
        if (f.y > H + 50) { f.hp = 0 }
        f.x = Math.max(20, Math.min(W - 20, f.x))
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

    const draw = () => {
      const g = gameRef.current
      const p = g.player, e = g.enemy
      if (!p || !e) return

      // BG - starry night sky
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#050520')
      grad.addColorStop(0.6, '#0a0a3a')
      grad.addColorStop(1, '#1a0a4a')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

      // Stars
      for (let i = 0; i < 40; i++) {
        const sx = (i * 73 + 17) % W
        const sy = (i * 47 + 31) % (H * 0.6)
        const flicker = 0.3 + Math.sin(Date.now() / 500 + i) * 0.2
        ctx.fillStyle = `rgba(255,255,255,${flicker})`
        ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill()
      }

      // Moon
      ctx.fillStyle = '#ffffcc'
      ctx.shadowColor = '#ffffcc'; ctx.shadowBlur = 30
      ctx.beginPath(); ctx.arc(W - 80, 60, 30, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0

      // Platforms
      PLATFORMS.forEach(plat => {
        const platGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.h)
        platGrad.addColorStop(0, '#333366')
        platGrad.addColorStop(1, '#222244')
        ctx.fillStyle = platGrad
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h)
        ctx.strokeStyle = '#5555aa'; ctx.lineWidth = 1
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h)
        // Glow
        ctx.shadowColor = '#5555aa'; ctx.shadowBlur = 5
        ctx.strokeStyle = '#5555aa'
        ctx.beginPath(); ctx.moveTo(plat.x, plat.y); ctx.lineTo(plat.x + plat.w, plat.y); ctx.stroke()
        ctx.shadowBlur = 0
      })

      // Draw wizards
      const drawWizard = (w, isP) => {
        const bx = w.x - w.w / 2, by = w.y
        // Robe
        ctx.fillStyle = w.slowed ? '#6688aa' : w.robeColor
        ctx.beginPath()
        ctx.moveTo(bx + 5, by)
        ctx.lineTo(bx - 8, by + w.h)
        ctx.lineTo(bx + w.w + 8, by + w.h)
        ctx.lineTo(bx + w.w - 5, by)
        ctx.closePath()
        ctx.fill()
        // Robe detail
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.beginPath()
        ctx.moveTo(bx + 12, by + 5)
        ctx.lineTo(bx + 5, by + w.h - 5)
        ctx.lineTo(bx + w.w - 5, by + w.h - 5)
        ctx.lineTo(bx + w.w - 12, by + 5)
        ctx.closePath()
        ctx.fill()
        // Head
        ctx.fillStyle = '#ffe0bd'
        ctx.beginPath(); ctx.arc(w.x, by - 5, 12, 0, Math.PI * 2); ctx.fill()
        // Hat
        ctx.fillStyle = w.robeColor
        ctx.beginPath()
        ctx.moveTo(w.x - 15, by - 8)
        ctx.lineTo(w.x, by - 35)
        ctx.lineTo(w.x + 15, by - 8)
        ctx.closePath()
        ctx.fill()
        // Hat brim
        ctx.fillStyle = w.robeColor
        ctx.beginPath(); ctx.ellipse(w.x, by - 8, 18, 5, 0, 0, Math.PI * 2); ctx.fill()
        // Hat star
        ctx.fillStyle = '#ffdd00'
        ctx.font = '10px serif'
        ctx.textAlign = 'center'
        ctx.fillText('★', w.x, by - 18)
        // Eyes
        ctx.fillStyle = '#000'
        ctx.fillRect(w.x - 4 + w.facing * 2, by - 8, 3, 3)
        ctx.fillRect(w.x + 3 + w.facing * 2, by - 8, 3, 3)
        // Staff
        ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(w.x + w.facing * 15, by - 5)
        ctx.lineTo(w.x + w.facing * 15, by + w.h - 5)
        ctx.stroke()
        // Staff gem
        ctx.fillStyle = w.attacking ? '#fff' : w.robeColor
        ctx.shadowColor = w.robeColor; ctx.shadowBlur = w.attacking ? 15 : 5
        ctx.beginPath(); ctx.arc(w.x + w.facing * 15, by - 8, 5, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
        // Shield
        if (w.blocking) {
          ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 2
          ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 80) * 0.2
          ctx.beginPath(); ctx.arc(w.x, by + 15, 30, 0, Math.PI * 2); ctx.stroke()
          ctx.globalAlpha = 0.1; ctx.fillStyle = '#00ff88'; ctx.fill()
          ctx.globalAlpha = 1
        }
      }

      drawWizard(p, true)
      drawWizard(e, false)

      // Projectiles
      projectilesRef.current.forEach(pr => {
        if (pr.type === 'lightning') {
          ctx.strokeStyle = '#ffff00'
          ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 10
          ctx.lineWidth = 3
          ctx.globalAlpha = pr.life !== undefined ? pr.life / 10 : 1
          ctx.beginPath()
          ctx.moveTo(pr.x, pr.y - 15)
          ctx.lineTo(pr.x + (Math.random() - 0.5) * 10, pr.y)
          ctx.lineTo(pr.x + (Math.random() - 0.5) * 10, pr.y + 15)
          ctx.stroke()
          ctx.shadowBlur = 0; ctx.globalAlpha = 1
        } else {
          // Trail
          pr.trail.forEach((t, ti) => {
            t.life -= 0.1
            ctx.globalAlpha = t.life * 0.5
            ctx.fillStyle = pr.color
            ctx.beginPath(); ctx.arc(t.x, t.y, pr.size * t.life, 0, Math.PI * 2); ctx.fill()
          })
          ctx.globalAlpha = 1
          // Projectile
          ctx.fillStyle = pr.color
          ctx.shadowColor = pr.color; ctx.shadowBlur = 12
          ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.size, 0, Math.PI * 2); ctx.fill()
          if (pr.type === 'fireball') {
            ctx.fillStyle = '#ffaa00'
            ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.size * 0.5, 0, Math.PI * 2); ctx.fill()
          }
          ctx.shadowBlur = 0
        }
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
        ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = left ? 'left' : 'right'
        ctx.fillText(name, left ? x : x + w, y - 4)
      }

      drawBar(20, 20, 280, 18, p.hp, p.maxHp, '#0088ff', '🧙 YOU', true)
      drawBar(W - 300, 20, 280, 18, e.hp, e.maxHp, '#ff0088', '🧙 AI', false)

      // Mana bars
      ctx.fillStyle = '#888'; ctx.font = '8px monospace'; ctx.textAlign = 'left'
      ctx.fillText('MANA', 20, 48)
      ctx.fillStyle = '#222'; ctx.fillRect(20, 52, 200, 6)
      ctx.fillStyle = '#4488ff'; ctx.fillRect(20, 52, p.mana * 2, 6)

      ctx.fillStyle = '#888'; ctx.textAlign = 'right'
      ctx.fillText('MANA', W - 20, 48)
      ctx.fillStyle = '#222'; ctx.fillRect(W - 220, 52, 200, 6)
      ctx.fillStyle = '#ff4488'; ctx.fillRect(W - 220, 52, e.mana * 2, 6)

      // Timer
      ctx.fillStyle = '#0a0a2e'; ctx.fillRect(W / 2 - 22, 8, 44, 30)
      ctx.strokeStyle = '#ffdd00'; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - 22, 8, 44, 30)
      ctx.fillStyle = timerRef.current <= 10 ? '#ff3333' : '#ffdd00'
      ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'
      ctx.fillText(timerRef.current.toString(), W / 2, 30)

      ctx.fillStyle = '#aaa'; ctx.font = '11px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`Round ${roundRef.current}  |  You: ${gameRef.current.playerWins}  AI: ${gameRef.current.aiWins}`, W / 2, 55)

      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
      ctx.fillText('← → Move | ↑ Jump | Z Fireball | X Ice | C Lightning | V Shield | SPACE Ultimate | P Pause', W / 2, H - 8)

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
  }, [gameState, difficulty, onWin, spawnP, spawnT, spawnConfetti, resetRound, aiDelay, aiDmg])

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-black/60 border border-[#8844ff]/40 w-full max-w-[820px]">
            <h2 className="text-3xl font-bold text-[#aa66ff]">🧙 WIZARD DUEL</h2>
            <p className="text-gray-400 text-sm">Arcane combat on floating platforms! Master the elements!</p>
            <div className="flex gap-2 flex-wrap justify-center text-xs">
              <span className="px-2 py-1 rounded bg-[#2a1a0a] border border-[#ff4400]/30 text-[#ff8844]">Z: Fireball</span>
              <span className="px-2 py-1 rounded bg-[#0a1a2a] border border-[#88ddff]/30 text-[#88ddff]">X: Ice Bolt</span>
              <span className="px-2 py-1 rounded bg-[#2a2a0a] border border-[#ffff00]/30 text-[#ffff88]">C: Lightning</span>
              <span className="px-2 py-1 rounded bg-[#0a2a1a] border border-[#00ff88]/30 text-[#00ff88]">V: Shield</span>
              <span className="px-2 py-1 rounded bg-[#2a0a2a] border border-[#ff00ff]/30 text-[#ff88ff]">SPACE: Ultimate</span>
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
            <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-[#8844ff]/30" />
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
            <h2 className="text-4xl font-bold text-[#aa66ff]">🎉 ARCHMAGE! 🎉</h2>
            <p className="text-gray-300">Your magical power is unmatched!</p>
            <div className="flex gap-3">
              <button onClick={() => startGame(difficulty)} className={BUTTON}>Play Again</button>
              <button onClick={() => setGameState('menu')} className={BUTTON}>Menu</button>
            </div>
          </motion.div>
        )}
        {gameState === 'lose' && (
          <motion.div key="lose" initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-black/70 border border-[#ff4444]/50">
            <h2 className="text-4xl font-bold text-[#ff4444]">SPELL FAILED</h2>
            <p className="text-gray-300">The enemy wizard was too powerful!</p>
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
