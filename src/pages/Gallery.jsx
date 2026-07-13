/* Gallery Page with lightbox */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassPanel from '../components/ui/GlassPanel'
import { playClick } from '../utils/sounds'

const GALLERY_ITEMS = [
  { id: 1, title: 'Epic Landscape', emoji: '🏔️', color: '#00d4ff', desc: 'Mountain adventure awaits!' },
  { id: 2, title: 'Space Explorer', emoji: '🚀', color: '#aa00ff', desc: 'Blast off to the stars!' },
  { id: 3, title: 'Ocean World', emoji: '🌊', color: '#0088ff', desc: 'Dive deep into the blue!' },
  { id: 4, title: 'Forest Adventure', emoji: '🌲', color: '#00ff88', desc: 'Explore the green wilderness!' },
  { id: 5, title: 'Desert Quest', emoji: '🏜️', color: '#ff8800', desc: 'Sand dunes and hidden treasure!' },
  { id: 6, title: 'Winter Wonderland', emoji: '❄️', color: '#00d4ff', desc: 'Snow-capped magical world!' },
  { id: 7, title: 'Neon City', emoji: '🌆', color: '#ff00ff', desc: 'Cyberpunk vibes!' },
  { id: 8, title: 'Crystal Cave', emoji: '💎', color: '#aa00ff', desc: 'Sparkling gems everywhere!' },
  { id: 9, title: 'Volcano Island', emoji: '🌋', color: '#ff0044', desc: 'Hot and adventurous!' },
  { id: 10, title: 'Cloud Kingdom', emoji: '☁️', color: '#ffee00', desc: 'Above the clouds!' },
  { id: 11, title: 'Candy Land', emoji: '🍭', color: '#ff00ff', desc: 'Sweet dreams are made of this!' },
  { id: 12, title: 'Robot Factory', emoji: '🤖', color: '#00d4ff', desc: 'Build your own robot army!' },
]

export default function Gallery() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="text-6xl mb-4 inline-block"
            animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>📸</motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Gallery</span>
          </h1>
          <p className="text-white/60 text-lg">A collection of awesome worlds!</p>
        </motion.div>

        {/* Masonry-ish Grid */}
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="break-inside-avoid">
              <GlassPanel className="cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.03, y: -3 }}
                onClick={() => { playClick(); setSelected(item) }}>
                <div className="w-full rounded-xl flex items-center justify-center mb-3 relative overflow-hidden"
                  style={{
                    height: 120 + (i % 3) * 40,
                    background: `linear-gradient(135deg, ${item.color}25, ${item.color}10)`,
                  }}>
                  <motion.span className="text-5xl"
                    whileHover={{ scale: 1.3, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}>
                    {item.emoji}
                  </motion.span>
                </div>
                <h3 className="text-white font-bold text-sm">{item.title}</h3>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
              onClick={() => setSelected(null)}>
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-[rgba(10,10,46,0.95)] rounded-3xl p-8 max-w-md w-full text-center border border-[rgba(0,212,255,0.2)]"
                onClick={e => e.stopPropagation()}>
                <motion.div className="text-8xl mb-4"
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}>
                  {selected.emoji}
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">{selected.title}</h2>
                <p className="text-white/60 mb-4">{selected.desc}</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { playClick(); setSelected(null) }}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold border-none cursor-pointer">
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
