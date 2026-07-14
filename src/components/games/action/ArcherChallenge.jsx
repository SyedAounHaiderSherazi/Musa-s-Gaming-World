import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const W = 320, H = 400

export default function ArcherChallenge({ onWin }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [arrows, setArrows] = useState(20)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [targets, setTargets] = useState([])
  const scoreRef = useRef(0)
  const arrowsRef = useRef(20)
  const targetsRef = useRef([])
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const hitParticlesRef = useRef([])
  const winFiredRef = useRef(false)

  const spawnTarget = useCallback(() => {
    const moving = Math.random() < 0.5
    targetsRef.current.push({
      x: 40 + Math.random() * (W - 80),
      y: 40 + Math.random() * (H - 160),
      size: 24 + Math.random() * 12,
      moving,
      vx: moving ? (Math.random() - 0.5) * 2 : 0,
      vy: moving ? (Math.random() - 0.5) * 1.5 : 0,
      emoji: ['🎯', '🏹', '💎', '🌟'][Math.floor(Math.random() * 4)],
      points: 10 + Math.floor(Math.random() * 15),
    })
    setTargets([...targetsRef.current])
  }, [])

  const startGame = () => {
    scoreRef.current = 0; arrowsRef.current = 20
    setScore(0); setArrows(20)
    setGameOver(false); setStarted(true)
    targetsRef.current = []; hitParticlesRef.current = []
    setTargets([])
    winFiredRef.current = false
  }

  useEffect(() => {
    if (!started || gameOver || arrowsRef.current <= 0) return
    spawnRef.current = setInterval(spawnTarget, 1500)
    for (let i = 0; i < 3; i++) spawnTarget()
    return () => clearInterval(spawnRef.current)
  }, [started, gameOver, spawnTarget, arrows])

  useEffect(() => {
    if (!started || gameOver) return
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)
      // Dark forest bg
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#0a0a2e')
      grad.addColorStop(1, '#0a1a0a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // ground
      ctx.fillStyle = '#1a2a1a'
      ctx.fillRect(0, H - 40, W, 40)

      // particles
      hitParticlesRef.current = hitParticlesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.03
        if (p.life <= 0) return false
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        return true
      })

      // Targets
      targetsRef.current.forEach(t => {
        if (t.moving) {
          t.x += t.vx; t.y += t.vy
          if (t.x < 30 || t.x > W - 30) t.vx *= -1
          if (t.y < 30 || t.y > H - 80) t.vy *= -1
        }
        ctx.font = `${t.size}px serif`
        ctx.textAlign = 'center'
        ctx.fillText(t.emoji, t.x, t.y)
        // ring
        ctx.strokeStyle = 'rgba(0,212,255,0.3)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size / 2 + 6, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Arrow count display
      ctx.fillStyle = '#ffee00'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`🏹 x${arrowsRef.current}`, 10, 20)

      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver])

  useEffect(() => {
    if (gameOver && score >= 80 && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      onWin()
    }
  }, [gameOver, score, onWin])

  useEffect(() => {
    if (started && arrowsRef.current <= 0 && !gameOver) {
      const t = setTimeout(() => {
        setGameOver(true)
        setStarted(false)
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [arrows, started, gameOver])

  const handleClick = useCallback((e) => {
    if (!started || gameOver || arrowsRef.current <= 0) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = W / rect.width, scaleY = H / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    arrowsRef.current -= 1
    setArrows(arrowsRef.current)

    for (let i = targetsRef.current.length - 1; i >= 0; i--) {
      const t = targetsRef.current[i]
      const dx = mx - t.x, dy = my - t.y
      if (Math.sqrt(dx * dx + dy * dy) < t.size) {
        scoreRef.current += t.points
        setScore(scoreRef.current)
        for (let j = 0; j < 10; j++) {
          hitParticlesRef.current.push({
            x: t.x, y: t.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: '#ffee00',
            size: 3 + Math.random() * 3,
            life: 1,
          })
        }
        targetsRef.current.splice(i, 1)
        setTargets([...targetsRef.current])
        break
      }
    }

    if (arrowsRef.current <= 0 && targetsRef.current.length === 0) {
      setTimeout(() => {
        setGameOver(true)
        setStarted(false)
      }, 300)
    }
  }, [started, gameOver])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#ffee00] font-bold">🎯 Score: {score}</span>
        <span className="text-[#00d4ff] font-bold">🏹 Arrows: {arrows}</span>
      </div>
      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,255,136,0.3)]">
        <canvas ref={canvasRef} width={W} height={H} onClick={handleClick}
          className="block max-w-full cursor-crosshair" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-center">
              <div className="text-5xl mb-2">🏹</div>
              <p className="text-white font-bold text-sm">Click targets to shoot!</p>
              <p className="text-white/50 text-xs mt-1">20 arrows, hit as many as you can!</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <p className="text-[#ffee00] font-bold text-xl mb-2">
                {score >= 150 ? '🏆 Sharpshooter!' : score >= 80 ? '🎯 Nice Shot!' : '🏹 Keep Practicing!'}
              </p>
              <p className="text-white/80 text-sm">Score: {score}</p>
            </div>
          </div>
        )}
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
        disabled={started && !gameOver}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ffee00] to-[#ff8800] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50">
        {gameOver ? '🔄 Retry' : started ? '⏳ Shooting...' : '🏹 Start Shooting!'}
      </motion.button>
    </div>
  )
}
