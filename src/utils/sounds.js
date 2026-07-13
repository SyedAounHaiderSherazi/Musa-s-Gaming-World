/* Sound utility - Web Audio API based, no external files needed */
/* Rich gaming sounds for a 10-year-old's gaming website */

let audioContext = null
let soundEnabled = false

export function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export function setSoundEnabled(enabled) {
  soundEnabled = enabled
}

export function isSoundEnabled() {
  return soundEnabled
}

function ensureCtx() {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch (_) {}
}

/* ── UI Interaction Sounds ── */

export function playClick() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    // Crisp two-tone click
    const osc1 = ctx.createOscillator()
    const g1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1200, t)
    osc1.frequency.exponentialRampToValueAtTime(800, t + 0.06)
    g1.gain.setValueAtTime(0.18, t)
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    osc1.connect(g1); g1.connect(ctx.destination)
    osc1.start(t); osc1.stop(t + 0.06)

    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1800, t + 0.02)
    osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.08)
    g2.gain.setValueAtTime(0.1, t + 0.02)
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
    osc2.connect(g2); g2.connect(ctx.destination)
    osc2.start(t + 0.02); osc2.stop(t + 0.08)
  } catch (_) {}
}

export function playHover() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(2000, t)
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.04)
    g.gain.setValueAtTime(0.06, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
    osc.connect(g); g.connect(ctx.destination)
    osc.start(t); osc.stop(t + 0.04)
  } catch (_) {}
}

export function playPop() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, t)
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.03)
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.08)
    g.gain.setValueAtTime(0.2, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
    osc.connect(g); g.connect(ctx.destination)
    osc.start(t); osc.stop(t + 0.08)
  } catch (_) {}
}

/* ── Game Reward Sounds ── */

export function playCoin() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    // Satisfying coin ding
    const osc1 = ctx.createOscillator()
    const g1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(988, t)
    g1.gain.setValueAtTime(0.25, t)
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
    osc1.connect(g1); g1.connect(ctx.destination)
    osc1.start(t); osc1.stop(t + 0.15)

    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1319, t + 0.06)
    g2.gain.setValueAtTime(0.25, t + 0.06)
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc2.connect(g2); g2.connect(ctx.destination)
    osc2.start(t + 0.06); osc2.stop(t + 0.2)
  } catch (_) {}
}

export function playSuccess() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    // Cheerful ascending arpeggio: C-E-G-C'
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t + i * 0.08)
      g.gain.setValueAtTime(0.2, t + i * 0.08)
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.25)
      osc.connect(g); g.connect(ctx.destination)
      osc.start(t + i * 0.08); osc.stop(t + i * 0.08 + 0.25)
    })
  } catch (_) {}
}

export function playWin() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    // Triumphant fanfare: C-E-G-C'-E'
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = i < 3 ? 'triangle' : 'sine'
      osc.frequency.setValueAtTime(freq, t + i * 0.12)
      g.gain.setValueAtTime(0.25, t + i * 0.12)
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.4)
      osc.connect(g); g.connect(ctx.destination)
      osc.start(t + i * 0.12); osc.stop(t + i * 0.12 + 0.4)
    })
  } catch (_) {}
}

export function playCelebration() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    // Joyful melody: C-E-G-C'-G-E-C'-E'-G'
    const melody = [523, 659, 784, 1047, 784, 1047, 1319, 1568]
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t + i * 0.09)
      g.gain.setValueAtTime(0.18, t + i * 0.09)
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.3)
      osc.connect(g); g.connect(ctx.destination)
      osc.start(t + i * 0.09); osc.stop(t + i * 0.09 + 0.3)
    })
    // Sparkle overlay
    const sp1 = ctx.createOscillator()
    const sg1 = ctx.createGain()
    sp1.type = 'triangle'
    sp1.frequency.setValueAtTime(2093, t + 0.5)
    sg1.gain.setValueAtTime(0.08, t + 0.5)
    sg1.gain.exponentialRampToValueAtTime(0.001, t + 1.0)
    sp1.connect(sg1); sg1.connect(ctx.destination)
    sp1.start(t + 0.5); sp1.stop(t + 1.0)
  } catch (_) {}
}

export function playLevelUp() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    // Rising triumphant scale
    const notes = [392, 440, 523, 587, 659, 784, 880, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = i < 4 ? 'triangle' : 'sine'
      osc.frequency.setValueAtTime(freq, t + i * 0.07)
      g.gain.setValueAtTime(0.2, t + i * 0.07)
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.2)
      osc.connect(g); g.connect(ctx.destination)
      osc.start(t + i * 0.07); osc.stop(t + i * 0.07 + 0.2)
    })
  } catch (_) {}
}

export function playError() {
  playTone(200, 0.3, 'sawtooth', 0.15)
  setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.15), 100)
}

/* ── Game-Specific Sounds ── */

export function playWhoosh() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(500, t)
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.25)
    g.gain.setValueAtTime(0.18, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
    osc.connect(g); g.connect(ctx.destination)
    osc.start(t); osc.stop(t + 0.25)
  } catch (_) {}
}

export function playDice() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    // Rattling dice sound
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(300 + Math.random() * 400, t + i * 0.04)
      g.gain.setValueAtTime(0.08, t + i * 0.04)
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.04)
      osc.connect(g); g.connect(ctx.destination)
      osc.start(t + i * 0.04); osc.stop(t + i * 0.04 + 0.04)
    }
    // Final thud
    const thud = ctx.createOscillator()
    const tg = ctx.createGain()
    thud.type = 'sine'
    thud.frequency.setValueAtTime(150, t + 0.22)
    tg.gain.setValueAtTime(0.15, t + 0.22)
    tg.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    thud.connect(tg); tg.connect(ctx.destination)
    thud.start(t + 0.22); thud.stop(t + 0.35)
  } catch (_) {}
}

export function playFlip() {
  if (!soundEnabled) return
  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    const t = ctx.currentTime
    // Rising then falling coin flip
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, t)
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.08)
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.18)
    g.gain.setValueAtTime(0.18, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc.connect(g); g.connect(ctx.destination)
    osc.start(t); osc.stop(t + 0.2)
  } catch (_) {}
}

/* ── Background Music System ── */
/* Lo-fi gaming ambient loop — bass + harmony + melody */

let bgMusicNodes = []
let bgMusicInterval = null
let bgMusicPlaying = false
let bgNoteIndex = 0

// Pentatonic gaming melody with bass
const bgBass =    [131, 147, 165, 175, 196, 175, 165, 147, 131, 165, 196, 262, 196, 165, 131, 147]
const bgChords = [
  [262, 330], [294, 370], [330, 415], [349, 440],
  [392, 494], [349, 440], [330, 415], [294, 370],
  [262, 330], [330, 415], [392, 494], [523, 659],
  [392, 494], [330, 415], [262, 330], [294, 370],
]
const bgMelody = [
  523, 587, 659, 523, 784, 659, 523, 587,
  659, 784, 880, 784, 659, 523, 587, 0,
]

export function startBGMusic() {
  if (bgMusicPlaying || !soundEnabled) return

  try {
    const ctx = ensureCtx()
    if (ctx.state === 'suspended') return
    bgMusicPlaying = true
    bgNoteIndex = 0

    const playBeat = () => {
      if (!soundEnabled) { stopBGMusic(); return }
      try {
        const ctx = ensureCtx()
        if (ctx.state === 'suspended') return
        const t = ctx.currentTime
        const i = bgNoteIndex % bgBass.length

        // Bass note (low, warm)
        const bassOsc = ctx.createOscillator()
        const bassG = ctx.createGain()
        bassOsc.type = 'sine'
        bassOsc.frequency.setValueAtTime(bgBass[i], t)
        bassG.gain.setValueAtTime(0.07, t)
        bassG.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
        bassOsc.connect(bassG); bassG.connect(ctx.destination)
        bassOsc.start(t); bassOsc.stop(t + 0.35)

        // Chord pad (soft harmony)
        const [c1, c2] = bgChords[i]
        ;[c1, c2].forEach(freq => {
          const osc = ctx.createOscillator()
          const g = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, t)
          g.gain.setValueAtTime(0.03, t)
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
          osc.connect(g); g.connect(ctx.destination)
          osc.start(t); osc.stop(t + 0.3)
        })

        // Melody (higher, intermittent)
        if (bgMelody[i] > 0) {
          const melOsc = ctx.createOscillator()
          const melG = ctx.createGain()
          melOsc.type = 'sine'
          melOsc.frequency.setValueAtTime(bgMelody[i], t)
          melG.gain.setValueAtTime(0.04, t)
          melG.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
          melOsc.connect(melG); melG.connect(ctx.destination)
          melOsc.start(t); melOsc.stop(t + 0.25)
        }

        bgNoteIndex++
      } catch (_) {}
    }

    bgMusicInterval = setInterval(playBeat, 300)
    playBeat() // play first beat immediately
  } catch (_) {}
}

export function stopBGMusic() {
  bgMusicPlaying = false
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval)
    bgMusicInterval = null
  }
  bgMusicNodes.forEach(n => { try { n.stop() } catch (_) {} })
  bgMusicNodes = []
}

export function isBGMusicPlaying() {
  return bgMusicPlaying
}
