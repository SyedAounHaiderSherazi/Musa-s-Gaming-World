import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const ACTIONS = ['attack', 'heavy', 'block', 'special']
const AI_COOLDOWN = 1200

export default function SwordDuel({ onWin }) {
  const [playerHP, setPlayerHP] = useState(100)
  const [aiHP, setAiHP] = useState(100)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [log, setLog] = useState([])
  const [playerAnim, setPlayerAnim] = useState(null)
  const [aiAnim, setAiAnim] = useState(null)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [score, setScore] = useState(0)
  const playerHPRef = useRef(100)
  const aiHPRef = useRef(100)
  const scoreRef = useRef(0)
  const logRef = useRef([])
  const winFiredRef = useRef(false)
  const aiTimerRef = useRef(null)

  const startGame = () => {
    playerHPRef.current = 100
    aiHPRef.current = 100
    scoreRef.current = 0
    logRef.current = []
    setPlayerHP(100)
    setAiHP(100)
    setScore(0)
    setLog([])
    setGameOver(false)
    setStarted(true)
    setIsPlayerTurn(true)
    setPlayerAnim(null)
    setAiAnim(null)
    winFiredRef.current = false
  }

  const addLog = (msg) => {
    logRef.current = [msg, ...logRef.current].slice(0, 5)
    setLog([...logRef.current])
  }

  const aiTurn = useCallback(() => {
    if (!started || gameOver) return
    const choices = ['attack', 'attack', 'attack', 'block', 'heavy', 'special']
    const action = choices[Math.floor(Math.random() * choices.length)]
    setAiAnim(action)
    setTimeout(() => {
      setAiAnim(null)
      setIsPlayerTurn(true)
    }, 500)
  }, [started, gameOver])

  useEffect(() => {
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current) }
  }, [])

  useEffect(() => {
    if (gameOver && score >= 3 && onWin && !winFiredRef.current) {
      winFiredRef.current = true
      onWin()
    }
  }, [gameOver, score, onWin])

  const handleAction = useCallback((action) => {
    if (!started || gameOver || !isPlayerTurn) return
    setIsPlayerTurn(false)
    setPlayerAnim(action)

    let pDmg = 0

    switch (action) {
      case 'attack': pDmg = 12 + Math.floor(Math.random() * 6); break
      case 'heavy': pDmg = 22 + Math.floor(Math.random() * 8); break
      case 'block': pDmg = 4; break
      case 'special': pDmg = 18 + Math.floor(Math.random() * 10); break
      default: break
    }

    aiHPRef.current = Math.max(0, aiHPRef.current - pDmg)
    setAiHP(aiHPRef.current)

    addLog(`You ${action} for ${pDmg} dmg!`)

    if (aiHPRef.current <= 0) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      addLog('🎉 You won this round!')
      setTimeout(() => {
        aiHPRef.current = 100
        playerHPRef.current = Math.min(100, playerHPRef.current + 20)
        setAiHP(100)
        setPlayerHP(playerHPRef.current)
        setPlayerAnim(null)
        setIsPlayerTurn(true)
      }, 1200)
      return
    }
    if (playerHPRef.current <= 0) {
      setGameOver(true)
      setStarted(false)
      addLog('💀 You were defeated!')
      return
    }

    setTimeout(() => {
      setPlayerAnim(null)
      // AI turn after delay
      aiTimerRef.current = setTimeout(() => {
        const aiActions = ['attack', 'attack', 'block', 'heavy', 'special']
        const act = aiActions[Math.floor(Math.random() * aiActions.length)]
        setAiAnim(act)
        let aDmg2 = 0, pDmg2 = 0
        switch (act) {
          case 'attack': aDmg2 = 12 + Math.floor(Math.random() * 6); break
          case 'heavy': aDmg2 = 22 + Math.floor(Math.random() * 8); break
          case 'block': aDmg2 = 4; break
          case 'special': aDmg2 = 18 + Math.floor(Math.random() * 10); break
          default: break
        }
        if (act === 'block') aDmg2 = Math.floor(aDmg2 * 0.3)
        playerHPRef.current = Math.max(0, playerHPRef.current - aDmg2)
        setPlayerHP(playerHPRef.current)
        addLog(`AI ${act} for ${aDmg2} dmg!`)

        if (playerHPRef.current <= 0) {
          setGameOver(true)
          setStarted(false)
          addLog('💀 You were defeated!')
          return
        }
        setTimeout(() => {
          setAiAnim(null)
          setIsPlayerTurn(true)
        }, 500)
      }, AI_COOLDOWN)
    }, 600)
  }, [started, gameOver, isPlayerTurn])

  const btnStyle = "px-4 py-2 rounded-xl text-white font-bold text-sm border-none cursor-pointer disabled:opacity-40"

  return (
    <div className="text-center max-w-md mx-auto">
      <div className="flex justify-center gap-4 mb-3 text-sm flex-wrap">
        <span className="text-[#ffee00] font-bold">🏆 Wins: {score}</span>
        <span className="text-[#ff0044] font-bold">❤️ You: {playerHP}%</span>
        <span className="text-[#aa00ff] font-bold">🤖 AI: {aiHP}%</span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1 px-2">
          <span className="text-white/60 text-xs">You</span>
          <span className="text-white/60 text-xs">{playerHP}%</span>
        </div>
        <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
          <motion.div className="h-full rounded-full" animate={{ width: `${playerHP}%` }}
            style={{ background: playerHP > 50 ? 'linear-gradient(90deg,#00ff88,#00d4ff)' : 'linear-gradient(90deg,#ff8800,#ff0044)' }} />
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1 px-2">
          <span className="text-white/60 text-xs">AI</span>
          <span className="text-white/60 text-xs">{aiHP}%</span>
        </div>
        <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
          <motion.div className="h-full rounded-full" animate={{ width: `${aiHP}%` }}
            style={{ background: 'linear-gradient(90deg,#aa00ff,#ff00ff)' }} />
        </div>
      </div>

      <div className="flex justify-center gap-6 mb-4 text-4xl">
        <motion.div animate={playerAnim ? { x: playerAnim === 'block' ? 0 : 20, scale: playerAnim === 'heavy' ? 1.3 : 1 } : { x: 0, scale: 1 }}
          transition={{ duration: 0.3 }}>
          <div className="text-center">
            <div>⚔️</div>
            <div className="text-xs text-white/60 mt-1">You</div>
            {playerAnim && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs font-bold text-[#ffee00]">{playerAnim}</motion.div>}
          </div>
        </motion.div>
        <span className="text-2xl self-center text-white/40">VS</span>
        <motion.div animate={aiAnim ? { x: aiAnim === 'block' ? 0 : -20, scale: aiAnim === 'heavy' ? 1.3 : 1 } : { x: 0, scale: 1 }}
          transition={{ duration: 0.3 }}>
          <div className="text-center">
            <div>🤖</div>
            <div className="text-xs text-white/60 mt-1">AI</div>
            {aiAnim && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs font-bold text-[#ff00ff]">{aiAnim}</motion.div>}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={!started || !isPlayerTurn || gameOver}
          onClick={() => handleAction('attack')} className={`${btnStyle} bg-gradient-to-r from-[#ff0044] to-[#ff8800]`}>⚔️ Attack</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={!started || !isPlayerTurn || gameOver}
          onClick={() => handleAction('heavy')} className={`${btnStyle} bg-gradient-to-r from-[#ff8800] to-[#ffee00]`}>💥 Heavy</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={!started || !isPlayerTurn || gameOver}
          onClick={() => handleAction('block')} className={`${btnStyle} bg-gradient-to-r from-[#00d4ff] to-[#00ff88]`}>🛡️ Block</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={!started || !isPlayerTurn || gameOver}
          onClick={() => handleAction('special')} className={`${btnStyle} bg-gradient-to-r from-[#aa00ff] to-[#ff00ff]`}>✨ Special</motion.button>
      </div>

      <div className="h-20 overflow-y-auto text-xs text-left px-2 mb-3 rounded-lg bg-black/30 border border-white/5">
        {log.map((l, i) => <div key={i} className="text-white/50 py-0.5 border-b border-white/5">{l}</div>)}
      </div>

      {gameOver && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-3">
          <p className="text-[#ff0044] font-bold text-lg">💀 Defeated!</p>
          <p className="text-white/60 text-sm">Wins: {score}</p>
        </motion.div>
      )}

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame}
        disabled={started && !gameOver}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer disabled:opacity-50">
        {gameOver ? '🔄 Retry' : started ? '⏳ Fighting...' : '⚔️ Start Duel!'}
      </motion.button>
    </div>
  )
}
