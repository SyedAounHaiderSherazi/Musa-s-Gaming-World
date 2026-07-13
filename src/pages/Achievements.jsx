/* Achievements Hall Page */
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { ACHIEVEMENTS, getRarityColor } from '../utils/achievements'
import GlassPanel from '../components/ui/GlassPanel'

export default function Achievements() {
  const { player } = useGame()
  const unlocked = player?.achievements || []

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="text-6xl mb-4 inline-block" animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}>🏆</motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Achievement Hall</span>
          </h1>
          <p className="text-white/60 text-lg">
            {unlocked.length}/{ACHIEVEMENTS.length} badges collected
          </p>
          <div className="max-w-xs mx-auto mt-3 h-3 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#ffee00] to-[#ff8800]"
              initial={{ width: 0 }} animate={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }} />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map((achievement, i) => {
            const isUnlocked = unlocked.includes(achievement.id)
            return (
              <motion.div key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}>
                <GlassPanel className={`text-center h-full relative ${isUnlocked ? '' : 'opacity-50'}`}
                  whileHover={{ scale: 1.05, y: -3 }}
                  glow={isUnlocked}>
                  <motion.div className="text-4xl mb-2 inline-block"
                    animate={isUnlocked ? { y: [0, -5, 0], rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}>
                    {isUnlocked ? achievement.icon : '🔒'}
                  </motion.div>
                  <h3 className="text-white font-bold text-sm mb-1">{achievement.name}</h3>
                  <p className="text-white/40 text-xs mb-2">{achievement.description}</p>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    style={{
                      color: getRarityColor(achievement.rarity),
                      borderColor: getRarityColor(achievement.rarity) + '40',
                      background: getRarityColor(achievement.rarity) + '15',
                    }}>
                    {achievement.rarity}
                  </span>
                  {isUnlocked && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center text-[10px] font-bold text-black">
                      ✓
                    </motion.div>
                  )}
                </GlassPanel>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
