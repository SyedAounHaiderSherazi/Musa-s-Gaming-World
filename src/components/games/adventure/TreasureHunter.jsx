/* Treasure Hunter - Grid-based exploration with fog of war */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const COLS = 8, ROWS = 8, CELL = 48
const NEON = { blue: '#00d4ff', pink: '#ff00ff', green: '#00ff88', yellow: '#ffee00', orange: '#ff8800', red: '#ff0044', purple: '#aa00ff' }

function generateDungeon() {
  const rooms = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({
    wall: Math.random() < 0.2, visited: false, hasKey: false, hasDoor: false, hasTreasure: false, hasTrap: false,
  })))
  rooms[0][0] = { wall: false, visited: true, hasKey: false, hasDoor: false, hasTreasure: false, hasTrap: false }
  rooms[ROWS - 1][COLS - 1] = { wall: false, visited: false, hasKey: false, hasDoor: false, hasTreasure: true, hasTrap: false }
  const paths = [[0, 0]]
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  while (paths.length > 0) {
    const [cx, cy] = paths[Math.floor(Math.random() * paths.length)]
    const shuffled = dirs.sort(() => Math.random() - 0.5)
    let opened = false
    for (const [dx, dy] of shuffled) {
      const nx = cx + dx, ny = cy + dy
      if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && rooms[ny][nx].wall) {
        rooms[ny][nx].wall = false
        rooms[cy][cx].visited = true
        paths.push([nx, ny])
        opened = true
        break
      }
    }
    if (!opened) paths.splice(paths.indexOf(paths.find(p => p[0] === cx && p[1] === cy)), 1)
  }
  let keysPlaced = 0
  while (keysPlaced < 2) {
    const kx = Math.floor(Math.random() * COLS), ky = Math.floor(Math.random() * ROWS)
    if (!rooms[ky][kx].wall && !rooms[ky][kx].hasTreasure && !(kx === 0 && ky === 0) && !rooms[ky][kx].hasKey) {
      rooms[ky][kx].hasKey = true; keysPlaced++
    }
  }
  let doorsPlaced = 0
  while (doorsPlaced < 2) {
    const dx = Math.floor(Math.random() * COLS), dy = Math.floor(Math.random() * ROWS)
    if (!rooms[dy][dx].wall && !rooms[dy][dx].hasTreasure && !rooms[dy][dx].hasKey && !(dx === 0 && dy === 0) && !rooms[dy][dx].hasDoor) {
      rooms[dy][dx].hasDoor = true; doorsPlaced++
    }
  }
  let trapsPlaced = 0
  while (trapsPlaced < 4) {
    const tx = Math.floor(Math.random() * COLS), ty = Math.floor(Math.random() * ROWS)
    if (!rooms[ty][tx].wall && !rooms[ty][tx].hasTreasure && !rooms[ty][tx].hasKey && !rooms[ty][tx].hasDoor && !(tx === 0 && ty === 0) && !rooms[ty][tx].hasTrap) {
      rooms[ty][tx].hasTrap = true; trapsPlaced++
    }
  }
  rooms[0][0].visited = true
  return rooms
}

export default function TreasureHunter({ onWin }) {
  const canvasRef = useRef(null)
  const [player, setPlayer] = useState({ x: 0, y: 0 })
  const [rooms, setRooms] = useState(() => generateDungeon())
  const [keys, setKeys] = useState(0)
  const [hp, setHp] = useState(3)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [started, setStarted] = useState(false)
  const [msg, setMsg] = useState('')
  const winFiredRef = useRef(false)
  const stateRef = useRef({ player: { x: 0, y: 0 }, rooms: generateDungeon(), keys: 0, hp: 3 })

  const initGame = useCallback(() => {
    const r = generateDungeon()
    const s = { player: { x: 0, y: 0 }, rooms: r, keys: 0, hp: 3 }
    stateRef.current = s
    setPlayer({ x: 0, y: 0 }); setRooms(r); setKeys(0); setHp(3)
    setScore(0); setMoves(0); setGameOver(false); setWon(false); setStarted(true)
    setMsg('')
    winFiredRef.current = false
  }, [])

  const drawMap = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const cw = COLS * CELL, ch = ROWS * CELL
    ctx.clearRect(0, 0, cw, ch)
    const g = ctx.createLinearGradient(0, 0, 0, ch)
    g.addColorStop(0, '#0a0a2e'); g.addColorStop(1, '#1a0a3e')
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch)
    const s = stateRef.current

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const room = s.rooms[y][x]
        const dist = Math.abs(x - s.player.x) + Math.abs(y - s.player.y)
        if (dist > 3 && !room.visited) continue
        const alpha = dist > 2 ? 0.3 : dist > 1 ? 0.6 : 1
        const px = x * CELL, py = y * CELL
        ctx.globalAlpha = alpha
        if (room.wall) {
          ctx.fillStyle = '#1a1a4a'; ctx.fillRect(px, py, CELL, CELL)
          ctx.strokeStyle = 'rgba(170,0,255,0.2)'; ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2)
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(px, py, CELL, CELL)
          ctx.strokeStyle = 'rgba(0,212,255,0.15)'; ctx.strokeRect(px, py, CELL, CELL)
          if (room.hasKey) {
            ctx.fillStyle = NEON.yellow; ctx.font = '20px serif'; ctx.fillText('🔑', px + 12, py + 32)
          }
          if (room.hasDoor) {
            ctx.fillStyle = NEON.orange; ctx.font = '20px serif'; ctx.fillText('🚪', px + 12, py + 32)
          }
          if (room.hasTrap) {
            ctx.fillStyle = NEON.red; ctx.font = '18px serif'; ctx.fillText('⚠️', px + 14, py + 32)
          }
          if (room.hasTreasure) {
            ctx.fillStyle = NEON.yellow; ctx.font = '22px serif'; ctx.fillText('🏆', px + 10, py + 34)
          }
        }
        ctx.globalAlpha = 1
      }
    }

    ctx.fillStyle = NEON.green
    ctx.shadowColor = NEON.green; ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.arc(s.player.x * CELL + CELL / 2, s.player.y * CELL + CELL / 2, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }, [])

  useEffect(() => { if (started) drawMap() }, [started, player, rooms, drawMap])

  useEffect(() => {
    if (!started) return
    const handleKey = (e) => {
      if (gameOver || won) return
      const k = e.key
      let dx = 0, dy = 0
      if (k === 'ArrowUp' || k === 'w') dy = -1
      else if (k === 'ArrowDown' || k === 's') dy = 1
      else if (k === 'ArrowLeft' || k === 'a') dx = -1
      else if (k === 'ArrowRight' || k === 'd') dx = 1
      else return
      e.preventDefault()
      const s = stateRef.current
      const nx = s.player.x + dx, ny = s.player.y + dy
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return
      const room = s.rooms[ny][nx]
      if (room.wall) return
      if (room.hasDoor) {
        if (s.keys > 0) {
          s.keys--; setKeys(s.keys)
          room.hasDoor = false
          setMsg('Door unlocked!')
        } else {
          setMsg('Need a key!')
          return
        }
      }
      if (room.hasKey) { s.keys++; setKeys(s.keys); room.hasKey = false; setMsg('Key collected!') }
      if (room.hasTrap) { s.hp--; setHp(s.hp); room.hasTrap = false; setMsg('Ouch! Trap!') }
      if (room.hasTreasure) {
        setWon(true); setScore(100); setMsg('Treasure found!')
        if (onWin && !winFiredRef.current) { winFiredRef.current = true; onWin() }
        drawMap()
        return
      }
      s.player.x = nx; s.player.y = ny
      room.visited = true
      s.rooms[ny][nx] = { ...room }
      setPlayer({ x: nx, y: ny })
      setRooms([...s.rooms.map(r => r.map(c => ({ ...c })))]); setMoves(m => m + 1)
      if (s.hp <= 0) { setGameOver(true); setMsg('You ran out of health!') }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [started, gameOver, won, onWin, drawMap])

  const cw = COLS * CELL, ch = ROWS * CELL
  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#ffee00] font-bold">🔑 {keys}</span>
        <span className="text-[#ff0044] font-bold">❤️ {hp}</span>
        <span className="text-[#00d4ff] font-bold">👣 {moves}</span>
      </div>
      {msg && <p className="text-[#00ff88] font-bold text-sm mb-2">{msg}</p>}
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: cw, height: ch }}>
        <canvas ref={canvasRef} width={cw} height={ch} style={{ display: 'block' }} />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-white font-bold text-sm">Find the treasure!</p>
              <p className="text-white/50 text-xs mt-1">Collect keys, avoid traps. Arrow keys to move.</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ff0044] font-bold text-xl mb-1">💀 Game Over!</p>
              <p className="text-white text-sm">Moves: {moves}</p>
            </motion.div>
          </div>
        )}
        {won && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ffee00] font-bold text-xl mb-1">🏆 Treasure Found!</p>
              <p className="text-white text-sm">Moves: {moves}</p>
            </motion.div>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={initGame} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
          {gameOver || won ? '🔄 Retry' : '▶️ Start'}
        </motion.button>
      </div>
    </div>
  )
}
