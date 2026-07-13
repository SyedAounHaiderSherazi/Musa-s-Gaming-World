/* Snake Game */
import { useState, useEffect, useCallback, useRef } from 'react'

const GRID_SIZE = 16
const CELL_SIZE = 18
const INITIAL_SPEED = 150

export default function SnakeGame({ onWin }) {
  const [snake, setSnake] = useState([{ x: 8, y: 8 }])
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [dir, setDir] = useState({ x: 1, y: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const dirRef = useRef(dir)
  const gameRef = useRef(null)
  const snakeRef = useRef([{ x: 8, y: 8 }])
  const winFiredRef = useRef(false)

  const placeFood = useCallback((snakeBody) => {
    let pos
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (snakeBody.some(s => s.x === pos.x && s.y === pos.y))
    return pos
  }, [])

  const reset = () => {
    const newSnake = [{ x: 8, y: 8 }]
    snakeRef.current = newSnake
    setSnake(newSnake)
    setFood(placeFood(newSnake))
    setDir({ x: 1, y: 0 })
    dirRef.current = { x: 1, y: 0 }
    setGameOver(false)
    setScore(0)
    setStarted(false)
    setSpeed(INITIAL_SPEED)
    winFiredRef.current = false
  }

  useEffect(() => {
    if (!started || gameOver) return

    gameRef.current = setInterval(() => {
      const currentDir = dirRef.current
      const prevSnake = snakeRef.current
      const head = { x: prevSnake[0].x + currentDir.x, y: prevSnake[0].y + currentDir.y }

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true)
        return
      }

      // Self collision
      if (prevSnake.some(s => s.x === head.x && s.y === head.y)) {
        setGameOver(true)
        return
      }

      const newSnake = [head, ...prevSnake]

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 1)
        setFood(placeFood(newSnake))
        setSpeed(sp => Math.max(60, sp - 3))
      } else {
        newSnake.pop()
      }

      snakeRef.current = newSnake
      setSnake(newSnake)
    }, speed)

    return () => clearInterval(gameRef.current)
  }, [started, gameOver, food, speed, placeFood])

  useEffect(() => {
    if (!started || gameOver) return
    if (score >= 15 && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      onWin()
    }
  }, [score, started, gameOver, onWin])

  useEffect(() => {
    const handleKey = (e) => {
      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      }
      const newDir = keyMap[e.key]
      if (newDir) {
        e.preventDefault()
        const current = dirRef.current
        if (newDir.x !== -current.x || newDir.y !== -current.y) {
          dirRef.current = newDir
          setDir(newDir)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="text-center">
      <div className="flex justify-center gap-6 mb-3 text-sm">
        <span className="text-[#00ff88] font-bold">🐍 Score: {score}</span>
      </div>

      {gameOver && (
        <p className="text-[#ff0044] font-bold text-xl mb-3">
          {score >= 15 ? '🏆 Snake Master!' : '💀 Game Over!'} Score: {score}
        </p>
      )}

      {!started && !gameOver && (
        <p className="text-white/60 mb-3 text-sm">Use arrow keys or WASD to move</p>
      )}

      {/* Game Grid */}
      <div
        className="inline-grid gap-0 mx-auto mb-4 rounded-xl overflow-hidden border border-[rgba(0,212,255,0.2)]"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          background: 'rgba(10,10,46,0.5)',
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE
          const y = Math.floor(i / GRID_SIZE)
          const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y
          const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y)
          const isFood = food.x === x && food.y === y

          return (
            <div
              key={i}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                background: isSnakeHead
                  ? '#00ff88'
                  : isSnakeBody
                    ? '#00cc66'
                    : isFood
                      ? '#ff0044'
                      : 'rgba(255,255,255,0.03)',
                borderRadius: isSnakeHead ? '4px' : isFood ? '50%' : '0',
                boxShadow: isFood ? '0 0 8px #ff0044' : isSnakeHead ? '0 0 8px #00ff88' : 'none',
                transition: 'all 0.05s',
              }}
            />
          )
        })}
      </div>

      {/* Mobile controls */}
      <div className="flex flex-col items-center gap-1 mb-4 md:hidden">
        <button
          onClick={() => { dirRef.current = { x: 0, y: -1 }; setDir({ x: 0, y: -1 }) }}
          className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] cursor-pointer text-lg"
        >↑</button>
        <div className="flex gap-1">
          <button
            onClick={() => { dirRef.current = { x: -1, y: 0 }; setDir({ x: -1, y: 0 }) }}
            className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] cursor-pointer text-lg"
          >←</button>
          <button
            onClick={() => { dirRef.current = { x: 0, y: 1 }; setDir({ x: 0, y: 1 }) }}
            className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] cursor-pointer text-lg"
          >↓</button>
          <button
            onClick={() => { dirRef.current = { x: 1, y: 0 }; setDir({ x: 1, y: 0 }) }}
            className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] cursor-pointer text-lg"
          >→</button>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {!started && (
          <button
            onClick={() => setStarted(true)}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-white font-bold text-sm border-none cursor-pointer"
          >
            ▶️ Start
          </button>
        )}
        <button
          onClick={reset}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  )
}
