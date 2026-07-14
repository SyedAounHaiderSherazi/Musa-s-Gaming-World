import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

function shuffleTiles() {
  const tiles = [...Array(15).keys()].map(i => i + 1).concat(0)
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }
  const inv = tiles.filter((v, i) => v !== 0).reduce((acc, v, i, arr) => {
    return acc + arr.slice(i + 1).filter(x => x < v).length
  }, 0)
  const emptyIdx = tiles.indexOf(0)
  const rowFromBottom = Math.floor(emptyIdx / 4)
  if ((inv + rowFromBottom) % 2 !== 0) {
    [tiles[0], tiles[1]] = [tiles[1], tiles[0]]
  }
  return tiles
}

function isSolvable(tiles) {
  const inv = tiles.filter(v => v !== 0).reduce((acc, v, i, arr) => {
    return acc + arr.slice(i + 1).filter(x => x < v).length
  }, 0)
  const rowFromBottom = Math.floor(tiles.indexOf(0) / 4)
  return (inv + rowFromBottom) % 2 === 0
}

function isWon(tiles) {
  for (let i = 0; i < 15; i++) {
    if (tiles[i] !== i + 1) return false
  }
  return tiles[15] === 0
}

const TILE_COLORS = {
  1: '#00d4ff', 2: '#ff00ff', 3: '#00ff88', 4: '#ffee00',
  5: '#ff8800', 6: '#ff0044', 7: '#aa00ff', 8: '#00d4ff',
  9: '#ff00ff', 10: '#00ff88', 11: '#ffee00', 12: '#ff8800',
  13: '#ff0044', 14: '#aa00ff', 15: '#00d4ff',
}

export default function SlidingPuzzle({ onWin }) {
  const [tiles, setTiles] = useState(() => shuffleTiles())
  const [moves, setMoves] = useState(0)
  const [timer, setTimer] = useState(0)
  const [running, setRunning] = useState(true)
  const [won, setWon] = useState(false)
  const interval = useRef(null)

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval.current)
  }, [running])

  const moveTile = useCallback((idx) => {
    const empty = tiles.indexOf(0)
    const r1 = Math.floor(idx / 4), c1 = idx % 4
    const r2 = Math.floor(empty / 4), c2 = empty % 4
    const adj = (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1
    if (!adj) return
    const newTiles = [...tiles]
    ;[newTiles[idx], newTiles[empty]] = [newTiles[empty], newTiles[idx]]
    setTiles(newTiles)
    setMoves(m => m + 1)
    if (isWon(newTiles)) {
      setRunning(false)
      setWon(true)
      if (onWin) onWin({ moves: moves + 1, time: timer })
    }
  }, [tiles, moves, timer, onWin])

  const restart = () => {
    setTiles(shuffleTiles())
    setMoves(0)
    setTimer(0)
    setRunning(true)
    setWon(false)
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-[500px] select-none" style={{ fontFamily: 'sans-serif' }}>
      <div className="flex gap-4 items-center text-sm">
        <span className="text-white font-mono">⏱ {fmt(timer)}</span>
        <span className="text-[#00ff88]">Moves: {moves}</span>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={restart}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
          Shuffle
        </motion.button>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(4, 80px)' }}>
        {tiles.map((tile, idx) => (
          <motion.div key={idx} layout
            onClick={() => tile !== 0 && moveTile(idx)}
            className="w-[80px] h-[80px] rounded-lg flex items-center justify-center text-xl font-bold"
            style={{
              background: tile === 0 ? 'rgba(255,255,255,0.03)' : `${TILE_COLORS[tile]}22`,
              border: tile === 0 ? '2px solid rgba(255,255,255,0.05)' : `2px solid ${TILE_COLORS[tile]}88`,
              color: tile === 0 ? 'transparent' : TILE_COLORS[tile],
              cursor: tile === 0 ? 'default' : 'pointer',
              boxShadow: tile !== 0 ? `0 0 10px ${TILE_COLORS[tile]}33` : 'none',
            }}
            whileHover={tile !== 0 ? { scale: 1.05 } : {}}
            whileTap={tile !== 0 ? { scale: 0.92 } : {}}>
            {tile !== 0 ? tile : ''}
          </motion.div>
        ))}
      </div>

      {won && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-50">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
            className="text-5xl font-bold text-[#00ff88]">🎉 Solved!</motion.div>
          <div className="text-white text-lg">Moves: {moves} | Time: {fmt(timer)}</div>
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
