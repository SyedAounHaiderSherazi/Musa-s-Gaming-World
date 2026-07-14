import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

const SIZE = 4

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function addRandom(grid) {
  const empty = []
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] === 0) empty.push([r, c])
  if (empty.length === 0) return grid
  const g = grid.map(r => [...r])
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  g[r][c] = Math.random() < 0.9 ? 2 : 4
  return g
}

function slideRow(row) {
  let filtered = row.filter(v => v !== 0)
  let score = 0
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2
      score += filtered[i]
      filtered.splice(i + 1, 1)
    }
  }
  while (filtered.length < SIZE) filtered.push(0)
  return { row: filtered, score }
}

function moveLeft(grid) {
  let totalScore = 0
  const newGrid = grid.map(row => {
    const { row: r, score } = slideRow(row)
    totalScore += score
    return r
  })
  return { grid: newGrid, score: totalScore }
}

function rotate(grid) {
  const g = emptyGrid()
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      g[c][SIZE - 1 - r] = grid[r][c]
  return g
}

function gridsEqual(a, b) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (a[r][c] !== b[r][c]) return false
  return true
}

function canMove(grid) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true
    }
  return false
}

function hasWon(grid) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] >= 2048) return true
  return false
}

const TILE_STYLES = {
  0: { bg: 'rgba(255,255,255,0.05)', color: 'transparent', border: 'none' },
  2: { bg: '#00d4ff22', color: '#00d4ff', border: '#00d4ff66' },
  4: { bg: '#ff00ff22', color: '#ff00ff', border: '#ff00ff66' },
  8: { bg: '#00ff8822', color: '#00ff88', border: '#00ff8866' },
  16: { bg: '#ffee0022', color: '#ffee00', border: '#ffee0066' },
  32: { bg: '#ff880022', color: '#ff8800', border: '#ff880066' },
  64: { bg: '#ff004422', color: '#ff0044', border: '#ff004466' },
  128: { bg: '#aa00ff33', color: '#aa00ff', border: '#aa00ff88' },
  256: { bg: '#00d4ff33', color: '#00d4ff', border: '#00d4ff88' },
  512: { bg: '#ff00ff33', color: '#ff00ff', border: '#ff00ff88' },
  1024: { bg: '#00ff8844', color: '#00ff88', border: '#00ff88aa' },
  2048: { bg: '#ffee0044', color: '#ffee00', border: '#ffee00cc' },
}

function getStyle(val) {
  return TILE_STYLES[val] || { bg: '#ff004433', color: '#ff0044', border: '#ff0044aa' }
}

export default function Game2048({ onWin }) {
  const [grid, setGrid] = useState(() => addRandom(addRandom(emptyGrid())))
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [keepPlaying, setKeepPlaying] = useState(false)
  const moved = useRef(false)

  const move = useCallback((direction) => {
    if (gameOver || (won && !keepPlaying)) return
    let g = grid.map(r => [...r])
    let rot = 0
    if (direction === 'left') rot = 0
    else if (direction === 'down') rot = 1
    else if (direction === 'right') rot = 2
    else if (direction === 'up') rot = 3

    for (let i = 0; i < rot; i++) g = rotate(g)
    const { grid: slid, score: s } = moveLeft(g)
    let result = slid
    for (let i = rot; i < 4; i++) result = rotate(result)

    if (!gridsEqual(grid, result)) {
      const newGrid = addRandom(result)
      setGrid(newGrid)
      setScore(sc => {
        const ns = sc + s
        if (ns > best) setBest(ns)
        return ns
      })
      if (hasWon(newGrid) && !won) {
        setWon(true)
        if (onWin) onWin({ score: score + s })
      }
      if (!canMove(newGrid)) setGameOver(true)
    }
  }, [grid, score, best, gameOver, won, keepPlaying, onWin])

  useEffect(() => {
    const handler = (e) => {
      const map = { ArrowLeft: 'left', ArrowDown: 'down', ArrowRight: 'right', ArrowUp: 'up' }
      if (map[e.key]) { e.preventDefault(); move(map[e.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [move])

  const restart = () => {
    setGrid(addRandom(addRandom(emptyGrid())))
    setScore(0)
    setGameOver(false)
    setWon(false)
    setKeepPlaying(false)
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-[500px] select-none" style={{ fontFamily: 'sans-serif' }}>
      <div className="flex gap-4 items-center text-sm">
        <span className="text-white font-mono">Score: <span className="text-[#ffee00]">{score}</span></span>
        <span className="text-white font-mono">Best: <span className="text-[#00ff88]">{best}</span></span>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={restart}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
          New Game
        </motion.button>
      </div>

      <div className="text-white text-xs opacity-60">Use arrow keys to play</div>

      <div className="grid gap-1.5 p-2 rounded-xl" style={{ gridTemplateColumns: `repeat(${SIZE}, 80px)`, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {grid.map((row, r) =>
          row.map((val, c) => {
            const s = getStyle(val)
            return (
              <motion.div key={`${r}-${c}`} layout
                className="w-[80px] h-[80px] rounded-lg flex items-center justify-center text-lg font-bold"
                style={{
                  background: s.bg,
                  border: `2px solid ${s.border}`,
                  color: s.color,
                  boxShadow: val > 0 ? `0 0 12px ${s.border}` : 'none',
                }}>
                {val !== 0 ? val : ''}
              </motion.div>
            )
          })
        )}
      </div>

      <div className="flex gap-2 mt-2 md:hidden">
        {[{ d: 'up', l: '▲' }, { d: 'left', l: '◄' }, { d: 'down', l: '▼' }, { d: 'right', l: '►' }].map(({ d, l }) => (
          <motion.button key={d} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => move(d)}
            className="w-12 h-12 rounded-lg text-lg font-bold border-none cursor-pointer"
            style={{ background: 'rgba(0,212,255,0.2)', color: '#00d4ff', border: '1px solid #00d4ff44' }}>
            {l}
          </motion.button>
        ))}
      </div>

      {(gameOver || (won && !keepPlaying)) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-50">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
            className="text-4xl font-bold" style={{ color: won ? '#ffee00' : '#ff0044' }}>
            {won ? '🎉 You Win!' : '💀 Game Over'}
          </motion.div>
          <div className="text-white text-lg">Score: {score}</div>
          {won && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setKeepPlaying(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#ffee00] text-black font-bold text-sm border-none cursor-pointer">
              Keep Playing
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={restart}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold border-none cursor-pointer">
            New Game
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
