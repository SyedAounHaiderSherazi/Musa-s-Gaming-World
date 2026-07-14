/* Music Player System - MP3-based with automatic fallback to Web Audio */
/* Playlist management, auto-switching by route, fade transitions */

const PLAYLIST = [
  { id: 'intro', file: '/music/intro.mp3', title: 'Intro', context: 'intro' },
  { id: 'lobby', file: '/music/lobby.mp3', title: 'Lobby', context: 'lobby' },
  { id: 'battle', file: '/music/battle.mp3', title: 'Battle', context: 'battle' },
  { id: 'happy', file: '/music/happy.mp3', title: 'Happy', context: 'happy' },
  { id: 'victory', file: '/music/victory.mp3', title: 'Victory', context: 'victory' },
  { id: 'secret', file: '/music/secret.mp3', title: 'Secret', context: 'secret' },
]

let currentAudio = null
let musicVolume = 0.5
let isMuted = false
let isPlaying = false
let currentIndex = 0
let shuffleMode = false
let repeatMode = false
let fadeInterval = null
let onTrackChange = null
let onPlayStateChange = null
let availableTracks = []

export function setMusicVolume(vol) {
  musicVolume = Math.max(0, Math.min(1, vol))
  if (currentAudio && !isMuted) {
    currentAudio.volume = musicVolume
  }
}

export function getMusicVolume() {
  return musicVolume
}

export function setMuted(muted) {
  isMuted = muted
  if (currentAudio) {
    currentAudio.volume = muted ? 0 : musicVolume
  }
}

export function isMutedState() {
  return isMuted
}

export function setShuffle(val) {
  shuffleMode = val
}

export function getShuffle() {
  return shuffleMode
}

export function setRepeat(val) {
  repeatMode = val
}

export function getRepeat() {
  return repeatMode
}

export function setOnTrackChange(cb) {
  onTrackChange = cb
}

export function setOnPlayStateChange(cb) {
  onPlayStateChange = cb
}

export function getCurrentTrack() {
  return PLAYLIST[currentIndex] || PLAYLIST[0]
}

export function getPlaylist() {
  return PLAYLIST
}

export function getProgress() {
  if (!currentAudio) return 0
  return currentAudio.duration ? (currentAudio.currentTime / currentAudio.duration) * 100 : 0
}

export function getCurrentTime() {
  return currentAudio ? currentAudio.currentTime : 0
}

export function getDuration() {
  return currentAudio ? currentAudio.duration || 0 : 0
}

export function seekTo(percent) {
  if (currentAudio && currentAudio.duration) {
    currentAudio.currentTime = (percent / 100) * currentAudio.duration
  }
}

function fadeOut(audio, callback) {
  if (fadeInterval) clearInterval(fadeInterval)
  if (!audio || audio.volume === 0) {
    if (callback) callback()
    return
  }
  const startVol = audio.volume
  const steps = 10
  let step = 0
  fadeInterval = setInterval(() => {
    step++
    audio.volume = startVol * (1 - step / steps)
    if (step >= steps) {
      clearInterval(fadeInterval)
      fadeInterval = null
      audio.volume = 0
      audio.pause()
      if (callback) callback()
    }
  }, 30)
}

function fadeIn(audio, targetVol, duration = 500) {
  if (fadeInterval) clearInterval(fadeInterval)
  audio.volume = 0
  audio.play().catch(() => {})
  const steps = 15
  let step = 0
  const volStep = targetVol / steps
  const interval = duration / steps
  fadeInterval = setInterval(() => {
    step++
    audio.volume = Math.min(targetVol, volStep * step)
    if (step >= steps) {
      clearInterval(fadeInterval)
      fadeInterval = null
      audio.volume = targetVol
    }
  }, interval)
}

export async function checkTrackAvailability() {
  availableTracks = []
  for (const track of PLAYLIST) {
    try {
      const response = await fetch(track.file, { method: 'HEAD' })
      if (response.ok) {
        availableTracks.push(track.id)
      }
    } catch {
      // File doesn't exist, skip silently
    }
  }
  return availableTracks
}

export function playTrack(trackId) {
  const idx = PLAYLIST.findIndex(t => t.id === trackId)
  if (idx >= 0) {
    stopMusic(false)
    currentIndex = idx
    startMusic()
  }
}

export function playByContext(context) {
  const idx = PLAYLIST.findIndex(t => t.context === context)
  if (idx >= 0 && currentIndex !== idx) {
    stopMusic(false)
    currentIndex = idx
    startMusic()
  } else if (idx >= 0 && !isPlaying) {
    startMusic()
  }
}

export function nextTrack() {
  stopMusic(false)
  if (shuffleMode) {
    let next
    do { next = Math.floor(Math.random() * PLAYLIST.length) } while (next === currentIndex && PLAYLIST.length > 1)
    currentIndex = next
  } else {
    currentIndex = (currentIndex + 1) % PLAYLIST.length
  }
  startMusic()
}

export function prevTrack() {
  stopMusic(false)
  if (shuffleMode) {
    let prev
    do { prev = Math.floor(Math.random() * PLAYLIST.length) } while (prev === currentIndex && PLAYLIST.length > 1)
    currentIndex = prev
  } else {
    currentIndex = (currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length
  }
  startMusic()
}

export function startMusic() {
  if (isPlaying) return

  const track = PLAYLIST[currentIndex]
  if (!track) return

  try {
    const audio = new Audio(track.file)
    audio.volume = isMuted ? 0 : musicVolume
    audio.loop = false
    audio.preload = 'auto'

    // Assign immediately so rapid calls to stopMusic/nextTrack can clean up
    currentAudio = audio

    audio.addEventListener('ended', () => {
      if (repeatMode) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        nextTrack()
      }
    })

    audio.addEventListener('error', () => {
      stopMusic(false)
    })

    audio.play().then(() => {
      isPlaying = true
      if (onPlayStateChange) onPlayStateChange(true)
      if (onTrackChange) onTrackChange(track)
    }).catch(() => {
      currentAudio = null
    })
  } catch {
    // Fallback handled elsewhere
  }
}

export function stopMusic(fade = true) {
  if (!currentAudio) {
    isPlaying = false
    if (onPlayStateChange) onPlayStateChange(false)
    return
  }

  if (fade) {
    fadeOut(currentAudio, () => {
      currentAudio = null
      isPlaying = false
      if (onPlayStateChange) onPlayStateChange(false)
    })
  } else {
    if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null }
    currentAudio.pause()
    currentAudio = null
    isPlaying = false
    if (onPlayStateChange) onPlayStateChange(false)
  }
}

export function togglePlayPause() {
  if (isPlaying) {
    stopMusic(true)
  } else {
    startMusic()
  }
}

export function isMusicPlaying() {
  return isPlaying
}
