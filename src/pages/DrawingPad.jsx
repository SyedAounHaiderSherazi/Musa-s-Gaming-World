/* Drawing Pad Page */
import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { playClick, playSuccess } from '../utils/sounds'
import GlassPanel from '../components/ui/GlassPanel'

const COLORS = ['#ffffff', '#ff0044', '#ff8800', '#ffee00', '#00ff88', '#00d4ff', '#0088ff', '#aa00ff', '#ff00ff', '#ff69b4', '#8B4513']

export default function DrawingPad() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#00d4ff')
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState('brush')
  const [lastPos, setLastPos] = useState(null)
  const { addXP, addCoins, unlockAchievement } = useGame()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    canvas.width = container.clientWidth
    canvas.height = Math.max(400, container.clientHeight)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#0a0a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startDraw = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPos(e)
    setLastPos(pos)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = tool === 'eraser' ? '#0a0a2e' : color
    ctx.fill()
  }

  const draw = useCallback((e) => {
    if (!isDrawing) return
    e.preventDefault()
    const pos = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? '#0a0a2e' : color
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    setLastPos(pos)
  }, [isDrawing, lastPos, color, brushSize, tool])

  const stopDraw = () => setIsDrawing(false)

  const clearCanvas = () => {
    playClick()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#0a0a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveCanvas = () => {
    playSuccess()
    const link = document.createElement('a')
    link.download = 'musa-drawing.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
    addXP(10)
    addCoins(5)
    unlockAchievement('drawing_artist')
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="text-6xl mb-4 inline-block" animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>✏️</motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "'Fredoka One', cursive" }}>
            <span className="text-gradient">Drawing Studio</span>
          </h1>
          <p className="text-white/60">Create something awesome!</p>
        </motion.div>

        <GlassPanel className="p-4" hover={false}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
            <div className="flex gap-1">
              {[
                { id: 'brush', icon: '🖌️', label: 'Brush' },
                { id: 'eraser', icon: '🧽', label: 'Eraser' },
              ].map(t => (
                <motion.button key={t.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setTool(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer border-none ${tool === t.id ? 'bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white' : 'bg-[rgba(255,255,255,0.1)] text-white/60'}`}>
                  {t.icon} {t.label}
                </motion.button>
              ))}
            </div>

            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]" />

            <div className="flex gap-1 flex-wrap">
              {COLORS.map(c => (
                <motion.button key={c} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full cursor-pointer border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                  style={{ background: c }} />
              ))}
            </div>

            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]" />

            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs">Size:</span>
              <input type="range" min="1" max="30" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-20 accent-[#00d4ff]" />
              <span className="text-white/70 text-xs font-bold w-6">{brushSize}</span>
            </div>

            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]" />

            <div className="flex gap-1">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={clearCanvas}
                className="px-3 py-1.5 rounded-lg text-sm font-bold bg-[rgba(255,0,68,0.2)] text-[#ff0044] border-none cursor-pointer">
                🗑️ Clear
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={saveCanvas}
                className="px-3 py-1.5 rounded-lg text-sm font-bold bg-[rgba(0,255,136,0.2)] text-[#00ff88] border-none cursor-pointer">
                💾 Save
              </motion.button>
            </div>
          </div>

          {/* Canvas */}
          <div className="w-full rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)] cursor-crosshair"
            style={{ touchAction: 'none' }}>
            <canvas ref={canvasRef} className="w-full block" style={{ height: 400 }}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
