/* Memory Card Matching Game */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const EMOJIS = ['🎮', '🎲', '🎯', '🏆', '⭐', '🎨', '🧩', '🎵', '💎', '🔥']

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function createCards(pairCount = 6) {
  const selected = EMOJIS.slice(0, pairCount)
  const pairs = [...selected, ...selected]
  return shuffleArray(pairs).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
}

export default function MemoryGame({ onWin }) {
  const [cards, setCards] = useState(() => createCards(6))
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [timer, setTimer] = useState(0)
  const [allMatched, setAllMatched] = useState(false)
  const winFiredRef = useRef(false)

  useEffect(() => {
    if (won) return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [won])

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, matched: true } : c
          ))
          setFlipped([])
        }, 500)
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
      setMoves(m => m + 1)
    }
  }, [flipped, cards])

  useEffect(() => {
    if (!won && cards.length > 0 && cards.every(c => c.matched)) {
      setWon(true)
      setAllMatched(true)
      if (!winFiredRef.current) {
        winFiredRef.current = true
        if (onWin) onWin()
      }
    }
  }, [cards, won, onWin])

  const handleClick = (i) => {
    if (flipped.length >= 2 || cards[i].flipped || cards[i].matched || flipped.includes(i)) return
    setCards(prev => prev.map((c, idx) => idx === i ? { ...c, flipped: true } : c))
    setFlipped(prev => [...prev, i])
  }

  const reset = () => {
    setCards(createCards(6))
    setFlipped([])
    setMoves(0)
    setWon(false)
    setTimer(0)
    winFiredRef.current = false
  }

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-4 text-sm">
        <span className="text-[#00d4ff]">⏱️ {timer}s</span>
        <span className="text-[#ff00ff]">🔄 {moves} moves</span>
        <span className="text-[#00ff88]">✅ {cards.filter(c => c.matched).length / 2}/6</span>
      </div>

      {won && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-[#00ff88] font-bold text-xl mb-4"
        >
          🎉 You found them all in {moves} moves and {timer}s!
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-3 max-w-[320px] mx-auto mb-4">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            whileHover={!card.matched && !flipped.includes(i) ? { scale: 1.05 } : {}}
            whileTap={!card.matched ? { scale: 0.95 } : {}}
            onClick={() => handleClick(i)}
            className="aspect-square rounded-xl text-2xl cursor-pointer border-none flex items-center justify-center"
            style={{
              background: card.matched
                ? 'rgba(0,255,136,0.15)'
                : flipped.includes(i)
                  ? 'rgba(0,212,255,0.2)'
                  : 'rgba(255,255,255,0.08)',
              border: `2px solid ${card.matched ? 'rgba(0,255,136,0.3)' : flipped.includes(i) ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <motion.span
              initial={false}
              animate={{
                rotateY: card.flipped || card.matched ? 180 : 0,
                scale: card.matched ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{ display: 'inline-block' }}
            >
              {card.flipped || card.matched ? card.emoji : '❓'}
            </motion.span>
          </motion.button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={reset}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer"
      >
        🔄 New Game
      </motion.button>
    </div>
  )
}
