/* Roblox Corner Page */
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import GlassPanel from '../components/ui/GlassPanel'

const ROBLOX_GAMES = [
  { id: 'brookhaven', name: 'Brookhaven', icon: '🏘️', desc: 'Live your dream life in this amazing roleplay world! Build houses, drive cars, and explore the town.', rating: 5, players: '100K+', genre: 'Roleplay' },
  { id: 'bloxfruits', name: 'Blox Fruits', icon: '⚔️', desc: 'Become a powerful warrior! Find mystical fruits, master combat skills, and become the strongest fighter!', rating: 5, players: '80K+', genre: 'Adventure' },
  { id: 'adoptme', name: 'Adopt Me', icon: '🐾', desc: 'Adopt and raise adorable pets! Trade with friends, decorate your home, and go on exciting adventures!', rating: 4, players: '60K+', genre: 'Simulation' },
  { id: 'bedwars', name: 'BedWars', icon: '🛏️', desc: 'Defend your bed and destroy others! Build bridges, collect resources, and outsmart your opponents!', rating: 5, players: '50K+', genre: 'Strategy' },
  { id: 'bladeball', name: 'Blade Ball', icon: '⚔️', desc: 'Dodge and deflect the deadly ball! Use abilities and timing to be the last one standing!', rating: 4, players: '40K+', genre: 'Action' },
  { id: 'doors', name: 'DOORS', icon: '🚪', desc: 'Survive 100 rooms of terror! Solve puzzles, hide from monsters, and escape the haunted hotel!', rating: 5, players: '30K+', genre: 'Horror' },
]

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'text-[#ffee00]' : 'text-white/20'}>⭐</span>
      ))}
    </div>
  )
}

export default function RobloxCorner() {
  const { toggleFavoriteGame, player, addXP, addCoins } = useGame()
  const favorites = player?.favoriteGames || []

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
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⭐
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Roblox Favorites</span>
          </h1>
          <p className="text-white/60 text-lg">Musa's top picks from the Roblox universe!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROBLOX_GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <GlassPanel
                className="h-full"
                whileHover={{ scale: 1.03, y: -5, boxShadow: '0 0 40px rgba(255,136,0,0.15)' }}
              >
                {/* Game Thumbnail Placeholder */}
                <div
                  className="w-full h-40 rounded-xl mb-4 flex items-center justify-center text-6xl relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${['#00d4ff20', '#ff00ff20', '#00ff8820', '#ff880020', '#aa00ff20', '#ff004420'][i]}, ${['#ff00ff20', '#00ff8820', '#ff880020', '#00d4ff20', '#ffee0020', '#00d4ff20'][i]})`,
                  }}
                >
                  <motion.span
                    animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {game.icon}
                  </motion.span>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(0,0,0,0.4)] text-white">
                    {game.genre}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{game.name}</h3>
                <StarRating rating={game.rating} />
                <p className="text-white/50 text-sm mt-2 mb-3 leading-relaxed">{game.desc}</p>

                <div className="flex items-center justify-between">
                  <span className="text-[#00ff88] text-xs font-bold">🟢 {game.players} playing</span>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      toggleFavoriteGame(game.id)
                      addXP(5)
                      addCoins(3)
                    }}
                    className="text-2xl cursor-pointer bg-transparent border-none"
                    style={{ filter: favorites.includes(game.id) ? 'none' : 'grayscale(0.8)' }}
                  >
                    {favorites.includes(game.id) ? '❤️' : '🤍'}
                  </motion.button>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
