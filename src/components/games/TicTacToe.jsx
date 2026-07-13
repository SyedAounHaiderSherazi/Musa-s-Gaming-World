/* Tic Tac Toe Game */
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function TicTacToe({ onWin }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isX, setIsX] = useState(true)
  const [winner, setWinner] = useState(null)
  const [draw, setDraw] = useState(false)

  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ]

  const checkWinner = (squares) => {
    for (const [a,b,c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const computerMove = useCallback((currentBoard) => {
    const empty = currentBoard.map((cell, i) => cell === null ? i : null).filter(i => i !== null)
    if (empty.length === 0) return

    // Try to win
    for (const i of empty) {
      const test = [...currentBoard]
      test[i] = 'O'
      if (checkWinner(test) === 'O') { setBoard(test); return }
    }
    // Block player win
    for (const i of empty) {
      const test = [...currentBoard]
      test[i] = 'X'
      if (checkWinner(test) === 'X') {
        const newBoard = [...currentBoard]
        newBoard[i] = 'O'
        setBoard(newBoard)
        const w = checkWinner(newBoard)
        if (w) { setWinner(w); if (onWin) onWin() }
        else if (newBoard.every(Boolean)) setDraw(true)
        return
      }
    }
    // Take center or random
    const move = empty.includes(4) ? 4 : empty[Math.floor(Math.random() * empty.length)]
    const newBoard = [...currentBoard]
    newBoard[move] = 'O'
    setBoard(newBoard)
    const w = checkWinner(newBoard)
    if (w) { setWinner(w); if (onWin) onWin() }
    else if (newBoard.every(Boolean)) setDraw(true)
  }, [onWin])

  const handleClick = (i) => {
    if (board[i] || winner || !isX) return
    const newBoard = [...board]
    newBoard[i] = 'X'
    setBoard(newBoard)

    const w = checkWinner(newBoard)
    if (w) {
      setWinner(w)
      if (onWin) onWin()
    } else if (newBoard.every(Boolean)) {
      setDraw(true)
    } else {
      setIsX(false)
      // Computer moves after short delay
      setTimeout(() => {
        const currentBoard = newBoard
        const empty = currentBoard.map((cell, i) => cell === null ? i : null).filter(i => i !== null)
        if (empty.length === 0) return

        // Try to win
        for (const idx of empty) {
          const test = [...currentBoard]
          test[idx] = 'O'
          if (checkWinner(test) === 'O') {
            setBoard(test)
            setWinner('O')
            if (onWin) onWin()
            setIsX(true)
            return
          }
        }
        // Block player
        for (const idx of empty) {
          const test = [...currentBoard]
          test[idx] = 'X'
          if (checkWinner(test) === 'X') {
            const nb = [...currentBoard]
            nb[idx] = 'O'
            setBoard(nb)
            const cw = checkWinner(nb)
            if (cw) { setWinner(cw); if (onWin) onWin() }
            else if (nb.every(Boolean)) setDraw(true)
            setIsX(true)
            return
          }
        }
        // Center or random
        const move = empty.includes(4) ? 4 : empty[Math.floor(Math.random() * empty.length)]
        const nb = [...currentBoard]
        nb[move] = 'O'
        setBoard(nb)
        const cw = checkWinner(nb)
        if (cw) { setWinner(cw); if (onWin) onWin() }
        else if (nb.every(Boolean)) setDraw(true)
        setIsX(true)
      }, 300)
    }
  }

  const reset = () => {
    setBoard(Array(9).fill(null))
    setIsX(true)
    setWinner(null)
    setDraw(false)
  }

  return (
    <div className="text-center">
      <div className="mb-4">
        {winner ? (
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[#00ff88] font-bold text-xl"
          >
            {winner === 'X' ? '🎉 You Win!' : '🤖 Computer Wins!'}
          </motion.p>
        ) : draw ? (
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#ffee00] font-bold text-xl">
            🤝 Draw!
          </motion.p>
        ) : (
          <p className="text-white/70">
            {isX ? '🔵 Your turn (X)' : '🤖 Computer thinking...'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-4">
        {board.map((cell, i) => (
          <motion.button
            key={i}
            whileHover={!cell && !winner && isX ? { scale: 1.1 } : {}}
            whileTap={!cell && !winner && isX ? { scale: 0.9 } : {}}
            onClick={() => handleClick(i)}
            className="w-20 h-20 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(0,212,255,0.2)] text-3xl font-bold text-white cursor-pointer flex items-center justify-center"
            style={{
              color: cell === 'X' ? '#00d4ff' : cell === 'O' ? '#ff0044' : 'transparent',
            }}
          >
            <motion.span
              initial={cell ? { scale: 0 } : {}}
              animate={cell ? { scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {cell}
            </motion.span>
          </motion.button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={reset}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer"
      >
        🔄 Restart
      </motion.button>
    </div>
  )
}
