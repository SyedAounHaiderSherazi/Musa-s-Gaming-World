/* Sound Effects System - Loads from public/sounds/ with Web Audio API fallback */

import { getAudioContext } from './sounds'

const SFX_FILES = {
  click: '/sounds/click.mp3',
  hover: '/sounds/hover.mp3',
  portal: '/sounds/portal.mp3',
  achievement: '/sounds/achievement.mp3',
  coin: '/sounds/coin.mp3',
  levelUp: '/sounds/levelup.mp3',
  chest: '/sounds/chest.mp3',
  wheelSpin: '/sounds/wheelspin.mp3',
  explosion: '/sounds/explosion.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  jump: '/sounds/jump.mp3',
  punch: '/sounds/punch.mp3',
  sword: '/sounds/sword.mp3',
  magic: '/sounds/magic.mp3',
  firework: '/sounds/firework.mp3',
}

let sfxEnabled = true
let audioCache = {}
let sfxVolume = 0.7

function getCtx() {
  return getAudioContext()
}

export function setSfxEnabled(enabled) {
  sfxEnabled = enabled
}

export function isSfxEnabled() {
  return sfxEnabled
}

export function setSfxVolume(vol) {
  sfxVolume = Math.max(0, Math.min(1, vol))
}

export function getSfxVolume() {
  return sfxVolume
}

async function preloadSfx() {
  for (const [key, path] of Object.entries(SFX_FILES)) {
    try {
      const response = await fetch(path, { method: 'HEAD' })
      if (response.ok) {
        const audio = new Audio(path)
        audio.preload = 'auto'
        audio.volume = sfxVolume
        audioCache[key] = audio
      }
    } catch {
      // File doesn't exist, will use fallback
    }
  }
}

preloadSfx()

function playFallback(name) {
  if (!sfxEnabled) return
  try {
    const ctx = getCtx()
    const t = ctx.currentTime

    const fallbackSounds = {
      click: () => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.type = 'sine'; o.frequency.setValueAtTime(1200, t)
        o.frequency.exponentialRampToValueAtTime(800, t + 0.06)
        g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.06)
      },
      hover: () => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.type = 'sine'; o.frequency.setValueAtTime(2000, t)
        o.frequency.exponentialRampToValueAtTime(1600, t + 0.04)
        g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.04)
      },
      coin: () => {
        const o1 = ctx.createOscillator(); const g1 = ctx.createGain()
        o1.type = 'sine'; o1.frequency.setValueAtTime(988, t)
        g1.gain.setValueAtTime(0.25, t); g1.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
        o1.connect(g1); g1.connect(ctx.destination); o1.start(t); o1.stop(t + 0.15)
        const o2 = ctx.createOscillator(); const g2 = ctx.createGain()
        o2.type = 'sine'; o2.frequency.setValueAtTime(1319, t + 0.06)
        g2.gain.setValueAtTime(0.25, t + 0.06); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
        o2.connect(g2); g2.connect(ctx.destination); o2.start(t + 0.06); o2.stop(t + 0.2)
      },
      victory: () => {
        ;[523, 659, 784, 1047, 1319].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain()
          o.type = i < 3 ? 'triangle' : 'sine'
          o.frequency.setValueAtTime(freq, t + i * 0.12)
          g.gain.setValueAtTime(0.25, t + i * 0.12); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.4)
          o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.4)
        })
      },
      defeat: () => {
        ;[400, 350, 300, 250].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain()
          o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t + i * 0.15)
          g.gain.setValueAtTime(0.12, t + i * 0.15); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.3)
          o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.15); o.stop(t + i * 0.15 + 0.3)
        })
      },
      levelUp: () => {
        ;[392, 440, 523, 587, 659, 784, 880, 1047].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain()
          o.type = i < 4 ? 'triangle' : 'sine'
          o.frequency.setValueAtTime(freq, t + i * 0.07)
          g.gain.setValueAtTime(0.2, t + i * 0.07); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.2)
          o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.2)
        })
      },
      achievement: () => {
        ;[784, 988, 1175, 1568].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain()
          o.type = 'triangle'; o.frequency.setValueAtTime(freq, t + i * 0.1)
          g.gain.setValueAtTime(0.2, t + i * 0.1); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.35)
          o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.35)
        })
      },
      jump: () => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.type = 'sine'; o.frequency.setValueAtTime(300, t)
        o.frequency.exponentialRampToValueAtTime(600, t + 0.1)
        g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.15)
      },
      punch: () => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.type = 'square'; o.frequency.setValueAtTime(150, t)
        o.frequency.exponentialRampToValueAtTime(50, t + 0.1)
        g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.12)
      },
      sword: () => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.type = 'sawtooth'; o.frequency.setValueAtTime(2000, t)
        o.frequency.exponentialRampToValueAtTime(500, t + 0.15)
        g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.15)
      },
      magic: () => {
        ;[523, 659, 784, 1047, 1319, 1568].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain()
          o.type = 'sine'; o.frequency.setValueAtTime(freq, t + i * 0.05)
          g.gain.setValueAtTime(0.12, t + i * 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.2)
          o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.05); o.stop(t + i * 0.05 + 0.2)
        })
      },
      portal: () => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.type = 'sine'; o.frequency.setValueAtTime(200, t)
        o.frequency.exponentialRampToValueAtTime(800, t + 0.5)
        g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.5)
      },
      explosion: () => {
        const bufSize = ctx.sampleRate * 0.3
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize)
        const src = ctx.createBufferSource(); src.buffer = buf
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
        src.connect(g); g.connect(ctx.destination); src.start(t)
      },
      chest: () => {
        ;[440, 554, 659, 880].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain()
          o.type = 'triangle'; o.frequency.setValueAtTime(freq, t + i * 0.12)
          g.gain.setValueAtTime(0.2, t + i * 0.12); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.3)
          o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.3)
        })
      },
      wheelSpin: () => {
        for (let i = 0; i < 8; i++) {
          const o = ctx.createOscillator(); const g = ctx.createGain()
          o.type = 'sine'; o.frequency.setValueAtTime(600 + i * 100, t + i * 0.05)
          g.gain.setValueAtTime(0.08, t + i * 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.05)
          o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.05); o.stop(t + i * 0.05 + 0.05)
        }
      },
      firework: () => {
        const bufSize = ctx.sampleRate * 0.4
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize) ** 2
        const src = ctx.createBufferSource(); src.buffer = buf
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        src.connect(g); g.connect(ctx.destination); src.start(t)
        const o = ctx.createOscillator(); const og = ctx.createGain()
        o.type = 'sine'; o.frequency.setValueAtTime(1200, t)
        o.frequency.exponentialRampToValueAtTime(200, t + 0.2)
        og.gain.setValueAtTime(0.15, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
        o.connect(og); og.connect(ctx.destination); o.start(t); o.stop(t + 0.2)
      },
    }

    if (fallbackSounds[name]) fallbackSounds[name]()
  } catch {}
}

export function playSfx(name) {
  if (!sfxEnabled) return
  const cached = audioCache[name]
  if (cached) {
    try {
      const clone = cached.cloneNode()
      clone.volume = sfxVolume
      clone.play().catch(() => playFallback(name))
    } catch {
      playFallback(name)
    }
  } else {
    playFallback(name)
  }
}

export { SFX_FILES }
