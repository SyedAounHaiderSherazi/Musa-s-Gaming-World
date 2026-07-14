/* Musa's Memories Gallery */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassPanel from '../components/ui/GlassPanel'
import { playClick, playSuccess } from '../utils/sounds'

const GALLERY_ITEMS = [
  { src: '/images/musa/1.jpeg', caption: 'Memory 1' },
  { src: '/images/musa/2.jpeg', caption: 'Memory 2' },
  { src: '/images/musa/3.jpeg', caption: 'Memory 3' },
  { src: '/images/musa/4.jpeg', caption: 'Memory 4' },
  { src: '/images/musa/5.jpeg', caption: 'Memory 5' },
  { src: '/images/musa/7.jpeg', caption: 'Memory 7' },
  { src: '/images/musa/8.jpeg', caption: 'Memory 8' },
  { src: '/images/musa/9.jpeg', caption: 'Memory 9' },
  { src: '/images/musa/10.jpeg', caption: 'Memory 10' },
  { src: '/images/musa/11.jpeg', caption: 'Memory 11' },
  { src: '/images/musa/12.jpeg', caption: 'Memory 12' },
  { src: '/images/musa/13.jpeg', caption: 'Memory 13' },
  { src: '/images/musa/14.jpeg', caption: 'Memory 14' },
  { src: '/images/musa/15.jpeg', caption: 'Memory 15' },
  { src: '/images/musa/16.jpeg', caption: 'Memory 16' },
  { src: '/images/musa/17.jpeg', caption: 'Memory 17' },
]

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [failedImages, setFailedImages] = useState(new Set())

  const openLightbox = (i) => { playClick(); setLightboxIndex(i) }
  const closeLightbox = () => setLightboxIndex(null)
  const nextImage = () => setLightboxIndex(prev => (prev + 1) % GALLERY_ITEMS.length)
  const prevImage = () => setLightboxIndex(prev => (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length)

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="text-6xl mb-4 inline-block" animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>📸</motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Musa's Memories</span>
          </h1>
          <p className="text-white/60">Special moments from the gaming world!</p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05, y: -5 }}
              className="cursor-pointer" onClick={() => openLightbox(i)}>
              <GlassPanel className="p-2 overflow-hidden" glow>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[rgba(0,0,0,0.3)]">
                  {failedImages.has(i) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00d4ff20] to-[#ff00ff20]">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-white/40 text-xs">{item.caption}</p>
                      </div>
                    </div>
                  ) : (
                    <img src={item.src} alt={item.caption} className="w-full h-full object-cover"
                      onError={() => setFailedImages(prev => new Set([...prev, i]))} />
                  )}
                </div>
                <p className="text-white/80 text-sm font-bold mt-2 text-center">{item.caption}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div className="fixed inset-0 z-[200] flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={closeLightbox} />
              <div className="relative z-10 max-w-4xl w-full mx-4">
                {/* Close button */}
                <button onClick={closeLightbox} className="absolute -top-12 right-0 text-white/60 text-3xl hover:text-white cursor-pointer bg-transparent border-none">✕</button>
                
                {/* Navigation */}
                <button onClick={prevImage} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white/60 text-4xl hover:text-white cursor-pointer bg-transparent border-none hidden md:block">‹</button>
                <button onClick={nextImage} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white/60 text-4xl hover:text-white cursor-pointer bg-transparent border-none hidden md:block">›</button>

                {/* Image */}
                <motion.div key={lightboxIndex} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}>
                  <div className="rounded-2xl overflow-hidden bg-[rgba(10,10,46,0.9)] border border-[rgba(0,212,255,0.2)]">
                    <div className="aspect-video flex items-center justify-center">
                      {failedImages.has(lightboxIndex) ? (
                        <div className="text-center p-8">
                          <div className="text-6xl mb-4">📷</div>
                          <p className="text-white/60">{GALLERY_ITEMS[lightboxIndex].caption}</p>
                          <p className="text-white/30 text-sm mt-2">Replace with a real photo!</p>
                        </div>
                      ) : (
                        <img src={GALLERY_ITEMS[lightboxIndex].src} alt={GALLERY_ITEMS[lightboxIndex].caption}
                          className="w-full h-full object-contain max-h-[70vh]"
                          onError={() => setFailedImages(prev => new Set([...prev, lightboxIndex]))} />
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-white font-bold">{GALLERY_ITEMS[lightboxIndex].caption}</p>
                      <p className="text-white/40 text-sm">{GALLERY_ITEMS[lightboxIndex].date}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {GALLERY_ITEMS.map((_, i) => (
                    <button key={i} onClick={() => setLightboxIndex(i)}
                      className={`w-2 h-2 rounded-full border-none cursor-pointer transition-all ${i === lightboxIndex ? 'bg-[#00d4ff] w-6' : 'bg-white/20'}`} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
