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
  "Playing this scuffed and still asking for a carry? 🐧",
  "Bro compiling errors into real life 💀",
  "Even Lee Sang-hyeok can’t carry this 🎮💀",
  "Even Kali Linux can’t hack you out of this 💀",
  "Lag? Or is your PC cooking and dropping FPS? 🥵",
  "Just quit and go raise cows instead 🐄"
];

// 🔥 Lời khen khi ăn điểm
const MEME_POPUPS = ["Skill gap 📈", "R U Sofm 💯", "That’s heat 🔥", "TÀY 🐧", "+999 Aura 🗿", "Hackerman 💻", "Lmao 💀", "Drip maxed 🗿", "EZ Game 🥱"];

// --- CANVAS SCALING ---
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
  const [score, setScore] = useState(0); // Dùng cho UI HUD
  const [highScore, setHighScore] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState('🤡');
  const [showSelector, setShowSelector] = useState(false);
  const [roastMsg, setRoastMsg] = useState('BUFFER OVERFLOW AT 0X4141');
  const [shake, setShake] = useState(false);

  // --- MỤC TỐI ƯU HIỆU NĂNG: Tách các state thay đổi liên tục ra khỏi React Render Cycle ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdRef = useRef<Bird>({ y: 250, velocity: 0, rotation: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const requestRef = useRef<number>(0);
  
  // Điểm số ngầm để chạy logic game (không gián đoạn vòng lặp)
  const scoreRef = useRef(0); 
  // Cache avatar để hàm draw tự lấy không cần dependency
  const selectedEmojiRef = useRef(selectedEmoji);

  // Cập nhật ref ngay khi người chơi chọn emoji mới
  useEffect(() => {
    selectedEmojiRef.current = selectedEmoji;
  }, [selectedEmoji]);

  // --- INIT HIGH SCORE ---
  useEffect(() => {
    const saved = localStorage.getItem('cyberfly_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // --- GAME LOGIC ---
  const resetGame = () => {
    birdRef.current = { y: 200, velocity: 0, rotation: 0 };
    pipesRef.current = [{ 
      x: LOGICAL_WIDTH, gapTop: 100, passed: false, moveType: 'none', baseY: 100, angle: 0 
    }];
    floatingTextsRef.current = [];
    scoreRef.current = 0; // Reset điểm ngầm
    setScore(0);          // Reset HUD UI
    setGameState('PLAYING');
  };

  const backToMenu = () => {
    setGameState('START');
    setScore(0);
  };

  const jump = useCallback(() => {
    if (gameState === 'PLAYING') {
      birdRef.current.velocity = JUMP_STRENGTH;
      
      // Hiệu ứng rung màn hình bựa
      setShake(true);
      setTimeout(() => setShake(false), 80);
    }
  }, [gameState, JUMP_STRENGTH]);

  const update = useCallback(() => {
    const width = LOGICAL_WIDTH;
    const height = LOGICAL_HEIGHT;

    // Update Bird
    const bird = birdRef.current;
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
    bird.rotation = Math.min(Math.PI / 2.5, Math.max(-Math.PI / 4, bird.velocity / 8));

    // Collision: Floor/Ceiling
    if (bird.y + BIRD_SIZE / 2 > height || bird.y - BIRD_SIZE / 2 < 0) {
      handleGameOver();
      return;
    }

    // Update Floating Texts
    floatingTextsRef.current.forEach(ft => {
      ft.life -= 0.015;
      ft.y -= 2; // Bay lên
    });
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);

    // Update Pipes
    pipesRef.current.forEach((pipe) => {
      pipe.x -= PIPE_SPEED;

      // Hiệu ứng ống múa lượn
      if (pipe.moveType === 'sine') {
        pipe.angle += 0.04;
        pipe.gapTop = pipe.baseY + Math.sin(pipe.angle) * 50;
      }

      // Collision: Pipes
      const birdBox = {
        left: BIRD_X - 12,
        right: BIRD_X + 12,
        top: bird.y - 12,
        bottom: bird.y + 12
      };

      if (
        birdBox.right > pipe.x &&
        birdBox.left < pipe.x + PIPE_WIDTH &&
        (birdBox.top < pipe.gapTop || birdBox.bottom > pipe.gapTop + PIPE_GAP)
      ) {
        handleGameOver();
      }

      // Score + Sinh Meme Popup
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
        pipe.passed = true;
        
        // Tăng điểm ngầm trước
        scoreRef.current += 1;
        // Bắn ra UI (React sẽ schedule update ngoài lề, không đụng tới vòng lặp)
        setScore(scoreRef.current);
        
        // Xóa text cũ, tạo 1 popup khổng lồ mới
        const randomColor = `hsl(${Math.random() * 360}, 100%, 65%)`;
        floatingTextsRef.current = [{
          text: MEME_POPUPS[Math.floor(Math.random() * MEME_POPUPS.length)],
          x: width / 2, // Căn giữa tuyệt đối
          y: height / 2,
          life: 1.2,
          color: randomColor
        }];
      }
    });

    // Add new pipes
    const lastPipe = pipesRef.current[pipesRef.current.length - 1];
    if (lastPipe && lastPipe.x < width - PIPE_SPACING) {
      // Dùng scoreRef.current để kiểm tra số điểm thay vì state `score`
      const isMoving = scoreRef.current >= 5 && Math.random() > 0.5;
      const gapTop = Math.random() * (height - PIPE_GAP - 120) + 60;
      
      pipesRef.current.push({
        x: width,
        gapTop: gapTop,
        passed: false,
        moveType: isMoving ? 'sine' : 'none',
        baseY: gapTop,
        angle: 0
      });
    }

    // Remove old pipes
    if (pipesRef.current[0] && pipesRef.current[0].x < -PIPE_WIDTH) {
      pipesRef.current.shift();
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
    
    // Xóa Dependency `score` đi để vòng lặp requestAnimationFrame KHÔNG bao giờ bị reset!
  }, [gameState]); 

  const handleGameOver = () => {
    setGameState('GAMEOVER');
    const randomJoke = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    setRoastMsg(randomJoke);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(DPI_SCALE, DPI_SCALE); 

    const width = LOGICAL_WIDTH;
    const height = LOGICAL_HEIGHT;
    
    // Dùng scoreRef.current để vẽ thay vì UI Score
    const isRGB = scoreRef.current >= 10;
    const time = Date.now() / 5;

    // Lưới Background
    ctx.strokeStyle = isRGB ? `hsla(${time % 360}, 100%, 50%, 0.1)` : 'rgba(239, 68, 68, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Draw FIREWALL Pipes
    pipesRef.current.forEach(pipe => {
      ctx.fillStyle = isRGB ? `hsla(${time % 360}, 100%, 50%, 0.15)` : 'rgba(239, 68, 68, 0.15)';
      ctx.strokeStyle = isRGB ? `hsla(${time % 360}, 100%, 50%, 0.6)` : 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2;

      // Top
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapTop);
      ctx.strokeRect(pipe.x, -2, PIPE_WIDTH, pipe.gapTop + 2);

      // Bottom
      const bottomY = pipe.gapTop + PIPE_GAP;
      ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, height - bottomY);
      ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, height - bottomY + 2);

      // Neon Glow edge
      ctx.shadowBlur = isRGB ? 20 : 12;
      ctx.shadowColor = isRGB ? `hsl(${time % 360}, 100%, 50%)` : '#ef4444';
      ctx.strokeRect(pipe.x, pipe.gapTop - 2, PIPE_WIDTH, 4);
      ctx.strokeRect(pipe.x, bottomY - 2, PIPE_WIDTH, 4);
      
      // Vẽ chữ BLOCK / DANGER
      ctx.shadowBlur = 0;
      ctx.fillStyle = isRGB ? `hsla(${time % 360}, 100%, 60%, 0.6)` : 'rgba(239, 68, 68, 0.5)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pipe.moveType === 'sine' ? 'DANGER' : 'BLOCK', pipe.x + PIPE_WIDTH/2, pipe.gapTop - 15);
      ctx.fillText(pipe.moveType === 'sine' ? 'DANGER' : 'BLOCK', pipe.x + PIPE_WIDTH/2, bottomY + 20);
    });

    // Draw Floating Text (Memes Khổng Lồ)
    floatingTextsRef.current.forEach(ft => {
      ctx.save();
      ctx.translate(ft.x, ft.y);
      
      const scaleFactor = 1 + (1.2 - ft.life) * 1.5; 
      ctx.scale(scaleFactor, scaleFactor);
      
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.life));
      
      ctx.font = '900 32px "Comic Sans MS", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(ft.text, 0, 0);
      
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      
      ctx.restore();
    });

    ctx.restore(); 

    // Draw Avatar
    const bird = birdRef.current;
    ctx.save();
    ctx.translate(BIRD_X * DPI_SCALE, bird.y * DPI_SCALE);
    
    // Dùng điểm ngầm để check RGB xoay
    if (scoreRef.current >= 15) {
      ctx.rotate((time / 10) % (Math.PI * 2));
    } else {
      ctx.rotate(bird.rotation);
    }
    
    ctx.font = `${BIRD_SIZE * DPI_SCALE}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedEmojiRef.current, 0, 0);
    ctx.restore();
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, update]); // Không còn `score` => Mượt mà tuyệt đối

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'PLAYING') jump();
        else if (gameState === 'START') resetGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump]);

  return (
    <div className={`relative w-full h-full overflow-hidden group font-mono transition-transform duration-75 
      ${shake ? 'translate-y-2 translate-x-1 scale-[1.02] bg-red-950/20' : 'bg-[#0d1117]'}`}>
      
      {/* HUD */}
      {gameState !== 'START' && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-red-500/30 px-3 py-1.5 flex items-center gap-2 rounded-xl">
            <span className="text-red-400 font-black text-lg shadow-sm">{score.toString().padStart(2, '0')}</span>
            {score >= 10 && <span className="text-[10px] bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text text-transparent font-bold animate-pulse">RGB ON</span>}
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-red-500/30 px-3 py-1.5 flex flex-col items-end rounded-xl">
            <span className="text-[9px] text-red-400/80 uppercase tracking-widest flex items-center gap-1">
              <Trophy size={8} /> Best
            </span>
            <span className="text-red-400 font-bold">{highScore.toString().padStart(2, '0')}</span>
          </div>
        </div>
      )}

      {/* START SCREEN */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0d1117]/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="flex flex-col items-center justify-center min-h-max py-4 w-full">
            <div className="mb-4 relative">
              <div className="text-6xl animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{selectedEmoji}</div>
              <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-1 border-4 border-[#0d1117]">
                <User size={10} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl font-black text-red-500 mb-1 tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              Cyber_Fly
            </h1>
            <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] mb-6 text-center">Bypass the firewalls</p>

            <div className="flex flex-col gap-3 w-full max-w-[200px]">
              <button 
                onClick={resetGame}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-900/20 text-xs rounded-xl"
              >
                <Play size={16} fill="currentColor" /> INJECT PAYLOAD
              </button>
              <button 
                onClick={() => setShowSelector(!showSelector)}
                className="w-full py-2.5 border border-white/10 hover:border-red-500/50 hover:text-red-400 text-white/70 text-xs font-medium transition-all rounded-xl"
              >
                CHANGE_AVATAR
              </button>
            </div>

            {/* Emoji Selector Modal */}
            {showSelector && (
              <div className="absolute inset-x-0 bottom-0 p-4 bg-[#161b22] border-t border-red-500/20 flex flex-col gap-3 animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-red-400 uppercase font-bold tracking-widest">Select Meme</span>
                  <button onClick={() => setShowSelector(false)} className="text-white/30 hover:text-white text-xs px-2 py-1">Close</button>
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => { setSelectedEmoji(emoji); setShowSelector(false); }}
                      className={`text-2xl p-2 transition-all rounded-xl ${selectedEmoji === emoji ? 'bg-red-500/20 border-2 border-red-500 scale-110' : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:scale-105'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN - FIX TRÀN LAYOUT */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-30 bg-red-950/80 backdrop-blur-md p-4 overflow-y-auto no-scrollbar flex flex-col items-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center justify-center min-h-full w-full py-4">
            <div className="text-4xl mb-2 grayscale opacity-80 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] animate-pulse">💀</div>
            <h2 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              BLOCKED!
            </h2>
            
            {/* LỜI KHỊA RANDOM */}
            <div className="w-full max-w-[240px] mb-6">
              <p className="text-red-300 text-[10px] sm:text-[11px] font-semibold tracking-wide text-center leading-relaxed border border-red-500/30 bg-red-500/10 p-3 rounded-lg shadow-inner">
                {roastMsg}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-center w-full max-w-[200px]">
              <div className="bg-black/20 p-2 rounded-lg border border-red-500/10">
                <div className="text-[9px] text-white/50 uppercase mb-1 font-bold">Score</div>
                <div className="text-xl font-black text-white drop-shadow-md">{score}</div>
              </div>
              <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                <div className="text-[9px] text-red-400 uppercase mb-1 font-bold">Best</div>
                <div className="text-xl font-black text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{highScore}</div>
              </div>
            </div>

            <div className="flex gap-3 w-full max-w-[240px]">
              <button 
                onClick={resetGame}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.4)] text-xs rounded-xl"
              >
                <RotateCcw size={14} /> RETRY
              </button>
              <button 
                onClick={backToMenu}
                className="flex-1 py-3 border border-white/20 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-xs rounded-xl"
              >
                <Home size={14} /> MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANVAS */}
      <canvas 
        ref={canvasRef} 
        width={LOGICAL_WIDTH * DPI_SCALE} 
        height={LOGICAL_HEIGHT * DPI_SCALE} 
        className="w-full h-full cursor-pointer touch-none"
        onMouseDown={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
      />

      {/* VIGNETTE & SCANLINE EFFECT */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"></div>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_3px,3px_100%] opacity-20"></div>
    </div>
  );
};

export default CyberFlyGame;