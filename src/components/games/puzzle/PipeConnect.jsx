import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

const PIPE_SHAPES = {
  straight: [[1, 1, 1, 1], [1, 1, 1, 1]],
  corner: [[0, 1, 1, 0], [1, 0, 0, 1], [0, 1, 1, 0], [1, 0, 0, 1]],
  tee: [[1, 1, 1, 0], [0, 1, 1, 1], [1, 0, 1, 1], [1, 1, 0, 1]],
  cross: [[1, 1, 1, 1]],
}

function getConnections(shape, rotation) {
  const orientations = PIPE_SHAPES[shape]
  return orientations[rotation % orientations.length]
}

function generatePuzzle(level) {
  const size = Math.min(3 + level, 6)
  const grid = []
  for (let r = 0; r < size; r++) {
    grid[r] = []
    for (let c = 0; c < size; c++) {
      const shapes = Object.keys(PIPE_SHAPES)
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      const rotation = Math.floor(Math.random() * 4)
      grid[r][c] = { shape, rotation, locked: false }
    }
  }
  grid[0][0] = { shape: 'straight', rotation: 1, locked: true }
  grid[size - 1][size - 1] = { shape: 'straight', rotation: 1, locked: true }
  return { grid, size }
}

function checkConnected(grid, size) {
  const solved = Array.from({ length: size }, () => Array(size).fill(false))
  const queue = [[0, 0]]
  solved[0][0] = true
  const dirs = [
    { dr: -1, dc: 0, side: 0 },
    { dr: 0, dc: 1, side: 1 },
    { dr: 1, dc: 0, side: 2 },
    { dr: 0, dc: -1, side: 3 },
  ]

  while (queue.length > 0) {
    const [r, c] = queue.shift()
    const conn = getConnections(grid[r][c].shape, grid[r][c].rotation)
    for (let i = 0; i < 4; i++) {
      if (!conn[i]) continue
      const nr = r + dirs[i].dr
      const nc = c + dirs[i].dc
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue
      if (solved[nr][nc]) continue
      const neighborConn = getConnections(grid[nr][nc].shape, grid[nr][nc].rotation)
      const opposite = (i + 2) % 4
      if (neighborConn[opposite]) {
        solved[nr][nc] = true
        queue.push([nr, nc])
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!solved[r][c]) return false
    }
  }
  return true
}

const PIPE_VISUAL = {
  straight: ['│', '─', '│', '─'],
  corner: ['└', '┌', '┐', '┘'],
  tee: ['├', '┬', '┤', '┴'],
  cross: ['┼', '┼', '┼', '┼'],
}

const PIPE_COLORS = ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800']

export default function PipeConnect({ onWin }) {
  const [level, setLevel] = useState(1)
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(1))
  const [grid, setGrid] = useState(() => puzzle.grid.map(r => r.map(c => ({ ...c }))))
  const [size, setSize] = useState(puzzle.size)
  const [timer, setTimer] = useState(0)
  const [running, setRunning] = useState(true)
  const [won, setWon] = useState(false)
  const [allWon, setAllWon] = useState(false)
  const interval = useRef(null)

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval.current)
  }, [running])

  const rotateCell = (r, c) => {
    if (grid[r][c].locked || won || allWon) return
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })))
    newGrid[r][c].rotation = (newGrid[r][c].rotation + 1) % 4
    setGrid(newGrid)
    if (checkConnected(newGrid, size)) {
      setRunning(false)
      setWon(true)
      if (level >= 5) {
        setAllWon(true)
        if (onWin) onWin({ totalLevels: level, time: timer })
      }
    }
  }

  const nextLevel = () => {
    const nl = level + 1
    const p = generatePuzzle(nl)
    setLevel(nl)
    setPuzzle(p)
    setGrid(p.grid.map(r => r.map(c => ({ ...c }))))
    setSize(p.size)
    setTimer(0)
    setRunning(true)
    setWon(false)
  }

  const restart = () => {
    const p = generatePuzzle(level)
    setPuzzle(p)
    setGrid(p.grid.map(r => r.map(c => ({ ...c }))))
    setSize(p.size)
    setTimer(0)
    setRunning(true)
    setWon(false)
    setAllWon(false)
  }

  const restartAll = () => {
    const p = generatePuzzle(1)
    setLevel(1)
    setPuzzle(p)
    setGrid(p.grid.map(r => r.map(c => ({ ...c }))))
    setSize(p.size)
    setTimer(0)
    setRunning(true)
    setWon(false)
    setAllWon(false)
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const cellSize = Math.max(60, 80 - level * 3)

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-[500px] select-none" style={{ fontFamily: 'sans-serif' }}>
      <div className="flex gap-4 items-center text-sm">
        <span className="text-[#00d4ff] font-bold">Level {level}/5</span>
        <span className="text-white font-mono">⏱ {fmt(timer)}</span>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={restart}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
          Restart
        </motion.button>
      </div>

      <div className="text-white text-xs opacity-60">Click pipes to rotate. Connect start to end!</div>

      <div className="grid gap-1 p-2 rounded-xl" style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)`, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isSource = r === 0 && c === 0
            const isDrain = r === size - 1 && c === size - 1
            const conn = getConnections(cell.shape, cell.rotation)
            const color = isSource ? '#00ff88' : isDrain ? '#ff0044' : PIPE_COLORS[(r * size + c) % PIPE_COLORS.length]
            return (
              <motion.div key={`${r}-${c}`}
                onClick={() => rotateCell(r, c)}
                className="rounded-lg flex items-center justify-center text-3xl font-mono cursor-pointer"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  background: cell.locked ? `${color}22` : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${color}66`,
                  color: color,
                  boxShadow: `0 0 8px ${color}33`,
                }}
                whileHover={!cell.locked ? { scale: 1.08 } : {}}
                whileTap={!cell.locked ? { scale: 0.92 } : {}}>
                <div style={{ transform: `rotate(${cell.rotation * 90}deg)` }}>
                  {isSource ? '🏁' : isDrain ? '🎯' : '🔧'}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {won && !allWon && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-50">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
            className="text-4xl font-bold text-[#00ff88]">🎉 Pipes Connected!</motion.div>
          <div className="text-white text-lg">Level {level} complete! Time: {fmt(timer)}</div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={nextLevel}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#ffee00] text-black font-bold border-none cursor-pointer">
            Next Level →
          </motion.button>
        </motion.div>
      )}

      {allWon && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-50">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
            className="text-5xl font-bold text-[#ffee00]">🏆 All Pipes Mastered!</motion.div>
          <div className="text-white text-lg">Total time: {fmt(timer)}</div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={restartAll}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold border-none cursor-pointer">
            Play Again
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
