import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const W = 600, H = 400, PADDLE_W = 12, PADDLE_H = 80, BALL_R = 8, WIN_SCORE = 5;

const PongGame = ({ onWin }) => {
  const canvasRef = useRef(null);
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const gameRef = useRef({
    ball: { x: W / 2, y: H / 2, vx: 4, vy: 3 },
    player: { y: H / 2 - PADDLE_H / 2, moving: 0 },
    ai: { y: H / 2 - PADDLE_H / 2 },
    scores: { player: 0, ai: 0 },
    keys: {},
    running: true,
  });

  const restart = useCallback(() => {
    const g = gameRef.current;
    g.ball = { x: W / 2, y: H / 2, vx: 4 * (Math.random() > 0.5 ? 1 : -1), vy: 3 * (Math.random() > 0.5 ? 1 : -1) };
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

    const handleKey = (e) => {
      gameRef.current.keys[e.key.toLowerCase()] = e.type === 'keydown';
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      const y = ((e.clientY - rect.top) / rect.height) * H;
      gameRef.current.player.y = y - PADDLE_H / 2;
    };
    const handleTouch = (e) => {
      const rect = canvas.getBoundingClientRect();
      const y = ((e.touches[0].clientY - rect.top) / rect.height) * H;
      gameRef.current.player.y = y - PADDLE_H / 2;
    };
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: true });

    const resetBall = () => {
      const g = gameRef.current;
      g.ball = { x: W / 2, y: H / 2, vx: 4 * (Math.random() > 0.5 ? 1 : -1), vy: 3 * (Math.random() > 0.5 ? 1 : -1) };
    };

    const update = () => {
      const g = gameRef.current;
      if (!g.running) return;
      const b = g.ball;

      // WASD / Arrow keys
      if (g.keys['w'] || g.keys['arrowup']) g.player.y -= 6;
      if (g.keys['s'] || g.keys['arrowdown']) g.player.y += 6;
      g.player.y = Math.max(0, Math.min(H - PADDLE_H, g.player.y));

      // AI movement
      const aiCenter = g.ai.y + PADDLE_H / 2;
      const diff = b.y - aiCenter;
      g.ai.y += diff * 0.06;
      g.ai.y = Math.max(0, Math.min(H - PADDLE_H, g.ai.y));

      // Ball movement
      b.x += b.vx;
      b.y += b.vy;

      // Top/bottom bounce
      if (b.y - BALL_R <= 0 || b.y + BALL_R >= H) b.vy *= -1;
      b.y = Math.max(BALL_R, Math.min(H - BALL_R, b.y));

      // Player paddle bounce (left)
      if (b.x - BALL_R <= PADDLE_W + 20 && b.y >= g.player.y && b.y <= g.player.y + PADDLE_H && b.vx < 0) {
        b.vx *= -1.05;
        b.vy += (b.y - (g.player.y + PADDLE_H / 2)) * 0.15;
        b.x = PADDLE_W + 21 + BALL_R;
      }

      // AI paddle bounce (right)
      if (b.x + BALL_R >= W - PADDLE_W - 20 && b.y >= g.ai.y && b.y <= g.ai.y + PADDLE_H && b.vx > 0) {
        b.vx *= -1.05;
        b.vy += (b.y - (g.ai.y + PADDLE_H / 2)) * 0.15;
        b.x = W - PADDLE_W - 21 - BALL_R;
      }

      // Scoring
      if (b.x < 0) {
        g.scores.ai++;
        setScores({ ...g.scores });
        if (g.scores.ai >= WIN_SCORE) {
          g.running = false;
          setGameOver(true);
          setWinner('AI');
        } else resetBall();
      }
      if (b.x > W) {
        g.scores.player++;
        setScores({ ...g.scores });
        if (g.scores.player >= WIN_SCORE) {
          g.running = false;
          setGameOver(true);
          setWinner('You');
          onWin?.();
        } else resetBall();
      }
    };

    const draw = () => {
      const g = gameRef.current;
      const b = g.ball;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, W, H);

      // Center line
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#00d4ff33';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center circle
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 40, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff00ff33';
      ctx.stroke();

      // Paddles
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(20, g.player.y, PADDLE_W, PADDLE_H);

      ctx.shadowColor = '#ff8800';
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(W - 20 - PADDLE_W, g.ai.y, PADDLE_W, PADDLE_H);
      ctx.shadowBlur = 0;

      // Ball
      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = '#ffee00';
      ctx.shadowColor = '#ffee00';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Scores
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ff8866';
      ctx.fillText(g.scores.player, W / 4, 50);
      ctx.fillStyle = '#ff880066';
      ctx.fillText(g.scores.ai, (W * 3) / 4, 50);

      // Labels
      ctx.font = '12px monospace';
      ctx.fillStyle = '#00ff88';
      ctx.fillText('YOU', W / 4, 70);
      ctx.fillStyle = '#ff8800';
      ctx.fillText('AI', (W * 3) / 4, 70);
    };

    const loop = () => {
      update();
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('touchmove', handleTouch);
    };
  }, [onWin]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3">
      <h2 className="text-xl font-bold text-[#00d4ff]">Neon Pong</h2>
      <div className="text-sm text-gray-400">First to {WIN_SCORE} wins! Mouse/WASD to move.</div>
      <canvas ref={canvasRef} width={W} height={H}
        className="rounded-xl border-2 border-[#ff00ff] cursor-none max-w-full" />
      {gameOver && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="text-center">
          <p className={`text-2xl font-bold ${winner === 'You' ? 'text-[#00ff88]' : 'text-[#ff8800]'}`}>
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

export default PongGame;
