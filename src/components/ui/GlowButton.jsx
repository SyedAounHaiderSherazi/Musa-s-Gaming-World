/* Reusable glowing button component */
import { motion } from 'framer-motion'

export default function GlowButton({ children, onClick, color = '#00d4ff', size = 'md', className = '', icon, ...props }) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-xl font-bold text-white
        transition-all duration-300 cursor-pointer
        ${sizes[size]} ${className}
      `}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        boxShadow: `0 0 20px ${color}40`,
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 40px ${color}60, 0 0 80px ${color}20`,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon && <span>{icon}</span>}
        {children}
      </span>
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: `linear-gradient(135deg, ${color}00, ${color}40, ${color}00)`,
        }}
        whileHover={{ opacity: 1 }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </motion.button>
  )
}
