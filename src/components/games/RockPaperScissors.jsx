/* Rock Paper Scissors Game */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CHOICES = [
  { name: 'Rock', emoji: '🪨', beats: 'Scissors' },
  { name: 'Paper', emoji: '📄', beats: 'Rock' },
  { name: 'Scissors', emoji: '✂️', beats: 'Paper' },
]

export default function RockPaperScissors({ onWin }) {
  const [playerChoice, setPlayerChoice] = useState(null)
  const [computerChoice, setComputerChoice] = useState(null)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 })

  const play = (choice) => {
    const computer = CHOICES[Math.floor(Math.random() * 3)]
    setPlayerChoice(choice)
    setComputerChoice(computer)

    if (choice.name === computer.name) {
      setResult('draw')
      setScore(s => ({ ...s, draws: s.draws + 1 }))
    } else if (choice.beats === computer.name) {
      setResult('win')
      setScore(s => ({ ...s, wins: s.wins + 1 }))
      if (onWin) onWin()
    } else {
      setResult('lose')
      setScore(s => ({ ...s, losses: s.losses + 1 }))
    }
  }

  return (
    <div className="text-center">
      <div className="flex justify-center gap-4 mb-6 text-sm">
        <span className="text-[#00ff88]">Wins: {score.wins}</span>
        <span className="text-[#ff0044]">Losses: {score.losses}</span>
        <span className="text-[#ffee00]">Draws: {score.draws}</span>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        {CHOICES.map(choice => (
          <motion.button
            key={choice.name}
            whileHover={{ scale: 1.15, y: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => play(choice)}
            className="w-20 h-20 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(0,212,255,0.2)] text-3xl cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <span>{choice.emoji}</span>
            <span className="text-white/50 text-[10px]">{choice.name}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <div className="flex justify-center items-center gap-6 mb-3">
              <div className="text-center">
                <div className="text-4xl mb-1">{playerChoice?.emoji}</div>
                <div className="text-white/50 text-xs">You</div>
              </div>
              <div className="text-2xl text-white/40">VS</div>
              <div className="text-center">
                <div className="text-4xl mb-1">{computerChoice?.emoji}</div>
                <div className="text-white/50 text-xs">Computer</div>
              </div>
            </div>
            <motion.p
              className="font-bold text-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                color: result === 'win' ? '#00ff88' : result === 'lose' ? '#ff0044' : '#ffee00'
              }}
            >
              {result === 'win' ? '🎉 You Win!' : result === 'lose' ? '😢 You Lose!' : '🤝 Draw!'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setPlayerChoice(null); setComputerChoice(null); setResult(null) }}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer"
      >
        🔄 Reset
      </motion.button>
    </div>
  )
}
