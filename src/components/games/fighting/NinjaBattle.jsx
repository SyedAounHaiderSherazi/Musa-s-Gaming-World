import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 800, H = 450, GROUND = 360, GRAVITY = 0.55
const BUTTON = 'px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer'

function ninja(x, color) {
  return { x, y: GROUND, vx: 0, vy: 0, w: 40, h: 65, hp: 100, maxHp: 100, color, energy: 0, attacking: false, attackTimer: 0, hitCD: 0, combo: 0, comboTimer: 0, comboDisplay: 0, blocking: false, dashing: false, dashTimer: 0, dashDir: 0, facing: 1, grounded: true, wins: 0, shurikens: [], trail: [] }
}

export default function NinjaBattle({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('menu')
  const [difficulty, setDifficulty] = useState('easy')
  const [round, setRound] = useState(1)
  const [playerWins, setPlayerWins] = useState(0)
  const [aiWins, setAiWins] = useState(0)
  const [comboDisp, setComboDisp] = useState(0)
  const [roundMsg, setRoundMsg] = useState('')
  const gameRef = useRef({})
  const keysRef = useRef({})
  const particlesRef = useRef([])
  const textsRef = useRef([])
  const confettiRef = useRef([])
  const timerRef = useRef(99)
  const timerTickRef = useRef(0)
  const pauseRef = useRef(false)
  const roundEndRef = useRef(0)
  const projectilesRef = useRef([])
  const roundRef = useRef(round)
  const comboDispRef = useRef(comboDisp)
  const roundMsgRef = useRef(roundMsg)

  useEffect(() => { roundRef.current = round }, [round])
  useEffect(() => { comboDispRef.current = comboDisp }, [comboDisp])
  useEffect(() => { roundMsgRef.current = roundMsg }, [roundMsg])

  const spawnP = useCallback((x, y, color, n = 8) => {
    for (let i = 0; i < n; i++) particlesRef.current.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1, color, size: Math.random() * 5 + 2 })
  }, [])

  const spawnT = useCallback((x, y, text, color = '#fff') => {
    textsRef.current.push({ x, y, text, color, life: 1, vy: -2 })
  }, [])

  const spawnConfetti = useCallback(() => {
    for (let i = 0; i < 80; i++) confettiRef.current.push({ x: Math.random() * W, y: -20, vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 2, life: 1, color: `hsl(${Math.random() * 360},100%,60%)`, size: Math.random() * 8 + 4, rot: Math.random() * 6 })
  }, [])

  const resetRound = useCallback(() => {
    const g = gameRef.current
    g.player = ninja(150, '#00d4ff')
    g.enemy = ninja(600, '#ff00ff')
    g.player.facing = 1
    g.enemy.facing = -1
    projectilesRef.current = []
    timerRef.current = 99
    timerTickRef.current = 0
    particlesRef.current = []
    textsRef.current = []
    roundEndRef.current = 0
    pauseRef.current = false
  }, [])

  const startGame = useCallback((diff) => {
    setDifficulty(diff)
    setRound(1)
    setPlayerWins(0)
    setAiWins(0)
    setComboDisp(0)
    gameRef.current.playerWins = 0
    gameRef.current.aiWins = 0
    resetRound()
    setGameState('playing')
    setRoundMsg('ROUND 1')
    setTimeout(() => setRoundMsg('FIGHT!'), 1200)
  }, [resetRound])

  const aiDelay = useCallback(() => difficulty === 'easy' ? 550 : difficulty === 'medium' ? 300 : 120, [difficulty])
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

    const hitTest = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by

    const update = () => {
      if (pauseRef.current) return
      const g = gameRef.current
      const p = g.player, e = g.enemy
      if (!p || !e) return

      timerTickRef.current++
      if (timerTickRef.current >= 60) { timerTickRef.current = 0; if (timerRef.current > 0) timerRef.current--; if (timerRef.current <= 0) { if (p.hp > e.hp) e.hp = 0; else p.hp = 0 } }

      // Player
      p.vx = 0
      if (!p.dashing) {
        if (keysRef.current['ArrowLeft']) { p.vx = -5; p.facing = -1 }
        if (keysRef.current['ArrowRight']) { p.vx = 5; p.facing = 1 }
        if (keysRef.current['ArrowUp'] && p.grounded) { p.vy = -12; p.grounded = false }
      }
      if (p.attackTimer > 0) { p.attackTimer--; if (p.attackTimer <= 0) p.attacking = false }
      if (p.hitCD > 0) p.hitCD--
      if (p.dashTimer > 0) { p.dashTimer--; if (p.dashTimer <= 0) p.dashing = false }
      if (p.comboTimer > 0) { p.comboTimer-- } else { p.combo = 0; setComboDisp(0) }

      // Shuriken throw (Z)
      if (keysRef.current['z'] || keysRef.current['Z']) {
        if (p.attackTimer <= 0 && p.energy >= 5) {
          p.attackTimer = 20
          p.energy -= 5
          projectilesRef.current.push({ x: p.x + p.facing * 20, y: p.y - 40, vx: p.facing * 10, vy: 0, owner: 'player', size: 8, dmg: 6, rot: 0 })
          spawnP(p.x + p.facing * 20, p.y - 40, '#00d4ff', 4)
        }
      }

      // Sword slash (X)
      if (keysRef.current['x'] || keysRef.current['X']) {
        if (p.attackTimer <= 0 && !p.dashing) {
          p.attacking = true
          p.attackTimer = 11
          if (Math.abs(p.x - e.x) < 70 && p.hitCD <= 0) {
            const dmg = 12
            e.hp = Math.max(0, e.hp - dmg)
            e.vx = p.facing * 6
            p.combo++
            p.comboTimer = 80
            p.comboDisplay = p.combo
            setComboDisp(p.combo)
            p.energy = Math.min(100, p.energy + 12)
            spawnP(e.x, e.y - 35, '#ffff00', 12)
            spawnT(e.x, e.y - 70, 'SLASH!', '#ff4444')
            p.hitCD = 15
          }
        }
      }

      // Dash (C)
      if ((keysRef.current['c'] || keysRef.current['C']) && !p.dashing && p.energy >= 20) {
        p.dashing = true
        p.dashTimer = 12
        p.energy -= 20
        p.vx = p.facing * 15
        spawnP(p.x, p.y - 30, '#00ffff', 8)
      }

      // Special (V)
      if ((keysRef.current['v'] || keysRef.current['V']) && p.energy >= 100 && p.attackTimer <= 0) {
        p.attackTimer = 40
        p.energy = 0
        spawnT(W / 2, H / 2, 'NINJA STRIKE!', '#ff00ff')
        // Screen-wide slash
        if (Math.abs(p.x - e.x) < 300) {
          e.hp = Math.max(0, e.hp - 30)
          e.vy = -10
          e.vx = p.facing * 12
          spawnP(e.x, e.y - 30, '#ff00ff', 20)
          spawnP(e.x, e.y - 30, '#ffff00', 20)
          p.combo += 5
          p.comboTimer = 80
          p.comboDisplay = p.combo
          setComboDisp(p.combo)
        }
      }

      // Trail
      if (p.dashing) p.trail.push({ x: p.x, y: p.y - 30, life: 1 })
      p.trail = p.trail.filter(t => { t.life -= 0.08; return t.life > 0 })

      // AI
      aiSt.timer--
      if (aiSt.timer <= 0) {
        aiSt.timer = aiDelay() / 16
        const dist = Math.abs(p.x - e.x)
        const r = Math.random()
        if (dist < 70) aiSt.action = r < 0.4 ? 'attack' : r < 0.6 ? 'block' : 'retreat'
        else if (dist < 250) aiSt.action = r < 0.3 ? 'shuriken' : r < 0.5 ? 'approach' : r < 0.7 ? 'attack' : 'idle'
        else aiSt.action = r < 0.5 ? 'approach' : 'shuriken'
      }

      e.vx = 0
      e.blocking = false
      if (aiSt.action === 'approach') { e.vx = e.x > p.x ? -4 : 4; e.facing = e.x > p.x ? -1 : 1 }
      else if (aiSt.action === 'retreat') { e.vx = e.x > p.x ? 4 : -4 }
      else if (aiSt.action === 'block') { e.blocking = true }
      else if (aiSt.action === 'shuriken' && e.attackTimer <= 0 && e.energy >= 5) {
        e.attackTimer = 25
        e.energy -= 5
        e.facing = e.x > p.x ? -1 : 1
        projectilesRef.current.push({ x: e.x + e.facing * 20, y: e.y - 40, vx: e.facing * 8, vy: 0, owner: 'enemy', size: 8, dmg: aiDmg() * 0.6, rot: 0 })
      } else if (aiSt.action === 'attack' && e.attackTimer <= 0) {
        e.attacking = true
        e.attackTimer = 12
        e.facing = e.x > p.x ? -1 : 1
        if (Math.abs(e.x - p.x) < 70 && e.hitCD <= 0) {
          const dmg = aiDmg()
          p.hp = Math.max(0, p.hp - dmg)
          p.vx = e.facing * 6
          e.energy = Math.min(100, e.energy + 12)
          spawnP(p.x, p.y - 30, '#ff6600', 8)
          spawnT(p.x, p.y - 60, 'HIT!', '#ff8800')
          e.hitCD = 15
        }
      }
      if (e.attackTimer > 0) { e.attackTimer--; if (e.attackTimer <= 0) e.attacking = false }
      if (e.hitCD > 0) e.hitCD--

      // Projectiles
      projectilesRef.current = projectilesRef.current.filter(pr => {
        pr.x += pr.vx
        pr.rot += 0.3
        if (pr.x < -20 || pr.x > W + 20) return false
        const target = pr.owner === 'player' ? e : p
        if (Math.abs(pr.x - target.x) < 25 && Math.abs(pr.y - (target.y - 30)) < 35 && target.hitCD <= 0) {
          const dmg = target.blocking ? pr.dmg * 0.2 : pr.dmg
          target.hp = Math.max(0, target.hp - dmg)
          target.vx = (pr.vx > 0 ? 1 : -1) * 4
          if (pr.owner === 'player') {
            p.combo++
            p.comboTimer = 80
            p.comboDisplay = p.combo
            setComboDisp(p.combo)
            p.energy = Math.min(100, p.energy + 8)
          }
          spawnP(pr.x, pr.y, '#ffff00', 6)
          spawnT(pr.x, pr.y - 20, `${Math.round(dmg)}`, '#ffaa00')
          return false
        }
        return true
      })

      // Physics
      ;[p, e].forEach(f => {
        f.vy = (f.vy || 0) + GRAVITY
        f.x += f.vx; f.y += f.vy
        if (f.y >= GROUND) { f.y = GROUND; f.vy = 0; f.grounded = true }
        f.x = Math.max(25, Math.min(W - 25, f.x))
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
          else if (gameRef.current.aiWins >= 2) { setGameState('lose') }
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

    const drawNinja = (n, isP) => {
      const bx = n.x - n.w / 2, by = n.y - n.h
      // Trail
      n.trail.forEach(t => {
        ctx.globalAlpha = t.life * 0.5
        ctx.fillStyle = n.color
        ctx.fillRect(t.x - 15, t.y - 20, 30, 50)
        ctx.globalAlpha = 1
      })
      // Body (dark suit)
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(bx + 5, by + 18, n.w - 10, n.h - 18)
      // Head
      ctx.fillStyle = '#2a2a3e'
      ctx.beginPath()
      ctx.arc(n.x, by + 12, 14, 0, Math.PI * 2)
      ctx.fill()
      // Bandana
      ctx.fillStyle = n.color
      ctx.fillRect(bx + 2, by + 6, n.w - 4, 5)
      // Eyes (glowing)
      ctx.fillStyle = n.color
      ctx.shadowColor = n.color
      ctx.shadowBlur = 8
      ctx.fillRect(n.x - 5 + n.facing * 2, by + 10, 3, 3)
      ctx.fillRect(n.x + 3 + n.facing * 2, by + 10, 3, 3)
      ctx.shadowBlur = 0
      // Arms
      if (n.attacking) {
        ctx.strokeStyle = '#444'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(n.x + n.facing * 15, by + 30)
        ctx.lineTo(n.x + n.facing * 50, by + 25)
        ctx.stroke()
        // Sword
        ctx.strokeStyle = '#ccc'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(n.x + n.facing * 50, by + 25)
        ctx.lineTo(n.x + n.facing * 75, by + 20)
        ctx.stroke()
        ctx.strokeStyle = '#fff'
        ctx.beginPath()
        ctx.moveTo(n.x + n.facing * 75, by + 20)
        ctx.lineTo(n.x + n.facing * 80, by + 18)
        ctx.stroke()
      } else {
        ctx.fillStyle = '#333'
        ctx.fillRect(bx, by + 25, 8, 18)
        ctx.fillRect(bx + n.w - 8, by + 25, 8, 18)
      }
      // Legs
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(bx + 8, by + n.h - 16, 10, 16)
      ctx.fillRect(bx + n.w - 18, by + n.h - 16, 10, 16)
      // Blocking effect
      if (n.blocking) {
        ctx.strokeStyle = '#00ff88'
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.arc(n.x, by + 30, 30, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }

    const draw = () => {
      const g = gameRef.current
      const p = g.player, e = g.enemy
      if (!p || !e) return

      // BG
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#0d0221')
      grad.addColorStop(1, '#1a0533')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Stars bg
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3 + 0.1})`
        ctx.fillRect((i * 97 + 23) % W, (i * 53 + 11) % (H - 100), 2, 2)
      }

      // Ground
      ctx.fillStyle = '#12082a'
      ctx.fillRect(0, GROUND + 15, W, H - GROUND)
      ctx.strokeStyle = '#6600cc'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, GROUND + 15); ctx.lineTo(W, GROUND + 15); ctx.stroke()

      drawNinja(p, true)
      drawNinja(e, false)

      // Projectiles (shuriken)
      projectilesRef.current.forEach(pr => {
        ctx.save()
        ctx.translate(pr.x, pr.y)
        ctx.rotate(pr.rot)
        ctx.fillStyle = pr.owner === 'player' ? '#00d4ff' : '#ff00ff'
        // Shuriken shape
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2)
          ctx.fillRect(-2, -pr.size, 4, pr.size)
        }
        ctx.restore()
      })

      // Particles
      particlesRef.current = particlesRef.current.filter(pt => {
        pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.03
        if (pt.life <= 0) return false
        ctx.globalAlpha = pt.life
        drawStar(pt.x, pt.y, 4, pt.size, pt.size / 2, pt.color)
        ctx.globalAlpha = 1
        return true
      })

      // Texts
      textsRef.current = textsRef.current.filter(t => {
        t.y += t.vy; t.life -= 0.02
        if (t.life <= 0) return false
        ctx.globalAlpha = t.life
        ctx.fillStyle = t.color
        ctx.font = 'bold 22px monospace'
        ctx.textAlign = 'center'
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
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = left ? 'left' : 'right'
        ctx.fillText(name, left ? x : x + w, y - 5)
      }
      drawBar(20, 25, 280, 22, p.hp, p.maxHp, '#00d4ff', 'NINJA (You)', true)
      drawBar(W - 300, 25, 280, 22, e.hp, e.maxHp, '#ff00ff', 'AI NINJA', false)

      // Energy
      ctx.fillStyle = '#222'; ctx.fillRect(20, 55, 180, 8)
      ctx.fillStyle = p.energy >= 100 ? '#ff00ff' : '#00ff88'
      ctx.fillRect(20, 55, p.energy * 1.8, 8)
      ctx.fillStyle = '#aaa'; ctx.font = '8px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`ENERGY ${Math.round(p.energy)}%${p.energy >= 100 ? ' [V] SPECIAL READY!' : ''}`, 20, 53)

      ctx.fillStyle = '#222'; ctx.fillRect(W - 200, 55, 180, 8)
      ctx.fillStyle = '#ff00ff'; ctx.fillRect(W - 200, 55, e.energy * 1.8, 8)

      // Timer
      ctx.fillStyle = '#000'; ctx.fillRect(W / 2 - 22, 12, 44, 32)
      ctx.strokeStyle = '#ffdd00'; ctx.lineWidth = 2; ctx.strokeRect(W / 2 - 22, 12, 44, 32)
      ctx.fillStyle = timerRef.current <= 10 ? '#ff3333' : '#ffdd00'
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center'
      ctx.fillText(timerRef.current.toString(), W / 2, 36)

      // Round info
      ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`Round ${roundRef.current}  |  You: ${gameRef.current.playerWins}  AI: ${gameRef.current.aiWins}`, W / 2, 60)

      // Combo
      if (comboDispRef.current > 1) {
        ctx.fillStyle = '#ffdd00'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center'
        ctx.fillText(`COMBO x${comboDispRef.current}`, W / 2, H / 2 - 60)
        ctx.strokeStyle = '#ff6600'; ctx.lineWidth = 1; ctx.strokeText(`COMBO x${comboDispRef.current}`, W / 2, H / 2 - 60)
        ctx.fillStyle = '#ffaa00'; ctx.font = '14px monospace'
        ctx.fillText(`x${comboDispRef.current} DAMAGE BONUS!`, W / 2, H / 2 - 38)
      }

      // Controls
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
      ctx.fillText('← → Move | ↑ Jump | Z Shuriken | X Slash | C Dash | V Special | P Pause', W / 2, H - 8)

      // Round msg
      if (roundMsgRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, H / 2 - 40, W, 80)
        ctx.fillStyle = '#ffdd00'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center'
        ctx.fillText(roundMsgRef.current, W / 2, H / 2 + 12)
      }

      // Confetti
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
            className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-black/60 border border-[#6600cc]/40 w-full max-w-[820px]">
            <h2 className="text-3xl font-bold text-[#cc00ff]">🥷 NINJA BATTLE</h2>
            <p className="text-gray-400 text-sm">Shadow warriors clash! Throw shurikens, slash, and dash!</p>
            <div className="flex gap-2 text-xs text-gray-400">
              <span className="px-2 py-1 rounded bg-[#1a1a2e] border border-[#00d4ff]/30">Z: Shuriken</span>
              <span className="px-2 py-1 rounded bg-[#1a1a2e] border border-[#ff4444]/30">X: Slash</span>
              <span className="px-2 py-1 rounded bg-[#1a1a2e] border border-[#00ffff]/30">C: Dash</span>
              <span className="px-2 py-1 rounded bg-[#1a1a2e] border border-[#ff00ff]/30">V: Special</span>
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
            <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-[#6600cc]/30" />
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
            <h2 className="text-4xl font-bold text-[#00ff88]">🎉 VICTORY! 🎉</h2>
            <p className="text-gray-300">The shadow warrior prevails!</p>
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
            <p className="text-gray-300">The shadows consumed you...</p>
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
