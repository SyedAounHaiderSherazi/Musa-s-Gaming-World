import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

const SIZE = 8;
const EMPTY = 0, RED = 1, BLUE = 2, RED_K = 3, BLUE_K = 4;

const createBoard = () => {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < SIZE; c++)
      if ((r + c) % 2 === 1) board[r][c] = BLUE;
  for (let r = 5; r < 8; r++)
    for (let c = 0; c < SIZE; c++)
      if ((r + c) % 2 === 1) board[r][c] = RED;
  return board;
};

const isPlayer = (p) => p === RED || p === RED_K;
const isAI = (p) => p === BLUE || p === BLUE_K;
const isKing = (p) => p === RED_K || p === BLUE_K;
const opposite = (p) => (isPlayer(p) ? [BLUE, BLUE_K] : [RED, RED_K]);

const getDirs = (piece) => {
  if (piece === RED_K || piece === BLUE_K) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  if (piece === RED) return [[-1, -1], [-1, 1]];
  return [[1, -1], [1, 1]];
};

const findJumps = (board, r, c, piece) => {
  const jumps = [];
  const dirs = getDirs(piece);
  for (const [dr, dc] of dirs) {
    const mr = r + dr, mc = c + dc;
    const nr = r + 2 * dr, nc = c + 2 * dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === EMPTY &&
      opposite(piece).includes(board[mr][mc])) {
      jumps.push({ fr: r, fc: c, tr: nr, tc: nc, mr, mc });
    }
  }
  return jumps;
};

const findMoves = (board, r, c, piece) => {
  const moves = [];
  const dirs = getDirs(piece);
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === EMPTY) {
      moves.push({ fr: r, fc: c, tr: nr, tc: nc });
    }
  }
  return moves;
};

const getAllMoves = (board, isPlayerTurn) => {
  const jumps = [], moves = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c];
      if (p === EMPTY) continue;
      if (isPlayerTurn && !isPlayer(p)) continue;
      if (!isPlayerTurn && !isAI(p)) continue;
      jumps.push(...findJumps(board, r, c, p));
      moves.push(...findMoves(board, r, c, p));
    }
  return jumps.length > 0 ? jumps : moves;
};

const makeMove = (board, move) => {
  const b = board.map(r => [...r]);
  let piece = b[move.fr][move.fc];
  b[move.fr][move.fc] = EMPTY;
  if (move.mr !== undefined) b[move.mr][move.mc] = EMPTY;
  if (piece === RED && move.tr === 0) piece = RED_K;
  if (piece === BLUE && move.tr === SIZE - 1) piece = BLUE_K;
  b[move.tr][move.tc] = piece;
  return b;
};

const hasPieces = (board, isP) => {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c];
      if (p !== EMPTY && (isP ? isPlayer(p) : isAI(p))) return true;
    }
  return false;
};

const aiEvaluate = (board) => {
  let score = 0;
  const values = { [RED]: -1, [RED_K]: -3, [BLUE]: 1, [BLUE_K]: 3 };
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      score += values[board[r][c]] || 0;
  return score;
};

const aiBestMove = (board) => {
  const allMoves = getAllMoves(board, false);
  if (allMoves.length === 0) return null;

  let bestScore = -Infinity, bestMoves = [];
  for (const move of allMoves) {
    const newBoard = makeMove(board, move);
    const score = aiEvaluate(newBoard) + Math.random() * 0.5;
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (Math.abs(score - bestScore) < 0.3) {
      bestMoves.push(move);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};

const CheckersGame = ({ onWin }) => {
  const [board, setBoard] = useState(createBoard);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [status, setStatus] = useState('Your turn (red)');

  const handleSquare = useCallback((r, c) => {
    if (!playerTurn || gameOver) return;
    const piece = board[r][c];
    if (isPlayer(piece) && !selected) {
      setSelected([r, c]);
      const moves = getAllMoves(board, true).filter(m => m.fr === r && m.fc === c);
      setValidMoves(moves);
      return;
    }
    if (selected) {
      const move = validMoves.find(m => m.tr === r && m.tc === c);
      if (move) {
        const newBoard = makeMove(board, move);
        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);

        if (!hasPieces(newBoard, true)) {
          setGameOver(true);
          setWinner('AI');
          return;
        }
        if (!hasPieces(newBoard, false)) {
          setGameOver(true);
          setWinner('You');
          onWin?.();
          return;
        }
        setPlayerTurn(false);
        setStatus('AI thinking...');
      } else {
        setSelected(null);
        setValidMoves([]);
      }
    }
  }, [board, selected, validMoves, playerTurn, gameOver, onWin]);

  useEffect(() => {
    if (!playerTurn && !gameOver) {
      const timer = setTimeout(() => {
        const move = aiBestMove(board);
        if (!move) {
          setGameOver(true);
          setWinner('You');
          onWin?.();
          return;
        }
        const newBoard = makeMove(board, move);
        setBoard(newBoard);
        setPlayerTurn(true);
        setStatus('Your turn (red)');

        if (!hasPieces(newBoard, false)) {
          setGameOver(true);
          setWinner('You');
          onWin?.();
        } else if (!hasPieces(newBoard, true)) {
          setGameOver(true);
          setWinner('AI');
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [playerTurn, gameOver, board, onWin]);

  const restart = () => {
    setBoard(createBoard());
    setSelected(null);
    setValidMoves([]);
    setPlayerTurn(true);
    setGameOver(false);
    setWinner('');
    setStatus('Your turn (red)');
  };

  const getPieceStyle = (piece) => {
    if (piece === RED || piece === RED_K) return 'bg-[#ff0055] shadow-[0_0_8px_#ff0055]';
    if (piece === BLUE || piece === BLUE_K) return 'bg-[#00aaff] shadow-[0_0_8px_#00aaff]';
    return '';
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3">
      <h2 className="text-xl font-bold text-[#00d4ff]">Checkers</h2>
      <div className="text-sm text-gray-400">{gameOver ? `${winner} wins!` : status}</div>
      <div className="p-2 rounded-xl border-2 border-[#ffee00] bg-[#1a1a2e]">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1;
              const isValidTarget = validMoves.some(m => m.tr === r && m.tc === c);
              const isSelected = selected && selected[0] === r && selected[1] === c;
              return (
                <div key={c}
                  onClick={() => handleSquare(r, c)}
                  className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center cursor-pointer transition-all
                    ${isDark ? 'bg-[#2a2a5e]' : 'bg-[#3a3a7e]'}
                    ${isSelected ? 'ring-2 ring-[#ffee00]' : ''}
                    ${isValidTarget ? 'ring-2 ring-[#00ff88] bg-[#00ff88]/10' : ''}`}>
                  {cell !== EMPTY && (
                    <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full ${getPieceStyle(cell)} flex items-center justify-center`}>
                      {isKing(cell) && <span className="text-[#ffee00] text-xs font-bold">K</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#ff0055] inline-block" /> You (Red)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#00aaff] inline-block" /> AI (Blue)</span>
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

export default CheckersGame;
