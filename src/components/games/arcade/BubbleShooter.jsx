/* Bubble Shooter - Canvas Arcade Game */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 400, H = 550
const BUBBLE_R = 16
const COLS = 12
const COLORS = ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800']

const makeGrid = () => {
  const rows = []
  for (let r = 0; r < 8; r++) {
    const row = []
    const offset = r % 2 === 1 ? BUBBLE_R : 0
    const cols = r % 2 === 1 ? COLS - 1 : COLS
    for (let c = 0; c < cols; c++) {
      row.push({
        x: c * BUBBLE_R * 2 + BUBBLE_R + offset,
        y: r * (BUBBLE_R * 1.73) + BUBBLE_R + 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alive: true,
      })
    }
    rows.push(row)
  }
  return rows
}

const shootBubble = (angle) => {
  const speed = 7
  return { x: W / 2, y: H - 50, dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed }
}

const dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)

export default function BubbleShooter({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('idle')
  const [score, setScore] = useState(0)

  const gridRef = useRef([])
  const bubbleRef = useRef(null)
  const angleRef = useRef(-Math.PI / 2)
  const nextColorRef = useRef(COLORS[Math.floor(Math.random() * COLORS.length)])
  const scoreRef = useRef(0)
  const stateRef = useRef('idle')
  const frameRef = useRef(null)
  const winRef = useRef(false)

  const snapToGrid = useCallback((bx, by) => {
    const row = Math.round((by - BUBBLE_R - 10) / (BUBBLE_R * 1.73))
    const offset = row % 2 === 1 ? BUBBLE_R : 0
    const col = Math.round((bx - BUBBLE_R - offset) / (BUBBLE_R * 2))
    return { row: Math.max(0, row), col: Math.max(0, col), offset }
  }, [])

  const findCluster = useCallback((grid, r, c, color) => {
    const cluster = []
    const visited = new Set()
    const key = (rr, cc) => `${rr},${cc}`
    const queue = [[r, c]]
    while (queue.length) {
      const [cr, cc] = queue.shift()
      const k = key(cr, cc)
      if (visited.has(k)) continue
      visited.add(k)
      if (cr < 0 || cr >= grid.length) continue
      if (cc < 0 || cc >= (grid[cr]?.length || 0)) continue
      const cell = grid[cr]?.[cc]
      if (!cell || !cell.alive || cell.color !== color) continue
      cluster.push([cr, cc])
      const dirs = cr % 2 === 1
        ? [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]]
        : [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]]
      for (const [dr, dc] of dirs) queue.push([cr + dr, cc + dc])
    }
    return cluster
  }, [])

  const findFloating = useCallback((grid) => {
    const connected = new Set()
    const queue = []
    if (grid[0]) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[0][c]?.alive) {
          queue.push([0, c])
          connected.add(`0,${c}`)
        }
      }
    }
    while (queue.length) {
      const [cr, cc] = queue.shift()
      const dirs = cr % 2 === 1
        ? [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]]
        : [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]]
      for (const [dr, dc] of dirs) {
        const nr = cr + dr, nc = cc + dc
        const k = `${nr},${nc}`
        if (connected.has(k)) continue
        if (nr < 0 || nr >= grid.length) continue
        if (nc < 0 || nc >= (grid[nr]?.length || 0)) continue
        if (grid[nr]?.[nc]?.alive) {
          connected.add(k)
          queue.push([nr, nc])
        }
      }
    }
    let count = 0
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < (grid[r]?.length || 0); c++) {
        if (grid[r][c]?.alive && !connected.has(`${r},${c}`)) {
          grid[r][c].alive = false
          count++
        }
      }
    }
    return count
  }, [])

  const startGame = useCallback(() => {
    gridRef.current = makeGrid()
    scoreRef.current = 0
    nextColorRef.current = COLORS[Math.floor(Math.random() * COLORS.length)]
    bubbleRef.current = null
    angleRef.current = -Math.PI / 2
    winRef.current = false
    setScore(0)
    stateRef.current = 'playing'
    setGameState('playing')
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      const grid = gridRef.current
      const bubble = bubbleRef.current

      if (bubble) {
        bubble.x += bubble.dx
        bubble.y += bubble.dy

        if (bubble.x - BUBBLE_R < 0 || bubble.x + BUBBLE_R > W) bubble.dx *= -1
        if (bubble.y - BUBBLE_R < 0) {
          bubble.dy = 0
        }

        let landed = false
        if (bubble.y - BUBBLE_R <= 10) {
          landed = true
        }

        if (!landed) {
          for (const row of grid) {
            for (const cell of row) {
              if (!cell.alive) continue
              if (dist(bubble, cell) < BUBBLE_R * 2) {
                landed = true
                break
              }
            }
            if (landed) break
          }
        }

        if (landed) {
          const snap = snapToGrid(bubble.x, bubble.y)
          while (grid.length <= snap.row) {
            const r = grid.length
            const offset = r % 2 === 1 ? BUBBLE_R : 0
            const cols = r % 2 === 1 ? COLS - 1 : COLS
            const newRow = []
            for (let c = 0; c < cols; c++) {
              newRow.push({
                x: c * BUBBLE_R * 2 + BUBBLE_R + offset,
                y: r * (BUBBLE_R * 1.73) + BUBBLE_R + 10,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                alive: false,
              })
            }
            grid.push(newRow)
          }

          const row = grid[snap.row]
          if (row && snap.col < row.length) {
            row[snap.col].alive = true
            row[snap.col].color = bubble.color
          }

          const cluster = findCluster(grid, snap.row, snap.col, bubble.color)
          if (cluster.length >= 3) {
            for (const [r, c] of cluster) grid[r][c].alive = false
            const floating = findFloating(grid)
            scoreRef.current += (cluster.length + floating) * 10
            setScore(scoreRef.current)
          }

          const allDead = grid.every(row => row.every(c => !c.alive))
          if (allDead) {
            stateRef.current = 'won'
            setGameState('won')
            return
          }

          const bottomRow = grid.length - 1
          if (grid[bottomRow]?.some(c => c.alive)) {
            stateRef.current = 'over'
            setGameState('over')
            return
          }

          bubbleRef.current = null
          nextColorRef.current = COLORS[Math.floor(Math.random() * COLORS.length)]
        }
      }

      // Draw
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, W, H)

      ctx.strokeStyle = 'rgba(0,212,255,0.1)'
      ctx.lineWidth = 1
      for (let r = 0; r < grid.length; r++) {
        for (const cell of grid[r] || []) {
          if (!cell.alive) continue
          ctx.fillStyle = cell.color
          ctx.shadowColor = cell.color
          ctx.shadowBlur = 5
          ctx.beginPath()
          ctx.arc(cell.x, cell.y, BUBBLE_R - 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.shadowBlur = 0

      if (bubble) {
        ctx.fillStyle = bubble.color
        ctx.shadowColor = bubble.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(bubble.x, bubble.y, BUBBLE_R - 1, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Aim line
      if (!bubble) {
        const ax = W / 2
        const ay = H - 50
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(ax + Math.cos(angleRef.current) * 100, ay + Math.sin(angleRef.current) * 100)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Shooter
      ctx.fillStyle = nextColorRef.current
      ctx.shadowColor = nextColorRef.current
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(W / 2, H - 50, BUBBLE_R, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [gameState, snapToGrid, findCluster, findFloating])

  useEffect(() => {
    const handleMove = (e) => {
      const canvas = canvasRef.current
      if (!canvas || stateRef.current !== 'playing' || bubbleRef.current) return
      const rect = canvas.getBoundingClientRect()
      const mx = ((e.clientX || e.touches?.[0]?.clientX || 0) - rect.left) * (W / rect.width)
      const my = ((e.clientY || e.touches?.[0]?.clientY || 0) - rect.top) * (H / rect.height)
      const dx = mx - W / 2
      const dy = my - (H - 50)
      angleRef.current = Math.atan2(dy, dx)
      if (angleRef.current > -0.1) angleRef.current = -0.1
      if (angleRef.current < -Math.PI + 0.1) angleRef.current = -Math.PI + 0.1
    }
    const handleClick = () => {
      if (stateRef.current !== 'playing' || bubbleRef.current) return
      bubbleRef.current = shootBubble(angleRef.current)
      bubbleRef.current.color = nextColorRef.current
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('click', handleClick)
    window.addEventListener('touchstart', handleClick)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('touchstart', handleClick)
    }
  }, [])

  useEffect(() => {
    if (gameState === 'won' && onWin && !winRef.current) {
      winRef.current = true
      onWin()
    }
  }, [gameState, onWin])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#00ff88] font-bold">Score: {score}</span>
      </div>

      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: W, height: H, maxWidth: '100%' }}>
        <canvas ref={canvasRef} width={W} height={H} className="w-full h-full" />

        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60"
            >
              <div className="text-center">
                <div className="text-5xl mb-3">🫧</div>
                <p className="text-[#00d4ff] font-bold text-xl mb-1">BUBBLE SHOOTER</p>
                <p className="text-white/60 text-xs mb-3">Match 3+ same colors to pop!</p>
                <p className="text-white/40 text-xs">Aim with mouse, click to shoot</p>
              </div>
            </motion.div>
          )}
          {gameState === 'won' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <p className="text-[#00ff88] font-bold text-3xl">ALL CLEAR!</p>
                <p className="text-white/60 text-sm mt-2">Score: {score}</p>
              </div>
            </motion.div>
          )}
          {gameState === 'over' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <p className="text-[#ff0044] font-bold text-2xl mb-2">GAME OVER</p>
                <p className="text-white/60 text-sm">Score: {score}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={startGame}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer"
      >
        {gameState === 'idle' ? '▶ Start' : '🔄 Restart'}
      </motion.button>
    </div>
  )
}
