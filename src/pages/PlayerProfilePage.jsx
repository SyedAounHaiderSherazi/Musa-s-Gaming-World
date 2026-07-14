/* Player Profile Page - Full video game style profile */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { ACHIEVEMENTS, getRarityColor, getRarityGlow } from '../utils/achievements'
import GlassPanel from '../components/ui/GlassPanel'
import MusaAvatar from '../components/ui/MusaAvatar'

const TITLES = [
  { minLevel: 1, title: 'Newcomer', color: '#aaaaaa' },
  { minLevel: 3, title: 'Apprentice', color: '#0088ff' },
  { minLevel: 5, title: 'Pro Gamer', color: '#00ff88' },
  { minLevel: 8, title: 'Elite Player', color: '#aa00ff' },
  { minLevel: 10, title: 'Game Master', color: '#ffee00' },
  { minLevel: 15, title: 'Legendary Champion', color: '#ff8800' },
  { minLevel: 20, title: 'Mythic Legend', color: '#ff0044' },
]

const GAME_NAMES = {
  snake: 'Snake', memory: 'Memory Game', tictactoe: 'Tic Tac Toe',
  whack: 'Whack-a-Mole', rps: 'Rock Paper Scissors', click: 'Click Speed',
  flappy: 'Flappy Bird', number: 'Number Guessing',
  'endless-runner': 'Endless Runner', 'cartoon-racing': 'Cartoon Car Racing',
  'hoverboard-race': 'Hoverboard Race', 'obstacle-runner': 'Obstacle Runner',
  'ninja-slash': 'Ninja Slash', 'zombie-survival': 'Zombie Survival',
  'space-shooter': 'Space Shooter', 'sword-duel': 'Sword Duel',
  'lightning-dodge': 'Lightning Dodge', 'lava-escape': 'Lava Escape',
  'castle-defense': 'Castle Defense', 'cannon-defender': 'Cannon Defender',
  'archer-challenge': 'Archer Challenge', 'alien-invaders': 'Alien Invaders',
  'robot-battle': 'Robot Battle', 'ninja-battle': 'Ninja Battle',
  'monster-battle': 'Monster Battle', 'hero-arena': 'Hero Arena',
  'robot-boxing': 'Robot Boxing', 'wizard-duel': 'Wizard Duel',
  'maze-escape': 'Maze Escape', 'dungeon-explorer': 'Dungeon Explorer',
  'parkour': 'Parkour Challenge', 'treasure-hunter': 'Treasure Hunter',
  'platform-jumper': 'Platform Jumper', 'coin-collector': 'Coin Collector',
  'game2048': '2048', 'match3': 'Match-3 Puzzle', 'color-sort': 'Color Sort',
  'sliding': 'Sliding Puzzle', 'pipe': 'Pipe Connect', 'sudoku': 'Sudoku',
  'bubble': 'Bubble Shooter', 'brick': 'Breakout', 'fruit': 'Fruit Slice',
  'pinball': 'Pinball', 'stack': 'Stack Tower',
  'connect4': 'Connect Four', 'checkers': 'Checkers', 'battleship': 'Battleship',
  'air-hockey': 'Air Hockey', 'pong': 'Pong',
}

function getUnlockedTitle(level) {
  let result = TITLES[0]
  for (const t of TITLES) {
    if (level >= t.minLevel) result = t
  }
  return result
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function PlayerProfilePage() {
  const { player, level, xp, coins, achievements, gamesPlayed, dailyStreak, highScores, completedGames, wheelSpins, xpForCurrentLevel, xpForNextLevel } = useGame()
  const [galleryImages] = useState([
    '/images/musa/1.jpeg',
    '/images/musa/2.jpeg',
    '/images/musa/3.jpeg',
    '/images/musa/4.jpeg',
    '/images/musa/5.jpeg',
    '/images/musa/7.jpeg',
  ])
  const [imgErrors, setImgErrors] = useState({})

  const unlocked = achievements || player?.achievements || []
  const title = getUnlockedTitle(level || player?.level || 1)
  const xpPercent = xpForNextLevel ? ((xpForCurrentLevel || 0) / xpForNextLevel) * 100 : 0

  const handleImgError = (idx) => setImgErrors(prev => ({ ...prev, [idx]: true }))

  const stats = [
    { label: 'Total XP', value: xp || player?.xp || 0, icon: '⭐', color: '#00ff88' },
    { label: 'Coins', value: coins || player?.coins || 0, icon: '🪙', color: '#ffee00' },
    { label: 'Games Played', value: gamesPlayed || player?.gamesPlayed || 0, icon: '🎮', color: '#00d4ff' },
    { label: 'Achievements', value: unlocked.length, icon: '🏆', color: '#ff00ff' },
    { label: 'Daily Streak', value: dailyStreak || player?.dailyStreak || 0, icon: '🔥', color: '#ff8800' },
    { label: 'Drawings Saved', value: player?.drawingsSaved || 0, icon: '🎨', color: '#aa00ff' },
    { label: 'Wheel Spins', value: wheelSpins || 0, icon: '🎰', color: '#ff0044' },
    { label: 'Total Clicks', value: player?.totalClicks || 0, icon: '🖱️', color: '#0088ff' },
  ]

  const favoriteGames = (player?.favoriteGames || []).map(id => ({
    id,
    name: GAME_NAMES[id] || id,
  }))

  const highScoreEntries = Object.entries(highScores || {}).filter(([, v]) => v > 0).slice(0, 8)

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Hero Banner */}
        <motion.div
          className="relative rounded-3xl overflow-hidden mb-10"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(255,0,255,0.1) 50%, rgba(0,255,136,0.1) 100%)',
            border: '1px solid rgba(0,212,255,0.2)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-20"
                style={{
                  width: 60 + Math.random() * 80,
                  height: 60 + Math.random() * 80,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00'][i % 4],
                  filter: 'blur(30px)',
                }}
                animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center py-10 px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <MusaAvatar src="/images/musa/avatar.jpeg" size={160} glowing ring />
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold mt-6 mb-2"
              style={{ fontFamily: "'Fredoka One', cursive" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-gradient">Syed Musa Hassan</span>
            </motion.h1>

            <motion.p
              className="text-lg font-bold mb-4"
              style={{ color: title.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {title.title}
            </motion.p>

            {/* Level badge + XP */}
            <motion.div
              className="flex items-center gap-4 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,255,136,0.3)] bg-[rgba(0,255,136,0.1)]">
                <span className="text-lg">⭐</span>
                <span className="text-[#00ff88] font-bold text-sm">Level {level || player?.level || 1}</span>
              </div>
              <span className="text-white/40 text-sm">{xpForCurrentLevel || 0}/{xpForNextLevel || 100} XP</span>
            </motion.div>

            <motion.div
              className="w-64 h-3 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #00ff88, #00d4ff, #ff00ff)' }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-10">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-6" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Player Stats</span>
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <GlassPanel className="text-center" hover glow={i < 4}>
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value.toLocaleString()}</div>
                  <div className="text-white/40 text-sm mt-1">{stat.label}</div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements Showcase */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-2" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Achievements</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/50 text-center text-sm mb-6">
            {unlocked.length}/{ACHIEVEMENTS.length} badges collected
          </motion.p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = unlocked.includes(ach.id)
              return (
                <motion.div
                  key={ach.id}
                  variants={fadeUp}
                  whileHover={{ scale: 1.08, y: -4 }}
                >
                  <div
                    className={`rounded-xl p-3 text-center backdrop-blur-xl border transition-all duration-300 h-full ${
                      isUnlocked
                        ? 'bg-[rgba(10,10,46,0.7)] border-[rgba(0,212,255,0.25)]'
                        : 'bg-[rgba(10,10,46,0.4)] border-[rgba(255,255,255,0.05)] opacity-40'
                    }`}
                    style={isUnlocked ? { boxShadow: getRarityGlow(ach.rarity) } : {}}
                  >
                    <div className="text-3xl mb-1">{isUnlocked ? ach.icon : '🔒'}</div>
                    <h4 className="text-white text-xs font-bold mb-0.5 leading-tight">{ach.name}</h4>
                    <p className="text-white/30 text-[10px] leading-tight mb-1.5">{ach.description}</p>
                    <span
                      className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold border"
                      style={{
                        color: getRarityColor(ach.rarity),
                        borderColor: getRarityColor(ach.rarity) + '40',
                        background: getRarityColor(ach.rarity) + '15',
                      }}
                    >
                      {ach.rarity}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Favorite Games */}
        {favoriteGames.length > 0 && (
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
            <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-6" style={{ fontFamily: "'Fredoka One', cursive" }}>
              <span className="text-gradient">Favorite Games</span>
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-3">
              {favoriteGames.map((game, i) => (
                <motion.div key={game.id} variants={fadeUp} whileHover={{ scale: 1.08, y: -3 }}>
                  <GlassPanel className="px-5 py-3 text-center" glow>
                    <div className="text-2xl mb-1">🎮</div>
                    <span className="text-white font-bold text-sm">{game.name}</span>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Game Progress */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-6" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Game Progress</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* High Scores */}
            <motion.div variants={fadeUp}>
              <GlassPanel className="h-full">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span>🏆</span> High Scores
                </h3>
                {highScoreEntries.length > 0 ? (
                  <div className="space-y-2">
                    {highScoreEntries.map(([gameId, score], i) => (
                      <div key={gameId} className="flex items-center justify-between bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2">
                        <span className="text-white/70 text-sm">{GAME_NAMES[gameId] || gameId}</span>
                        <span className="text-[#ffee00] font-bold text-sm">{score.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-sm text-center py-4">No high scores yet. Start playing!</p>
                )}
              </GlassPanel>
            </motion.div>

            {/* Completed Games */}
            <motion.div variants={fadeUp}>
              <GlassPanel className="h-full">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span>✅</span> Completed Games
                </h3>
                <div className="text-center py-4">
                  <motion.div
                    className="text-5xl font-bold text-[#00ff88] mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  >
                    {(completedGames || []).length}
                  </motion.div>
                  <p className="text-white/40 text-sm">games completed</p>
                </div>
                {(completedGames || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {completedGames.slice(0, 10).map(gameId => (
                      <span key={gameId} className="px-2 py-1 rounded-full bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] text-[#00ff88] text-xs font-bold">
                        {GAME_NAMES[gameId] || gameId}
                      </span>
                    ))}
                    {completedGames.length > 10 && (
                      <span className="px-2 py-1 rounded-full bg-[rgba(255,255,255,0.05)] text-white/40 text-xs">
                        +{completedGames.length - 10} more
                      </span>
                    )}
                  </div>
                )}
              </GlassPanel>
            </motion.div>
          </div>
        </motion.div>

        {/* Gallery Preview */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-6" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Gallery Preview</span>
          </motion.h2>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {galleryImages.map((src, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <GlassPanel className="p-2 overflow-hidden">
                  <div className="aspect-square rounded-xl overflow-hidden bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                    {!imgErrors[i] ? (
                      <img
                        src={src}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImgError(i)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[rgba(0,212,255,0.2)] to-[rgba(255,0,255,0.2)] flex items-center justify-center">
                        <span className="text-4xl">{['🏔️', '🚀', '🌊'][i]}</span>
                      </div>
                    )}
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Favorite Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassPanel className="max-w-2xl mx-auto text-center" hover={false} glow>
            <div className="text-4xl mb-3">💬</div>
            <blockquote className="text-white/80 text-lg italic leading-relaxed" style={{ fontFamily: "'Fredoka One', cursive" }}>
              "Gaming is not just a hobby, it's an adventure!"
            </blockquote>
            <div className="mt-3 flex items-center justify-center gap-2">
              <MusaAvatar src="/images/musa/avatar.jpeg" size={24} />
              <span className="text-white/40 text-sm font-bold">Syed Musa Hassan</span>
            </div>
          </GlassPanel>
        </motion.div>

      </div>
    </div>
  )
}
