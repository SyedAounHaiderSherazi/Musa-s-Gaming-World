/* Cinematic Intro - Premium AAA-style reveal screen */
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playIntroAmbient, playWhoosh, playNameReveal, playCelebration, playPortalOpen } from '../../utils/introSounds'
import { getAudioContext } from '../../utils/sounds'

/* ── Utility: generate stable random values ── */
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/* ── Particle field ── */
function ParticleField({ count = 60, opacity = 1 }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: seededRandom(i * 7 + 1) * 100,
      y: seededRandom(i * 13 + 3) * 100,
      size: 1.5 + seededRandom(i * 17 + 5) * 3,
      delay: seededRandom(i * 23 + 7) * 4,
      duration: 3 + seededRandom(i * 29 + 11) * 4,
      color: ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800', '#aa00ff'][i % 6],
    })), [count])

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ opacity }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -40 - seededRandom(p.id) * 30, 0],
            x: [0, (seededRandom(p.id + 50) - 0.5) * 30, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ── Floating geometric cubes ── */
function FloatingCubes({ count = 12, opacity = 1 }) {
  const cubes = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      size: 12 + seededRandom(i * 31 + 13) * 30,
      x: seededRandom(i * 37 + 17) * 100,
      y: seededRandom(i * 41 + 19) * 100,
      rotStart: seededRandom(i * 43 + 23) * 360,
      delay: seededRandom(i * 47 + 29) * 3,
      duration: 5 + seededRandom(i * 53 + 31) * 6,
      color: ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00'][i % 4],
    })), [count])

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ opacity }}>
      {cubes.map(c => (
        <motion.div
          key={c.id}
          className="absolute"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size,
            border: `1.5px solid ${c.color}40`,
            background: `linear-gradient(135deg, ${c.color}10, ${c.color}05)`,
            borderRadius: '3px',
            boxShadow: `0 0 ${c.size}px ${c.color}15, inset 0 0 ${c.size / 2}px ${c.color}08`,
          }}
          animate={{
            y: [0, -25, 0],
            rotateX: [c.rotStart, c.rotStart + 180, c.rotStart + 360],
            rotateY: [c.rotStart, c.rotStart - 180, c.rotStart - 360],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: c.duration,
            repeat: Infinity,
            delay: c.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ── Ambient light rays ── */
function LightRays({ opacity = 1 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + i * 25}%`,
            top: '-20%',
            width: '2px',
            height: '140%',
            background: `linear-gradient(180deg, transparent, ${['#00d4ff08', '#ff00ff08', '#00ff8808'][i]}, transparent)`,
            transform: `rotate(${-15 + i * 15}deg)`,
            filter: 'blur(20px)',
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            x: [0, 20 * (i % 2 === 0 ? 1 : -1), 0],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ── Lens flare ── */
function LensFlare({ x = '50%', y = '40%', opacity = 1, color = '#00d4ff' }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)', opacity }}
    >
      <div className="relative">
        <div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            left: -100,
            top: -100,
            background: `radial-gradient(circle, ${color}15 0%, ${color}08 30%, transparent 70%)`,
            filter: 'blur(15px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 80,
            height: 80,
            left: -40,
            top: -40,
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            left: -3,
            top: -3,
            background: '#ffffff',
            boxShadow: `0 0 20px ${color}, 0 0 40px ${color}80`,
          }}
        />
      </div>
    </motion.div>
  )
}

/* ── Glass panel for text ── */
function GlassPanel({ children, className = '' }) {
  return (
    <div
      className={`relative backdrop-blur-xl rounded-3xl border border-white/10 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </div>
  )
}

/* ── Animated name text with shine sweep ── */
function AnimatedName({ text, color = '#00d4ff', delay = 0 }) {
  return (
    <motion.div
      className="relative inline-block"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2
        className="text-3xl md:text-5xl lg:text-6xl font-bold relative"
        style={{
          fontFamily: "'Fredoka One', cursive",
          background: `linear-gradient(135deg, ${color}, #ffffff, ${color})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: 'none',
          filter: `drop-shadow(0 0 20px ${color}60) drop-shadow(0 0 40px ${color}30)`,
        }}
      >
        {text}
        {/* Shine sweep overlay */}
        <motion.span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: 'easeInOut' }}
        >
          {text}
        </motion.span>
      </h2>
    </motion.div>
  )
}

/* ── Celebration sparkles ── */
function CelebrationSparkles({ active }) {
  const sparkles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 61 + 37) * 100,
      y: seededRandom(i * 67 + 41) * 100,
      size: 4 + seededRandom(i * 71 + 43) * 8,
      delay: seededRandom(i * 73 + 47) * 2,
      emoji: ['✨', '⭐', '🌟', '💫', '🎆', '🎇'][i % 6],
    })), [])

  if (!active) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {sparkles.map(s => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.3, 0],
            rotate: [0, 180],
            y: [0, -30],
          }}
          transition={{
            duration: 1.5 + seededRandom(s.id) * 1,
            delay: s.delay,
            ease: 'easeOut',
          }}
        >
          {s.emoji}
        </motion.div>
      ))}
    </div>
  )
}

/* ── Floating balloons ── */
function FloatingBalloons({ active }) {
  const balloons = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 10 + seededRandom(i * 83 + 53) * 80,
      color: ['#ff0044', '#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800', '#aa00ff', '#ff69b4'][i],
      delay: seededRandom(i * 89 + 59) * 1.5,
      size: 20 + seededRandom(i * 97 + 61) * 12,
    })), [])

  if (!active) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {balloons.map(b => (
        <motion.div
          key={b.id}
          className="absolute bottom-0"
          style={{ left: `${b.x}%` }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: -800, opacity: [0, 0.7, 0.7, 0] }}
          transition={{
            duration: 5,
            delay: b.delay,
            ease: 'easeOut',
          }}
        >
          <div
            style={{
              width: b.size,
              height: b.size * 1.3,
              background: `radial-gradient(circle at 30% 30%, ${b.color}cc, ${b.color})`,
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
              boxShadow: `0 0 ${b.size}px ${b.color}40`,
            }}
          />
          <div
            className="mx-auto"
            style={{
              width: 1,
              height: 30,
              background: `${b.color}60`,
              marginLeft: b.size / 2 - 0.5,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

/* ── Portal effect ── */
function PortalEffect({ active, progress = 0 }) {
  if (!active) return null
  const size = 50 + progress * 50

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${size}%`,
          height: `${size}%`,
          maxWidth: 600,
          maxHeight: 600,
          border: '2px solid rgba(0,212,255,0.3)',
          boxShadow: `0 0 60px rgba(0,212,255,0.2), inset 0 0 60px rgba(0,212,255,0.1)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${size * 0.7}%`,
          height: `${size * 0.7}%`,
          maxWidth: 420,
          maxHeight: 420,
          border: '1.5px solid rgba(255,0,255,0.25)',
          boxShadow: `0 0 40px rgba(255,0,255,0.15), inset 0 0 40px rgba(255,0,255,0.08)`,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${size * 0.35}%`,
          height: `${size * 0.35}%`,
          maxWidth: 210,
          maxHeight: 210,
          background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(255,0,255,0.08) 50%, transparent 70%)',
          filter: 'blur(15px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN INTRO COMPONENT
   ══════════════════════════════════════════════════════ */
export default function CinematicIntro({ onComplete }) {
  const [started, setStarted] = useState(false)
  const [scene, setScene] = useState(0) // 0=dark, 1=particles, 2=creator, 3=cousin, 4=portal, 5=done
  const [portalProgress, setPortalProgress] = useState(0)
  const timersRef = useRef([])

  const handleStart = () => {
    // Resume both audio contexts (intro + main sounds)
    try {
      const mainCtx = getAudioContext()
      if (mainCtx.state === 'suspended') mainCtx.resume()
    } catch (_) {}
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const testCtx = new AudioContext()
      if (testCtx.state === 'suspended') testCtx.resume()
      testCtx.close()
    } catch (_) {}
    setStarted(true)
  }

  // Scene timer — only runs after tap-to-start
  useEffect(() => {
    if (!started) return
    const timers = timersRef.current
    const addTimer = (fn, ms) => {
      const id = setTimeout(fn, ms)
      timers.push(id)
      return id
    }

    // Scene 1: particles fade in (0-2s)
    addTimer(() => {
      setScene(1)
      playIntroAmbient()
    }, 100)

    // Scene 2: creator reveal (2s)
    addTimer(() => {
      setScene(2)
      playWhoosh()
    }, 2000)

    // Scene 3: cousin reveal (4s)
    addTimer(() => {
      setScene(3)
      playWhoosh()
      setTimeout(() => playNameReveal(), 300)
      setTimeout(() => playCelebration(), 800)
    }, 4000)

    // Scene 4: portal (6s)
    addTimer(() => {
      setScene(4)
      playPortalOpen()
    }, 6000)

    // Portal growth
    addTimer(() => setPortalProgress(0.3), 6200)
    addTimer(() => setPortalProgress(0.6), 6800)
    addTimer(() => setPortalProgress(1), 7400)

    // Complete (8s)
    addTimer(() => {
      setScene(5)
      onComplete()
    }, 8000)

    return () => timers.forEach(id => clearTimeout(id))
  }, [started, onComplete])

  const handleSkip = () => {
    timersRef.current.forEach(id => clearTimeout(id))
    setScene(5)
    onComplete()
  }

  if (scene === 5) return null

  if (!started) {
    return (
      <motion.div
        className="fixed inset-0 z-[250] flex flex-col items-center justify-center cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #050510 0%, #0a0a2e 30%, #0d0520 60%, #050510 100%)',
        }}
        onClick={handleStart}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ParticleField count={40} opacity={0.6} />
        <motion.div
          className="text-8xl mb-6 z-10"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎮
        </motion.div>
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-white mb-4 z-10"
          style={{ fontFamily: "'Fredoka One', cursive" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Musa's World
        </motion.h1>
        <motion.div
          className="px-8 py-3 rounded-2xl border-2 border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.1)] z-10"
          animate={{ opacity: [0.5, 1, 0.5], boxShadow: ['0 0 20px rgba(0,212,255,0.2)', '0 0 40px rgba(0,212,255,0.4)', '0 0 20px rgba(0,212,255,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[#00d4ff] font-bold text-lg" style={{ fontFamily: "'Fredoka One', cursive" }}>
            🔊 Tap to Start
          </span>
        </motion.div>
        <motion.p
          className="text-white/30 text-sm mt-6 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Best with sound on!
        </motion.p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 z-[250] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #050510 0%, #0a0a2e 30%, #0d0520 60%, #050510 100%)',
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── Background layers ── */}
      <ParticleField count={60} opacity={scene >= 1 ? 1 : 0} />
      <FloatingCubes count={12} opacity={scene >= 1 ? 1 : 0} />
      <LightRays opacity={scene >= 1 ? 0.8 : 0} />

      {/* Ambient vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* ── Lens flare ── */}
      <LensFlare x="50%" y="35%" opacity={scene >= 1 ? 0.6 : 0} color="#00d4ff" />
      <LensFlare x="70%" y="60%" opacity={scene >= 2 ? 0.3 : 0} color="#ff00ff" />

      {/* ── Scene 2: Creator Reveal ── */}
      <AnimatePresence>
        {scene === 2 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.8 }}
          >
            <GlassPanel className="px-10 py-8 md:px-16 md:py-12 text-center max-w-lg mx-4">
              <motion.p
                className="text-white/50 text-sm md:text-base mb-3 tracking-widest uppercase"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                Built with ❤️ by
              </motion.p>
              <AnimatedName text="Syed Aoun Sherazi" color="#00d4ff" delay={0.5} />
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scene 3: Cousin Reveal ── */}
      <AnimatePresence>
        {scene === 3 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            <GlassPanel className="px-10 py-8 md:px-16 md:py-12 text-center max-w-lg mx-4">
              <motion.p
                className="text-white/50 text-sm md:text-base mb-3 tracking-widest uppercase"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                For My Lovely Cousin
              </motion.p>
              <AnimatedName text="Syed Musa Hassan ❤️" color="#ff00ff" delay={0.4} />
            </GlassPanel>
            <CelebrationSparkles active />
            <FloatingBalloons active />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scene 4: Portal ── */}
      <AnimatePresence>
        {scene === 4 && (
          <>
            <PortalEffect active progress={portalProgress} />
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <GlassPanel className="px-10 py-8 md:px-16 md:py-10 text-center max-w-md mx-4">
                <motion.p
                  className="text-xl md:text-2xl font-bold tracking-wide"
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    background: 'linear-gradient(135deg, #00d4ff, #ff00ff, #00ff88)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 15px rgba(0,212,255,0.4))',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Your Adventure Begins...
                </motion.p>
              </GlassPanel>
            </motion.div>

            {/* Portal flash overlay */}
            <motion.div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ delay: 1, duration: 0.8 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Skip Button ── */}
      <motion.button
        className="absolute top-5 right-5 z-[100] px-5 py-2 rounded-full text-white/50 text-xs font-bold tracking-wider uppercase cursor-pointer border border-white/10"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(8px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        whileHover={{
          opacity: 1,
          scale: 1.05,
          background: 'rgba(255,255,255,0.1)',
          borderColor: 'rgba(255,255,255,0.2)',
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSkip}
      >
        Skip Intro →
      </motion.button>

      {/* ── Bottom progress dots ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {[1, 2, 3, 4].map(s => (
          <motion.div
            key={s}
            className="rounded-full"
            style={{
              width: scene >= s ? 24 : 6,
              height: 6,
              background: scene >= s
                ? 'linear-gradient(90deg, #00d4ff, #ff00ff)'
                : 'rgba(255,255,255,0.15)',
              boxShadow: scene >= s ? '0 0 8px rgba(0,212,255,0.4)' : 'none',
            }}
            animate={{
              width: scene >= s ? 24 : 6,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        ))}
      </div>
    </motion.div>
  )
}
