'use client'; 

import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import IntelFeed from '@/components/IntelFeed';
import CyberFlyGame from '@/components/FlappyBird';
import { Terminal, X, Skull, Bug, Zap, ShieldAlert, KeySquare, Mail, Github, Twitter, Gamepad2 } from 'lucide-react';
import CyberChat from '@/components/CyberChat';

// ==========================================
// COMPONENT: MÀN HÌNH KHỞI ĐỘNG (Crystal Blue Carbon)
// ==========================================
const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const bootLogs = [
      "Initializing core services...",
      "Loading StackOverflow copy-paste buffer... [OK]",
      "Praying to the Machine God... [FAILED]",
      "Ignoring 42 compiler warnings... [DONE]",
      "Bypassing firewall... Wait, we don't have one.",
      "Loading Crystal Glass UI Module... Please don't inspect element.",
      "SYSTEM (barely) READY."
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#010409] font-mono text-xs md:text-sm p-8 flex flex-col justify-end pb-20"
    >
      <div className="space-y-2 max-w-3xl border-l-2 border-[#3B82F6]/50 pl-4">
        {logs.map((log, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-[#94A3B8]">
            <span className="text-[#3B82F6] font-bold">{`>_ `}</span> 
            <span>
              {String(log).includes('[FAILED]') ? (
                <span>{log.split('[FAILED]')[0]}<span className="text-red-500">[FAILED]</span></span>
              ) : (
                log
              )}
            </span>
          </motion.div>
        ))}
        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-[#3B82F6] mt-2">█</motion.div>
      </div>
    </motion.div>
  );
};

// ==========================================
// THẺ GAME DÙNG CHUNG (DESKTOP & MOBILE)
// ==========================================
const GameCard = ({ chaosMode, className = "" }: { chaosMode: boolean, className?: string }) => (
  <motion.div 
    className={`w-full rounded-3xl border p-4 flex flex-col gap-3 transition-all duration-500 overflow-hidden relative group backdrop-blur-md shrink-0 ${className}
      ${chaosMode ? 'bg-red-950/60 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'bg-[#0d1117]/70 border-white/10 hover:border-[#3B82F6]/50 hover:bg-[#090d14]/90'}`}
  >
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] blur-[80px] rounded-full pointer-events-none transition-all duration-700 
      ${chaosMode ? 'bg-red-600/10' : 'bg-[#3B82F6]/10 group-hover:bg-[#3B82F6]/20'}`} />

    <div className="flex items-center justify-between z-10 border-b border-white/10 pb-2">
      <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${chaosMode ? 'text-red-400' : 'text-white'}`}>
        <Gamepad2 size={16} className={`${chaosMode ? 'text-red-500' : 'text-[#3B82F6]'} group-hover:animate-pulse`} />
        Cyber_Fly
      </h3>
    </div>

    {/* Bỏ hoàn toàn class rounded và isolate ở đây */}
    <div className="w-full flex-1 min-h-[120px] relative z-10 overflow-hidden shadow-inner border border-white/5 bg-[#0d1117]">
       <CyberFlyGame />
    </div>
  </motion.div>
);

// ==========================================
// MAIN PAGE: CRYSTAL BLUE CARBON
// ==========================================
export default function Home() {
  const [isBooting, setIsBooting] = useState(true);
  const [isIntelOpen, setIsIntelOpen] = useState(false);
  
  const [chaosMode, setChaosMode] = useState(false);
  const [runawayPos, setRunawayPos] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [bsodState, setBsodState] = useState(false);
  const hackerControls = useAnimation();
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleStatusClick = () => {
    if (bsodState) {
      setBsodState(false);
      setClickCount(0);
      return;
    }
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount > 5) setBsodState(true);
    setTimeout(() => setClickCount(0), 2000); 
  };

  const startHackerHold = () => {
    holdTimeout.current = setTimeout(() => {
      document.documentElement.classList.add('hacker-mode');
      hackerControls.start({
        color: "#3B82F6", 
        textShadow: "0px 0px 15px rgba(59, 130, 246, 0.6)",
        transition: { duration: 0.2 },
      });
    }, 1000); 
  };

  const stopHackerHold = () => {
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    document.documentElement.classList.remove('hacker-mode');
    hackerControls.start({
      color: "#FFFFFF", 
      textShadow: "none",
      transition: { duration: 0.2 },
    });
  };

  const handleHireHover = () => {
    if(!chaosMode) {
      const randomX = (Math.random() - 0.5) * 500; 
      const randomY = (Math.random() - 0.5) * 500;
      setRunawayPos({ x: randomX, y: randomY });
    }
  };

  const resetRunaway = () => {
      setRunawayPos({ x: 0, y: 0 });
    };

  // --- CYBERCAT v2.0 LOGIC (ASCII ART + INTERACTION) ---
  const [petMood, setPetMood] = useState<'chill' | 'happy' | 'hack' | 'angry' | 'shield' | 'chaos' | 'dance'>('chill');
  const [speech, setSpeech] = useState('System online. Awaiting orders,... 🐈');
  const [command, setCommand] = useState('');

  const asciiFrames = {
    chill: `  |\\__/,|   (\`\\ \n _.0-0._ |  _) ) \n_(_(_/-(_(_/  `,
    happy: `  /\\_/\\  \n ( ^.^ )  *purr*\n  > ~ <   `,
    hack: `  /\\_/\\   [😎] \n ( -.- )  [SSH]\n  > ^ <   [BUSY]`,
    angry: `  /\\_/\\  \n ( >_< )  *HISS!*\n  vv vv  `,
    shield: `  /\\_/\\   [🛡️]\n ( o.o )  [SEC]\n  > ^ <   `,
    chaos: `  /\\_/\\  \n ( X.X )  FATAL_ERR\n  UNSTABLE`,
    dance: `  /\\_/\\  \n ~( v.v )~\n  > ^ <   ` 
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = command.trim().toLowerCase();
      setCommand('');

      switch(cmd) {
        case 'hi':
        case 'hello':
          setPetMood('happy');
          setSpeech('Hello! Systems are 100% green today.');
          break;
        case 'coffee':
        case 'feed':
          setPetMood('happy');
          setSpeech('System injected! Compile speed +50%... ☕');
          break;
        case 'hack':
        case 'pwn':
          setPetMood('hack');
          setSpeech('Bypassing firewall... Please wait for the Flag.');
          break;
        case 'shield':
        case 'secure':
          setPetMood('shield');
          setSpeech('Shields UP! Monitoring for suspicious packets.');
          break;
        case 'whoami':
          setSpeech('You are the Admin. I am your Loyal Cyber-Companion.');
          break;
        case 'status':
          setSpeech('CPU: Chill | Mood: Stable | Hunger: Coffee_Required');
          break;
        case 'help':
          setSpeech('Try: hi, coffee, hack, shield, whoami, status, clear');
          break;
        case 'clear':
          setPetMood('chill');
          setSpeech('Terminal reset. Chilling in the background...');
          break;
        default:
          setPetMood('angry');
          setSpeech(`Unknown command: "${cmd}". My database is confused.`);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}
      </AnimatePresence>

      <main className={`min-h-screen font-mono transition-all duration-700 overflow-x-hidden selection:bg-[#3B82F6]/30 selection:text-white
        ${chaosMode ? 'bg-[#1a0505] text-red-300' : 'bg-[#010409] text-[#94A3B8]'}`}>
        
        {/* BACKGROUND GRID */}
        <div className={`fixed inset-0 pointer-events-none z-0 transition-all duration-700
          ${chaosMode 
            ? 'opacity-30 bg-[radial-gradient(circle_at_2px_2px,#ef4444_2px,transparent_0)] bg-[size:20px_20px] rotate-3 scale-110' 
            : 'opacity-10 bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] bg-[size:32px_32px]'}`} 
        />
        
        {/* GLOW ÁNH SÁNG */}
        <div className={`fixed top-[0%] left-[10%] w-[40rem] h-[40rem] rounded-full blur-[150px] -z-10 pointer-events-none transition-colors duration-1000 
          ${chaosMode ? 'bg-red-600/20' : 'bg-[#3B82F6]/10'}`}></div>
        <div className={`fixed bottom-[-10%] right-[0%] w-[30rem] h-[30rem] rounded-full blur-[120px] -z-10 pointer-events-none transition-colors duration-1000 
          ${chaosMode ? 'bg-orange-600/10' : 'bg-[#3B82F6]/5'}`}></div>

        {/* HEADER KÍNH MỜ */}
        <header className={`fixed top-0 left-0 w-full z-40 backdrop-blur-md border-b transition-all duration-700
          ${chaosMode ? 'border-red-500/30 bg-red-950/70' : 'border-white/10 bg-[#0d1117]/70'}`}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs md:text-sm">
              <Skull className={chaosMode ? "text-red-500 animate-ping" : "text-[#3B82F6]"} size={18} />
              <span className="font-black tracking-widest text-white">
                {chaosMode ? 'WTF_IS_HAPPENING' : 'TezD'}
              </span>
            </div>

            <div className={`hidden md:flex items-center gap-6 ${chaosMode ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest border-r border-white/10 pr-4 mr-1">CONNECT //</span>
              <a href="https://github.com/anphan991" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#3B82F6] hover:scale-110 transition-all hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                <Github size={18} />
              </a>
              <a href="https://x.com/TezD991" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#3B82F6] hover:scale-110 transition-all hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                <Twitter size={18} />
              </a>
              <a href="mailto:an0915129080@gmail.com" className="text-[#94A3B8] hover:text-[#3B82F6] hover:scale-110 transition-all hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                <Mail size={18} />
              </a>
            </div>

            <div className={`text-[10px] font-bold flex items-center gap-2 ${chaosMode ? 'text-red-500' : 'text-[#3B82F6]'}`}>
              <span className="hidden md:inline">{chaosMode ? 'Status: CRITICAL' : 'Status: Operating'}</span>
              <span className={`flex h-2 w-2 rounded-full ${chaosMode ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping' : 'bg-[#3B82F6] shadow-[0_0_8px_#3B82F6] animate-pulse'}`}></span>
            </div>
          </div>
        </header>

        {/* ========================================== */}
        {/* DASHBOARD LAYOUT */}
        {/* ========================================== */}
        <div className={`relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 pt-32 pb-20 transition-all duration-700`}>
          
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
            
            {/* ========================================== */}
            {/* CỘT TRÁI (Đồng bộ Grid Auto-rows với Cột Phải) */}
            {/* ========================================== */}
            <div className="hidden lg:grid grid-cols-1 auto-rows-[minmax(180px,auto)] gap-5 w-full h-full">
              
              {/* INTEL FEED (Chiếm 3 row, ngang bằng với thẻ Optimize) */}
              <motion.div 
                className={`row-span-3 w-full h-full transition-all duration-500 overflow-hidden flex flex-col
                  ${chaosMode 
                    ? 'border border-red-500/50 bg-red-950/50 backdrop-blur-md rounded-3xl -rotate-2 scale-95 opacity-90' 
                    : '[&>*]:!border-white/10 [&>*]:!bg-[#0d1117]/70 [&>*]:backdrop-blur-md [&>*]:!text-[#94A3B8] rounded-3xl border border-white/10'}`} 
              >
                <IntelFeed />
              </motion.div>

              {/* DESKTOP GAME CARD (Chiếm 1 row cuối, nằm ngay dưới Intel Feed ngang với CTF) */}
              <GameCard chaosMode={chaosMode} className="row-span-1" />

            </div>

            {/* ========================================== */}
            {/* CỘT PHẢI: BENTO GRID */}
            {/* ========================================== */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-[minmax(180px,auto)] h-full">
              
              {/* CARD 1: INTRO (Row 1-2) */}
              <motion.div 
                onMouseLeave={resetRunaway}
                className={`md:col-span-8 md:row-span-2 rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden group backdrop-blur-md
                  ${chaosMode ? 'bg-red-950/60 border border-red-500/50 rotate-1' : 'bg-[#0d1117]/70 border border-white/10 hover:border-[#3B82F6]/50 hover:bg-[#0d1117]/90 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]'}`}
              >
                <div className="z-10 w-full relative h-full flex flex-col">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className={`px-3 py-1 bg-white/5 text-white border border-white/10 text-[10px] rounded-md uppercase font-bold tracking-widest ${chaosMode ? 'border-red-500/50 text-red-500 bg-red-900/30' : ''}`}>
                      Copy-Paste Architect
                    </span>
                    <motion.span 
                      className={`px-3 py-1 text-[#3B82F6] border border-[#3B82F6]/30 text-[10px] rounded-md uppercase font-bold tracking-widest cursor-pointer transition-colors ${
                        bsodState ? 'bg-red-500 text-white border-red-500' : 'bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20'
                      }`}
                      onClick={handleStatusClick}
                    >
                      {bsodState ? 'ERROR: 418' : 'Professional Googler'}
                    </motion.span>
                  </div>

                  {bsodState && (
                    <div className="absolute inset-0 bg-[#010409] border border-red-500/50 text-red-500 p-6 font-mono text-xs z-30 space-y-2 flex flex-col justify-center rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                      <p className="bg-red-500 text-white w-fit px-2 mb-2 font-bold">SYSTEM_CRASH</p>
                      <p className="text-sm font-black text-white">An exception 0E has occurred.</p>
                      <p>Copy-Paste buffer overflow.</p>
                      <p className="mt-4">* Professional Googler status compromised.</p>
                      <p className="animate-pulse font-bold text-center mt-6 cursor-pointer hover:text-white" onClick={() => setBsodState(false)}>(Click to reset system)</p>
                    </div>
                  )}
                  
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2 flex items-center gap-3 leading-none">
                    <motion.span 
                      className="cursor-pointer transition-colors"
                      onMouseDown={startHackerHold}
                      onMouseUp={stopHackerHold}
                      onMouseLeave={stopHackerHold}
                      onTouchStart={startHackerHold}
                      onTouchEnd={stopHackerHold}
                      animate={hackerControls}
                    >
                      An Phan
                    </motion.span>
                    <span className="inline-block cursor-help text-4xl hover:animate-spin">🐧</span>
                  </h1>
                  <h2 className="text-lg md:text-xl font-medium text-[#3B82F6] mb-5">
                    InfoSec Student & Break-stuff Enthusiast
                  </h2>
                  <p className="text-[#94A3B8] text-xs md:text-sm max-w-md leading-relaxed space-y-1 font-sans">
                    <span className="block font-mono text-[15px] opacity-70">"Please excuse me for being antisocial 🙏"</span>
                    <span className="block italic text-[18px] ">Я не знаю почему это работает, но не трогай.</span>
                    <span className="block text-[18px]">Сделано для ПК — мобилка это побочный квест</span>
                  </p>

                  <div className="mt-auto pt-6 flex items-center justify-end z-10 relative">
                    <motion.button 
                      suppressHydrationWarning
                      onMouseEnter={handleHireHover}
                      onClick={() => { if(!chaosMode) alert("Bắt được rồiii! 🐧") }}
                      animate={{ x: runawayPos.x, y: runawayPos.y }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className={`ml-auto px-8 py-3 text-xs font-black uppercase rounded-xl transition-colors z-50
                        ${chaosMode ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]'}`}
                    >
                      Hire Me?
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* CARD 2: ASCII CYBER PET (Row 1-2) */}
              <motion.div 
                className={`md:col-span-4 md:row-span-2 relative overflow-hidden rounded-3xl border bg-[#0d1117]/70 backdrop-blur-md p-5 flex flex-col transition-all duration-500 group
                  ${chaosMode ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'border-white/10 hover:border-[#3B82F6]/50 hover:bg-[#090d14]/90'}`}
              >
                <div className="relative z-10 flex justify-between items-center mb-3 border-b border-white/10 pb-2 font-mono">
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${chaosMode ? 'text-red-400' : 'text-white'}`}>
                    {chaosMode ? '🚨 SYSTEM_GLITCH' : '🐈 ASCII_COMPANION.v1'}
                  </h3>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center flex-grow font-mono py-4 cursor-help" 
                     onClick={() => { setPetMood('angry'); setSpeech('Hiss! I am compiling Kernel! Do not touch!'); }}>
                  
                  <div className={`mb-6 px-4 py-2 rounded-xl border text-[10px] sm:text-xs min-h-[45px] w-full flex items-center shadow-inner transition-colors
                    ${chaosMode ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-white/90'}`}>
                    <span className={`mr-2 font-bold ${chaosMode ? 'text-red-500' : 'text-[#3B82F6]'}`}>&gt;</span> 
                    {speech}
                  </div>

                  <div className="h-24 flex items-center justify-center">
                    <pre className={`text-sm sm:text-base font-bold leading-tight transition-all duration-300
                      ${chaosMode ? 'text-red-600 animate-pulse scale-125' : 
                        petMood === 'happy' ? 'text-green-400 scale-110' :
                        petMood === 'dance' ? 'text-yellow-400 animate-bounce' :
                        petMood === 'angry' ? 'text-red-400' : 'text-[#3B82F6] group-hover:text-white'}`}>
                      {chaosMode ? asciiFrames.chaos : asciiFrames[petMood]}
                    </pre>
                  </div>
                </div>

                <div className="relative z-10 mt-4 font-mono text-xs bg-black/50 rounded-xl border border-white/5 p-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-black italic ${chaosMode ? 'text-red-500' : 'text-[#3B82F6]'}`}>admin@root:~</span>
                    <input 
                      suppressHydrationWarning
                      type="text" 
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      onKeyDown={handleCommand}
                      placeholder="Type 'help'..."
                      className="flex-1 bg-transparent border-none outline-none text-white/90 placeholder:text-white/20 tracking-wide"
                    />
                  </div>
                </div>
              </motion.div>

              {/* CARD 3: NÚT TỐI ƯU HÓA CODE (Row 3) */}
              <motion.div 
                className={`md:col-span-12 md:row-span-1 rounded-3xl flex items-center justify-between p-6 cursor-pointer transition-all duration-500 group border backdrop-blur-md
                  ${chaosMode ? 'bg-red-950/60 border-red-500/50 text-white' : 'bg-[#0d1117]/70 border-white/10 hover:border-[#3B82F6]/50 hover:bg-[#0d1117]/90 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]'}`}
                onClick={() => setChaosMode(!chaosMode)}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${chaosMode ? 'bg-red-500 text-white' : 'bg-white/5 text-[#3B82F6] border border-white/10 group-hover:scale-110 group-hover:bg-[#3B82F6]/10'}`}>
                    {chaosMode ? <Bug size={24} /> : <Zap size={24} />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-widest ${chaosMode ? 'text-red-400' : 'text-white group-hover:text-[#3B82F6] transition-colors'}`}>
                      {chaosMode ? 'CTRL+Z! CTRL+Z!' : 'Click to Optimize Code'}
                    </h3>
                    <p className={`text-xs mt-1 ${chaosMode ? 'text-red-300' : 'text-[#94A3B8]'}`}>
                      {chaosMode ? 'Never trust anything on the internet!!!' : 'x10 performance boost (trust me bro)'}
                    </p>
                  </div>
                </div>
                <ShieldAlert size={32} className={`opacity-20 transition-opacity ${chaosMode ? 'animate-ping opacity-100 text-red-500' : 'text-[#3B82F6] group-hover:opacity-100 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
              </motion.div>

              {/* CARD 4: CTF (Row 4) */}
              <Link href="/blog" className="md:col-span-4 md:row-span-1 block h-full group">
                <motion.div 
                  className={`relative h-full overflow-hidden rounded-3xl border bg-[#0d1117]/70 backdrop-blur-md p-6 flex flex-col justify-between transition-all duration-500
                    ${chaosMode ? 'border-red-500/50 rotate-2 translate-y-2' : 'border-white/10 hover:border-[#3B82F6]/50 hover:bg-[#0d1117]/90 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <h3 className={`text-lg font-bold uppercase tracking-widest flex items-center gap-2 ${chaosMode ? 'text-red-400' : 'text-white'}`}>
                      <span className={`${chaosMode ? 'text-red-500' : 'text-[#3B82F6]'} group-hover:animate-pulse`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="inline-block">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                          <line x1="4" y1="22" x2="4" y2="15"></line>
                        </svg>
                      </span> 
                      CTF_Training
                    </h3>
                    <span className={`text-[#3B82F6] transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 font-bold`}>
                      ↗
                    </span>
                  </div>

                  <div className="relative z-10 flex-grow mt-3 mb-2 space-y-1.5 font-mono text-[11px] sm:text-xs">
                    <div className={`${chaosMode ? 'text-red-400/80' : 'text-[#3B82F6]/80'}`}>
                      <span className="text-[#94A3B8] mr-2">&gt;</span>./get_flags.sh
                    </div>
                    <div className={`pl-4 ${chaosMode ? 'text-red-300' : 'text-white/80'} flex justify-between items-center group-hover:text-white transition-colors`}>
                      <span>[+] DAY1</span>
                      <span className="text-[#3B82F6] text-[10px]">Pwned</span>
                    </div>
                    <div className={`pl-4 ${chaosMode ? 'text-red-300' : 'text-white/80'} flex justify-between items-center group-hover:text-white transition-colors delay-75`}>
                      <span>[+] DAY67</span>
                      <span className="text-[#3B82F6] text-[10px]">100%</span>
                    </div>
                    <div className="pl-4 flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-3 bg-[#3B82F6]/70 animate-pulse"></span>
                    </div>
                  </div>

                  <p className={`relative z-10 text-[10px] sm:text-xs italic border-t pt-3 ${chaosMode ? 'text-red-300 border-red-500/20' : 'text-[#64748B] border-white/10'}`}>
                    // A note dump of my CTF journey where confusion slowly turns into “ohhh”
                  </p>
                </motion.div>
              </Link>

              {/* CARD 5: RFID (Row 4) */}
              <Link href="/projects/rfid" className="md:col-span-4 md:row-span-1 block h-full group">
                <motion.div 
                  className={`relative h-full overflow-hidden rounded-3xl border bg-[#0d1117]/70 backdrop-blur-md p-6 flex flex-col justify-between transition-all duration-500
                    ${chaosMode ? 'border-red-500/50 bg-red-950/30 -rotate-1 -translate-x-2' : 'border-white/10 hover:border-[#3B82F6]/50 hover:bg-[#0d1117]/90 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#3B82F6]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <h3 className={`text-lg font-bold uppercase tracking-widest flex items-center gap-2 ${chaosMode ? 'text-red-400' : 'text-white'}`}>
                      <span className={`${chaosMode ? 'text-red-500' : 'text-[#3B82F6]'} group-hover:animate-pulse`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block">
                          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                          <rect x="9" y="9" width="6" height="6"></rect>
                          <line x1="9" y1="1" x2="9" y2="4"></line>
                          <line x1="15" y1="1" x2="15" y2="4"></line>
                          <line x1="9" y1="20" x2="9" y2="23"></line>
                          <line x1="15" y1="20" x2="15" y2="23"></line>
                          <line x1="20" y1="9" x2="23" y2="9"></line>
                          <line x1="20" y1="14" x2="23" y2="14"></line>
                          <line x1="1" y1="9" x2="4" y2="9"></line>
                          <line x1="1" y1="14" x2="4" y2="14"></line>
                        </svg>
                      </span> 
                      IoT_RFID_Vault
                    </h3>
                    <span className={`text-[#3B82F6] transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 font-bold`}>
                      ↗
                    </span>
                  </div>

                  <div className="relative z-10 flex-grow mt-3 mb-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 font-mono text-[11px] sm:text-xs">
                    <div className={`${chaosMode ? 'text-red-400' : 'text-[#94A3B8]'} flex items-center group-hover:text-white transition-colors`}>Build:</div>
                    <div className={`${chaosMode ? 'text-red-300' : 'text-white/90'} tracking-wider font-semibold group-hover:text-white transition-colors ml-3`}>FINAL_RUN</div>
                    
                    <div className={`${chaosMode ? 'text-red-400' : 'text-[#94A3B8]'} mt-0.5 group-hover:text-white transition-colors delay-75`}>Co-op Squad:</div>
                    <div className="flex flex-col items-start gap-1 group-hover:text-white transition-colors delay-75">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${chaosMode ? 'bg-red-500' : 'bg-[#00FF41]'} animate-pulse`}></span>
                        <span className={`${chaosMode ? 'text-red-300' : 'text-[#3B82F6]'}`}>@ndhoc</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${chaosMode ? 'bg-red-500' : 'bg-[#00FF41]'} animate-pulse delay-75`}></span>
                        <span className={`${chaosMode ? 'text-red-300' : 'text-[#3B82F6]'}`}>@pigeon_king</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${chaosMode ? 'bg-red-500' : 'bg-[#00FF41]'} animate-pulse delay-150`}></span>
                        <span className={`${chaosMode ? 'text-red-300' : 'text-[#3B82F6]'}`}>@nck</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${chaosMode ? 'bg-red-500' : 'bg-[#00FF41]'} animate-pulse delay-300`}></span>
                        <span className={`${chaosMode ? 'text-red-300' : 'text-[#3B82F6]'}`}>@bo_nam</span>
                      </div>
                    </div>

                    <div className={`${chaosMode ? 'text-red-400' : 'text-[#94A3B8]'} flex items-center group-hover:text-white transition-colors delay-100`}>Hardware:</div>
                    <div className={`${chaosMode ? 'text-red-300' : 'text-white/60'} group-hover:text-white transition-colors delay-100 ml-3`}>ESP32_Core</div>
                  </div>

                  <p className={`relative z-10 text-[10px] sm:text-xs italic border-t pt-3 ${chaosMode ? 'text-red-300 border-red-500/20' : 'text-[#64748B] border-white/10'}`}>
                    // Final chance to run it with mah G.
                  </p>
                </motion.div>
              </Link>

              {/* CARD 6: FREE COOKIE (Row 4) */}
              <motion.a 
                href="/free-cookie" target="_blank" rel="noopener noreferrer"
                className={`md:col-span-4 md:row-span-1 block h-full rounded-3xl border bg-[#0d1117]/70 backdrop-blur-md p-6 flex flex-col justify-between transition-all duration-500 group cursor-help
                  ${chaosMode ? 'border-red-500/50 rotate-3 translate-y-2' : 'border-white/10 hover:border-amber-500/40 hover:bg-[#0d1117]/90'}`}
                whileHover={chaosMode ? {} : { scale: 1.02 }}
              >
                <div>
                  <div className="text-3xl mb-2">{chaosMode ? '☢️' : '🍪'}</div>
                  <h3 className={`text-lg font-bold uppercase tracking-widest flex items-center gap-2 ${chaosMode ? 'text-red-500' : 'text-amber-500'}`}>
                    Free_Cookie
                  </h3>
                  <p className={`text-[10px] mt-1 ${chaosMode ? 'text-red-400' : 'text-[#94A3B8]'}`}>Totally safe. Not a rickroll. I promise.</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className={`text-[9px] px-2 py-1 rounded-md border font-mono uppercase font-bold
                    ${chaosMode ? 'bg-red-500/10 text-red-500 border-red-500/50 animate-pulse' : 'bg-white/5 text-amber-500 border-amber-500/30 group-hover:border-amber-500 transition-colors'}`}>
                    {chaosMode ? 'DO NOT CLICK' : 'Do Not Click'}
                  </span>
                </div>
              </motion.a>

              {/* CARD 7: NEW MODULE (Row 5) */}
              <Link href="/info-sec" className="md:col-span-4 md:row-span-1 block h-full group">
                <motion.div 
                  className={`relative h-full overflow-hidden rounded-3xl border bg-[#0d1117]/70 backdrop-blur-md p-6 flex flex-col justify-between transition-all duration-500
                    ${chaosMode ? 'border-red-500/50 -rotate-2 translate-y-2' : 'border-white/10 hover:border-[#3B82F6]/50 hover:bg-[#0d1117]/90 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <h3 className={`text-lg font-bold uppercase tracking-widest flex items-center gap-2 ${chaosMode ? 'text-red-400' : 'text-white'}`}>
                      <span className={`${chaosMode ? 'text-red-500' : 'text-[#3B82F6]'} group-hover:animate-pulse`}>
                        <KeySquare size={18} strokeWidth={2.5} />
                      </span> 
                      InfoSec_Notes
                    </h3>
                    <span className={`text-[#3B82F6] transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 font-bold`}>
                      ↗
                    </span>
                  </div>

                  <div className="relative z-10 flex-grow mt-3 mb-2 space-y-1.5 font-mono text-[11px] sm:text-xs">
                    <div className={`${chaosMode ? 'text-red-400/80' : 'text-[#3B82F6]/80'}`}>
                      <span className="text-[#94A3B8] mr-2">&gt;</span>./init_project.sh
                    </div>
                    <div className={`pl-4 ${chaosMode ? 'text-red-300' : 'text-white/80'} flex justify-between items-center group-hover:text-white transition-colors`}>
                      <span>[+] STATUS</span>
                      <span className="text-[#3B82F6] text-[10px]">Deploying</span>
                    </div>
                    <div className={`pl-4 ${chaosMode ? 'text-red-300' : 'text-white/80'} flex justify-between items-center group-hover:text-white transition-colors delay-75`}>
                      <span>[+] PROGRESS</span>
                      <span className="text-[#3B82F6] text-[10px]">Loading...</span>
                    </div>
                    <div className="pl-4 flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-3 bg-[#3B82F6]/70 animate-pulse"></span>
                    </div>
                  </div>

                  <p className={`relative z-10 text-[10px] sm:text-xs italic border-t pt-3 ${chaosMode ? 'text-red-300 border-red-500/20' : 'text-[#64748B] border-white/10'}`}>
                    // Description...
                  </p>
                </motion.div>
              </Link>

                {/*New Card Here*/}

              {/* MOBILE GAME CARD (Hiển thị mượt mà trên Mobile, ẩn trên bản PC do Desktop đã có ở bên trái) */}
              <GameCard chaosMode={chaosMode} className="lg:hidden md:col-span-12 md:row-span-1" />

            </div>
          </div>
        </div>

        
        {/* NÚT TERMINAL MOBILE */}
        <motion.button
          className={`lg:hidden fixed bottom-6 right-6 z-40 p-4 rounded-full backdrop-blur-md shadow-lg border transition-all
            ${chaosMode ? 'bg-red-600 border-red-500 text-white animate-bounce' : 'bg-[#0d1117]/80 border-white/10 text-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
          onClick={() => setIsIntelOpen(true)}
        >
          <Terminal className="w-6 h-6" />
        </motion.button>

        {/* MODAL INTEL FEED CHO MOBILE */}
        <AnimatePresence>
          {isIntelOpen && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="lg:hidden fixed inset-0 z-50 p-6 flex flex-col justify-center items-center bg-[#010409]/80"
              onClick={() => setIsIntelOpen(false)}
            >
              <motion.div 
                className="w-full max-w-sm h-[650px] max-h-[85vh] relative rounded-3xl border border-white/10 overflow-hidden bg-[#0d1117]/90 backdrop-blur-xl shadow-[0_0_50px_rgba(59,130,246,0.15)]" 
                onClick={(e) => e.stopPropagation()} 
              >
                <button 
                  className="absolute -top-12 right-0 p-2 text-[#94A3B8] hover:text-white bg-white/10 rounded-full"
                  onClick={() => setIsIntelOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
                <IntelFeed />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <CyberChat />

      </main>
    </>
  );
}