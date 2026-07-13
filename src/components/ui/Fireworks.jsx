/* Fireworks animation */
import { useEffect, useState, useRef } from 'react'

const COLORS = ['#ff0044', '#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800']

function createFirework(width, height) {
  return {
    id: Math.random(),
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 60,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    particles: Array.from({ length: 20 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 3,
      size: 2 + Math.random() * 3,
    })),
    frame: 0,
    maxFrame: 30,
  }
}

export default function Fireworks({ active = false, count = 5 }) {
  const [fireworks, setFireworks] = useState([])
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!active) return

    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    const newFw = Array.from({ length: count }, () => createFirework(window.innerWidth, window.innerHeight))
    setFireworks(newFw)

    intervalRef.current = setInterval(() => {
      setFireworks(prev =>
        prev.map(fw => ({ ...fw, frame: fw.frame + 1 })).filter(fw => fw.frame < fw.maxFrame)
      )
    }, 30)

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setFireworks([])
    }, 2000)
  }, [active, count])

  if (fireworks.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[95]">
      {fireworks.map(fw => (
        <div key={fw.id} className="absolute" style={{ left: `${fw.x}%`, top: `${fw.y}%` }}>
          {fw.particles.map((p, i) => {
            const progress = fw.frame / fw.maxFrame
            const dist = p.speed * fw.frame * 3
            const x = Math.cos(p.angle) * dist
            const y = Math.sin(p.angle) * dist
            const opacity = 1 - progress
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: fw.color,
                  transform: `translate(${x}px, ${y}px)`,
                  opacity,
                  boxShadow: `0 0 ${p.size * 2}px ${fw.color}`,
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
