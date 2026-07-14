/* Intro cinematic sounds - Web Audio API, no external files */

import { getAudioContext } from './sounds'

function getCtx() {
  const c = getAudioContext()
  if (c.state === 'suspended') c.resume()
  return c
}

function pad(freq, duration, vol = 0.12, type = 'sine') {
  try {
    const c = getCtx()
    if (c.state === 'suspended') return
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime)
    g.gain.setValueAtTime(0, c.currentTime)
    g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.3)
    g.gain.linearRampToValueAtTime(vol, c.currentTime + duration - 0.5)
    g.gain.linearRampToValueAtTime(0, c.currentTime + duration)
    osc.connect(g)
    g.connect(c.destination)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch (_) {}
}

export function playIntroAmbient() {
  pad(130, 8, 0.06, 'sine')
  pad(196, 8, 0.04, 'sine')
  pad(262, 8, 0.03, 'triangle')
}

export function playWhoosh() {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(150, c.currentTime + 0.35)
    g.gain.setValueAtTime(0.15, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35)
    osc.connect(g)
    g.connect(c.destination)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.35)
  } catch (_) {}
}

export function playNameReveal() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => {
    setTimeout(() => pad(f, 0.5, 0.12, 'sine'), i * 120)
  })
}

export function playCelebration() {
  const melody = [523, 659, 784, 1047, 1319, 1047, 1319, 1568]
  melody.forEach((f, i) => {
    setTimeout(() => pad(f, 0.35, 0.1, 'sine'), i * 90)
  })
  // Sparkle overlay
  setTimeout(() => pad(2093, 0.6, 0.06, 'triangle'), 200)
  setTimeout(() => pad(2637, 0.5, 0.05, 'triangle'), 400)
}

export function playPortalOpen() {
  try {
    const c = getCtx()
    // Rising sweep
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(80, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, c.currentTime + 1.5)
    g.gain.setValueAtTime(0.08, c.currentTime)
    g.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.8)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5)
    osc.connect(g)
    g.connect(c.destination)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 1.5)

    // Harmonic shimmer
    const osc2 = c.createOscillator()
    const g2 = c.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(440, c.currentTime)
    osc2.frequency.exponentialRampToValueAtTime(1760, c.currentTime + 1.5)
    g2.gain.setValueAtTime(0.06, c.currentTime)
    g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5)
    osc2.connect(g2)
    g2.connect(c.destination)
    osc2.start(c.currentTime)
    osc2.stop(c.currentTime + 1.5)
  } catch (_) {}
}
