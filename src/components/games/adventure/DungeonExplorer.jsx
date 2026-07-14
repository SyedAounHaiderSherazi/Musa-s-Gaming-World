/* Dungeon Explorer - Top-down dungeon crawler */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const CW = 400, CH = 400, TILE = 32, COLS = 13, ROWS = 13, PLAYER_R = 10, ENEMY_R = 10
const NEON = { blue: '#00d4ff', pink: '#ff00ff', green: '#00ff88', yellow: '#ffee00', orange: '#ff8800', red: '#ff0044', purple: '#aa00ff' }

function generateDungeonMap() {
  const m = Array.from({ length: ROWS }, (_, y) => Array.from({ length: COLS }, (_, x) => {
    if (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1) return 1
    if (x % 4 === 0 || y % 4 === 0) return Math.random() < 0.3 ? 0 : 1
    return 0
  }))
  m[1][1] = 0; m[ROWS - 2][COLS - 2] = 0
  const carve = (x, y) => { m[y][x] = 0; const d = [[0, 1], [1, 0], [0, -1], [-1, 0]].sort(() => Math.random() - 0.5); d.forEach(([dx, dy]) => { const nx = x + dx * 2, ny = y + dy * 2; if (nx > 0 && nx < COLS - 1 && ny > 0 && ny < ROWS - 1 && m[ny][nx] === 1) { m[y + dy][x + dx] = 0; carve(nx, ny) } }) }
  carve(1, 1)
  return m
}

function generateItems(map) {
  const items = []
  for (let i = 0; i < 4; i++) {
    let ix, iy, tries = 0
    do { ix = 2 + Math.floor(Math.random() * (COLS - 4)); iy = 2 + Math.floor(Math.random() * (ROWS - 4)); tries++ }
    while ((map[iy][ix] === 1 || items.some(it => it.x === ix && it.y === iy) || (ix <= 2 && iy <= 2)) && tries < 50)
    items.push({ x: ix, y: iy, type: i < 2 ? 'potion' : 'key' })
  }
  return items
}

function generateEnemies(map) {
  const enemies = []
  for (let i = 0; i < 3; i++) {
    let ex, ey, tries = 0
    do { ex = 3 + Math.floor(Math.random() * (COLS - 6)); ey = 3 + Math.floor(Math.random() * (ROWS - 6)); tries++ }
    while ((map[ey][ex] === 1 || (Math.hypot(ex - 1, ey - 1) < 4)) && tries < 50)
    enemies.push({ x: ex * TILE + TILE / 2, y: ey * TILE + TILE / 2, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, dir: Math.random() * Math.PI * 2 })
  }
  return enemies
}

export default function DungeonExplorer({ onWin }) {
  const canvasRef = useRef(null)
  const [hp, setHp] = useState(5)
  const [keys, setKeys] = useState(0)
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [msg, setMsg] = useState('')
  const winFiredRef = useRef(false)
  const stateRef = useRef({})
  const frameRef = useRef(null)

  const initGame = useCallback(() => {
    const map = generateDungeonMap()
    const items = generateItems(map)
    const enemies = generateEnemies(map)
    stateRef.current = {
      map, items, enemies,
      player: { x: 1 * TILE + TILE / 2, y: 1 * TILE + TILE / 2 },
      hp: 5, keys: 0, score: 0, keys_: 0,
      keys__: {}, invincible: 0, exitOpen: false,
    }
    setHp(5); setKeys(0); setScore(0); setStarted(true); setGameOver(false); setWon(false); setMsg('')
    winFiredRef.current = false
  }, [])

  useEffect(() => {
    if (!started) return
    const handleKey = (e) => {
      const k = e.key.toLowerCase()
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault()
      stateRef.current.keys__[k] = true
    }
    const handleUp = (e) => { stateRef.current.keys__[e.key.toLowerCase()] = false }
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
      const spd = 2.8
      let dx = 0, dy = 0
      if (s.keys__['w'] || s.keys__['arrowup']) dy = -spd
      if (s.keys__['s'] || s.keys__['arrowdown']) dy = spd
      if (s.keys__['a'] || s.keys__['arrowleft']) dx = -spd
      if (s.keys__['d'] || s.keys__['arrowright']) dx = spd
      const nx = p.x + dx, ny = p.y + dy
      const tx = Math.floor(nx / TILE), ty = Math.floor(ny / TILE)
      if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS && s.map[ty][tx] === 0) {
        p.x = nx; p.y = ny
      } else {
        if (tx >= 0 && tx < COLS && Math.floor(p.y / TILE) >= 0 && s.map[Math.floor(p.y / TILE)][tx] === 0) p.x = nx
        if (ty >= 0 && ty < ROWS && Math.floor(p.x / TILE) >= 0 && s.map[ty][Math.floor(p.x / TILE)] === 0) p.y = ny
      }

      s.items = s.items.filter(item => {
        if (Math.hypot(p.x - (item.x * TILE + TILE / 2), p.y - (item.y * TILE + TILE / 2)) < PLAYER_R + 10) {
          if (item.type === 'potion') { s.hp = Math.min(5, s.hp + 1); setHp(s.hp); setMsg('Health restored!') }
          else { s.keys_++; setKeys(s.keys_); setMsg('Key collected!') }
          setTimeout(() => setMsg(''), 1500)
          return false
        }
        return true
      })

      if (s.invincible > 0) s.invincible--
      s.enemies.forEach(e => {
        e.dir += (Math.random() - 0.5) * 0.1
        const enx = e.x + Math.cos(e.dir) * 1.2, eny = e.y + Math.sin(e.dir) * 1.2
        const etx = Math.floor(enx / TILE), ety = Math.floor(eny / TILE)
        if (etx >= 0 && etx < COLS && ety >= 0 && ety < ROWS && s.map[ety][etx] === 0) {
          e.x = enx; e.y = eny
        } else { e.dir += Math.PI }
        if (s.invincible <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < PLAYER_R + ENEMY_R) {
          s.hp--; setHp(s.hp); s.invincible = 60
          if (s.hp <= 0) {
            s.gameOver = true; setGameOver(true); setMsg('Defeated!')
            cancelAnimationFrame(frameRef.current); return
          }
        }
      })

      const exitTx = COLS - 2, exitTy = ROWS - 2
      const exitPx = exitTx * TILE + TILE / 2, exitPy = exitTy * TILE + TILE / 2
      if (Math.hypot(p.x - exitPx, p.y - exitPy) < PLAYER_R + 14) {
        if (s.keys_ >= 1) {
          s.won = true; setWon(true); setScore(100 + s.hp * 20)
          if (onWin && !winFiredRef.current) { winFiredRef.current = true; onWin() }
          cancelAnimationFrame(frameRef.current); return
        } else {
          setMsg('Need a key!')
        }
      }

      const camX = Math.max(0, Math.min(CW, p.x - CW / 2))
      const camY = Math.max(0, Math.min(CH, p.y - CH / 2))

      ctx.clearRect(0, 0, CW, CH)
      const bg = ctx.createLinearGradient(0, 0, 0, CH)
      bg.addColorStop(0, '#0a0a2e'); bg.addColorStop(1, '#1a0a3e')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH)

      ctx.save(); ctx.translate(-camX, -camY)

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const px = x * TILE, py = y * TILE
          if (s.map[y][x] === 1) {
            ctx.fillStyle = '#1a1a4a'; ctx.fillRect(px, py, TILE, TILE)
            ctx.strokeStyle = 'rgba(170,0,255,0.15)'; ctx.strokeRect(px, py, TILE, TILE)
          } else {
            ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(px, py, TILE, TILE)
          }
        }
      }

      s.items.forEach(item => {
        const ix = item.x * TILE + TILE / 2, iy = item.y * TILE + TILE / 2
        ctx.font = '18px serif'
        ctx.fillText(item.type === 'potion' ? '🧪' : '🔑', ix - 9, iy + 6)
      })

      const t = performance.now() / 500
      ctx.fillStyle = s.keys_ >= 1 ? NEON.yellow : 'rgba(255,238,0,0.3)'
      ctx.shadowColor = NEON.yellow; ctx.shadowBlur = s.keys_ >= 1 ? 12 + Math.sin(t) * 4 : 0
      ctx.font = '18px serif'; ctx.fillText('🚪', exitPx - 9, exitPy + 6)
      ctx.shadowBlur = 0

      s.enemies.forEach(e => {
        ctx.fillStyle = NEON.red; ctx.shadowColor = NEON.red; ctx.shadowBlur = 10
        ctx.beginPath(); ctx.arc(e.x, e.y, ENEMY_R, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = 'white'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText('💀', e.x, e.y + 3); ctx.textAlign = 'start'
      })

      if (s.invincible <= 0 || Math.floor(s.invincible / 3) % 2 === 0) {
        ctx.fillStyle = NEON.green; ctx.shadowColor = NEON.green; ctx.shadowBlur = 14
        ctx.beginPath(); ctx.arc(p.x, p.y, PLAYER_R, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
      }

      ctx.restore()

      const mmS = 5, mmO = 4
      const mmW = COLS * mmS, mmH = ROWS * mmS
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(mmO, mmO, mmW + 4, mmH + 4)
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          ctx.fillStyle = s.map[y][x] === 1 ? '#333' : '#666'
          ctx.fillRect(mmO + x * mmS, mmO + y * mmS, mmS - 1, mmS - 1)
        }
      }
      ctx.fillStyle = NEON.green
      ctx.fillRect(mmO + Math.floor(p.x / TILE) * mmS, mmO + Math.floor(p.y / TILE) * mmS, mmS, mmS)

      if (!s.gameOver && !s.won) frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver, won, onWin])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#ff0044] font-bold">❤️ {hp}</span>
        <span className="text-[#ffee00] font-bold">🔑 {keys}</span>
        <span className="text-[#00d4ff] font-bold">⭐ {score}</span>
      </div>
      {msg && <p className="text-[#00ff88] font-bold text-sm mb-2">{msg}</p>}
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: CW, height: CH }}>
        <canvas ref={canvasRef} width={CW} height={CH} style={{ display: 'block' }} />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-center">
              <div className="text-4xl mb-2">⚔️</div>
              <p className="text-white font-bold text-sm">Explore the dungeon!</p>
              <p className="text-white/50 text-xs mt-1">Find keys, avoid enemies, reach the exit</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ff0044] font-bold text-xl mb-1">💀 Defeated!</p>
              <p className="text-white text-sm">Score: {score}</p>
            </motion.div>
          </div>
        )}
        {won && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ffee00] font-bold text-xl mb-1">🏆 Dungeon Cleared!</p>
              <p className="text-white text-sm">Score: {score}</p>
            </motion.div>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={initGame} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#aa00ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
          {gameOver || won ? '🔄 Retry' : '▶️ Start'}
        </motion.button>
      </div>
    </div>
  )
}
