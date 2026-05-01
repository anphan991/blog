'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Play, RotateCcw, User, Home } from 'lucide-react';

// --- TYPES ---
type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

interface Bird {
  y: number;
  velocity: number;
  rotation: number;
}

interface Pipe {
  x: number;
  gapTop: number;
  passed: boolean;
  moveType: 'none' | 'sine';
  baseY: number;
  angle: number;
}

interface FloatingText {
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

// 🍄 Hệ Avatar Meme 
const EMOJIS = ['🤡', '🍄', '🤖', '🐶', '🐛', '☕', '🫠', '💀', '🐧', '🗿'];

// 🤬 Khịa khi thua
const ROASTS = [
  "Bri unlocked “how did you even do that?” achievement 🏆💀",
  "Mouse ran out of battery or what? 🐭💀",
  "Ctrl+Z ain’t saving this one 😭",
  "Bro compiling errors into real life 💀",
  "Even Kali Linux can’t hack you out of this 💀",
  "Just quit and go raise cows instead 🐄"
];

// 🔥 Lời khen khi ăn điểm
const MEME_POPUPS = ["Skill gap 📈", "R U Sofm 💯", "That’s heat 🔥", "TÀY 🐧", "Hackerman 💻", "Drip maxed 🗿", "EZ Game 🥱"];

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 500;
const DPI_SCALE = 2; 

const CyberFlyGame: React.FC = () => {
  // --- SETTINGS ---
  const GRAVITY = 0.25;
  const JUMP_STRENGTH = -4.8;
  const PIPE_SPEED = 2.4;
  const PIPE_SPACING = 240; 
  const PIPE_WIDTH = 52;
  const PIPE_GAP = 160;      
  const BIRD_X = 50;
  const BIRD_SIZE = 34;

  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0); 
  const [highScore, setHighScore] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState('🤡');
  const [showSelector, setShowSelector] = useState(false);
  const [roastMsg, setRoastMsg] = useState('BUFFER OVERFLOW');
  const [shake, setShake] = useState(false);

  // --- REFS ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdRef = useRef<Bird>({ y: 250, velocity: 0, rotation: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const requestRef = useRef<number>(0);
  const scoreRef = useRef(0); 
  const selectedEmojiRef = useRef(selectedEmoji);
  const gameStateRef = useRef<GameState>('START');

  useEffect(() => {
    selectedEmojiRef.current = selectedEmoji;
  }, [selectedEmoji]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const saved = localStorage.getItem('cyberfly_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const jump = useCallback(() => {
    if (gameStateRef.current === 'PLAYING') {
      birdRef.current.velocity = JUMP_STRENGTH;
      setShake(true);
      setTimeout(() => setShake(false), 80);
    }
  }, [JUMP_STRENGTH]);

  const handleGameOver = useCallback(() => {
    setGameState('GAMEOVER');
    const randomJoke = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    setRoastMsg(randomJoke);
    
    // Lưu kỷ lục
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('cyberfly_highscore', scoreRef.current.toString());
    }
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, [highScore]);

  const resetGame = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Ngăn sự kiện Click lan ra canvas gây nhảy
    birdRef.current = { y: 200, velocity: 0, rotation: 0 };
    pipesRef.current = [{ 
      x: LOGICAL_WIDTH, gapTop: 100, passed: false, moveType: 'none', baseY: 100, angle: 0 
    }];
    floatingTextsRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setGameState('PLAYING');
  };

  const backToMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGameState('START');
    setScore(0);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(DPI_SCALE, DPI_SCALE); 

    const width = LOGICAL_WIDTH;
    const height = LOGICAL_HEIGHT;
    const isRGB = scoreRef.current >= 10;
    const time = Date.now() / 5;

    // Grid
    ctx.strokeStyle = isRGB ? `hsla(${time % 360}, 100%, 50%, 0.1)` : 'rgba(239, 68, 68, 0.05)';
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Pipes
    pipesRef.current.forEach(pipe => {
      ctx.fillStyle = isRGB ? `hsla(${time % 360}, 100%, 50%, 0.15)` : 'rgba(239, 68, 68, 0.15)';
      ctx.strokeStyle = isRGB ? `hsla(${time % 360}, 100%, 50%, 0.6)` : 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapTop);
      ctx.strokeRect(pipe.x, -2, PIPE_WIDTH, pipe.gapTop + 2);
      const bottomY = pipe.gapTop + PIPE_GAP;
      ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, height - bottomY);
      ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, height - bottomY + 2);
    });

    // Floating Texts
    floatingTextsRef.current.forEach(ft => {
      ctx.save();
      ctx.translate(ft.x, ft.y);
      const scaleFactor = 1 + (1.2 - ft.life) * 1.5; 
      ctx.scale(scaleFactor, scaleFactor);
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.life));
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    });

    ctx.restore(); 

    // Avatar
    const bird = birdRef.current;
    ctx.save();
    ctx.translate(BIRD_X * DPI_SCALE, bird.y * DPI_SCALE);
    ctx.rotate(scoreRef.current >= 15 ? (time / 10) : bird.rotation);
    ctx.font = `${BIRD_SIZE * DPI_SCALE}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedEmojiRef.current, 0, 0);
    ctx.restore();
  }, []);

  const update = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;

    const bird = birdRef.current;
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
    bird.rotation = Math.min(Math.PI / 2.5, Math.max(-Math.PI / 4, bird.velocity / 8));

    if (bird.y + BIRD_SIZE / 2 > LOGICAL_HEIGHT || bird.y - BIRD_SIZE / 2 < 0) {
      handleGameOver();
      return;
    }

    floatingTextsRef.current.forEach(ft => { ft.life -= 0.015; ft.y -= 2; });
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);

    pipesRef.current.forEach((pipe) => {
      pipe.x -= PIPE_SPEED;
      if (pipe.moveType === 'sine') {
        pipe.angle += 0.04;
        pipe.gapTop = pipe.baseY + Math.sin(pipe.angle) * 50;
      }

      if (BIRD_X + 12 > pipe.x && BIRD_X - 12 < pipe.x + PIPE_WIDTH &&
         (bird.y - 12 < pipe.gapTop || bird.y + 12 > pipe.gapTop + PIPE_GAP)) {
        handleGameOver();
      }

      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
        pipe.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
        floatingTextsRef.current = [{
          text: MEME_POPUPS[Math.floor(Math.random() * MEME_POPUPS.length)],
          x: LOGICAL_WIDTH / 2, y: LOGICAL_HEIGHT / 2, life: 1.2,
          color: `hsl(${Math.random() * 360}, 100%, 65%)`
        }];
      }
    });

    const lastPipe = pipesRef.current[pipesRef.current.length - 1];
    if (lastPipe && lastPipe.x < LOGICAL_WIDTH - PIPE_SPACING) {
      const gapTop = Math.random() * (LOGICAL_HEIGHT - PIPE_GAP - 120) + 60;
      pipesRef.current.push({
        x: LOGICAL_WIDTH, gapTop, passed: false,
        moveType: scoreRef.current >= 5 && Math.random() > 0.5 ? 'sine' : 'none',
        baseY: gapTop, angle: 0
      });
    }

    if (pipesRef.current[0] && pipesRef.current[0].x < -PIPE_WIDTH) pipesRef.current.shift();

    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [GRAVITY, handleGameOver, draw]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState, update]);

  // --- INPUT HANDLING ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 🛡️ CHỐNG XUNG ĐỘT: Nếu đang tập trung vào input/textarea (Chatbot) thì bỏ qua
      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault(); // Ngăn cuộn trang
        if (gameStateRef.current === 'PLAYING') {
          jump();
        } else if (gameStateRef.current === 'START') {
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  return (
    <div className={`relative w-full h-full overflow-hidden font-mono transition-all duration-75 
      ${shake ? 'translate-y-1 bg-red-900/10' : 'bg-[#0d1117]'}`}>
      
      {/* HUD UI */}
      {gameState !== 'START' && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-red-500/30 px-3 py-1 rounded-xl">
            <span className="text-red-400 font-black text-lg">{score.toString().padStart(2, '0')}</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-red-500/30 px-3 py-1 flex flex-col items-end rounded-xl">
            <span className="text-[8px] text-red-400/80 uppercase tracking-widest flex items-center gap-1">
              <Trophy size={8} /> Best
            </span>
            <span className="text-red-400 font-bold text-xs">{highScore}</span>
          </div>
        </div>
      )}

      {/* START SCREEN */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0d1117]/80 backdrop-blur-sm p-6">
          <div className="text-6xl mb-6 animate-bounce">{selectedEmoji}</div>
          <h1 className="text-2xl font-black text-red-500 mb-1 tracking-tighter uppercase">Cyber_Fly</h1>
          <p className="text-white/30 text-[9px] uppercase tracking-widest mb-8">Bypass the firewalls</p>
          
          <div className="flex flex-col gap-3 w-full max-w-[200px]">
            <button 
              suppressHydrationWarning
              onClick={(e) => resetGame(e)}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95 rounded-xl text-xs"
            >
              <Play size={14} fill="currentColor" /> INJECT PAYLOAD
            </button>
            <button 
              suppressHydrationWarning
              onClick={(e) => { e.stopPropagation(); setShowSelector(!showSelector); }}
              className="w-full py-2.5 border border-white/10 hover:border-red-500/50 text-white/70 text-[10px] font-medium rounded-xl"
            >
              CHANGE_AVATAR
            </button>
          </div>

          {showSelector && (
            <div className="mt-4 p-3 bg-[#161b22] border border-red-500/20 rounded-2xl flex flex-wrap justify-center gap-2 max-w-[240px]">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={(e) => { e.stopPropagation(); setSelectedEmoji(emoji); setShowSelector(false); }}
                  className={`text-xl p-2 rounded-lg transition-all ${selectedEmoji === emoji ? 'bg-red-500/20 border border-red-500' : 'hover:bg-white/5'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-30 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="text-4xl mb-4">💀</div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">BLOCKED!</h2>
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg mb-6 max-w-[220px]">
            <p className="text-red-300 text-[10px] leading-relaxed">{roastMsg}</p>
          </div>
          
          <div className="flex gap-4 mb-8">
             <div className="text-center">
               <div className="text-[8px] text-white/40 uppercase mb-1">Score</div>
               <div className="text-xl font-black text-white">{score}</div>
             </div>
             <div className="text-center">
               <div className="text-[8px] text-red-400/40 uppercase mb-1">Best</div>
               <div className="text-xl font-black text-red-500">{highScore}</div>
             </div>
          </div>

          <div className="flex gap-3 w-full max-w-[240px]">
            <button onClick={(e) => resetGame(e)} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all active:scale-95">
              <RotateCcw size={14} /> RETRY
            </button>
            <button onClick={(e) => backToMenu(e)} className="flex-1 py-3 border border-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all active:scale-95">
              <Home size={14} /> MENU
            </button>
          </div>
        </div>
      )}

      {/* GAME CANVAS */}
      <canvas 
        ref={canvasRef} 
        width={LOGICAL_WIDTH * DPI_SCALE} 
        height={LOGICAL_HEIGHT * DPI_SCALE} 
        className="w-full h-full cursor-pointer touch-none"
        onMouseDown={() => {
          if (gameStateRef.current === 'PLAYING') jump();
          else if (gameStateRef.current === 'START') resetGame();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          if (gameStateRef.current === 'PLAYING') jump();
          else if (gameStateRef.current === 'START') resetGame();
        }}
      />

      {/* EFFECTS */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]"></div>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[size:100%_4px] opacity-20"></div>
    </div>
  );
};

export default CyberFlyGame;