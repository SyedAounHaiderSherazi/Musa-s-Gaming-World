/* Meet Musa - Personal character section */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassPanel from '../components/ui/GlassPanel'

const GALLERY_IMAGES = [
  { src: '/images/musa/1.jpeg', alt: 'Musa having fun' },
  { src: '/images/musa/2.jpeg', alt: 'Musa playing games' },
  { src: '/images/musa/3.jpeg', alt: 'Musa adventure' },
  { src: '/images/musa/4.jpeg', alt: 'Musa with friends' },
  { src: '/images/musa/5.jpeg', alt: 'Musa exploring' },
  { src: '/images/musa/7.jpeg', alt: 'Musa smiling' },
  { src: '/images/musa/8.jpeg', alt: 'Musa gaming' },
  { src: '/images/musa/9.jpeg', alt: 'Musa laughing' },
  { src: '/images/musa/10.jpeg', alt: 'Musa celebrating' },
  { src: '/images/musa/11.jpeg', alt: 'Musa exploring' },
  { src: '/images/musa/12.jpeg', alt: 'Musa playing' },
  { src: '/images/musa/13.jpeg', alt: 'Musa adventures' },
  { src: '/images/musa/14.jpeg', alt: 'Musa fun times' },
  { src: '/images/musa/15.jpeg', alt: 'Musa memories' },
  { src: '/images/musa/16.jpeg', alt: 'Musa moments' },
  { src: '/images/musa/17.jpeg', alt: 'Musa joy' },
]

const FUN_FACTS = [
  'Musa loves playing Roblox!',
  'Musa is awesome at video games!',
  'Musa\'s favorite color is blue!',
  'Musa has the best smile!',
  'Musa is a great friend!',
  'Musa loves eating pizza!',
  'Musa is super smart!',
  'Musa wants to be a game developer!',
]

const FAVORITE_GAMES = [
  { name: 'Adopt Me!', icon: '🐾' },
  { name: 'Brookhaven', icon: '🏠' },
  { name: 'Blox Fruits', icon: '🍊' },
  { name: 'Tower of Hell', icon: '🗼' },
  { name: 'Murder Mystery 2', icon: '🔍' },
  { name: 'Jailbreak', icon: '🚔' },
]

const FAVORITE_FOODS = [
  { name: 'Pizza', icon: '🍕' },
  { name: 'Burgers', icon: '🍔' },
  { name: 'Ice Cream', icon: '🍦' },
  { name: 'Fries', icon: '🍟' },
  { name: 'Chicken Nuggets', icon: '🍗' },
  { name: 'Chocolate Cake', icon: '🎂' },
]

const FAVORITE_HOBBIES = [
  { name: 'Gaming', icon: '🎮' },
  { name: 'Drawing', icon: '🎨' },
  { name: 'Watching YouTube', icon: '📺' },
  { name: 'Playing Outside', icon: '⚽' },
  { name: 'Building LEGO', icon: '🧱' },
  { name: 'Reading Comics', icon: '📚' },
]

const FAVORITE_YOUTUBERS = [
  { name: 'MrBeast', icon: '🌟' },
  { name: 'PewDiePie', icon: '🎮' },
  { name: 'DanTDM', icon: '💎' },
  { name: 'Markiplier', icon: '🔴' },
  { name: 'PopularMMOs', icon: '🌍' },
]

const MEMORY_WALL = [
  { text: 'First time playing Roblox together!', emoji: '🎮', date: '2024' },
  { text: 'Best gaming session ever!', emoji: '🏆', date: '2024' },
  { text: 'Musa beat the hardest level!', emoji: '⭐', date: '2024' },
  { text: 'Built the coolest Roblox house!', emoji: '🏠', date: '2024' },
  { text: 'Won 10 games in a row!', emoji: '🔥', date: '2024' },
  { text: 'Found the secret treasure!', emoji: '💎', date: '2024' },
]

function FavoriteMomentCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[rgba(255,255,255,0.05)] rounded-xl p-4 border border-[rgba(0,212,255,0.15)]"
    >
      <div className="text-3xl mb-2">{item.emoji}</div>
      <p className="text-white/80 text-sm font-bold">{item.text}</p>
      <p className="text-white/40 text-xs mt-1">{item.date}</p>
    </motion.div>
  )
}

function ItemGrid({ items, columns = 3 }) {
  const colClass = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'
  return (
    <div className={`grid grid-cols-2 ${colClass} gap-3`}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.05, y: -3 }}
          className="bg-[rgba(255,255,255,0.05)] rounded-xl p-3 text-center border border-[rgba(0,212,255,0.1)]"
        >
          <div className="text-3xl mb-1">{item.icon}</div>
          <p className="text-white/80 text-xs font-bold">{item.name}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default function MeetMusa() {
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [currentFact, setCurrentFact] = useState(0)
  const [profileFailed, setProfileFailed] = useState(false)
  const failedImagesRef = useRef(new Set())

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % GALLERY_IMAGES.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % FUN_FACTS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.3)]"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {profileFailed ? (
              <div className="w-full h-full bg-gradient-to-br from-[#00d4ff] to-[#ff00ff] flex items-center justify-center text-5xl">😎</div>
            ) : (
              <img
                src="/images/musa/avatar.jpeg"
                alt="Musa"
                className="w-full h-full object-cover"
                onError={() => setProfileFailed(true)}
              />
            )}
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Meet Musa!</span>
          </h1>
          <p className="text-white/60 text-lg">The coolest kid in the gaming world!</p>
        </motion.div>

        {/* Animated Fun Fact Carousel */}
        <GlassPanel className="mb-8 text-center" glow>
          <h2 className="text-lg font-bold text-[#ffee00] mb-4">✨ Fun Facts About Musa ✨</h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentFact}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-white text-xl font-bold"
            >
              {FUN_FACTS[currentFact]}
            </motion.p>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-4">
            {FUN_FACTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentFact(i)}
                className={`w-2 h-2 rounded-full cursor-pointer border-none transition-all ${
                  i === currentFact ? 'bg-[#ffee00] w-6' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </GlassPanel>

        {/* Photo Carousel */}
        <GlassPanel className="mb-8" glow>
          <h2 className="text-lg font-bold text-[#ff00ff] mb-4 text-center">📸 Photo Gallery</h2>
          <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-[rgba(0,0,0,0.3)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {failedImagesRef.current.has(carouselIndex) ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00d4ff20] to-[#ff00ff20]">
                    <div className="text-center">
                      <div className="text-6xl mb-3">📷</div>
                      <p className="text-white/40 text-sm">{GALLERY_IMAGES[carouselIndex].alt}</p>
                      <p className="text-white/20 text-xs mt-2">Replace with real photo!</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={GALLERY_IMAGES[carouselIndex].src}
                    alt={GALLERY_IMAGES[carouselIndex].alt}
                    className="max-h-full max-w-full object-contain rounded-lg"
                    onError={() => { failedImagesRef.current.add(carouselIndex) }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
            <button
              onClick={() => setCarouselIndex(prev => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white border-none cursor-pointer text-lg"
            >←</button>
            <button
              onClick={() => setCarouselIndex(prev => (prev + 1) % GALLERY_IMAGES.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white border-none cursor-pointer text-lg"
            >→</button>
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {GALLERY_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className={`w-2 h-2 rounded-full cursor-pointer border-none transition-all ${
                  i === carouselIndex ? 'bg-[#ff00ff] w-6' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </GlassPanel>

        {/* Favorites Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <GlassPanel>
            <h2 className="text-lg font-bold text-[#00ff88] mb-3">🎮 Favorite Roblox Games</h2>
            <ItemGrid items={FAVORITE_GAMES} columns={2} />
          </GlassPanel>

          <GlassPanel>
            <h2 className="text-lg font-bold text-[#ff8800] mb-3">🍕 Favorite Foods</h2>
            <ItemGrid items={FAVORITE_FOODS} columns={2} />
          </GlassPanel>

          <GlassPanel>
            <h2 className="text-lg font-bold text-[#00d4ff] mb-3">🎯 Favorite Hobbies</h2>
            <ItemGrid items={FAVORITE_HOBBIES} columns={2} />
          </GlassPanel>

          <GlassPanel>
            <h2 className="text-lg font-bold text-[#ff0044] mb-3">📺 Favorite YouTubers</h2>
            <ItemGrid items={FAVORITE_YOUTUBERS} columns={2} />
          </GlassPanel>
        </div>

        {/* Memory Wall */}
        <GlassPanel className="mb-8" glow>
          <h2 className="text-lg font-bold text-[#aa00ff] mb-4 text-center">🧱 Memory Wall</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MEMORY_WALL.map((item, i) => (
              <FavoriteMomentCard key={i} item={item} index={i} />
            ))}
          </div>
        </GlassPanel>

        {/* Favorite Moments */}
        <GlassPanel className="mb-8 text-center">
          <h2 className="text-lg font-bold text-[#ffee00] mb-4">⭐ Favorite Moments ⭐</h2>
          <div className="space-y-3">
            {[
              { emoji: '🎮', text: 'First time beating a hard level in Roblox!', rating: 5 },
              { emoji: '🏆', text: 'Winning 10 games in a row!', rating: 5 },
              { emoji: '😂', text: 'Funniest gaming moment ever!', rating: 5 },
              { emoji: '🤝', text: 'Playing together with friends and family!', rating: 5 },
            ].map((moment, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-3 bg-[rgba(255,255,255,0.05)] rounded-xl p-3"
              >
                <span className="text-3xl">{moment.emoji}</span>
                <div className="text-left flex-1">
                  <p className="text-white/80 text-sm font-bold">{moment.text}</p>
                  <div className="text-xs mt-1">
                    {'⭐'.repeat(moment.rating)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassPanel>

        {/* Placeholder Note */}
        <GlassPanel className="text-center">
          <div className="text-4xl mb-3">📝</div>
          <h2 className="text-lg font-bold text-white mb-2">Add Your Own Content!</h2>
          <p className="text-white/50 text-sm">
            Replace the placeholder images in <code className="text-[#00d4ff]">/public/images/musa/</code> with real photos.
            <br />Edit this file to add more sections, memories, and fun content!
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['avatar.jpeg', '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '7.jpeg'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full bg-[rgba(0,212,255,0.1)] text-[#00d4ff] text-xs font-mono">
                /images/musa/{f}
              </span>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
