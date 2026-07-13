/* Floating particles background effect */
import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 40

export default function FloatingParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800', '#aa00ff', '#ff0044']

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 3,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 3,
        shape: Math.random() > 0.5 ? 'square' : 'circle',
      })
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY
        p.rotation += p.rotationSpeed

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity

        if (p.shape === 'square') {
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
          ctx.strokeStyle = p.color
          ctx.lineWidth = 1
          ctx.globalAlpha = p.opacity * 0.5
          ctx.strokeRect(-p.size / 2 - 2, -p.size / 2 - 2, p.size + 4, p.size + 4)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
          ctx.globalAlpha = p.opacity * 0.3
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI * 2)
          ctx.strokeStyle = p.color
          ctx.lineWidth = 1
          ctx.stroke()
        }

        ctx.restore()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
