/* Player Profile Panel */
import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'

const AVATARS = {
  explorer: { emoji: '🧭', name: 'Explorer', color: '#00d4ff' },
  ninja: { emoji: '🥷', name: 'Ninja', color: '#ff0044' },
  robot: { emoji: '🤖', name: 'Robot', color: '#00ff88' },
  wizard: { emoji: '🧙', name: 'Wizard', color: '#aa00ff' },
  pirate: { emoji: '🏴‍☠️', name: 'Pirate', color: '#ff8800' },
  astronaut: { emoji: '👨‍🚀', name: 'Astronaut', color: '#ffee00' },
}

export default function PlayerProfile({ compact = false }) {
  const { level, xp, coins, achievements, dailyStreak, gamesPlayed, player } = useGame()
  const avatar = player?.avatar ? AVATARS[player.avatar] : AVATARS.explorer
  const xpProgress = (xp % 100) / 100

  if (compact) {
    return (
      <motion.div
        className="flex items-center gap-3 bg-[rgba(10,10,46,0.8)] backdrop-blur-xl rounded-full px-4 py-2 border border-[rgba(0,212,255,0.2)]"
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-xl">{avatar?.emoji || '🎮'}</span>
        <div className="flex items-center gap-1">
          <span className="text-[#ffee00] text-sm font-bold">🪙 {coins}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#00ff88] text-sm font-bold">⭐ Lvl {level}</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-[rgba(10,10,46,0.8)] backdrop-blur-xl rounded-2xl p-5 border border-[rgba(0,212,255,0.2)] max-w-xs w-full"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <div className="text-center mb-4">
        <motion.div
          className="text-5xl mb-2 inline-block"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {avatar?.emoji || '🎮'}
        </motion.div>
        <h3 className="text-white font-bold text-lg">{player?.name || 'Player'}</h3>
        <p className="text-[#00d4ff] text-sm">{avatar?.name || 'Explorer'}</p>
      </div>

      {/* Level & XP */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[#00ff88] font-bold">Level {level}</span>
          <span className="text-white/60">{xp % 100}/100 XP</span>
        </div>
        <div className="h-3 bg-[rgba(0,255,136,0.1)] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00ff88, #00d4ff)' }}
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-[rgba(255,238,0,0.1)] rounded-xl p-2">
          <div className="text-xl">🪙</div>
          <div className="text-[#ffee00] font-bold text-sm">{coins}</div>
          <div className="text-white/40 text-xs">Coins</div>
        </div>
        <div className="bg-[rgba(0,212,255,0.1)] rounded-xl p-2">
          <div className="text-xl">🏆</div>
          <div className="text-[#00d4ff] font-bold text-sm">{achievements?.length || 0}</div>
          <div className="text-white/40 text-xs">Badges</div>
        </div>
        <div className="bg-[rgba(255,0,255,0.1)] rounded-xl p-2">
          <div className="text-xl">🎮</div>
          <div className="text-[#ff00ff] font-bold text-sm">{gamesPlayed || 0}</div>
          <div className="text-white/40 text-xs">Games</div>
        </div>
        <div className="bg-[rgba(255,136,0,0.1)] rounded-xl p-2">
          <div className="text-xl">🔥</div>
          <div className="text-[#ff8800] font-bold text-sm">{dailyStreak || 0}</div>
          <div className="text-white/40 text-xs">Streak</div>
        </div>
      </div>
    </motion.div>
  )
}
