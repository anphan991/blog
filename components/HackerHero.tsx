'use client';

import { useState, useEffect } from 'react';
import { TerminalSquare, EyeOff, Eye } from 'lucide-react';

// Dịch chữ thường sang Leet Speak (Đã export để xài chung)
export const toLeet = (str: string) => {
  const map: Record<string, string> = {
    'a': '4', 'A': '4', 'e': '3', 'E': '3', 'i': '1', 'I': '1',
    'o': '0', 'O': '0', 's': '5', 'S': '5', 't': '7', 'T': '7', 'g': '9', 'G': '9'
  };
  return str.replace(/[aAeEiIoOsStTgG]/g, m => map[m]);
};

// Component giải mã Matrix (Đã export để xài chung)
export const GlitchText = ({ text, isLeet, className = "" }: { text: string, isLeet: boolean, className?: string }) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const targetText = isLeet ? toLeet(text) : text;
    let iteration = 0;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    
    const interval = setInterval(() => {
      setDisplayText(prev => 
        targetText.split("").map((char, index) => {
          if (char === " ") return " ";
          if (index < Math.floor(iteration)) return targetText[index];
          return letters[Math.floor(Math.random() * letters.length)];
        }).join("")
      );
      if (iteration >= targetText.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [isLeet, text]);

  return <span className={className}>{displayText}</span>;
};

// COMPONENT CHÍNH: Nhận State từ cha truyền xuống
export default function HackerHero({ isLeet, setIsLeet }: { isLeet: boolean, setIsLeet: (v: boolean) => void }) {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000">
      
      <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000 
        ${isLeet ? 'bg-[radial-gradient(circle_at_1px_1px,#ef4444_1px,transparent_0)]' : 'bg-[radial-gradient(circle_at_1px_1px,#3f3f46_1px,transparent_0)]'}`} 
        style={{ backgroundSize: '32px 32px' }} 
      />

      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={() => setIsLeet(!isLeet)}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-lg font-mono text-[10px] md:text-xs uppercase tracking-widest border transition-all duration-300
            ${isLeet ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-lime-500 hover:text-lime-500'}`}
        >
          {isLeet ? <Eye className="animate-pulse" size={16} /> : <EyeOff size={16} />}
          <span>1337_M0D3 : {isLeet ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl px-6">
         <div className={`mb-8 p-4 rounded-2xl border transition-colors duration-700 backdrop-blur-sm ${isLeet ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5'}`}>
            <TerminalSquare size={48} className={isLeet ? "text-red-500 animate-pulse" : "text-lime-500"} />
         </div>

         <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 transition-colors duration-700 ${isLeet ? 'text-red-500 drop-shadow-[0_0_15px_red]' : 'text-white'}`}>
           <GlitchText text="An Phan Khánh" isLeet={isLeet} />
         </h1>

         <h2 className="text-lg md:text-2xl font-mono text-zinc-400 mb-8 flex items-center justify-center gap-3 w-full">
            <GlitchText text="Network Security @ CLB ATTT HCMUTE" isLeet={isLeet} />
         </h2>

         <p className="text-xs md:text-sm text-zinc-500 max-w-xl leading-relaxed mb-12">
           <GlitchText text="Chuyên nghiên cứu lỗ hổng bảo mật, giải mã hệ thống IoT và tham gia các chiến dịch Capture The Flag (CTF). Nếu hệ thống của bạn an toàn, tôi sẽ chứng minh điều ngược lại." isLeet={isLeet} />
         </p>

         <div className={`w-full max-w-lg border rounded-lg p-5 text-left font-mono text-xs md:text-sm transition-colors duration-700 shadow-2xl ${isLeet ? 'bg-[#1a0505] border-red-900/50' : 'bg-black border-zinc-800'}`}>
            <div className="flex gap-2 mb-4 border-b border-zinc-800/50 pb-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            
            <p className={isLeet ? 'text-red-500 font-bold' : 'text-[#3b82f6] font-bold'}>
              ┌──(<span className={isLeet ? 'text-red-400' : 'text-white'}>anphan991㉿kali</span>)-[~/Desktop]
            </p>
            <p className="text-zinc-300 mt-1 mb-4">
              └─$ <GlitchText text="cat skills.txt" isLeet={isLeet} className={isLeet ? 'text-red-300' : 'text-lime-500'} />
            </p>
            
            <p className="text-zinc-400 space-y-2 leading-loose">
              <GlitchText text="[+] Penetration Testing & Vulnerability Assessment" isLeet={isLeet} /><br/>
              <GlitchText text="[+] Hardware/IoT Exploitation (ESP32, RFID)" isLeet={isLeet} /><br/>
              <GlitchText text="[+] Cryptography & Reverse Engineering" isLeet={isLeet} />
            </p>
            <p className="mt-4 animate-pulse font-black text-lime-500">_</p>
         </div>
      </div>
    </section>
  );
}