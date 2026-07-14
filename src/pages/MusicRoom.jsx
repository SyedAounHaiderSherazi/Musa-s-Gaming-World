/* Enhanced Music Room - MP3 playlist player with full controls */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassPanel from '../components/ui/GlassPanel'
import {
  getPlaylist, getCurrentTrack, isMusicPlaying, togglePlayPause,
  nextTrack, prevTrack, setMusicVolume, getMusicVolume,
  setShuffle, getShuffle, setRepeat, getRepeat,
  getProgress, getCurrentTime, getDuration, seekTo,
  setOnTrackChange, setOnPlayStateChange, playTrack,
} from '../utils/musicPlayer'

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MusicRoom() {
  const [playing, setPlaying] = useState(isMusicPlaying())
  const [track, setTrack] = useState(getCurrentTrack())
  const [volume, setVolume] = useState(getMusicVolume())
  const [shuffle, setShuffleState] = useState(getShuffle())
  const [repeat, setRepeatState] = useState(getRepeat())
  const [progress, setProgress] = useState(0)
  const [time, setTime] = useState({ current: 0, duration: 0 })

  useEffect(() => {
    setOnTrackChange((t) => { setTrack(t) })
    setOnPlayStateChange((p) => { setPlaying(p) })
    const interval = setInterval(() => {
      setProgress(getProgress())
      setTime({ current: getCurrentTime(), duration: getDuration() })
    }, 250)
    return () => clearInterval(interval)
  }, [])

  const handlePlayPause = useCallback(() => { togglePlayPause() }, [])
  const handleNext = useCallback(() => { nextTrack() }, [])
  const handlePrev = useCallback(() => { prevTrack() }, [])
  const handleVolume = useCallback((e) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    setMusicVolume(v)
  }, [])
  const handleShuffle = useCallback(() => {
    const newVal = !shuffle
    setShuffleState(newVal)
    setShuffle(newVal)
  }, [shuffle])
  const handleRepeat = useCallback(() => {
    const newVal = !repeat
    setRepeatState(newVal)
    setRepeat(newVal)
  }, [repeat])
  const handleSeek = useCallback((e) => {
    seekTo(parseFloat(e.target.value))
  }, [])

  const playlist = getPlaylist()
  const albumEmojis = ['🎬', '🏠', '⚔️', '🎉', '🏆', '🔮']
  const bgColors = ['#00d4ff', '#00ff88', '#ff0044', '#ff00ff', '#ffee00', '#aa00ff']

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-2xl mx-auto">

        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="text-6xl mb-4 inline-block"
            animate={{ rotate: playing ? [0, 5, -5, 0] : 0, scale: playing ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}>
            🎵
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Music Room</span>
          </h1>
          <p className="text-white/60">Your personal DJ booth!</p>
        </motion.div>

        {/* Now Playing */}
        <GlassPanel className="mb-6 text-center" glow>
          <div className="mb-6">
            <motion.div
              className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-6xl"
              style={{ background: `linear-gradient(135deg, ${bgColors[playlist.indexOf(track)] || '#00d4ff'}30, ${bgColors[playlist.indexOf(track)] || '#00d4ff'}10)` }}
              animate={{ rotate: playing ? 360 : 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              {albumEmojis[playlist.indexOf(track)] || '🎵'}
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={track?.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-xl font-bold text-white">{track?.title || 'No Track'}</h2>
              <p className="text-white/40 text-sm">Musa's Gaming World</p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="mt-6 px-4">
            <input type="range" min="0" max="100" step="0.1" value={progress}
              onChange={handleSeek}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #00d4ff ${progress}%, rgba(255,255,255,0.1) ${progress}%)` }}
            />
            <div className="flex justify-between text-white/40 text-xs mt-1">
              <span>{formatTime(time.current)}</span>
              <span>{formatTime(time.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleShuffle}
              className={`w-10 h-10 rounded-full border-none cursor-pointer flex items-center justify-center text-lg ${shuffle ? 'bg-[#00d4ff] text-white' : 'bg-[rgba(255,255,255,0.1)] text-white/60'}`}>
              🔀
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.1)] text-white border-none cursor-pointer flex items-center justify-center text-xl">
              ⏮
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full text-white border-none cursor-pointer flex items-center justify-center text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #ff00ff)', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}>
              {playing ? '⏸' : '▶'}
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.1)] text-white border-none cursor-pointer flex items-center justify-center text-xl">
              ⏭
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handleRepeat}
              className={`w-10 h-10 rounded-full border-none cursor-pointer flex items-center justify-center text-lg ${repeat ? 'bg-[#ff00ff] text-white' : 'bg-[rgba(255,255,255,0.1)] text-white/60'}`}>
              🔁
            </motion.button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center gap-3 mt-4 px-4">
            <span className="text-white/40 text-sm">🔈</span>
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={handleVolume}
              className="w-32 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #00ff88 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)` }}
            />
            <span className="text-white/40 text-sm">🔊</span>
          </div>
        </GlassPanel>

        {/* Playlist */}
        <GlassPanel>
          <h2 className="text-lg font-bold text-white mb-4">🎶 Playlist</h2>
          <div className="space-y-2">
            {playlist.map((t, i) => {
              const isActive = track?.id === t.id
              return (
                <motion.button key={t.id} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}
                  onClick={() => playTrack(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-none cursor-pointer text-left transition-all ${
                    isActive
                      ? 'bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)]'
                      : 'bg-[rgba(255,255,255,0.05)]'
                  }`}>
                  <span className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${bgColors[i]}20` }}>
                    {albumEmojis[i]}
                  </span>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${isActive ? 'text-[#00d4ff]' : 'text-white/80'}`}>{t.title}</p>
                    <p className="text-white/30 text-xs">{t.context}</p>
                  </div>
                  {isActive && playing && (
                    <motion.div className="flex gap-0.5 items-end h-4"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {[0, 1, 2].map(j => (
                        <motion.div key={j} className="w-1 bg-[#00d4ff] rounded-full"
                          animate={{ height: [4, 12, 4] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: j * 0.15 }} />
                      ))}
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </GlassPanel>

        {/* Instructions */}
        <GlassPanel className="mt-6 text-center">
          <p className="text-white/40 text-xs">
            Place your MP3 files in <code className="text-[#00d4ff]">public/music/</code> to add songs!
            <br />Supported: intro.mp3, lobby.mp3, battle.mp3, happy.mp3, victory.mp3, secret.mp3
          </p>
        </GlassPanel>
      </div>
    </div>
  )
}
