/* Confetti animation component */
import { useEffect, useState, useCallback, useRef } from 'react'

const COLORS = ['#ff0044', '#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800', '#aa00ff']

function createPiece() {
  return {
    id: Math.random(),
    x: Math.random() * 100,
    y: -10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 5 + Math.random() * 8,
    rotation: Math.random() * 360,
    speed: 2 + Math.random() * 3,
    drift: (Math.random() - 0.5) * 3,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
  }
}

export default function Confetti({ active = false, duration = 3000, intensity = 50 }) {
  const [pieces, setPieces] = useState([])
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const trigger = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    const newPieces = Array.from({ length: intensity }, createPiece)
    setPieces(newPieces)

    intervalRef.current = setInterval(() => {
      setPieces(prev =>
        prev
          .map(p => ({ ...p, y: p.y + p.speed, x: p.x + p.drift, rotation: p.rotation + p.drift * 10 }))
          .filter(p => p.y < 110)
      )
    }, 30)

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setPieces([])
    }, duration)
  }, [duration, intensity])

  useEffect(() => {
    if (active) trigger()
  }, [active, trigger])

  if (pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.shape === 'square' ? p.size : p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  )
}

export function useConfetti() {
  const [active, setActive] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const fire = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActive(true)
    timeoutRef.current = setTimeout(() => setActive(false), 100)
  }, [])
  return { active, fire }
}
