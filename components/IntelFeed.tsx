'use client'; 

import { Terminal, ShieldAlert, LogOut, PackageCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

// Link Direct GIF Anime Good Morning
const BOCCHI_ESCAPE_GIF = "https://media1.tenor.com/m/tUCOeHmPtTcAAAAC/good-morning-anime.gif";

const memeStatuses = [
  "STATUS: PANICKING (Bocchi Mode)",
  "STATUS: HIDING IN THE CLOSET",
  "STATUS: AVOIDING EYE CONTACT",
  "STATUS: 500 INTERNAL SOCIAL ERROR",
  "STATUS: OVERTHINKING THE LAYOUT",

  
];

export default function IntelFeed() {
  const [latestPosts, setLatestPosts] = useState<string[]>(["Decrypting intel..."]);
  const [randomStatus, setRandomStatus] = useState("● STATUS: CONNECTING...");
  const [isEscaped, setIsEscaped] = useState(false);

  useEffect(() => {
    // Random status vui nhộn
    setRandomStatus("● " + memeStatuses[Math.floor(Math.random() * memeStatuses.length)]);
    
    // DANH SÁCH BÀI VIẾT 
    setLatestPosts([
      "InFoSec: Cryptography Intro",
      "NEW_SECTOR: INFOSEC_OR_IN_SECURITY 💀",
      "SCAN_OR_SCAM — RFID System Update Complete",
      "Day 3: KERNEL_PANIC_AGAIN 💀 — Computer Architecture & OS | Memory Management",
      "Day 2: JUST_ONE_MORE_REFRESH 💀 — Web Basics | How Web Works",
      "Day 1: WHO_ATE_MY_PACKETS 🤡 — Intro networking | OSI & TCP/IP",
    ]);
  }, []);

  return (
    <div className="h-full w-full flex flex-col border border-zinc-800 rounded-3xl font-mono text-xs bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden transition-colors duration-500">
      
      {/* === PHẦN 1: LOG HỆ THỐNG (PC: 65% | Mobile: 55%) === */}
      <div className="lg:h-[65%] h-[55%] p-6 flex flex-col items-start gap-3 w-full border-b border-zinc-800">
        
        {/* Header Terminal */}
        <div className="flex items-center gap-2 text-zinc-500 mb-1 w-full pb-2 border-b border-zinc-900 shrink-0">
          <Terminal className="w-4 h-4 text-lime-400" />
          <span>[SYSTEM_INTEL] v1.0.4</span>
        </div>
        
        {/* Nhấp nháy Status */}
        <div className="text-lime-400 animate-pulse font-semibold shrink-0">
          {randomStatus}
        </div>
        
        {/* Khu vực danh sách bài viết - Tự động cuộn nếu quá dài */}
        <div className="flex flex-col w-full pt-1 min-h-0 flex-1 overflow-hidden">
          <div className="flex gap-2 mb-2 shrink-0">
            <span className="text-zinc-600">&gt;</span>
            <span className="text-zinc-300">RANDOM_STUFF_HERE:</span>
          </div>
          
          <div className="flex flex-col gap-4 pl-4 overflow-y-auto pr-2 pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {latestPosts.map((post, index) => (
              <span 
                key={index}
                className="text-lime-300 whitespace-normal break-words leading-relaxed border-l border-zinc-900 pl-3 py-0.5 hover:border-lime-500 transition-colors"
              >
                "{post}"
              </span>
            ))}
          </div>
        </div>

        {/* Chân log cố định */}
        <div className="text-[10px] text-zinc-700 w-full text-center mt-auto border-t border-zinc-900 pt-2 shrink-0">
          ./get_social_battery.sh: Denied.
        </div>
      </div>

      {/* === PHẦN 2: GÓC TRÚ ẨN (PC: 35% | Mobile: 45%) === */}
      <div className="lg:h-[35%] h-[45%] bg-black/20 p-3 flex flex-col justify-center items-center relative w-full overflow-hidden">
        {!isEscaped ? (
          /* Giao diện CHỜ */
          <div className="flex flex-col items-center text-center gap-2">
            <ShieldAlert className="w-8 h-8 text-zinc-700 animate-pulse" />
            <p className="text-[10px] text-zinc-500 max-w-[200px] leading-tight font-medium">
              System Overload? Human interaction detected? 
              <br/>
              Activate escape protocol below.
            </p>
            <button 
              suppressHydrationWarning
              onClick={() => setIsEscaped(true)}
              className="mt-1 flex items-center gap-2 px-3 py-1.5 border border-red-900 bg-red-950/20 text-red-300 rounded-lg hover:bg-red-900/50 hover:border-red-500 transition-all shadow-lg shadow-red-950/20 text-[10px]"
            >
              <LogOut className="w-3 h-3" />
              <span>[ACTIVATE_SAFE_HOUSE]</span>
            </button>
          </div>
        ) : (
          /* Giao diện HIỆN GIF (Cân đối & Không bị cắt) */
          <div className="flex flex-col items-center justify-between w-full h-full animate-in fade-in zoom-in duration-300">
            
            {/* Box chứa ảnh - object-contain là chìa khóa để hiện trọn vẹn GIF */}
            <div className="relative w-full flex-1 rounded-xl overflow-hidden border border-zinc-800 bg-black mb-2 mt-1 shadow-inner flex items-center justify-center p-1">
              <img 
                src={BOCCHI_ESCAPE_GIF} 
                alt="Anime Safe House Escape Mode" 
                className="w-full h-full object-contain opacity-90"
              />

            </div>

            <button 
              onClick={() => setIsEscaped(false)}
              className="flex items-center gap-1.5 text-[9px] text-zinc-500 hover:text-white transition-colors mb-1"
            >
              <PackageCheck className="w-3 h-3" />
              <span>[RE-ENTER_REALITY]</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}