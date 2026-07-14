/* Fighting Games Hub Page */
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { playClick, playWin } from '../utils/sounds'
import GlassPanel from '../components/ui/GlassPanel'
import MusaAvatar from '../components/ui/MusaAvatar'
import HeroArena from '../components/games/fighting/HeroArena'
import NinjaBattle from '../components/games/fighting/NinjaBattle'
import RobotBoxing from '../components/games/fighting/RobotBoxing'
import MonsterBattle from '../components/games/fighting/MonsterBattle'
import WizardDuel from '../components/games/fighting/WizardDuel'

const FIGHTING_GAMES = [
  { id: 'hero-arena', name: 'Hero Arena', icon: '🦸', desc: 'Block heroes battle it out!', color: '#00d4ff', Component: HeroArena },
  { id: 'ninja-battle', name: 'Ninja Battle', icon: '🥷', desc: 'Shuriken and sword combat!', color: '#ff00ff', Component: NinjaBattle },
  { id: 'robot-boxing', name: 'Robot Boxing', icon: '🤖', desc: 'Mech vs mech showdown!', color: '#ffee00', Component: RobotBoxing },
  { id: 'monster-battle', name: 'Monster Battle', icon: '🐲', desc: 'Friendly monster fights!', color: '#ff8800', Component: MonsterBattle },
  { id: 'wizard-duel', name: 'Wizard Duel', icon: '🧙', desc: 'Epic spell battles!', color: '#aa00ff', Component: WizardDuel },
]

export default function FightingGames() {
  const [selectedGame, setSelectedGame] = useState(null)
  const [gameResult, setGameResult] = useState(null)
  const { addXP, addCoins, incrementGamesPlayed } = useGame()
  const winFiredRef = useRef(false)

  const handleWin = useCallback(() => {
    if (winFiredRef.current) return
    winFiredRef.current = true
    setGameResult('win')
    playWin()
    addXP(30)
    addCoins(15)
  }, [addXP, addCoins])

  const gameObj = FIGHTING_GAMES.find(g => g.id === selectedGame)

  const handleSelectGame = useCallback((gameId) => {
    playClick()
    winFiredRef.current = false
    setGameResult(null)
    setSelectedGame(gameId)
    incrementGamesPlayed()
  }, [incrementGamesPlayed])

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="text-6xl mb-4 inline-block"
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}>
            ⚔️
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient-warm">Fighting Games</span>
          </h1>
          <p className="text-white/60 text-lg">Cartoon battles with no blood or gore!</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedGame && gameObj ? (
            <motion.div key={gameObj.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <GlassPanel className="max-w-2xl mx-auto mb-8 relative overflow-hidden" glow>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MusaAvatar src="/images/musa/avatar.jpeg" size={32} />
                    <span className="text-2xl">{gameObj.icon}</span>
                    <h2 className="text-xl font-bold text-white">{gameObj.name}</h2>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedGame(null)}
                    className="px-4 py-1.5 rounded-lg bg-[rgba(255,255,255,0.1)] text-white/70 text-sm font-bold border border-[rgba(255,255,255,0.2)] cursor-pointer">
                    ← Back
                  </motion.button>
                </div>
                <gameObj.Component onWin={handleWin} />
                <AnimatePresence>
                  {gameResult === 'win' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl z-10">
                      <MusaAvatar src="/images/musa/avatar.jpeg" size={64} glowing ring />
                      <p className="text-2xl font-bold text-white mt-3" style={{ fontFamily: "'Fredoka One', cursive" }}>Victory!</p>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setGameResult(null); setSelectedGame(null) }}
                        className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold cursor-pointer">
                        Fight Again!
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassPanel>
            </motion.div>
          ) : (
            <motion.div key="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {FIGHTING_GAMES.map((game, i) => (
                <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}>
                  <GlassPanel className="cursor-pointer text-center h-full"
                    whileHover={{ scale: 1.05, y: -5, boxShadow: `0 0 30px ${game.color}25` }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectGame(game.id)}>
                    <motion.div className="text-5xl mb-3 inline-block"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}>
                      {game.icon}
                    </motion.div>
                    <h3 className="text-white font-bold text-base mb-1">{game.name}</h3>
                    <p className="text-white/40 text-sm">{game.desc}</p>
                    <motion.div className="h-1 rounded-full mt-3 mx-auto w-12"
                      style={{ background: game.color }} whileHover={{ width: '80%' }} />
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
