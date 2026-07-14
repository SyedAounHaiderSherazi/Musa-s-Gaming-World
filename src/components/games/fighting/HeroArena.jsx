import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 800, H = 450, GROUND = 350, GRAVITY = 0.6
const BUTTON = 'px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer'

function createFighter(x, color, name) {
  return { x, y: GROUND, vx: 0, vy: 0, w: 50, h: 70, hp: 100, maxHp: 100, color, name, energy: 0, blocking: false, attacking: false, attackTimer: 0, hitCooldown: 0, combo: 0, comboTimer: 0, facing: x < 400 ? 1 : -1, dodging: false, dodgeTimer: 0, grounded: true, wins: 0 }
}

export default function HeroArena({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('menu')
  const [difficulty, setDifficulty] = useState('easy')
  const [round, setRound] = useState(1)
  const [playerWins, setPlayerWins] = useState(0)
  const [aiWins, setAiWins] = useState(0)
  const [combo, setCombo] = useState(0)
  const [roundMsg, setRoundMsg] = useState('')
  const gameRef = useRef({})
  const keysRef = useRef({})
  const particlesRef = useRef([])
  const textsRef = useRef([])
  const confettiRef = useRef([])
  const timerRef = useRef(99)
  const timerTickRef = useRef(0)
  const pauseRef = useRef(false)
  const roundEndTimerRef = useRef(0)
  const roundRef = useRef(round)
  const comboRef = useRef(combo)
  const roundMsgRef = useRef(roundMsg)

  useEffect(() => { roundRef.current = round }, [round])
  useEffect(() => { comboRef.current = combo }, [combo])
  useEffect(() => { roundMsgRef.current = roundMsg }, [roundMsg])

  const spawnParticles = useCallback((x, y, color, count = 8) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1, color, size: Math.random() * 6 + 3, type: Math.random() > 0.5 ? 'star' : 'circle' })
    }
  }, [])

  const spawnText = useCallback((x, y, text, color = '#fff') => {
    textsRef.current.push({ x, y, text, color, life: 1, vy: -2 })
  }, [])

  const spawnConfetti = useCallback(() => {
    for (let i = 0; i < 80; i++) {
      confettiRef.current.push({ x: Math.random() * W, y: -20, vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 2, life: 1, color: `hsl(${Math.random() * 360},100%,60%)`, size: Math.random() * 8 + 4, rot: Math.random() * Math.PI * 2 })
    }
  }, [])

  const resetRound = useCallback(() => {
    const g = gameRef.current
    g.player = createFighter(150, '#00d4ff', 'HERO')
    g.enemy = createFighter(600, '#ff00ff', 'RIVAL')
    g.player.facing = 1
    g.enemy.facing = -1
    timerRef.current = 99
    timerTickRef.current = 0
    particlesRef.current = []
    textsRef.current = []
    roundEndTimerRef.current = 0
    pauseRef.current = false
  }, [])

  const startGame = useCallback((diff) => {
    setDifficulty(diff)
    setRound(1)
    setPlayerWins(0)
    setAiWins(0)
    setCombo(0)
    gameRef.current.playerWins = 0
    gameRef.current.aiWins = 0
    resetRound()
    setGameState('playing')
    setRoundMsg('ROUND 1')
    setTimeout(() => setRoundMsg('FIGHT!'), 1200)
  }, [resetRound])

  const getAIRetryDelay = useCallback(() => {
    switch (difficulty) {
      case 'easy': return 600
      case 'medium': return 350
      case 'hard': return 150
      default: return 500
    }
  }, [difficulty])

  const getAIDamage = useCallback(() => {
    switch (difficulty) {
      case 'easy': return 5
      case 'medium': return 8
      case 'hard': return 12
      default: return 6
    }
  }, [difficulty])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const aiState = { actionTimer: 0, action: null }

    const handleKey = (e) => {
      keysRef.current[e.key] = e.type === 'keydown'
      if (e.key.toLowerCase() === 'p' && e.type === 'keydown') {
        pauseRef.current = !pauseRef.current
        setGameState(prev => pauseRef.current ? 'paused' : 'playing')
      }
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKey)

    const update = () => {
      if (pauseRef.current) return
      const g = gameRef.current
      const p = g.player
      const e = g.enemy
      if (!p || !e) return

      // Timer
      timerTickRef.current++
      if (timerTickRef.current >= 60) {
        timerTickRef.current = 0
        if (timerRef.current > 0) timerRef.current--
        if (timerRef.current <= 0) {
          if (p.hp > e.hp) { e.hp = 0 } else { p.hp = 0 }
        }
      }

      // Player movement
      const speed = 5
      p.vx = 0
      if (!p.dodging && !p.attacking) {
        if (keysRef.current['ArrowLeft']) { p.vx = -speed; p.facing = -1 }
        if (keysRef.current['ArrowRight']) { p.vx = speed; p.facing = 1 }
        if (keysRef.current['ArrowUp'] && p.grounded) { p.vy = -13; p.grounded = false }
      }

      // Player actions
      p.blocking = !!keysRef.current['d'] || !!keysRef.current['D']
      if (p.attackTimer > 0) { p.attackTimer--; if (p.attackTimer <= 0) p.attacking = false }
      if (p.dodgeTimer > 0) { p.dodgeTimer--; if (p.dodgeTimer <= 0) p.dodging = false }
      if (p.hitCooldown > 0) p.hitCooldown--

      if ((keysRef.current['a'] || keysRef.current['A']) && p.attackTimer <= 0 && !p.blocking) {
        p.attacking = true
        p.attackTimer = 12
        const range = 70
        const px = p.x + p.facing * 30
        if (Math.abs(px - e.x) < range && p.hitCooldown <= 0) {
          const dmg = p.blocking ? 2 : 8
          e.hp = Math.max(0, e.hp - dmg)
          e.vx = p.facing * 5
          p.combo++
          p.comboTimer = 90
          p.energy = Math.min(100, p.energy + 10)
          setCombo(p.combo)
          spawnParticles(e.x, e.y - 30, '#ffdd00', 10)
          spawnText(e.x, e.y - 60, 'POW!', '#ff4444')
          p.hitCooldown = 15
        }
      }

      if ((keysRef.current['s'] || keysRef.current['S']) && p.attackTimer <= 0 && !p.blocking && p.energy >= 40) {
        p.attacking = true
        p.attackTimer = 18
        p.energy -= 40
        if (Math.abs(p.x - e.x) < 100) {
          e.hp = Math.max(0, e.hp - 20)
          e.vy = -8
          e.vx = p.facing * 8
          p.combo += 2
          p.comboTimer = 90
          setCombo(p.combo)
          spawnParticles(e.x, e.y - 20, '#ff00ff', 15)
          spawnText(e.x, e.y - 70, 'BOOM!', '#ff00ff')
        }
      }

      if ((keysRef.current['w'] || keysRef.current['W']) && !p.blocking) {
        p.blocking = true
      }

      if (keysRef.current['d'] || keysRef.current['D']) {
        if (p.dodgeTimer <= 0 && p.energy >= 15) {
          p.dodging = true
          p.dodgeTimer = 15
          p.energy -= 15
          p.x += p.facing * 80
          spawnParticles(p.x, p.y - 30, '#00d4ff', 6)
        }
      }

      if (p.comboTimer > 0) { p.comboTimer-- } else { p.combo = 0; setCombo(0) }

      // AI logic
      aiState.actionTimer--
      if (aiState.actionTimer <= 0) {
        aiState.actionTimer = getAIRetryDelay() / 16
        const dist = Math.abs(p.x - e.x)
        const r = Math.random()
        if (dist < 80) {
          aiState.action = r < 0.5 ? 'attack' : (r < 0.7 ? 'block' : 'retreat')
        } else if (dist < 200) {
          aiState.action = r < 0.4 ? 'approach' : (r < 0.7 ? 'attack' : 'idle')
        } else {
          aiState.action = r < 0.6 ? 'approach' : 'idle'
        }
      }

      if (!e.attacking && e.dodgeTimer <= 0) {
        e.vx = 0
        e.blocking = false
        if (aiState.action === 'approach') {
          e.vx = e.x > p.x ? -3 : 3
          e.facing = e.x > p.x ? -1 : 1
        } else if (aiState.action === 'retreat') {
          e.vx = e.x > p.x ? 3 : -3
        } else if (aiState.action === 'block') {
          e.blocking = true
        } else if (aiState.action === 'attack' && e.attackTimer <= 0) {
          e.attacking = true
          e.attackTimer = 15
          e.facing = e.x > p.x ? -1 : 1
          if (Math.abs(e.x - p.x) < 90 && e.hitCooldown <= 0) {
            const dmg = p.blocking ? getAIDamage() * 0.3 : getAIDamage()
            p.hp = Math.max(0, p.hp - dmg)
            p.vx = e.facing * 6
            e.energy = Math.min(100, e.energy + 10)
            spawnParticles(p.x, p.y - 30, '#ff6600', 8)
            spawnText(p.x, p.y - 60, 'HIT!', '#ff8800')
            e.hitCooldown = 20
          }
        }
      }
      if (e.attackTimer > 0) { e.attackTimer--; if (e.attackTimer <= 0) e.attacking = false }
      if (e.hitCooldown > 0) e.hitCooldown--
      if (e.dodgeTimer > 0) e.dodgeTimer--

      // Physics
      ;[p, e].forEach(f => {
        f.vy = (f.vy || 0) + GRAVITY
        f.x += f.vx
        f.y += f.vy
        if (f.y >= GROUND) { f.y = GROUND; f.vy = 0; f.grounded = true }
        f.x = Math.max(30, Math.min(W - 30, f.x))
      })

      // Check round end
      if (p.hp <= 0 || e.hp <= 0) {
        roundEndTimerRef.current++
        if (roundEndTimerRef.current === 1) {
          if (p.hp <= 0 && e.hp <= 0) {
            setRoundMsg('DRAW!')
          } else if (e.hp <= 0) {
            setRoundMsg('YOU WIN ROUND!')
            const nw = gameRef.current.playerWins + 1
            gameRef.current.playerWins = nw
            setPlayerWins(nw)
          } else {
            setRoundMsg('AI WINS ROUND!')
            const nw = gameRef.current.aiWins + 1
            gameRef.current.aiWins = nw
            setAiWins(nw)
          }
        }
        if (roundEndTimerRef.current > 120) {
          const pw = gameRef.current.playerWins
          const aw = gameRef.current.aiWins
          if (pw >= 2) {
            setGameState('win')
            spawnConfetti()
            if (onWin) onWin()
          } else if (aw >= 2) {
            setGameState('lose')
          } else {
            setRound(prev => prev + 1)
            resetRound()
            setGameState('playing')
            setRoundMsg(`ROUND ${roundRef.current + 1}`)
            setTimeout(() => setRoundMsg('FIGHT!'), 1200)
          }
        }
      }
    }

    const drawStar = (cx, cy, spikes, outerR, innerR, color) => {
      ctx.save()
      ctx.beginPath()
      let rot = Math.PI / 2 * 3
      const step = Math.PI / spikes
      ctx.moveTo(cx, cy - outerR)
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR)
        rot += step
        ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR)
        rot += step
      }
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      ctx.restore()
    }

    const drawFighter = (f, isPlayer) => {
      const bx = f.x - f.w / 2, by = f.y - f.h
      // Body
      ctx.fillStyle = f.blocking ? '#88ff88' : f.color
      ctx.fillRect(bx, by + 15, f.w, f.h - 15)
      // Head
      ctx.fillStyle = '#ffe0bd'
      ctx.beginPath()
      ctx.arc(f.x, by + 10, 16, 0, Math.PI * 2)
      ctx.fill()
      // Eyes
      ctx.fillStyle = '#000'
      ctx.fillRect(f.x - 6 + f.facing * 3, by + 6, 3, 4)
      ctx.fillRect(f.x + 3 + f.facing * 3, by + 6, 3, 4)
      // Mouth
      if (f.attacking) {
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(f.x - 4, by + 16, 8, 3)
      } else if (f.blocking) {
        ctx.fillStyle = '#0088ff'
        ctx.fillRect(f.x - 5, by + 16, 10, 2)
      } else {
        ctx.fillStyle = '#000'
        ctx.fillRect(f.x - 3, by + 16, 6, 2)
      }
      // Arms
      ctx.fillStyle = f.blocking ? '#66cc66' : (isPlayer ? '#0099cc' : '#cc00aa')
      if (f.attacking) {
        ctx.fillRect(f.x + f.facing * 25, by + 25, f.facing * 25, 8)
        drawStar(f.x + f.facing * 50, by + 29, 5, 10, 5, '#ffff00')
      } else if (f.blocking) {
        ctx.fillRect(f.x - 5, by + 20, 10, 25)
      } else {
        ctx.fillRect(bx - 5, by + 25, 8, 20)
        ctx.fillRect(bx + f.w - 3, by + 25, 8, 20)
      }
      // Legs
      ctx.fillStyle = isPlayer ? '#006699' : '#990077'
      ctx.fillRect(bx + 5, by + f.h - 18, 15, 18)
      ctx.fillRect(bx + f.w - 20, by + f.h - 18, 15, 18)
      // Dodge effect
      if (f.dodging) {
        ctx.globalAlpha = 0.4
        ctx.fillStyle = '#00d4ff'
        ctx.fillRect(bx - 5, by, f.w + 10, f.h)
        ctx.globalAlpha = 1
      }
    }

    const draw = () => {
      const g = gameRef.current
      const p = g.player
      const e = g.enemy
      if (!p || !e) return

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#0a0a2e')
      grad.addColorStop(1, '#1a0a3e')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Grid lines
      ctx.strokeStyle = 'rgba(0,212,255,0.1)'
      ctx.lineWidth = 1
      for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke() }
      for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke() }

      // Ground
      ctx.fillStyle = '#1a1a4e'
      ctx.fillRect(0, GROUND + 20, W, H - GROUND - 20)
      ctx.strokeStyle = '#00d4ff'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, GROUND + 20); ctx.lineTo(W, GROUND + 20); ctx.stroke()

      drawFighter(p, true)
      drawFighter(e, false)

      // Particles
      particlesRef.current = particlesRef.current.filter(pt => {
        pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.03
        if (pt.life <= 0) return false
        ctx.globalAlpha = pt.life
        if (pt.type === 'star') {
          drawStar(pt.x, pt.y, 5, pt.size, pt.size / 2, pt.color)
        } else {
          ctx.fillStyle = pt.color
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
        return true
      })

      // Floating texts
      textsRef.current = textsRef.current.filter(t => {
        t.y += t.vy; t.life -= 0.02
        if (t.life <= 0) return false
        ctx.globalAlpha = t.life
        ctx.fillStyle = t.color
        ctx.font = 'bold 24px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(t.text, t.x, t.y)
        ctx.globalAlpha = 1
        return true
      })

      // UI - Health bars
      const drawBar = (x, y, w, h, val, max, color, name, isLeft) => {
        ctx.fillStyle = '#222'
        ctx.fillRect(x, y, w, h)
        const ratio = Math.max(0, val / max)
        ctx.fillStyle = ratio > 0.5 ? color : ratio > 0.25 ? '#ffaa00' : '#ff3333'
        if (isLeft) ctx.fillRect(x, y, w * ratio, h)
        else ctx.fillRect(x + w * (1 - ratio), y, w * ratio, h)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, w, h)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = isLeft ? 'left' : 'right'
        ctx.fillText(name, isLeft ? x : x + w, y - 5)
        ctx.fillText(`${Math.ceil(val)}%`, isLeft ? x + w / 2 : x + w / 2, y + h - 3)
      }

      drawBar(20, 30, 280, 25, p.hp, p.maxHp, '#00d4ff', p.name, true)
      drawBar(W - 300, 30, 280, 25, e.hp, e.maxHp, '#ff00ff', e.name, false)

      // Energy bars
      ctx.fillStyle = '#333'
      ctx.fillRect(20, 62, 200, 10)
      ctx.fillStyle = p.energy >= 40 ? '#00ff88' : '#ffff00'
      ctx.fillRect(20, 62, p.energy * 2, 10)
      ctx.fillStyle = '#fff'
      ctx.font = '9px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('ENERGY', 20, 60)

      ctx.fillStyle = '#333'
      ctx.fillRect(W - 220, 62, 200, 10)
      ctx.fillStyle = '#ff00ff'
      ctx.fillRect(W - 220, 62, e.energy * 2, 10)

      // Timer
      ctx.fillStyle = '#000'
      ctx.fillRect(W / 2 - 25, 15, 50, 35)
      ctx.strokeStyle = '#ffdd00'
      ctx.lineWidth = 2
      ctx.strokeRect(W / 2 - 25, 15, 50, 35)
      ctx.fillStyle = timerRef.current <= 10 ? '#ff3333' : '#ffdd00'
      ctx.font = 'bold 22px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(timerRef.current.toString(), W / 2, 42)

      // Round info
      ctx.fillStyle = '#fff'
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`Round ${roundRef.current}  |  You: ${gameRef.current.playerWins}  AI: ${gameRef.current.aiWins}`, W / 2, 70)

      // Combo
      if (comboRef.current > 1) {
        ctx.fillStyle = '#ffdd00'
        ctx.font = 'bold 20px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`COMBO x${comboRef.current}!`, W / 2, H / 2 - 50)
        ctx.strokeStyle = '#ff6600'
        ctx.lineWidth = 1
        ctx.strokeText(`COMBO x${comboRef.current}!`, W / 2, H / 2 - 50)
      }

      // Controls reminder
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('← → Move | ↑ Jump | A Attack | S Special | W Block | D Dodge | P Pause', W / 2, H - 10)

      // Round message
      if (roundMsgRef.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.fillRect(0, H / 2 - 40, W, 80)
        ctx.fillStyle = '#ffdd00'
        ctx.font = 'bold 36px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(roundMsgRef.current, W / 2, H / 2 + 12)
      }

      // Confetti
      confettiRef.current = confettiRef.current.filter(c => {
        c.x += c.vx; c.y += c.vy; c.rot += 0.05; c.life -= 0.005
        if (c.life <= 0 || c.y > H) return false
        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate(c.rot)
        ctx.globalAlpha = c.life
        ctx.fillStyle = c.color
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2)
        ctx.restore()
        return true
      })
    }

    const loop = () => {
      update()
      draw()
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keyup', handleKey)
    }
  }, [gameState, difficulty, onWin, spawnParticles, spawnText, spawnConfetti, resetRound, getAIRetryDelay, getAIDamage])

  const skins = [
    { name: 'Neon Hero', color: '#00d4ff', locked: false },
    { name: 'Fire Fist', color: '#ff4400', locked: true },
    { name: 'Shadow', color: '#8800ff', locked: true },
    { name: 'Golden', color: '#ffdd00', locked: true },
  ]

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-black/60 border border-[#00d4ff]/30 w-full max-w-[820px]">
            <h2 className="text-3xl font-bold text-[#00d4ff]">⚔️ HERO ARENA</h2>
            <p className="text-gray-400 text-sm">Two blocky heroes clash! Choose difficulty and fight!</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {skins.map(s => (
                <div key={s.name} className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${s.locked ? 'border-gray-600 opacity-40' : 'border-[#00d4ff]'}`}>
                  <div className="w-8 h-12 rounded" style={{ background: s.color }} />
                  <span className="text-xs text-white">{s.locked ? '🔒' : s.name}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {['easy', 'medium', 'hard'].map(d => (
                <button key={d} onClick={() => startGame(d)}
                  className={`${BUTTON} ${difficulty === d ? 'ring-2 ring-white' : ''}`}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 text-center">
              ← → Move | ↑ Jump | A Attack | S Special | W Block | D Dodge | P Pause
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
                  <button onClick={() => { setGameState('menu') }} className={BUTTON}>Quit</button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'win' && (
          <motion.div key="win" initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-black/70 border border-[#00ff88]/50">
            <h2 className="text-4xl font-bold text-[#00ff88]">🎉 YOU WIN! 🎉</h2>
            <p className="text-gray-300">Congratulations, champion!</p>
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
            <p className="text-gray-300">Try again, hero!</p>
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
