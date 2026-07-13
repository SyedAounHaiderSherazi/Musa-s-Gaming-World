/* Scroll progress bar */
import { motion, useScroll } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left"
      style={{
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg, #00d4ff, #ff00ff, #00ff88, #ffee00)',
      }}
    />
  )
}
