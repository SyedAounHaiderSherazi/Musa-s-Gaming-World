/* Back to top rocket button */
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 50 }}
          whileHover={{ scale: 1.2, rotate: -10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#ff00ff] to-[#00d4ff] text-white text-2xl flex items-center justify-center shadow-lg cursor-pointer border-2 border-white/30"
          style={{ boxShadow: '0 0 30px rgba(255,0,255,0.4)' }}
        >
          🚀
        </motion.button>
      )}
    </AnimatePresence>
  )
}
