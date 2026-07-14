/* MusaAvatar - Reusable profile image with graceful fallback */
import { useState } from 'react'
import { motion } from 'framer-motion'

const FALLBACK_GRADIENTS = [
  'from-[#00d4ff] to-[#ff00ff]',
  'from-[#ff00ff] to-[#aa00ff]',
  'from-[#00ff88] to-[#00d4ff]',
  'from-[#ffee00] to-[#ff8800]',
]

export default function MusaAvatar({
  src,
  alt = 'Syed Musa Hassan',
  size = 48,
  className = '',
  glowing = false,
  floating = false,
  pulsing = false,
  ring = false,
  ringColor = '#00d4ff',
  onClick,
  gradientIndex = 0,
}) {
  const [imgFailed, setImgFailed] = useState(false)

  const sizeClass = {
    24: 'w-6 h-6 text-xs',
    32: 'w-8 h-8 text-sm',
    40: 'w-10 h-10 text-base',
    48: 'w-12 h-12 text-lg',
    56: 'w-14 h-14 text-xl',
    64: 'w-16 h-16 text-2xl',
    80: 'w-20 h-20 text-3xl',
    96: 'w-24 h-24 text-4xl',
    128: 'w-32 h-32 text-5xl',
    160: 'w-40 h-40 text-6xl',
  }[size] || `w-12 h-12 text-lg`

  const fallbackGradient = FALLBACK_GRADIENTS[gradientIndex % FALLBACK_GRADIENTS.length]

  const animationProps = {}
  if (floating) {
    animationProps.animate = { y: [0, -6, 0] }
    animationProps.transition = { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
  if (pulsing) {
    animationProps.animate = {
      ...(animationProps.animate || {}),
      boxShadow: [
        `0 0 20px ${ringColor}40`,
        `0 0 40px ${ringColor}80`,
        `0 0 20px ${ringColor}40`,
      ],
    }
    animationProps.transition = { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      {...animationProps}
    >
      {/* Glow ring */}
      {glowing && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `conic-gradient(from 0deg, ${ringColor}, #ff00ff, #00ff88, ${ringColor})`,
            filter: 'blur(6px)',
            opacity: 0.5,
          }}
        />
      )}

      {/* Neon ring border */}
      {ring && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `3px solid ${ringColor}`,
            boxShadow: `0 0 15px ${ringColor}60, inset 0 0 15px ${ringColor}20`,
          }}
        />
      )}

      {/* Image or fallback */}
      <div className={`relative w-full h-full rounded-full overflow-hidden ${ring ? 'border-2 border-white/20' : ''}`}>
        {imgFailed || !src ? (
          <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}>
            <span style={{ fontSize: size * 0.4 }}>😎</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
    </motion.div>
  )
}
