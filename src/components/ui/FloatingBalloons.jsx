/* Floating balloons decoration */
import { motion } from 'framer-motion'
import { useMemo } from 'react'

export default function FloatingBalloons() {
  const balloons = useMemo(() => {
    const colors = ['#ff0044', '#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800', '#aa00ff']
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${10 + Math.random() * 80}%`,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
      size: 20 + Math.random() * 15,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {balloons.map(b => (
        <motion.div
          key={b.id}
          className="absolute bottom-0"
          style={{ left: b.left }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(b.id) * 50, 0],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: 'linear',
          }}
        >
          <div
            className="rounded-full opacity-30"
            style={{
              width: b.size,
              height: b.size * 1.3,
              background: `radial-gradient(circle at 30% 30%, ${b.color}cc, ${b.color})`,
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
