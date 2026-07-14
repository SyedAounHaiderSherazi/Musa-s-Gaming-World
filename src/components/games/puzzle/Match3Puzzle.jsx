import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

const ROWS = 6
const COLS = 6
const GEM_COLORS = ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800', '#ff0044']
const GEM_NAMES = ['💧', '🔮', '🍀', '⚡', '🔥', '💎']
const MAX_MOVES = 30

function createGrid() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.floor(Math.random() * GEM_COLORS.length))
  )
}

function findMatches(grid) {
  const matched = new Set()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 3; c++) {
      const v = grid[r][c]
      if (v >= 0 && v === grid[r][c + 1] && v === grid[r][c + 2]) {
        let end = c + 2
        while (end + 1 < COLS && grid[r][end + 1] === v) end++
        for (let i = c; i <= end; i++) matched.add(`${r}-${i}`)
      }
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 3; r++) {
      const v = grid[r][c]
      if (v >= 0 && v === grid[r + 1][c] && v === grid[r + 2][c]) {
        let end = r + 2
        while (end + 1 < ROWS && grid[end + 1][c] === v) end++
        for (let i = r; i <= end; i++) matched.add(`${i}-${c}`)
      }
    }
  }
  return matched
}

function clearAndDrop(grid) {
  const matches = findMatches(grid)
  if (matches.size === 0) return { grid, cleared: 0 }
  let score = matches.size
  const g = grid.map(r => [...r])
  matches.forEach(key => {
    const [r, c] = key.split('-').map(Number)
    g[r][c] = -1
  })
  for (let c = 0; c < COLS; c++) {
    const col = []
    for (let r = 0; r < ROWS; r++) {
      if (g[r][c] >= 0) col.push(g[r][c])
    }
    while (col.length < ROWS) col.unshift(Math.floor(Math.random() * GEM_COLORS.length))
    for (let r = 0; r < ROWS; r++) g[r][c] = col[r]
  }
  const next = clearAndDrop(g)
  return { grid: next.grid, cleared: score + next.cleared }
}

export default function Match3Puzzle({ onWin }) {
  const [grid, setGrid] = useState(() => createGrid())
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(MAX_MOVES)
  const [animating, setAnimating] = useState(false)
  const [won, setWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [combo, setCombo] = useState(0)

  const processGrid = useCallback((g) => {
    setAnimating(true)
    setTimeout(() => {
      const { grid: newGrid, cleared } = clearAndDrop(g)
      if (cleared > 0) {
        setScore(s => s + cleared * 10)
        setCombo(c => c + 1)
        processGrid(newGrid)
      } else {
        setCombo(0)
        setAnimating(false)
        setGrid(newGrid)
      }
    }, 200)
  }, [])

  const swap = (r1, c1, r2, c2) => {
    if (animating || gameOver) return
    const g = grid.map(r => [...r])
    ;[g[r1][c1], g[r2][c2]] = [g[r2][c2], g[r1][c1]]
    const matches = findMatches(g)
    if (matches.size > 0) {
      setGrid(g)
      setMoves(m => m - 1)
      processGrid(g)
    }
  }

  const handleClick = (r, c) => {
    if (animating || gameOver) return
    if (!selected) {
      setSelected([r, c])
      return
    }
    const [sr, sc] = selected
    if (sr === r && sc === c) { setSelected(null); return }
    const adj = (Math.abs(sr - r) + Math.abs(sc - c)) === 1
    if (adj) {
      swap(sr, sc, r, c)
      setSelected(null)
    } else {
      setSelected([r, c])
    }
  }

  useEffect(() => {
    if (moves <= 0 && started && !gameOver && !won) {
      const timer = setTimeout(() => {
        setGameOver(true)
        if (score >= 200) {
          setWon(true)
          if (onWin) onWin({ score })
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [moves, score, started, onWin, gameOver, won])

  const restart = () => {
    setGrid(createGrid())
    setSelected(null)
    setScore(0)
    setMoves(MAX_MOVES)
    setAnimating(false)
    setWon(false)
    setGameOver(false)
    setCombo(0)
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-[500px] select-none" style={{ fontFamily: 'sans-serif' }}>
      <div className="flex gap-4 items-center text-sm">
        <span className="text-white font-mono">Score: <span className="text-[#ffee00]">{score}</span></span>
        <span className="text-white font-mono">Moves: <span className="text-[#00ff88]">{moves}</span></span>
        {combo > 1 && <span className="text-[#ff8800] font-bold">Combo x{combo}!</span>}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={restart}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
          Restart
        </motion.button>
      </div>

      <div className="text-white text-xs opacity-60">Click two adjacent gems to swap. Match 3+ to score!</div>

      <div className="grid gap-1 p-2 rounded-xl" style={{ gridTemplateColumns: `repeat(${COLS}, 60px)`, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {grid.map((row, r) =>
          row.map((gem, c) => {
            const isSel = selected && selected[0] === r && selected[1] === c
            return (
              <motion.div key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                className="w-[60px] h-[60px] rounded-lg flex items-center justify-center text-2xl cursor-pointer"
                style={{
                  background: `${GEM_COLORS[gem]}22`,
                  border: isSel ? `2px solid #ffee00` : `2px solid ${GEM_COLORS[gem]}55`,
                  boxShadow: isSel ? '0 0 12px #ffee00' : `0 0 6px ${GEM_COLORS[gem]}33`,
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}>
                {GEM_NAMES[gem]}
              </motion.div>
            )
          })
        )}
      </div>

      {(gameOver || won) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-50">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
            className="text-4xl font-bold" style={{ color: won ? '#ffee00' : '#ff0044' }}>
            {won ? '🎉 Great Job!' : 'Time\'s Up!'}
          </motion.div>
          <div className="text-white text-lg">Score: {score}</div>
          {won && <div className="text-[#00ff88]">You reached 200+ points!</div>}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={restart}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold border-none cursor-pointer">
            Play Again
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
