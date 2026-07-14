/* Stack Tower - Canvas Arcade Game */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const W = 400, H = 500
const BLOCK_H = 24
const INITIAL_W = 200
const BASE_Y = H - 60
const COLORS = ['#00d4ff', '#ff00ff', '#00ff88', '#ffee00', '#ff8800']

export default function StackTower({ onWin }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('idle')
  const [score, setScore] = useState(0)

  const blocksRef = useRef([])
  const movingRef = useRef(null)
  const scoreRef = useRef(0)
  const stateRef = useRef('idle')
  const frameRef = useRef(null)
  const winRef = useRef(false)

  const initGame = useCallback(() => {
    const baseBlock = {
      x: (W - INITIAL_W) / 2, y: BASE_Y, w: INITIAL_W, h: BLOCK_H,
      color: COLORS[0],
    }
    blocksRef.current = [baseBlock]
    scoreRef.current = 0
    movingRef.current = {
      x: W / 2, y: BASE_Y - BLOCK_H, w: INITIAL_W, h: BLOCK_H,
      dir: 1, speed: 2.5,
      color: COLORS[1],
    }
    winRef.current = false
    setScore(0)
    stateRef.current = 'playing'
    setGameState('playing')
  }, [])

  const dropBlock = useCallback(() => {
    if (stateRef.current !== 'playing') return
    const moving = movingRef.current
    const stack = blocksRef.current
    const top = stack[stack.length - 1]

    const overlap = Math.min(moving.x + moving.w, top.x + top.w) - Math.max(moving.x, top.x)

    if (overlap <= 0) {
      stateRef.current = 'over'
      setGameState('over')
      return
    }

    const trimmedW = overlap
    const newX = Math.max(moving.x, top.x)

    stack.push({
      x: newX, y: moving.y, w: trimmedW, h: BLOCK_H,
      color: moving.color,
    })

    scoreRef.current++
    setScore(scoreRef.current)

    if (scoreRef.current >= 20) {
      stateRef.current = 'won'
      setGameState('won')
      return
    }

    const speed = Math.min(5, 2.5 + scoreRef.current * 0.12)
    movingRef.current = {
      x: 0, y: moving.y - BLOCK_H, w: trimmedW, h: BLOCK_H,
      dir: 1, speed,
      color: COLORS[(scoreRef.current + 1) % COLORS.length],
    }
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        dropBlock()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [dropBlock])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      const m = movingRef.current
      if (m) {
        m.x += m.dir * m.speed
        if (m.x + m.w > W) { m.dir = -1; m.x = W - m.w }
        if (m.x < 0) { m.dir = 1; m.x = 0 }
      }

      // Camera offset for tall towers
      let camY = 0
      const stack = blocksRef.current
      if (stack.length > 10) {
        camY = (stack.length - 10) * BLOCK_H
      }

      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, W, H)

      // Draw stack
      for (let i = 0; i < stack.length; i++) {
        const b = stack[i]
        const drawY = b.y - camY
        if (drawY < -BLOCK_H || drawY > H) continue
        ctx.fillStyle = b.color
        ctx.shadowColor = b.color
        ctx.shadowBlur = 4
        ctx.beginPath()
        ctx.roundRect(b.x, drawY, b.w, b.h, 3)
        ctx.fill()
      }
      ctx.shadowBlur = 0

      // Draw moving block
      if (m) {
        const my = m.y - camY
        ctx.fillStyle = m.color
        ctx.shadowColor = m.color
        ctx.shadowBlur = 10
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        ctx.roundRect(m.x, my, m.w, m.h, 3)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }

      // Guide line
      if (m) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(m.x, m.y - camY - BLOCK_H)
        ctx.lineTo(m.x, m.y - camY + BLOCK_H * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Score
      ctx.fillStyle = '#ffee00'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`Height: ${scoreRef.current}`, W / 2, 30)

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [gameState])

  useEffect(() => {
    if (gameState === 'won' && onWin && !winRef.current) {
      winRef.current = true
      onWin()
    }
  }, [gameState, onWin])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#ffee00] font-bold">Height: {score}</span>
        <span className="text-[#00d4ff] font-bold">Target: 20</span>
      </div>

      <div className="relative mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{ width: W, height: H, maxWidth: '100%' }}>
        <canvas ref={canvasRef} width={W} height={H} className="w-full h-full" />

        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="text-5xl mb-3">🏗️</div>
                <p className="text-[#ffee00] font-bold text-xl mb-1">STACK TOWER</p>
                <p className="text-white/60 text-xs mb-3">Stack 20 blocks to win!</p>
                <p className="text-white/40 text-xs">Tap or press Space to drop blocks</p>
              </div>
            </motion.div>
          )}
          {gameState === 'won' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <motion.p animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}
                  className="text-[#00ff88] font-bold text-3xl">TOWER COMPLETE!</motion.p>
                <p className="text-white/60 text-sm mt-2">Height: {score}</p>
              </div>
            </motion.div>
          )}
          {gameState === 'over' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <motion.p animate={{ y: [0, 6, 0] }} transition={{ duration: 0.4 }}
                  className="text-[#ff0044] font-bold text-2xl mb-2">TOWER FELL!</motion.p>
                <p className="text-white/60 text-sm">Height: {score}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={initGame}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer"
      >
        {gameState === 'idle' ? '▶ Start' : '🔄 Restart'}
      </motion.button>

      {gameState === 'playing' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={dropBlock}
          className="ml-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffee00] to-[#ff8800] text-white font-bold text-sm border-none cursor-pointer"
        >
          ⬇️ Drop
        </motion.button>
      )}
    </div>
  )
}
