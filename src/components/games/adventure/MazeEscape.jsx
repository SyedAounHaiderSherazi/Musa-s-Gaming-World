/* Maze Escape - Randomly generated maze with fog of war */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const CELL = 28, COLS = 15, ROWS = 15, W = COLS * CELL, H = ROWS * CELL
const NEON = { blue: '#00d4ff', pink: '#ff00ff', green: '#00ff88', yellow: '#ffee00', red: '#ff0044' }

function generateMaze(cols, rows) {
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ top: true, right: true, bottom: true, left: true, visited: false })))
  const stack = [{ x: 0, y: 0 }]
  grid[0][0].visited = true
  while (stack.length > 0) {
    const cur = stack[stack.length - 1]
    const neighbors = []
    if (cur.y > 0 && !grid[cur.y - 1][cur.x].visited) neighbors.push({ x: cur.x, y: cur.y - 1, dir: 'top' })
    if (cur.x < cols - 1 && !grid[cur.y][cur.x + 1].visited) neighbors.push({ x: cur.x + 1, y: cur.y, dir: 'right' })
    if (cur.y < rows - 1 && !grid[cur.y + 1][cur.x].visited) neighbors.push({ x: cur.x, y: cur.y + 1, dir: 'bottom' })
    if (cur.x > 0 && !grid[cur.y][cur.x - 1].visited) neighbors.push({ x: cur.x - 1, y: cur.y, dir: 'left' })
    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)]
      if (next.dir === 'top') { grid[cur.y][cur.x].top = false; grid[next.y][next.x].bottom = false }
      if (next.dir === 'right') { grid[cur.y][cur.x].right = false; grid[next.y][next.x].left = false }
      if (next.dir === 'bottom') { grid[cur.y][cur.x].bottom = false; grid[next.y][next.x].top = false }
      if (next.dir === 'left') { grid[cur.y][cur.x].left = false; grid[next.y][next.x].right = false }
      grid[next.y][next.x].visited = true
      stack.push(next)
    } else { stack.pop() }
  }
  return grid
}

export default function MazeEscape({ onWin }) {
  const canvasRef = useRef(null)
  const mazeRef = useRef(null)
  const [player, setPlayer] = useState({ x: 0, y: 0 })
  const [time, setTime] = useState(0)
  const [steps, setSteps] = useState(0)
  const [started, setStarted] = useState(false)
  const [won, setWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [timeLimit, setTimeLimit] = useState(60)
  const winFiredRef = useRef(false)
  const stateRef = useRef({ player: { x: 0, y: 0 }, maze: null, started: false })
  const timerRef = useRef(null)

  const initGame = useCallback(() => {
    const m = generateMaze(COLS, ROWS)
    mazeRef.current = m
    stateRef.current = { player: { x: 0, y: 0 }, maze: m, started: true }
    setPlayer({ x: 0, y: 0 }); setSteps(0); setTime(0); setStarted(true); setWon(false); setGameOver(false); setTimeLimit(60)
    winFiredRef.current = false
  }, [])

  useEffect(() => {
    if (!started || won || gameOver) return
    timerRef.current = setInterval(() => {
      setTime(t => {
        const next = t + 1
        if (next >= timeLimit) { setGameOver(true); clearInterval(timerRef.current) }
        return next
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, won, gameOver, timeLimit])

  useEffect(() => {
    if (!started) return
    const handleKey = (e) => {
      if (won || gameOver) return
      const k = e.key
      let dx = 0, dy = 0
      if (k === 'ArrowUp' || k === 'w') dy = -1
      else if (k === 'ArrowDown' || k === 's') dy = 1
      else if (k === 'ArrowLeft' || k === 'a') dx = -1
      else if (k === 'ArrowRight' || k === 'd') dx = 1
      else return
      e.preventDefault()
      const s = stateRef.current
      const cell = s.maze[s.player.y][s.player.x]
      if (dx === 1 && cell.right) return
      if (dx === -1 && cell.left) return
      if (dy === 1 && cell.bottom) return
      if (dy === -1 && cell.top) return
      const nx = s.player.x + dx, ny = s.player.y + dy
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return
      s.player.x = nx; s.player.y = ny
      setPlayer({ x: nx, y: ny })
      setSteps(st => st + 1)
      if (nx === COLS - 1 && ny === ROWS - 1) {
        setWon(true); clearInterval(timerRef.current)
        if (onWin && !winFiredRef.current) { winFiredRef.current = true; onWin() }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [started, won, gameOver, onWin])

  useEffect(() => {
    if (!started || !mazeRef.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const maze = mazeRef.current
    ctx.clearRect(0, 0, W, H)
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#0a0a2e'); g.addColorStop(1, '#1a0a3e')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

    const fogRadius = 3.2
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const dist = Math.hypot(x - player.x, y - player.y)
        const alpha = dist <= fogRadius ? 1 - (dist / fogRadius) * 0.7 : 0.05
        if (alpha < 0.05) continue
        ctx.globalAlpha = alpha
        const px = x * CELL, py = y * CELL
        const cell = maze[y][x]
        ctx.fillStyle = (x === COLS - 1 && y === ROWS - 1) ? 'rgba(255,238,0,0.15)' : 'rgba(255,255,255,0.03)'
        ctx.fillRect(px, py, CELL, CELL)
        ctx.strokeStyle = 'rgba(170,0,255,0.3)'; ctx.lineWidth = 2
        if (cell.top) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + CELL, py); ctx.stroke() }
        if (cell.right) { ctx.beginPath(); ctx.moveTo(px + CELL, py); ctx.lineTo(px + CELL, py + CELL); ctx.stroke() }
        if (cell.bottom) { ctx.beginPath(); ctx.moveTo(px, py + CELL); ctx.lineTo(px + CELL, py + CELL); ctx.stroke() }
        if (cell.left) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + CELL); ctx.stroke() }
        ctx.globalAlpha = 1
      }
    }

    if (Math.hypot(COLS - 1 - player.x, ROWS - 1 - player.y) <= fogRadius) {
      const ex = (COLS - 1) * CELL + CELL / 2, ey = (ROWS - 1) * CELL + CELL / 2
      ctx.fillStyle = NEON.yellow; ctx.shadowColor = NEON.yellow; ctx.shadowBlur = 12
      ctx.font = '18px serif'; ctx.fillText('🏁', ex - 9, ey + 6)
      ctx.shadowBlur = 0
    }

    ctx.globalAlpha = 1
    ctx.fillStyle = NEON.green
    ctx.shadowColor = NEON.green; ctx.shadowBlur = 14
    ctx.beginPath()
    ctx.arc(player.x * CELL + CELL / 2, player.y * CELL + CELL / 2, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }, [started, player, won, gameOver])

  const timeLeft = Math.max(0, timeLimit - time)
  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#00ff88] font-bold">👣 {steps}</span>
        <span className={`font-bold ${timeLeft <= 10 ? 'text-[#ff0044]' : 'text-[#00d4ff]'}`}>⏱️ {timeLeft}s</span>
      </div>
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: W, height: H }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block' }} />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-center">
              <div className="text-4xl mb-2">🏁</div>
              <p className="text-white font-bold text-sm">Escape the maze!</p>
              <p className="text-white/50 text-xs mt-1">Reach the finish before time runs out</p>
            </motion.div>
          </div>
        )}
        {won && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ffee00] font-bold text-xl mb-1">🏆 Maze Escaped!</p>
              <p className="text-white text-sm">{steps} steps in {time}s</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-[#ff0044] font-bold text-xl mb-1">⏱️ Time's Up!</p>
              <p className="text-white text-sm">{steps} steps taken</p>
            </motion.div>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={initGame} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#aa00ff] to-[#00d4ff] text-white font-bold text-sm border-none cursor-pointer">
          {gameOver || won ? '🔄 Retry' : '▶️ Start'}
        </motion.button>
      </div>
    </div>
  )
}
