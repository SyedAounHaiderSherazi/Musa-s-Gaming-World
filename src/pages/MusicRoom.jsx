/* Music Room Page */
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import GlassPanel from '../components/ui/GlassPanel'
import { playClick } from '../utils/sounds'

const TRACKS = [
  { id: 1, name: 'Chiptune Adventure', emoji: '🎮', color: '#00d4ff', bpm: 120, notes: [262, 330, 392, 523, 392, 330, 262, 294] },
  { id: 2, name: 'Pixel Dreams', emoji: '⭐', color: '#ff00ff', bpm: 100, notes: [349, 392, 440, 523, 440, 392, 349, 330] },
  { id: 3, name: 'Neon Nights', emoji: '🌆', color: '#aa00ff', bpm: 130, notes: [523, 587, 659, 784, 659, 587, 523, 440] },
  { id: 4, name: 'Ocean Waves', emoji: '🌊', color: '#0088ff', bpm: 80, notes: [262, 294, 330, 349, 330, 294, 262, 247] },
  { id: 5, name: 'Rocket Launch', emoji: '🚀', color: '#ff8800', bpm: 140, notes: [440, 523, 659, 784, 880, 784, 659, 523] },
  { id: 6, name: 'Mystic Forest', emoji: '🌲', color: '#00ff88', bpm: 90, notes: [392, 440, 494, 523, 494, 440, 392, 349] },
]

export default function MusicRoom() {
  const [currentTrack, setCurrentTrack] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [progress, setProgress] = useState(0)
  const audioCtxRef = useRef(null)
  const intervalRef = useRef(null)
  const noteIndexRef = useRef(0)
  const startTimeRef = useRef(0)

  const track = TRACKS[currentTrack]

  const stopMusic = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setPlaying(false)
    setProgress(0)
    noteIndexRef.current = 0
  }, [])

  const playNote = useCallback((freq, vol) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(vol * 0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch (e) { /* silent */ }
  }, [])

  const startMusic = useCallback(() => {
    stopMusic()
    setPlaying(true)
    startTimeRef.current = Date.now()
    const noteInterval = 60000 / track.bpm

    intervalRef.current = setInterval(() => {
      const note = track.notes[noteIndexRef.current % track.notes.length]
      playNote(note, volume)
      noteIndexRef.current++

      const elapsed = Date.now() - startTimeRef.current
      setProgress((elapsed % (noteInterval * track.notes.length)) / (noteInterval * track.notes.length))
    }, noteInterval)
  }, [track, volume, playNote, stopMusic])

  useEffect(() => {
    return () => stopMusic()
  }, [stopMusic])

  useEffect(() => {
    stopMusic()
  }, [currentTrack, stopMusic])

  const nextTrack = () => {
    setCurrentTrack((currentTrack + 1) % TRACKS.length)
  }

  const prevTrack = () => {
    setCurrentTrack((currentTrack - 1 + TRACKS.length) % TRACKS.length)
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="text-6xl mb-4 inline-block"
            animate={playing ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.5, repeat: playing ? Infinity : 0 }}>🎵</motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Music Room</span>
          </h1>
          <p className="text-white/60 text-lg">Listen to some chill tunes!</p>
        </motion.div>

        {/* Now Playing */}
        <GlassPanel className="max-w-lg mx-auto mb-8 text-center" glow>
          <motion.div className="text-6xl mb-4 inline-block"
            key={track.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' }}>
            {track.emoji}
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-1">{track.name}</h2>
          <p className="text-white/40 text-sm mb-4">Track {currentTrack + 1} of {TRACKS.length}</p>

          {/* Progress */}
          <div className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full mb-4 overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: track.color, width: `${progress * 100}%` }} />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { playClick(); prevTrack() }}
              className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] text-white text-lg border-none cursor-pointer">⏮️</motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => { playClick(); playing ? stopMusic() : startMusic() }}
              className="w-14 h-14 rounded-full text-white text-2xl border-none cursor-pointer flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${track.color}, ${track.color}88)` }}>
              {playing ? '⏸️' : '▶️'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { playClick(); nextTrack() }}
              className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] text-white text-lg border-none cursor-pointer">⏭️</motion.button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm">🔈</span>
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-32 accent-[#00d4ff]" />
            <span className="text-sm">🔊</span>
            <span className="text-white/40 text-xs">{Math.round(volume * 100)}%</span>
          </div>
        </GlassPanel>

        {/* Track List */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
          {TRACKS.map((t, i) => (
            <motion.div key={t.id}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { playClick(); setCurrentTrack(i) }}
              className={`cursor-pointer rounded-xl p-3 text-center border transition-all ${currentTrack === i
                ? 'border-white/30 bg-[rgba(255,255,255,0.1)]'
                : 'border-transparent bg-[rgba(255,255,255,0.03)]'
              }`}>
              <span className="text-2xl block mb-1">{t.emoji}</span>
              <span className="text-white text-xs font-bold block">{t.name}</span>
              {currentTrack === i && playing && (
                <motion.div className="flex justify-center gap-0.5 mt-1">
                  {[0, 1, 2].map(j => (
                    <motion.div key={j} className="w-1 rounded-full" style={{ background: t.color }}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.1 }} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
