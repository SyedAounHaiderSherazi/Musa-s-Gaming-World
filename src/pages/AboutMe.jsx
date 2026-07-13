/* About Me Page */
import { motion } from 'framer-motion'
import GlassPanel from '../components/ui/GlassPanel'

const FUN_FACTS = [
  { icon: '👤', label: 'Name', value: 'Syed Musa Hassan', color: '#00d4ff' },
  { icon: '🎂', label: 'Age', value: '10 Years Old', color: '#ff00ff' },
  { icon: '🎮', label: 'Favorite Game', value: 'Roblox', color: '#00ff88' },
  { icon: '🍕', label: 'Favorite Food', value: 'Pizza & Burgers', color: '#ff8800' },
  { icon: '🎨', label: 'Favorite Color', value: 'Blue & Green', color: '#00d4ff' },
  { icon: '📺', label: 'Favorite YouTubers', value: 'DanTDM, Preston, Typical Gamer', color: '#ff0044' },
  { icon: '🌟', label: 'Dream', value: 'Game Developer & Pro Gamer', color: '#ffee00' },
  { icon: '⚽', label: 'Hobbies', value: 'Gaming, Drawing, Reading', color: '#aa00ff' },
  { icon: '🏫', label: 'School', value: 'Beaconhouse School', color: '#00ff88' },
  { icon: '💻', label: 'Learning', value: 'Web Development', color: '#00d4ff' },
  { icon: '🎵', label: 'Music', value: 'Pop & Game Soundtracks', color: '#ff00ff' },
  { icon: '🐾', label: 'Pet', value: 'Dreams of a Puppy!', color: '#ff8800' },
]

export default function AboutMe() {
  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-7xl mb-4 inline-block"
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            👦
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">About Me</span>
          </h1>
          <p className="text-white/60 text-lg">
            Get to know the awesome kid behind this gaming world!
          </p>
        </motion.div>

        {/* Avatar Card */}
        <motion.div
          className="max-w-md mx-auto mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <GlassPanel className="text-center" glow>
            <motion.div
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
              style={{ background: 'linear-gradient(135deg, #00d4ff30, #ff00ff30)' }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              🧭
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-1">Syed Musa Hassan</h2>
            <p className="text-[#00d4ff] mb-3">Age 10 | Beaconhouse School</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {['🎮 Gamer', '🎨 Artist', '🌟 Dreamer', '💻 Coder'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-bold bg-[rgba(0,212,255,0.15)] text-[#00d4ff] border border-[rgba(0,212,255,0.3)]">
                  {tag}
                </span>
              ))}
            </div>
          </GlassPanel>
        </motion.div>

        {/* Fun Facts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {FUN_FACTS.map((fact, i) => (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring' }}
            >
              <GlassPanel className="text-center h-full" whileHover={{ scale: 1.05, y: -5, boxShadow: `0 0 25px ${fact.color}25` }}>
                <motion.div
                  className="text-4xl mb-2"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {fact.icon}
                </motion.div>
                <h3 className="text-white/50 text-xs uppercase tracking-wider mb-1">{fact.label}</h3>
                <p className="text-white font-bold text-sm">{fact.value}</p>
                <div className="h-0.5 w-8 mx-auto mt-2 rounded-full" style={{ background: fact.color }} />
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Fun Quote */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <GlassPanel className="max-w-lg mx-auto" hover={false}>
            <motion.div
              className="text-4xl mb-3"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💪
            </motion.div>
            <p className="text-white/80 italic text-lg">
              "Dream big, play hard, and never stop exploring!"
            </p>
            <p className="text-white/40 text-sm mt-2">- Musa's Life motto</p>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  )
}
