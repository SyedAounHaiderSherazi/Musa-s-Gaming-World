import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const W = 600, H = 400, PUCK_R = 12, PADDLE_R = 20, WIN_SCORE = 7;

const AirHockey = ({ onWin }) => {
  const canvasRef = useRef(null);
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const gameRef = useRef({
    puck: { x: W / 2, y: H / 2, vx: 3, vy: 2 },
    playerPaddle: { x: W / 2, y: H - 40 },
    aiPaddle: { x: W / 2, y: 40 },
    mouse: { x: W / 2, y: H - 40 },
    scores: { player: 0, ai: 0 },
    running: true,
  });

  const restart = useCallback(() => {
    const g = gameRef.current;
    g.puck = { x: W / 2, y: H / 2, vx: (Math.random() > 0.5 ? 3 : -3), vy: 3 };
    g.scores = { player: 0, ai: 0 };
    g.running = true;
    setScores({ player: 0, ai: 0 });
    setGameOver(false);
    setWinner('');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      gameRef.current.mouse = {
        x: ((clientX - rect.left) / rect.width) * W,
        y: ((clientY - rect.top) / rect.height) * H,
      };
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: true });

    const resetPuck = (dir) => {
      gameRef.current.puck = { x: W / 2, y: H / 2, vx: (Math.random() > 0.5 ? 3 : -3) * dir, vy: 3 * dir };
    };

    const update = () => {
      const g = gameRef.current;
      if (!g.running) return;
      const p = g.puck;

      // Player paddle follows mouse
      g.playerPaddle.x += (g.mouse.x - g.playerPaddle.x) * 0.15;
      g.playerPaddle.y = H - 40;

      // AI tracks puck with lag
      const aiTargetX = p.x + (Math.random() - 0.5) * 40;
      g.aiPaddle.x += (aiTargetX - g.aiPaddle.x) * 0.06;
      g.aiPaddle.y = 40;

      // Clamp paddles
      g.playerPaddle.x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, g.playerPaddle.x));
      g.aiPaddle.x = Math.max(PADDLE_R, Math.min(W - PADDLE_R, g.aiPaddle.x));

      // Move puck
      p.x += p.vx;
      p.y += p.vy;

      // Wall bounce
      if (p.x - PUCK_R <= 0 || p.x + PUCK_R >= W) p.vx *= -1;
      p.x = Math.max(PUCK_R, Math.min(W - PUCK_R, p.x));

      // Paddle collision
      const paddleBounce = (pad) => {
        const dx = p.x - pad.x, dy = p.y - pad.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PUCK_R + PADDLE_R) {
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          p.vx = Math.cos(angle) * speed * 1.1;
          p.vy = Math.sin(angle) * speed * 1.1;
          p.x = pad.x + Math.cos(angle) * (PUCK_R + PADDLE_R + 1);
          p.y = pad.y + Math.sin(angle) * (PUCK_R + PADDLE_R + 1);
        }
      };
      paddleBounce(g.playerPaddle);
      paddleBounce(g.aiPaddle);

      // Goal detection
      if (p.y - PUCK_R <= 0) {
        g.scores.player++;
        setScores({ ...g.scores });
        if (g.scores.player >= WIN_SCORE) {
          g.running = false;
          setGameOver(true);
          setWinner('You');
          onWin?.();
        } else resetPuck(1);
      }
      if (p.y + PUCK_R >= H) {
        g.scores.ai++;
        setScores({ ...g.scores });
        if (g.scores.ai >= WIN_SCORE) {
          g.running = false;
          setGameOver(true);
          setWinner('AI');
        } else resetPuck(-1);
      }
    };

    const draw = () => {
      const g = gameRef.current;
      const p = g.puck;
      ctx.clearRect(0, 0, W, H);

      // Table
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, W - 8, H - 8);

      // Center line
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = '#ff00ff55';
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center circle
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 50, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff00ff44';
      ctx.stroke();

      // Goals
      ctx.fillStyle = '#00ff8844';
      ctx.fillRect(W / 2 - 60, 0, 120, 6);
      ctx.fillRect(W / 2 - 60, H - 6, 120, 6);

      // Paddles
      const drawPaddle = (x, y, color) => {
        ctx.beginPath();
        ctx.arc(x, y, PADDLE_R, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      };
      drawPaddle(g.playerPaddle.x, g.playerPaddle.y, '#00ff88');
      drawPaddle(g.aiPaddle.x, g.aiPaddle.y, '#ff8800');

      // Puck
      ctx.beginPath();
      ctx.arc(p.x, p.y, PUCK_R, 0, Math.PI * 2);
      ctx.fillStyle = '#ffee00';
      ctx.shadowColor = '#ffee00';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Scores
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`YOU: ${g.scores.player}`, 80, H - 15);
      ctx.fillStyle = '#ff8800';
      ctx.fillText(`AI: ${g.scores.ai}`, W - 80, 25);
    };

    const loop = () => {
      update();
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
    };
  }, [onWin]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3">
      <h2 className="text-xl font-bold text-[#00d4ff]">Air Hockey</h2>
      <div className="text-sm text-gray-400">First to {WIN_SCORE} wins! Move mouse to control paddle.</div>
      <canvas ref={canvasRef} width={W} height={H}
        className="rounded-xl border-2 border-[#00d4ff] cursor-none max-w-full" />
      {gameOver && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="text-center">
          <p className={`text-2xl font-bold ${winner === 'You' ? 'text-[#00ff88]' : 'text-[#ff00ff]'}`}>
            {winner === 'You' ? 'You Win!' : 'AI Wins!'}
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

export default AirHockey;
