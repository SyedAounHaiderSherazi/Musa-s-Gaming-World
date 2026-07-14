import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

const SIZE = 10;
const SHIPS = [5, 4, 3, 3, 2];
const SHIP_NAMES = ['Carrier', 'Battleship', 'Cruiser', 'Submarine', 'Destroyer'];
const WATER = 0, SHIP = 1, MISS = 2, HIT = 3, SUNK = 4;

const createGrid = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(WATER));

const canPlace = (grid, ship, r, c, horiz) => {
  for (let i = 0; i < ship; i++) {
    const nr = r + (horiz ? 0 : i), nc = c + (horiz ? i : 0);
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return false;
    if (grid[nr][nc] !== WATER) return false;
  }
  return true;
};

const placeOnGrid = (grid, ship, r, c, horiz) => {
  const g = grid.map(row => [...row]);
  const cells = [];
  for (let i = 0; i < ship; i++) {
    const nr = r + (horiz ? 0 : i), nc = c + (horiz ? i : 0);
    g[nr][nc] = SHIP;
    cells.push([nr, nc]);
  }
  return { grid: g, cells };
};

const randomPlaceAll = (ships) => {
  let grid = createGrid();
  const placements = [];
  for (const ship of ships) {
    let placed = false;
    while (!placed) {
      const horiz = Math.random() > 0.5;
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      if (canPlace(grid, ship, r, c, horiz)) {
        const result = placeOnGrid(grid, ship, r, c, horiz);
        grid = result.grid;
        placements.push({ cells: result.cells, hits: 0, sunk: false });
        placed = true;
      }
    }
  }
  return { grid, placements };
};

const checkSunk = (placement) => placement.hits >= placement.cells.length;

const Battleship = ({ onWin }) => {
  const [phase, setPhase] = useState('placing');
  const [playerGrid, setPlayerGrid] = useState(createGrid);
  const [aiGridData] = useState(() => randomPlaceAll(SHIPS));
  const [playerGridData, setPlayerGridData] = useState([]);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [playerShots, setPlayerShots] = useState(createGrid);
  const [aiShots, setAiShots] = useState(createGrid);
  const [currentShip, setCurrentShip] = useState(0);
  const [horizontal, setHorizontal] = useState(true);
  const [hoverCell, setHoverCell] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [message, setMessage] = useState('Place your Carrier (5 cells)');
  const [aiTracker, setAiTracker] = useState([]);
  const aiHitsRef = useRef([]);

  const previewCells = useCallback(() => {
    if (!hoverCell || phase !== 'placing' || currentShip >= SHIPS.length) return [];
    const [r, c] = hoverCell;
    const cells = [];
    for (let i = 0; i < SHIPS[currentShip]; i++) {
      const nr = r + (horizontal ? 0 : i), nc = c + (horizontal ? i : 0);
      cells.push([nr, nc]);
    }
    return cells;
  }, [hoverCell, phase, currentShip, horizontal]);

  const handlePlayerPlace = (r, c) => {
    if (phase !== 'placing' || currentShip >= SHIPS.length) return;
    if (!canPlace(playerGrid, SHIPS[currentShip], r, c, horizontal)) return;
    const result = placeOnGrid(playerGrid, SHIPS[currentShip], r, c, horizontal);
    setPlayerGrid(result.grid);
    setPlayerGridData(prev => [...prev, { cells: result.cells, hits: 0, sunk: false }]);
    const next = currentShip + 1;
    setCurrentShip(next);
    if (next >= SHIPS.length) {
      setPhase('battle');
      setMessage('All ships placed! Click enemy grid to fire!');
    } else {
      setMessage(`Place your ${SHIP_NAMES[next]} (${SHIPS[next]} cells)`);
    }
  };

  const handlePlayerShot = (r, c) => {
    if (!playerTurn || gameOver || phase !== 'battle') return;
    if (playerShots[r][c] !== WATER) return;
    const newShots = playerShots.map(row => [...row]);
    if (aiGridData.grid[r][c] === SHIP) {
      newShots[r][c] = HIT;
      for (const p of aiGridData.placements) {
        if (p.cells.some(([cr, cc]) => cr === r && cc === c)) {
          p.hits++;
          if (checkSunk(p)) {
            p.sunk = true;
            for (const [sr, sc] of p.cells) newShots[sr][sc] = SUNK;
            setMessage(`You sunk their ${SHIP_NAMES[aiGridData.placements.indexOf(p)]}!`);
          } else {
            setMessage('Hit!');
          }
          break;
        }
      }
    } else {
      newShots[r][c] = MISS;
      setMessage('Miss!');
    }
    setPlayerShots(newShots);

    const allSunk = aiGridData.placements.every(p => p.sunk);
    if (allSunk) {
      setGameOver(true);
      setWinner('You');
      setMessage('You win! All enemy ships destroyed!');
      onWin?.();
      return;
    }
    setPlayerTurn(false);

    // AI turn after delay
    setTimeout(() => {
      doAiTurn();
    }, 800);
  };

  const doAiTurn = () => {
    const newShots = aiShots.map(row => [...row]);
    let r, c;

    // Smart targeting: if we have hits, try adjacent cells
    const hits = aiHitsRef.current;
    if (hits.length > 0) {
      const last = hits[hits.length - 1];
      const adj = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const candidates = adj.map(([dr, dc]) => [last[0] + dr, last[1] + dc])
        .filter(([nr, nc]) => nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && newShots[nr][nc] === WATER);
      if (candidates.length > 0) {
        [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    if (r === undefined) {
      do {
        r = Math.floor(Math.random() * SIZE);
        c = Math.floor(Math.random() * SIZE);
      } while (newShots[r][c] !== WATER);
    }

    if (playerGrid[r][c] === SHIP) {
      newShots[r][c] = HIT;
      aiHitsRef.current.push([r, c]);
      for (const p of playerGridData) {
        if (p.cells.some(([cr, cc]) => cr === r && cc === c)) {
          p.hits++;
          if (checkSunk(p)) {
            p.sunk = true;
            aiHitsRef.current = aiHitsRef.current.filter(([hr, hc]) =>
              !p.cells.some(([cr, cc]) => cr === hr && cc === hc));
          }
          break;
        }
      }
    } else {
      newShots[r][c] = MISS;
    }
    setAiShots(newShots);

    const allSunk = playerGridData.every(p => p.sunk);
    if (allSunk) {
      setGameOver(true);
      setWinner('AI');
      setMessage('AI wins! Your fleet is destroyed!');
      return;
    }
    setPlayerTurn(true);
  };

  const restart = () => {
    const newAiData = randomPlaceAll(SHIPS);
    Object.assign(aiGridData, newAiData);
    setPlayerGrid(createGrid());
    setPlayerGridData([]);
    setPlayerShots(createGrid());
    setAiShots(createGrid());
    setCurrentShip(0);
    setHorizontal(true);
    setPhase('placing');
    setPlayerTurn(true);
    setGameOver(false);
    setWinner('');
    setMessage('Place your Carrier (5 cells)');
    aiHitsRef.current = [];
  };

  const preview = previewCells();
  const validPreview = phase === 'placing' && hoverCell && canPlace(playerGrid, SHIPS[currentShip] || 1, hoverCell[0], hoverCell[1], horizontal);

  const renderGrid = (grid, shots, isEnemy) => (
    <div className="grid grid-cols-10 gap-px">
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const shot = shots[r][c];
          const isPreview = isEnemy && false;
          const pShot = !isEnemy ? shots[r][c] : undefined;
          const showShip = !isEnemy && cell === SHIP && phase === 'placing';
          const inPreview = preview.some(([pr, pc]) => pr === r && pc === c) && validPreview;
          return (
            <div key={`${r}-${c}`}
              onClick={() => isEnemy ? handlePlayerShot(r, c) : handlePlayerPlace(r, c)}
              onMouseEnter={() => !isEnemy && setHoverCell([r, c])}
              onMouseLeave={() => !isEnemy && setHoverCell(null)}
              className={`w-6 h-6 sm:w-8 sm:h-8 border border-[#1a1a3e] flex items-center justify-center text-xs font-bold transition-all
                ${isEnemy ? 'cursor-pointer hover:bg-[#ff00ff20]' : ''}
                ${shot === HIT ? 'bg-[#ff0055] text-white' :
                  shot === MISS ? 'bg-[#334]' :
                  shot === SUNK ? 'bg-[#ff00ff] text-white' :
                  inPreview ? 'bg-[#00ff88]/30 ring-1 ring-[#00ff88]' :
                  showShip ? 'bg-[#00d4ff]/40' : 'bg-[#0a0a2e]'}
                ${isEnemy && shot === WATER ? 'hover:bg-[#00d4ff20]' : ''}`}>
              {shot === HIT && 'X'}
              {shot === SUNK && '\u2620'}
              {shot === MISS && '\u00B7'}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3">
      <h2 className="text-xl font-bold text-[#00d4ff]">Battleship</h2>
      <div className="text-sm text-gray-400">{message}</div>
      {phase === 'placing' && (
        <button onClick={() => setHorizontal(h => !h)}
          className="px-3 py-1 rounded-lg bg-[#1a1a3e] text-[#00d4ff] border border-[#00d4ff] text-xs cursor-pointer">
          Rotation: {horizontal ? 'Horizontal' : 'Vertical'}
        </button>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="text-center">
          <div className="text-xs text-[#00ff88] mb-1 font-bold">Your Fleet</div>
          {renderGrid(playerGrid, aiShots, false)}
        </div>
        <div className="text-center">
          <div className="text-xs text-[#ff00ff] mb-1 font-bold">Enemy Waters</div>
          {renderGrid(
            aiGridData.grid.map(row => row.map(() => WATER)),
            playerShots, true
          )}
        </div>
      </div>
      <div className="flex gap-3 text-xs">
        <span className="text-[#ff0055]">X = Hit</span>
        <span className="text-[#ff00ff]">\u2620 = Sunk</span>
        <span className="text-gray-500">\u00B7 = Miss</span>
      </div>
      {gameOver && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
          <p className={`text-xl font-bold ${winner === 'You' ? 'text-[#00ff88]' : 'text-[#ff00ff]'}`}>
            {winner === 'You' ? 'Victory!' : 'Defeated!'}
          </p>
          <button onClick={restart}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#ff00ff] text-white font-bold text-sm border-none cursor-pointer mt-2">
            Play Again
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Battleship;
