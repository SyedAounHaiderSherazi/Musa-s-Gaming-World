import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#ff0044', '#00d4ff', '#00ff88', '#ffee00', '#ff00ff', '#aa00ff', '#ff8800']
const COLOR_NAMES = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Violet', 'Orange']

function generateLevel(level) {
  const numColors = Math.min(3 + level, COLORS.length)
  const ballsPerColor = Math.min(3 + Math.floor(level / 2), 5)
  const totalBalls = numColors * ballsPerColor
  const tubes = []
  for (let i = 0; i < numColors; i++) {
    for (let j = 0; j < ballsPerColor; j++) {
      tubes.push(i)
    }
  }
  for (let i = tubes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tubes[i], tubes[j]] = [tubes[j], tubes[i]]
  }
  const chunkSize = ballsPerColor
  const tubeContents = []
  for (let i = 0; i < tubes.length; i += chunkSize) {
    tubeContents.push(tubes.slice(i, i + chunkSize))
  }
  tubeContents.push([])
  tubeContents.push([])
  return { tubes: tubeContents, numColors, ballsPerColor }
}

function isSolved(state, numColors, ballsPerColor) {
  for (let i = 0; i < numColors; i++) {
    const tube = state[i]
    if (tube.length !== ballsPerColor) return false
    if (!tube.every(b => b === i)) return false
  }
  for (let i = numColors; i < state.length; i++) {
    if (state[i].length !== 0) return false
  }
  return true
}

export default function ColorSort({ onWin }) {
  const [level, setLevel] = useState(1)
  const [init, setInit] = useState(() => generateLevel(1))
  const [state, setState] = useState(() => init.tubes)
  const [selected, setSelected] = useState(null)
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [allWon, setAllWon] = useState(false)

  const checkWin = useCallback((newState) => {
    if (isSolved(newState, init.numColors, init.ballsPerColor)) {
      if (level >= 5) {
        setAllWon(true)
        if (onWin) onWin({ totalLevels: level, moves })
      } else {
        setWon(true)
      }
    }
  }, [init, level, moves, onWin])

  const handleTubeClick = (idx) => {
    if (won || allWon) return
    if (selected === null) {
      if (state[idx].length === 0) return
      setSelected(idx)
    } else {
      if (selected === idx) { setSelected(null); return }
      const fromTube = [...state[selected]]
      const toTube = [...state[idx]]
      const ball = fromTube.pop()
      const canPlace = toTube.length < init.ballsPerColor && (toTube.length === 0 || toTube[toTube.length - 1] === ball)
      if (canPlace) {
        toTube.push(ball)
        const newState = state.map((t, i) => {
          if (i === selected) return fromTube
          if (i === idx) return toTube
          return [...t]
        })
        setState(newState)
        setMoves(m => m + 1)
        checkWin(newState)
      }
      setSelected(null)
    }
  }

  const nextLevel = () => {
    const nl = level + 1
    const newInit = generateLevel(nl)
    setLevel(nl)
    setInit(newInit)
    setState(newInit.tubes)
    setSelected(null)
    setMoves(0)
    setWon(false)
  }

  const restart = () => {
    const newInit = generateLevel(level)
    setInit(newInit)
    setState(newInit.tubes)
    setSelected(null)
    setMoves(0)
    setWon(false)
    setAllWon(false)
  }

  const restartAll = () => {
    const newInit = generateLevel(1)
    setLevel(1)
    setInit(newInit)
    setState(newInit.tubes)
    setSelected(null)
    setMoves(0)
    setWon(false)
    setAllWon(false)
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-[500px] select-none" style={{ fontFamily: 'sans-serif' }}>
      <div className="flex gap-4 items-center text-sm">
        <span className="text-[#00d4ff] font-bold">Level {level}/5</span>
        <span className="text-white font-mono">Moves: <span className="text-[#ffee00]">{moves}</span></span>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={restart}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
          Restart
        </motion.button>
      </div>

      <div className="text-white text-xs opacity-60">Click tube to pick up ball, click another to place</div>

      <div className="flex gap-3 flex-wrap justify-center">
        {state.map((tube, idx) => {
          const isSelected = selected === idx
          const topColor = tube.length > 0 ? COLORS[tube[tube.length - 1]] : null
          return (
            <motion.div key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleTubeClick(idx)}
              className="flex flex-col-reverse items-center rounded-b-xl cursor-pointer"
              style={{
                width: '56px',
                minHeight: `${init.ballsPerColor * 32 + 16}px`,
                background: 'rgba(255,255,255,0.04)',
                border: isSelected ? '2px solid #ffee00' : '2px solid rgba(255,255,255,0.15)',
                borderBottom: 'none',
                boxShadow: isSelected ? '0 0 15px #ffee00' : 'none',
                padding: '8px 4px',
                gap: '4px',
              }}>
              {tube.map((ball, bi) => (
                <motion.div key={bi} layout
                  className="rounded-full"
                  style={{
                    width: '40px',
                    height: '28px',
                    background: COLORS[ball],
                    boxShadow: `0 0 8px ${COLORS[ball]}88`,
                  }} />
              ))}
            </motion.div>
          )
        })}
      </div>

      {won && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-50">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
            className="text-4xl font-bold text-[#00ff88]">🎉 Level {level} Complete!</motion.div>
          <div className="text-white text-lg">Moves: {moves}</div>
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
            className="text-5xl font-bold text-[#ffee00]">🏆 All Levels Complete!</motion.div>
          <div className="text-white text-lg">Total moves: {moves}</div>
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
