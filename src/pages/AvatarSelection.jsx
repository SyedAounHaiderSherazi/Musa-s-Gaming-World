/* Avatar Selection Screen */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { playClick, playSuccess } from '../utils/sounds'

const AVATARS = [
  { id: 'explorer', name: 'Explorer', emoji: '🧭', color: '#00d4ff', desc: 'Brave adventurer seeking new worlds!' },
  { id: 'ninja', name: 'Ninja', emoji: '🥷', color: '#ff0044', desc: 'Silent and deadly with epic moves!' },
  { id: 'robot', name: 'Robot', emoji: '🤖', color: '#00ff88', desc: 'Powered up and ready to roll!' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', color: '#aa00ff', desc: 'Master of magical spells!' },
  { id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️', color: '#ff8800', desc: 'Sailing the seven seas!' },
  { id: 'astronaut', name: 'Astronaut', emoji: '👨‍🚀', color: '#ffee00', desc: 'Exploring the cosmos!' },
]

export default function AvatarSelection({ onComplete }) {
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const { player, setPlayer } = useGame()

  const handleSelect = () => {
    if (!selected) return
    playSuccess()
    setPlayer(prev => ({ ...prev, avatar: selected }))
    localStorage.setItem('musa-avatar-selected', 'true')
    onComplete()
  }

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 50%, #0a1a3e 100%)',
      }}
      exit={{ opacity: 0 }}
    >
      {/* Floating decorations */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-lg opacity-10"
          style={{
            width: 10 + Math.random() * 30,
            height: 10 + Math.random() * 30,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: AVATARS[i % 6].color,
          }}
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      <motion.h1
        className="text-3xl md:text-5xl font-bold mb-2 text-center"
        style={{ fontFamily: "'Fredoka One', cursive" }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-gradient">Choose Your Character!</span>
      </motion.h1>
      <motion.p
        className="text-white/60 mb-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Pick an avatar to begin your adventure
      </motion.p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mb-8">
        {AVATARS.map((avatar, i) => (
          <motion.div
            key={avatar.id}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 * i, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.08, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClick(); setSelected(avatar.id) }}
            onMouseEnter={() => setHovered(avatar.id)}
            onMouseLeave={() => setHovered(null)}
            className={`
              relative rounded-2xl p-5 cursor-pointer text-center transition-all duration-300 backdrop-blur-xl border-2
              ${selected === avatar.id
                ? 'border-white shadow-lg'
                : 'border-transparent hover:border-white/30'
              }
            `}
            style={{
              background: selected === avatar.id
                ? `linear-gradient(135deg, ${avatar.color}30, ${avatar.color}10)`
                : 'rgba(255,255,255,0.05)',
              boxShadow: selected === avatar.id ? `0 0 30px ${avatar.color}40` : 'none',
            }}
          >
            <motion.div
              className="text-5xl mb-2"
              animate={
                hovered === avatar.id || selected === avatar.id
                  ? { y: [0, -8, 0], rotate: [0, -5, 5, 0] }
                  : {}
              }
              transition={{ duration: 1, repeat: Infinity }}
            >
              {avatar.emoji}
            </motion.div>
            <h3 className="text-white font-bold text-lg">{avatar.name}</h3>
            <p className="text-white/50 text-xs mt-1">{avatar.desc}</p>
            {selected === avatar.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#00ff88] flex items-center justify-center text-sm font-bold text-black"
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: selected ? 1 : 0.3, y: 0 }}
        whileHover={selected ? { scale: 1.05 } : {}}
        whileTap={selected ? { scale: 0.95 } : {}}
        onClick={handleSelect}
        disabled={!selected}
        className="px-10 py-4 rounded-2xl font-bold text-lg text-white cursor-pointer border-none"
        style={{
          background: selected
            ? `linear-gradient(135deg, ${AVATARS.find(a => a.id === selected)?.color || '#00d4ff'}, #ff00ff)`
            : 'rgba(255,255,255,0.1)',
          boxShadow: selected ? '0 0 40px rgba(0,212,255,0.3)' : 'none',
        }}
      >
        🚀 Start Adventure!
      </motion.button>
    </motion.div>
  )
}
