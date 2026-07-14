import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800', '#ff0044', '#aa00ff']

function generatePuzzle() {
  const base = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ]
  const shuffled = base.map(r => [...r])
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (Math.random() < 0.5) shuffled[i][j] = 0
    }
  }
  let count = 0
  shuffled.forEach(r => r.forEach(c => { if (c !== 0) count++ }))
  if (count < 6) {
    const ri = Math.floor(Math.random() * 4)
    const ci = Math.floor(Math.random() * 4)
    shuffled[ri][ci] = base[ri][ci]
  }
  return { solution: base, grid: shuffled }
}

export default function SudokuKids({ onWin }) {
  const [puzzle, setPuzzle] = useState(() => generatePuzzle())
  const [grid, setGrid] = useState(() => puzzle.grid.map(r => [...r]))
  const [fixed, setFixed] = useState(() => puzzle.grid.map(r => r.map(c => c !== 0)))
  const [selected, setSelected] = useState(null)
  const [errors, setErrors] = useState([])
  const [timer, setTimer] = useState(0)
  const [running, setRunning] = useState(true)
  const [won, setWon] = useState(false)
  const [hints, setHints] = useState(5)
  const interval = useRef(null)

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval.current)
  }, [running])

  const checkWin = useCallback((g) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return false
      }
    }
    for (let r = 0; r < 4; r++) {
      const row = new Set(g[r])
      if (row.size !== 4) return false
    }
    for (let c = 0; c < 4; c++) {
      const col = new Set([g[0][c], g[1][c], g[2][c], g[3][c]])
      if (col.size !== 4) return false
    }
    for (let br = 0; br < 2; br++) {
      for (let bc = 0; bc < 2; bc++) {
        const box = new Set()
        for (let r = br * 2; r < br * 2 + 2; r++) {
          for (let c = bc * 2; c < bc * 2 + 2; c++) {
            box.add(g[r][c])
          }
        }
        if (box.size !== 4) return false
      }
    }
    return true
  }, [])

  const findErrors = useCallback((g) => {
    const errs = []
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) continue
        const val = g[r][c]
        for (let c2 = 0; c2 < 4; c2++) {
          if (c2 !== c && g[r][c2] === val) errs.push(`${r}-${c}`)
        }
        for (let r2 = 0; r2 < 4; r2++) {
          if (r2 !== r && g[r2][c] === val) errs.push(`${r}-${c}`)
        }
        const br = Math.floor(r / 2) * 2
        const bc = Math.floor(c / 2) * 2
        for (let r2 = br; r2 < br + 2; r2++) {
          for (let c2 = bc; c2 < bc + 2; c2++) {
            if (r2 !== r || c2 !== c) {
              if (g[r2][c2] === val) errs.push(`${r}-${c}`)
            }
          }
        }
      }
    }
    return [...new Set(errs)]
  }, [])

  const handleCell = (r, c) => {
    if (fixed[r][c]) return
    setSelected([r, c])
  }

  const handleInput = (num) => {
    if (!selected) return
    const [r, c] = selected
    if (fixed[r][c]) return
    const newGrid = grid.map(row => [...row])
    newGrid[r][c] = num
    setGrid(newGrid)
    setErrors(findErrors(newGrid))
    if (checkWin(newGrid)) {
      setRunning(false)
      setWon(true)
      if (onWin) onWin({ time: timer, hintsUsed: 5 - hints })
    }
  }

  const useHint = () => {
    if (hints <= 0) return
    const errs = findErrors(grid)
    if (errs.length > 0) {
      setErrors(errs)
      setHints(h => h - 1)
    } else {
      const empty = []
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (grid[r][c] === 0) empty.push([r, c])
        }
      }
      if (empty.length > 0) {
        const [r, c] = empty[Math.floor(Math.random() * empty.length)]
        const newGrid = grid.map(row => [...row])
        newGrid[r][c] = puzzle.solution[r][c]
        setGrid(newGrid)
        setHints(h => h - 1)
        if (checkWin(newGrid)) {
          setRunning(false)
          setWon(true)
          if (onWin) onWin({ time: timer, hintsUsed: 5 - hints + 1 })
        }
      }
    }
  }

  const restart = () => {
    const p = generatePuzzle()
    setPuzzle(p)
    setGrid(p.grid.map(r => [...r]))
    setFixed(p.grid.map(r => r.map(c => c !== 0)))
    setSelected(null)
    setErrors([])
    setTimer(0)
    setRunning(true)
    setWon(false)
    setHints(5)
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-[500px] select-none" style={{ fontFamily: 'sans-serif' }}>
      <div className="flex gap-4 items-center text-sm">
        <span className="text-white font-mono">⏱ {fmt(timer)}</span>
        <span className="text-[#ffee00]">💡 Hints: {hints}</span>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={restart}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
          Restart
        </motion.button>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(4, 70px)' }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isFixed = fixed[r][c]
            const isSelected = selected && selected[0] === r && selected[1] === c
            const isError = errors.includes(`${r}-${c}`)
            const bg = isFixed ? 'rgba(0,212,255,0.25)' : cell !== 0 ? 'rgba(255,0,255,0.15)' : 'rgba(255,255,255,0.05)'
            const borderCol = isError ? '#ff0044' : isSelected ? '#ffee00' : ((Math.floor(r / 2) + Math.floor(c / 2)) % 2 === 0 ? 'rgba(0,212,255,0.4)' : 'rgba(255,0,255,0.3)')
            return (
              <motion.div key={`${r}-${c}`} whileHover={!isFixed ? { scale: 1.05 } : {}}
                onClick={() => handleCell(r, c)}
                className="w-[70px] h-[70px] rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer"
                style={{
                  background: bg,
                  border: `2px solid ${borderCol}`,
                  color: isFixed ? '#00d4ff' : isError ? '#ff0044' : '#fff',
                  boxShadow: isError ? '0 0 10px #ff0044' : isSelected ? '0 0 12px #ffee00' : 'none',
                }}>
                {cell !== 0 ? cell : ''}
              </motion.div>
            )
          })
        )}
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4].map(n => (
          <motion.button key={n} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => handleInput(n)}
            className="w-12 h-12 rounded-lg text-xl font-bold border-none cursor-pointer"
            style={{ background: COLORS[n - 1], color: '#000' }}>
            {n}
          </motion.button>
        ))}
      </div>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={useHint} disabled={hints <= 0}
        className="px-4 py-2 rounded-xl text-white font-bold text-sm border-none cursor-pointer"
        style={{ background: hints > 0 ? 'linear-gradient(to right, #ffee00, #ff8800)' : '#444', opacity: hints > 0 ? 1 : 0.5 }}>
        💡 Show Hint
      </motion.button>

      {won && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-50">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
            className="text-5xl font-bold text-[#ffee00]">🎉 Puzzle Complete!</motion.div>
          <div className="text-white text-lg">Time: {fmt(timer)} | Hints used: {5 - hints}</div>
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
