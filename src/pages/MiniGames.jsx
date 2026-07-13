/* Mini Games Page - Hub for all games */
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { playClick, playWin } from '../utils/sounds'
import GlassPanel from '../components/ui/GlassPanel'
import TicTacToe from '../components/games/TicTacToe'
import RockPaperScissors from '../components/games/RockPaperScissors'
import MemoryGame from '../components/games/MemoryGame'
import WhackAMole from '../components/games/WhackAMole'
import SnakeGame from '../components/games/SnakeGame'
import FlappyBird from '../components/games/FlappyBird'
import ClickSpeed from '../components/games/ClickSpeed'
import NumberGuessing from '../components/games/NumberGuessing'

const GAMES = [
  { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌', desc: 'Classic X and O', color: '#00d4ff', Component: TicTacToe },
  { id: 'rps', name: 'Rock Paper Scissors', icon: '🪨', desc: 'Beat the computer!', color: '#ff00ff', Component: RockPaperScissors },
  { id: 'memory', name: 'Memory Match', icon: '🧠', desc: 'Find all the pairs', color: '#00ff88', Component: MemoryGame },
  { id: 'whack', name: 'Whack-a-Mole', icon: '🔨', desc: 'Whack the moles!', color: '#ff8800', Component: WhackAMole },
  { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Grow and eat!', color: '#00ff88', Component: SnakeGame },
  { id: 'flappy', name: 'Flappy Bird', icon: '🐤', desc: 'Fly through pipes!', color: '#ffee00', Component: FlappyBird },
  { id: 'click', name: 'Click Speed', icon: '⚡', desc: 'How fast can you click?', color: '#ff0044', Component: ClickSpeed },
  { id: 'guess', name: 'Number Guess', icon: '🔢', desc: 'Guess 1-100', color: '#aa00ff', Component: NumberGuessing },
]

export default function MiniGames() {
  const [selectedGame, setSelectedGame] = useState(null)
  const { addXP, addCoins, incrementGamesPlayed, unlockAchievement } = useGame()
  const winFiredRef = useRef(false)

  const handleWin = useCallback(() => {
    if (winFiredRef.current) return
    winFiredRef.current = true
    playWin()
    addXP(20)
    addCoins(10)
    incrementGamesPlayed()
  }, [addXP, addCoins, incrementGamesPlayed])

  const gameObj = GAMES.find(g => g.id === selectedGame)

  const handleSelectGame = useCallback((gameId) => {
    playClick()
    winFiredRef.current = false
    setSelectedGame(gameId)
    incrementGamesPlayed()
  }, [incrementGamesPlayed])

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-6xl mb-4 inline-block"
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎮
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Mini Games</span>
          </h1>
          <p className="text-white/60 text-lg">Pick a game and start playing!</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedGame && gameObj ? (
            <motion.div
              key={gameObj.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <GlassPanel className="max-w-xl mx-auto mb-8" glow>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{gameObj.icon}</span>
                    <h2 className="text-xl font-bold text-white">{gameObj.name}</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedGame(null)}
                    className="px-4 py-1.5 rounded-lg bg-[rgba(255,255,255,0.1)] text-white/70 text-sm font-bold border border-[rgba(255,255,255,0.2)] cursor-pointer"
                  >
                    ← Back
                  </motion.button>
                </div>
                <gameObj.Component onWin={handleWin} />
              </GlassPanel>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {GAMES.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <GlassPanel
                    className="cursor-pointer text-center h-full"
                    whileHover={{ scale: 1.05, y: -5, boxShadow: `0 0 30px ${game.color}25` }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectGame(game.id)}
                  >
                    <motion.div
                      className="text-5xl mb-3 inline-block"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                    >
                      {game.icon}
                    </motion.div>
                    <h3 className="text-white font-bold text-sm mb-1">{game.name}</h3>
                    <p className="text-white/40 text-xs">{game.desc}</p>
                  </GlassPanel>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
