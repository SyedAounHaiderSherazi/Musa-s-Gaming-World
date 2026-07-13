/* Reusable glass panel component */
import { motion } from 'framer-motion'

export default function GlassPanel({ children, className = '', dark = true, hover = true, glow = false, ...props }) {
  return (
    <motion.div
      className={`
        rounded-2xl p-6 backdrop-blur-xl border transition-all duration-300
        ${dark
          ? 'bg-[rgba(10,10,46,0.6)] border-[rgba(0,212,255,0.15)]'
          : 'bg-[rgba(255,255,255,0.6)] border-[rgba(100,100,255,0.2)]'
        }
        ${glow ? 'shadow-[0_0_30px_rgba(0,212,255,0.2)]' : ''}
        ${className}
      `}
      whileHover={hover ? {
        scale: 1.02,
        boxShadow: '0 0 40px rgba(0,212,255,0.2)',
        borderColor: 'rgba(0,212,255,0.3)',
      } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
