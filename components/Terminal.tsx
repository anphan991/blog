'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, Cpu, Zap, Activity } from 'lucide-react';

export default function InteractiveTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ cmd: string; resp: string | React.ReactNode }[]>([
    { cmd: 'system --init', resp: 'Terminal v2.5.0 initialized. Type "help" to start.' }
  ]);
  const [isBocchiPanic, setIsBocchiPanic] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.toLowerCase().trim();
    let resp: string | React.ReactNode = '';

    switch (cmd) {
      case 'help':
        resp = (
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-blue-400 text-sm md:text-base font-['Share_Tech_Mono',_monospace]">
            <span>&gt; help</span><span className="text-slate-500">Hiá»‡n báº£ng lá»‡nh nÃ y</span>
            <span>&gt; stats</span><span className="text-slate-500">Hiá»‡u nÄƒng thá»±c táº¿</span>
            <span>&gt; scan</span><span className="text-slate-500">Giáº£ láº­p quáº¹t tháº»</span>
            <span>&gt; bocchi</span><span className="text-slate-500 text-red-500/50">PANIC MODE</span>
            <span>&gt; ndhoc</span><span className="text-slate-500 text-amber-500/50">Tri Ã¢n anh lá»›n</span>
            <span>&gt; clear</span><span className="text-slate-500">XÃ³a mÃ n hÃ¬nh</span>
          </div>
        );
        break;
      case 'ndhoc':
        resp = (
          <span className="text-amber-500 font-bold italic">
            "Credit: Cáº£m Æ¡n anh lá»›n PhÃº YÃªn!"
          </span>
        );
        break;
      case 'bocchi':
        setIsBocchiPanic(true);
        resp = <span className="text-red-500 font-black animate-pulse italic">âš ï¸ WARNING: BOCCHI IS PANICKING!</span>;
        setTimeout(() => setIsBocchiPanic(false), 3000);
        break;
      case 'stats':
        resp = (
          <div className="space-y-1">
            <p className="text-green-400">STATUS: OPERATIONAL</p>
            <p>Avg Latency: 0.61s</p>
            <p>Packet Loss: 0.00%</p>
            <p>Uptime: 124 days</p>
          </div>
        );
        break;
      case 'scan':
        resp = (
          <div className="text-green-500 border-l-2 border-green-500 pl-4 py-2">
            [RFID]: Detected UID [E2 4A 8B 1C] <br/>
            [SERVER]: Authenticating... <br/>
            [AUTH]: Access Granted. Welcome, An Phan KhÃ¡nh!
          </div>
        );
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'neofetch':
        resp = (
          <div className="text-purple-400 flex gap-8 items-center py-4">
            <pre className="text-[10px] leading-tight font-black">
              {`   /\\___/\\    \n  (  o o  )   \n  (  =^=  )   \n   (______)   `}
            </pre>
            <div className="text-xs md:text-sm space-y-1">
              <p className="text-white font-bold underline">anphan@kali-bocchi</p>
              <p><span className="text-blue-400">OS:</span> Next.js (HCMUTE Edition)</p>
              <p><span className="text-blue-400">Kernel:</span> Dual-Core ESP32</p>
              <p><span className="text-blue-400">Shell:</span> Zsh (AnPhan_Console)</p>
            </div>
          </div>
        );
        break;
      default:
        resp = `Command not found: ${cmd}. Thá»­ gÃµ "help" Ä‘i bradar.`;
    }

    setHistory([...history, { cmd: input, resp }]);
    setInput('');
  };

  return (
    <div className={`transition-all duration-300 ${isBocchiPanic ? 'animate-shake' : ''}`}>
      <div className="bg-black/90 backdrop-blur-2xl border-2 border-zinc-800 rounded-[50px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] hover:border-purple-500/30 transition-colors">
        {/* Terminal Header */}
        <div className="bg-zinc-900/80 px-10 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-500"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs font-black text-slate-500 tracking-[0.3em] uppercase">Operator_Terminal_v2.5</span>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <TerminalIcon size={18} className="text-slate-600" />
          </div>
        </div>

        {/* Terminal Body */}
        <div ref={scrollRef} className="h-full min-h-[300px] overflow-y-auto p-12 font-['Share_Tech_Mono',_monospace] text-base md:text-xl scrollbar-hide">
          <AnimatePresence>
            {history.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                key={i} 
                className="mb-8"
              >
                <div className="flex gap-5 items-center">
                  <span className="text-lime-500 font-black text-2xl">âžœ</span>
                  <span className="text-slate-300">~ <strong className="text-white">{item.cmd}</strong></span>
                </div>
                <div className="mt-4 pl-12 text-slate-500 leading-relaxed italic">
                  {item.resp}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <form onSubmit={handleCommand} className="flex gap-5 items-center mt-4">
            <span className="text-lime-500 font-black text-2xl">âžœ</span>
            <span className="text-slate-300 italic">~</span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full caret-purple-500 font-black text-xl"
              placeholder="..."
              autoFocus
            />
          </form>
        </div>
      </div>
    </div>
  );
}

