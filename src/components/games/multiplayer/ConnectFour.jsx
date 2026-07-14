import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

const ROWS = 6, COLS = 7;
const EMPTY = 0, PLAYER = 1, AI = 2;

const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));

const checkWin = (board, r, c, piece) => {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (let d = 1; d < 4; d++) {
      const nr = r + dr * d, nc = c + dc * d;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === piece) count++;
      else break;
    }
    for (let d = 1; d < 4; d++) {
      const nr = r - dr * d, nc = c - dc * d;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === piece) count++;
      else break;
    }
    if (count >= 4) return true;
  }
  return false;
};

const getValidCols = (board) => {
  const cols = [];
  for (let c = 0; c < COLS; c++) if (board[0][c] === EMPTY) cols.push(c);
  return cols;
};

const dropPiece = (board, col, piece) => {
  const newBoard = board.map(r => [...r]);
  for (let r = ROWS - 1; r >= 0; r--) {
    if (newBoard[r][col] === EMPTY) {
      newBoard[r][col] = piece;
      return { board: newBoard, row: r };
    }
  }
  return null;
};

const aiMove = (board) => {
  const valid = getValidCols(board);
  if (valid.length === 0) return -1;

  // Check if AI can win
  for (const c of valid) {
    const res = dropPiece(board, c, AI);
    if (res && checkWin(res.board, res.row, c, AI)) return c;
  }
  // Block player win
  for (const c of valid) {
    const res = dropPiece(board, c, PLAYER);
    if (res && checkWin(res.board, res.row, c, PLAYER)) return c;
  }
  // Prefer center
  const center = 3;
  if (valid.includes(center)) return center;
  // Random from valid
  return valid[Math.floor(Math.random() * valid.length)];
};

const ConnectFour = ({ onWin }) => {
  const [board, setBoard] = useState(createBoard);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [lastMove, setLastMove] = useState(null);
  const [winCells, setWinCells] = useState([]);

  const findWinCells = (board, r, c, piece) => {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of dirs) {
      const cells = [[r, c]];
      for (let d = 1; d < 4; d++) {
        const nr = r + dr * d, nc = c + dc * d;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === piece) cells.push([nr, nc]);
        else break;
      }
      for (let d = 1; d < 4; d++) {
        const nr = r - dr * d, nc = c - dc * d;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === piece) cells.push([nr, nc]);
        else break;
      }
      if (cells.length >= 4) return cells;
    }
    return [];
  };

  const handleDrop = useCallback((col) => {
    if (!playerTurn || gameOver) return;
    const res = dropPiece(board, col, PLAYER);
    if (!res) return;
    setLastMove([res.row, col]);
    const newBoard = res.board;
    if (checkWin(newBoard, res.row, col, PLAYER)) {
      setWinCells(findWinCells(newBoard, res.row, col, PLAYER));
      setBoard(newBoard);
      setGameOver(true);
      setWinner('You');
      onWin?.();
      return;
    }
    if (getValidCols(newBoard).length === 0) {
      setBoard(newBoard);
      setGameOver(true);
      setWinner("It's a Tie");
      return;
    }
    setBoard(newBoard);
    setPlayerTurn(false);
  }, [board, playerTurn, gameOver, onWin]);

  // AI turn
  const doAiTurn = useCallback(() => {
    if (gameOver || playerTurn) return;
    const col = aiMove(board);
    if (col === -1) return;
    setTimeout(() => {
      const res = dropPiece(board, col, AI);
      if (!res) return;
      setLastMove([res.row, col]);
      const newBoard = res.board;
      if (checkWin(newBoard, res.row, col, AI)) {
        setWinCells(findWinCells(newBoard, res.row, col, AI));
        setBoard(newBoard);
        setGameOver(true);
        setWinner('AI');
        return;
      }
      setBoard(newBoard);
      setPlayerTurn(true);
    }, 500);
  }, [board, playerTurn, gameOver]);

  useEffect(() => {
    if (!playerTurn && !gameOver) {
      doAiTurn();
    }
  }, [playerTurn, gameOver, doAiTurn]);

  const restart = () => {
    setBoard(createBoard());
    setPlayerTurn(true);
    setGameOver(false);
    setWinner('');
    setLastMove(null);
    setWinCells([]);
  };

  const isWinCell = (r, c) => winCells.some(([wr, wc]) => wr === r && wc === c);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3">
      <h2 className="text-xl font-bold text-[#00d4ff]">Connect Four</h2>
      <div className="text-sm text-gray-400">
        {gameOver ? (winner === "It's a Tie" ? "It's a Tie!" : `${winner} wins!`) :
          playerTurn ? 'Your turn (blue)' : 'AI thinking...'}
      </div>
      <div className="bg-[#1a1a3e] p-3 rounded-xl border-2 border-[#ff00ff]">
        {board.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((cell, c) => (
              <motion.button key={c}
                whileHover={!gameOver && playerTurn ? { scale: 1.1 } : {}}
                whileTap={!gameOver && playerTurn ? { scale: 0.95 } : {}}
                onClick={() => handleDrop(c)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 cursor-pointer transition-all duration-300
                  ${cell === EMPTY ? 'bg-[#0a0a2e] border-[#2a2a5e] hover:border-[#00d4ff]' :
                    cell === PLAYER ? 'bg-[#00d4ff] border-[#00d4ff]' :
                    'bg-[#ff00ff] border-[#ff00ff]'}
                  ${isWinCell(r, c) ? 'ring-2 ring-[#ffee00] shadow-lg shadow-[#ffee00]/50' : ''}`}
                style={cell !== EMPTY ? { boxShadow: `0 0 12px ${cell === PLAYER ? '#00d4ff' : '#ff00ff'}` } : {}}
                disabled={gameOver || !playerTurn || cell !== EMPTY}
              />
            ))}
          </div>
        ))}
      </div>
      {gameOver && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
          <button onClick={restart}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer">
            Play Again
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ConnectFour;
