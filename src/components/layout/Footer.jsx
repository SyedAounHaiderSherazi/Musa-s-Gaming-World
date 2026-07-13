/* Footer component */
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="relative z-10 text-center py-8 mt-12"
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent mb-6" />
        <motion.p
          className="text-white/50 text-sm"
          whileHover={{ color: '#ff00ff' }}
        >
          Made with <span className="text-[#ff0044]">❤️</span> by Your Awesome Cousin for{' '}
          <span className="text-gradient font-bold">Syed Musa Hassan</span>
        </motion.p>
        <p className="text-white/30 text-xs mt-2">
          🏫 Beaconhouse School | 🎮 Gaming World v1.0
        </p>
        <div className="flex justify-center gap-4 mt-4">
          {['🎮', '🎲', '🎯', '🏆', '⭐'].map((icon, i) => (
            <motion.span
              key={i}
              className="text-xl opacity-50"
              whileHover={{ scale: 1.3, opacity: 1 }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              {icon}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.footer>
  )
}
