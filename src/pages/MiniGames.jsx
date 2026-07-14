/* Mini Games Page - Hub for all games with categories */
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { playClick, playWin } from '../utils/sounds'
import GlassPanel from '../components/ui/GlassPanel'
import MusaAvatar from '../components/ui/MusaAvatar'

import TicTacToe from '../components/games/TicTacToe'
import RockPaperScissors from '../components/games/RockPaperScissors'
import MemoryGame from '../components/games/MemoryGame'
import WhackAMole from '../components/games/WhackAMole'
import SnakeGame from '../components/games/SnakeGame'
import FlappyBird from '../components/games/FlappyBird'
import ClickSpeed from '../components/games/ClickSpeed'
import NumberGuessing from '../components/games/NumberGuessing'

import NinjaSlash from '../components/games/action/NinjaSlash'
import ZombieSurvival from '../components/games/action/ZombieSurvival'
import RobotBattle from '../components/games/action/RobotBattle'
import SwordDuel from '../components/games/action/SwordDuel'
import ArcherChallenge from '../components/games/action/ArcherChallenge'
import CannonDefender from '../components/games/action/CannonDefender'
import SpaceShooter from '../components/games/action/SpaceShooter'
import AlienInvaders from '../components/games/action/AlienInvaders'
import CastleDefense from '../components/games/action/CastleDefense'
import LavaEscape from '../components/games/action/LavaEscape'
import VolcanoRun from '../components/games/action/VolcanoRun'
import LightningDodge from '../components/games/action/LightningDodge'

import CoinCollector from '../components/games/adventure/CoinCollector'
import TreasureHunter from '../components/games/adventure/TreasureHunter'
import MazeEscape from '../components/games/adventure/MazeEscape'
import PlatformJumper from '../components/games/adventure/PlatformJumper'
import ParkourChallenge from '../components/games/adventure/ParkourChallenge'
import DungeonExplorer from '../components/games/adventure/DungeonExplorer'

import EndlessRunner from '../components/games/racing/EndlessRunner'
import ObstacleRunner from '../components/games/racing/ObstacleRunner'
import HoverboardRace from '../components/games/racing/HoverboardRace'
import CartoonCarRacing from '../components/games/racing/CartoonCarRacing'

import SudokuKids from '../components/games/puzzle/SudokuKids'
import SlidingPuzzle from '../components/games/puzzle/SlidingPuzzle'
import Game2048 from '../components/games/puzzle/Game2048'
import Match3Puzzle from '../components/games/puzzle/Match3Puzzle'
import ColorSort from '../components/games/puzzle/ColorSort'
import PipeConnect from '../components/games/puzzle/PipeConnect'

import Breakout from '../components/games/arcade/Breakout'
import BubbleShooter from '../components/games/arcade/BubbleShooter'
import FruitSlice from '../components/games/arcade/FruitSlice'
import StackTower from '../components/games/arcade/StackTower'
import Pinball from '../components/games/arcade/Pinball'
import BrickBreaker from '../components/games/arcade/BrickBreaker'

import AirHockey from '../components/games/multiplayer/AirHockey'
import PongGame from '../components/games/multiplayer/PongGame'
import ConnectFour from '../components/games/multiplayer/ConnectFour'
import CheckersGame from '../components/games/multiplayer/CheckersGame'
import Battleship from '../components/games/multiplayer/Battleship'

const CATEGORIES = [
  {
    id: 'classic', name: 'Classic Games', icon: '🎯', color: '#00d4ff',
    games: [
      { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌', desc: 'Classic X and O', color: '#00d4ff', Component: TicTacToe },
      { id: 'rps', name: 'Rock Paper Scissors', icon: '🪨', desc: 'Beat the computer!', color: '#ff00ff', Component: RockPaperScissors },
      { id: 'memory', name: 'Memory Match', icon: '🧠', desc: 'Find all the pairs', color: '#00ff88', Component: MemoryGame },
      { id: 'whack', name: 'Whack-a-Mole', icon: '🔨', desc: 'Whack the moles!', color: '#ff8800', Component: WhackAMole },
      { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Grow and eat!', color: '#00ff88', Component: SnakeGame },
      { id: 'flappy', name: 'Flappy Bird', icon: '🐤', desc: 'Fly through pipes!', color: '#ffee00', Component: FlappyBird },
      { id: 'click', name: 'Click Speed', icon: '⚡', desc: 'How fast can you click?', color: '#ff0044', Component: ClickSpeed },
      { id: 'guess', name: 'Number Guess', icon: '🔢', desc: 'Guess 1-100', color: '#aa00ff', Component: NumberGuessing },
    ],
  },
  {
    id: 'action', name: 'Action Games', icon: '💥', color: '#ff0044',
    games: [
      { id: 'ninja-slash', name: 'Ninja Slash', icon: '🥷', desc: 'Slice objects, dodge bombs!', color: '#ff00ff', Component: NinjaSlash },
      { id: 'zombie', name: 'Zombie Survival', icon: '🧟', desc: 'Survive zombie waves!', color: '#00ff88', Component: ZombieSurvival },
      { id: 'robot-battle', name: 'Robot Battle', icon: '🤖', desc: 'Fight enemy robots!', color: '#00d4ff', Component: RobotBattle },
      { id: 'sword-duel', name: 'Sword Duel', icon: '⚔️', desc: 'Sword fight the AI!', color: '#ff8800', Component: SwordDuel },
      { id: 'archer', name: 'Archer Challenge', icon: '🏹', desc: 'Hit the targets!', color: '#ffee00', Component: ArcherChallenge },
      { id: 'cannon', name: 'Cannon Defender', icon: '💥', desc: 'Defend your castle!', color: '#ff0044', Component: CannonDefender },
      { id: 'space-shooter', name: 'Space Shooter', icon: '👾', desc: 'Blast alien ships!', color: '#aa00ff', Component: SpaceShooter },
      { id: 'alien-invaders', name: 'Alien Invaders', icon: '🚀', desc: 'Classic alien invasion!', color: '#00ff88', Component: AlienInvaders },
      { id: 'castle-defense', name: 'Castle Defense', icon: '🛡️', desc: 'Protect your castle!', color: '#00d4ff', Component: CastleDefense },
      { id: 'lava-escape', name: 'Lava Escape', icon: '🔥', desc: 'Jump above the lava!', color: '#ff8800', Component: LavaEscape },
      { id: 'volcano-run', name: 'Volcano Run', icon: '🌋', desc: 'Run through fire!', color: '#ff0044', Component: VolcanoRun },
      { id: 'lightning-dodge', name: 'Lightning Dodge', icon: '⚡', desc: 'Dodge the bolts!', color: '#ffee00', Component: LightningDodge },
    ],
  },
  {
    id: 'adventure', name: 'Adventure Games', icon: '🗺️', color: '#00ff88',
    games: [
      { id: 'coin-collector', name: 'Coin Collector', icon: '🪙', desc: 'Collect all the coins!', color: '#ffee00', Component: CoinCollector },
      { id: 'treasure-hunter', name: 'Treasure Hunter', icon: '💎', desc: 'Find the treasure!', color: '#00d4ff', Component: TreasureHunter },
      { id: 'maze-escape', name: 'Maze Escape', icon: '🏃', desc: 'Escape the maze!', color: '#ff00ff', Component: MazeEscape },
      { id: 'platform-jumper', name: 'Platform Jumper', icon: '🦘', desc: 'Jump and collect stars!', color: '#00ff88', Component: PlatformJumper },
      { id: 'parkour', name: 'Parkour Challenge', icon: '🏃', desc: 'Run and jump forever!', color: '#ff8800', Component: ParkourChallenge },
      { id: 'dungeon', name: 'Dungeon Explorer', icon: '🏰', desc: 'Explore dark dungeons!', color: '#aa00ff', Component: DungeonExplorer },
    ],
  },
  {
    id: 'racing', name: 'Racing Games', icon: '🏎️', color: '#ff8800',
    games: [
      { id: 'endless-runner', name: 'Endless Runner', icon: '🏃', desc: 'Run as far as you can!', color: '#00ff88', Component: EndlessRunner },
      { id: 'obstacle-runner', name: 'Obstacle Runner', icon: '🚧', desc: 'Dodge everything!', color: '#ff0044', Component: ObstacleRunner },
      { id: 'hoverboard', name: 'Hoverboard Race', icon: '🛹', desc: 'Race on hoverboards!', color: '#00d4ff', Component: HoverboardRace },
      { id: 'car-racing', name: 'Cartoon Car Racing', icon: '🚗', desc: 'Race cartoon cars!', color: '#ffee00', Component: CartoonCarRacing },
    ],
  },
  {
    id: 'puzzle', name: 'Puzzle Games', icon: '🧩', color: '#aa00ff',
    games: [
      { id: 'sudoku', name: 'Sudoku Kids', icon: '🔢', desc: 'Simple number puzzle!', color: '#00d4ff', Component: SudokuKids },
      { id: 'sliding', name: 'Sliding Puzzle', icon: '🔢', desc: 'Slide the tiles!', color: '#ff00ff', Component: SlidingPuzzle },
      { id: '2048', name: '2048', icon: '🔢', desc: 'Merge to 2048!', color: '#ffee00', Component: Game2048 },
      { id: 'match3', name: 'Match-3 Puzzle', icon: '💎', desc: 'Match colored gems!', color: '#ff00ff', Component: Match3Puzzle },
      { id: 'color-sort', name: 'Color Sort', icon: '🎨', desc: 'Sort the colors!', color: '#00ff88', Component: ColorSort },
      { id: 'pipe', name: 'Pipe Connect', icon: '🔧', desc: 'Connect the pipes!', color: '#00d4ff', Component: PipeConnect },
    ],
  },
  {
    id: 'arcade', name: 'Arcade Games', icon: '👾', color: '#ff00ff',
    games: [
      { id: 'breakout', name: 'Breakout', icon: '🧱', desc: 'Break all the bricks!', color: '#00d4ff', Component: Breakout },
      { id: 'bubble', name: 'Bubble Shooter', icon: '🫧', desc: 'Pop matching bubbles!', color: '#ff00ff', Component: BubbleShooter },
      { id: 'fruit-slice', name: 'Fruit Slice', icon: '🍎', desc: 'Slice the fruits!', color: '#ff0044', Component: FruitSlice },
      { id: 'stack', name: 'Stack Tower', icon: '🏗️', desc: 'Stack as high as you can!', color: '#ffee00', Component: StackTower },
      { id: 'pinball', name: 'Pinball', icon: '🎰', desc: 'Bounce the ball!', color: '#aa00ff', Component: Pinball },
      { id: 'brick-breaker', name: 'Brick Breaker', icon: '🧱', desc: 'Break bricks!', color: '#ff8800', Component: BrickBreaker },
    ],
  },
  {
    id: 'multiplayer', name: 'vs AI Games', icon: '🤖', color: '#00d4ff',
    games: [
      { id: 'air-hockey', name: 'Air Hockey', icon: '🏒', desc: 'Score goals!', color: '#00d4ff', Component: AirHockey },
      { id: 'pong', name: 'Pong', icon: '🏓', desc: 'Classic pong game!', color: '#00ff88', Component: PongGame },
      { id: 'connect4', name: 'Connect Four', icon: '🔴', desc: 'Connect 4 in a row!', color: '#ff0044', Component: ConnectFour },
      { id: 'checkers', name: 'Checkers', icon: '⬛', desc: 'Classic board game!', color: '#ff8800', Component: CheckersGame },
      { id: 'battleship', name: 'Battleship', icon: '🚢', desc: 'Sink the ships!', color: '#aa00ff', Component: Battleship },
    ],
  },
]

export default function MiniGames() {
  const [selectedGame, setSelectedGame] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [gameResult, setGameResult] = useState(null)
  const { addXP, addCoins, incrementGamesPlayed, unlockAchievement } = useGame()
  const winFiredRef = useRef(false)

  const allGames = CATEGORIES.flatMap(c => c.games)
  const handleWin = useCallback(() => {
    if (winFiredRef.current) return
    winFiredRef.current = true
    setGameResult('win')
    playWin()
    addXP(20)
    addCoins(10)
  }, [addXP, addCoins])

  const gameObj = selectedGame ? allGames.find(g => g.id === selectedGame) : null

  const handleSelectGame = useCallback((gameId) => {
    playClick()
    winFiredRef.current = false
    setGameResult(null)
    setSelectedGame(gameId)
    incrementGamesPlayed()
  }, [incrementGamesPlayed])

  const currentGames = selectedCategory
    ? CATEGORIES.find(c => c.id === selectedCategory)?.games || []
    : []

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="text-6xl mb-4 inline-block"
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}>
            🎮
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Mini Games</span>
          </h1>
          <p className="text-white/60 text-lg">{allGames.length} games to play!</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedGame && gameObj ? (
            <motion.div key={gameObj.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <GlassPanel className="max-w-xl mx-auto mb-8 relative overflow-hidden" glow>
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
                      <p className="text-2xl font-bold text-white mt-3" style={{ fontFamily: "'Fredoka One', cursive" }}>You Win!</p>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setGameResult(null); setSelectedGame(null) }}
                        className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold cursor-pointer">
                        Play More!
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassPanel>
            </motion.div>
          ) : selectedCategory ? (
            <motion.div key={`cat-${selectedCategory}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.1)] text-white/70 text-sm font-bold border border-[rgba(255,255,255,0.2)] cursor-pointer">
                  ← All Categories
                </motion.button>
                <h2 className="text-xl font-bold text-white">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.icon}{' '}
                  {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentGames.map((game, i) => (
                  <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}>
                    <GlassPanel className="cursor-pointer text-center h-full"
                      whileHover={{ scale: 1.05, y: -5, boxShadow: `0 0 30px ${game.color}25` }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectGame(game.id)}>
                      <motion.div className="text-5xl mb-3 inline-block"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}>
                        {game.icon}
                      </motion.div>
                      <h3 className="text-white font-bold text-sm mb-1">{game.name}</h3>
                      <p className="text-white/40 text-xs">{game.desc}</p>
                    </GlassPanel>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {CATEGORIES.map((cat, i) => (
                  <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}>
                    <GlassPanel className="cursor-pointer text-center h-full"
                      whileHover={{ scale: 1.05, y: -5, boxShadow: `0 0 30px ${cat.color}25` }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { playClick(); setSelectedCategory(cat.id) }}>
                      <motion.div className="text-5xl mb-3 inline-block"
                        animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}>
                        {cat.icon}
                      </motion.div>
                      <h3 className="text-white font-bold text-base mb-1">{cat.name}</h3>
                      <p className="text-white/40 text-xs">{cat.games.length} games</p>
                      <motion.div className="h-1 rounded-full mt-3 mx-auto w-12"
                        style={{ background: cat.color }} whileHover={{ width: '80%' }} />
                    </GlassPanel>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
