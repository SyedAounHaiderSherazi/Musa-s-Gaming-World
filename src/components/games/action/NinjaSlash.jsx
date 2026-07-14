import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const W = 320, H = 420, GAME_TIME = 30
const FRUITS = ['🍎','🍊','🍋','🍇','🍉','🍓','⭐','🌟','💎']

export default function NinjaSlash({ onWin }) {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const itemsRef = useRef([])
  const scoreRef = useRef(0)
  const timerRef = useRef(null)
  const frameRef = useRef(null)
  const winFiredRef = useRef(false)
  const particlesRef = useRef([])
  const spawnRef = useRef(null)

  const spawnItem = useCallback(() => {
    const isBomb = Math.random() < 0.2
    itemsRef.current.push({
      x: 30 + Math.random() * (W - 60),
      y: -30,
      speed: 1.5 + Math.random() * 2.5,
      emoji: isBomb ? '💣' : FRUITS[Math.floor(Math.random() * FRUITS.length)],
      isBomb,
      size: 32,
      rotation: Math.random() * 360,
    })
  }, [])

  const startGame = () => {
    scoreRef.current = 0
    setScore(0)
    setTimeLeft(GAME_TIME)
    setGameOver(false)
    setStarted(true)
    itemsRef.current = []
    particlesRef.current = []
    winFiredRef.current = false
  }

  useEffect(() => {
    if (!started || gameOver) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
    spawnRef.current = setInterval(spawnItem, 500)
    return () => { clearInterval(timerRef.current); clearInterval(spawnRef.current) }
  }, [started, gameOver, spawnItem])

  useEffect(() => {
    if (timeLeft === 0 && !gameOver) {
      setGameOver(true)
      setStarted(false)
    }
  }, [timeLeft, gameOver])

  useEffect(() => {
    if (gameOver && score >= 10 && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      onWin()
    }
  }, [gameOver, score, onWin])

  useEffect(() => {
    if (!started || gameOver) return
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, W, H)

      // particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.03
        if (p.life <= 0) return false
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        return true
      })

      itemsRef.current.forEach(item => {
        item.y += item.speed
        item.rotation += 3
        ctx.save()
        ctx.translate(item.x, item.y)
        ctx.rotate((item.rotation * Math.PI) / 180)
        ctx.font = `${item.size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(item.emoji, 0, 0)
        ctx.restore()
      })

      itemsRef.current = itemsRef.current.filter(i => i.y < H + 40)
      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [started, gameOver])

  const handleCanvasClick = useCallback((e) => {
    if (!started) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = W / rect.width
    const scaleY = H / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    const ctx = canvasRef.current?.getContext('2d')

    for (let i = itemsRef.current.length - 1; i >= 0; i--) {
      const item = itemsRef.current[i]
      const dx = mx - item.x, dy = my - item.y
      if (Math.sqrt(dx * dx + dy * dy) < item.size + 10) {
        if (item.isBomb) {
          setScore(s => Math.max(0, s - 3))
          scoreRef.current = Math.max(0, scoreRef.current - 3)
          for (let j = 0; j < 12; j++) {
            particlesRef.current.push({
              x: item.x, y: item.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              color: '#ff0044',
              size: 4 + Math.random() * 3,
              life: 1,
            })
          }
        } else {
          scoreRef.current += 1
          setScore(scoreRef.current)
          for (let j = 0; j < 8; j++) {
            particlesRef.current.push({
              x: item.x, y: item.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: '#00ff88',
              size: 3 + Math.random() * 2,
              life: 1,
            })
          }
        }
        itemsRef.current.splice(i, 1)
        break
      }
    }
  }, [started])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#00ff88] font-bold">⚔️ Score: {score}</span>
        <span className="text-[#ff0044] font-bold">⏱️ {timeLeft}s</span>
      </div>

      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(255,0,255,0.3)]">
        <canvas ref={canvasRef} width={W} height={H} onClick={handleCanvasClick}
          className="block max-w-full cursor-crosshair" style={{ imageRendering: 'pixelated' }} />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-center">
              <div className="text-5xl mb-2">🥷</div>
              <p className="text-white font-bold text-sm">Slice the fruits, avoid bombs!</p>
            </motion.div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <p className="text-[#ffee00] font-bold text-xl mb-2">
                {score >= 20 ? '🏆 Amazing!' : score >= 10 ? '🎉 Great!' : '💪 Try Again!'}
              </p>
              <p className="text-white/80 text-sm">Score: {score}</p>
            </div>
          </div>
        )}
      </div>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
        disabled={started}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ff00ff] to-[#00d4ff] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50">
        {gameOver ? '🔄 Retry' : started ? '⏳ Playing...' : '🥷 Start Slicing!'}
      </motion.button>
    </div>
  )
}
