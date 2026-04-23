'use client'; // <-- Quan trọng: Client Component để dùng Framer Motion & React State

import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import IntelFeed from '@/components/IntelFeed';
import { Terminal, X } from 'lucide-react';

export default function Home() {
  // --- STATE handle Easter Eggs ---
  const [clickCount, setClickCount] = useState(0);
  const [bsodState, setBsodState] = useState(false);
  const hackerControls = useAnimation();
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isIntelOpen, setIsIntelOpen] = useState(false);
  // --- 1. Hiệu ứng spam click Status Badge ---
  const handleStatusClick = () => {
    if (bsodState) {
      setBsodState(false);
      setClickCount(0);
      return;
    }
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount > 5) {
      setBsodState(true);
    }
    setTimeout(() => setClickCount(0), 2000);
  };

  // --- 2. Hiệu ứng nhấn giữ tên 'An Phan' ---
  const startHackerHold = () => {
    holdTimeout.current = setTimeout(() => {
      document.documentElement.classList.add('dark', 'hacker-mode');
      hackerControls.start({
        opacity: [0, 1],
        transition: { duration: 0.2 },
      });
    }, 1000);
  };

  const stopHackerHold = () => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
    }
    document.documentElement.classList.remove('hacker-mode');
  };

return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-slate-200 overflow-y-auto z-0 font-sans p-4 md:p-8 flex flex-col items-center pt-20 md:pt-32 transition-colors duration-500">
      
      {/* Background Gradient giữ nguyên */}
      <div className="fixed top-[-20%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-blue-600/10 blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] rounded-full bg-purple-600/10 blur-[120px] -z-10 pointer-events-none"></div>

      {/* === LAYOUT CHIA 2 CỘT: ÉP CHIỀU CAO BẰNG NHAU (VẠCH VÀNG) === */}
      {/* Sử dụng Grid thay vì Flex. items-stretch là mặc định. */}
      {/* Dùng 'lg:' thay vì 'xl:' để Layout 2 cột hiện sớm hơn trên ThinkPad */}
<div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mb-20 items-stretch">
        
        {/* --- CỘT TRÁI (HUD SIDEBAR) --- */}
        {/* FIX 1: Bỏ hoàn toàn sticky và h-fit đi. Dùng h-full để nó căng tràn bằng đúng vạch vàng! */}
        <div className="hidden lg:block h-full w-full">
          <IntelFeed />
        </div>

        {/* --- CỘT PHẢI (BENTO GRID) --- */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)] h-full">
        
          {/* BENTO 1: HERO CARD */}
          <div className="md:col-span-2 md:row-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>
            
            <div className="z-10">
              <motion.div 
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-6 cursor-pointer transition-colors ${
                  bsodState ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-black/50 border-white/10 text-slate-300'
                }`}
                onClick={handleStatusClick}
                whileHover={{ rotate: [0, -5, 5, -5, 5, 0], scale: 1.1 }}
              >
                <span className={`flex h-2 w-2 rounded-full animate-pulse ${bsodState ? 'bg-red-500' : 'bg-green-500'}`}></span>
                {bsodState ? 'System: CRASHED (418)' : 'System: Online | Social Battery: 1%'}
              </motion.div>
              
              {bsodState && (
                <div className="absolute inset-0 bg-[#0000aa] text-white p-6 font-mono text-xs z-30 space-y-2">
                  <p className="text-sm">A problem has been detected and Windows has been shut down...</p>
                  <p>Meme_Found_Exception</p>
                  <p>*** STOP: 0x0000007B (0xF789E524, 0xC0000034, 0x00000000, 0x00000000)</p>
                  <p className="font-bold text-center mt-4">_spam_click_detec_</p>
                  <p className="animate-pulse font-bold text-center mt-2">(Click badge again to reset)</p>
                </div>
              )}

              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
                <span 
                  className="cursor-pointer"
                  onMouseDown={startHackerHold}
                  onMouseUp={stopHackerHold}
                  onMouseLeave={stopHackerHold}
                >
                  An Phan
                </span>
                <span className="inline-block cursor-help text-4xl hover:animate-spin">🐧</span>
              </h1>
              <h2 className="text-xl font-medium text-blue-400 mb-4 transition-colors hacker:text-green-400">
                InfoSec Student & Break-stuff Enthusiast
              </h2>
              <p className="text-slate-400 max-w-md leading-relaxed transition-colors hacker:text-green-400/80">
                "Please excuse me for being antisocial 🙏"<br/>
                Я не знаю почему это работает, но не трогай.<br/>
                Сделано для ПК — мобилка это побочный квест 
              </p>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 mt-8 z-10">
              {['https://github.com/anphan991', 'https://x.com/TezD991', 'mailto:an0915129080@gmail.com'].map((href, index) => (
                <motion.a 
                  key={index} href={href} target="_blank" rel="noopener noreferrer" 
                  className="p-3 bg-black/50 border border-white/10 hover:border-blue-500 rounded-xl transition-colors hacker:hover:border-green-500"
                  whileHover={{ scale: 1.2, y: -5, transition: { type: "spring", stiffness: 300 } }}
                >
                  {index === 0 && <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>}
                  {index === 1 && <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.076H5.036z"></path></svg>}
                  {index === 2 && <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
                </motion.a>
              ))}
            </div>
          </div>

          {/* BENTO 2: FAKE TERMINAL */}
          <div className="md:col-span-1 md:row-span-1 bg-black border border-slate-800 rounded-3xl p-6 font-mono text-sm flex flex-col hover:border-green-500/50 transition-colors">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <p className="text-green-400 hacker:text-green-300">anphan991㉿kali:~$ <span className="text-white">./get_sleep.sh</span></p>
            <p className="text-red-400 mt-1">bash: ./get_sleep.sh: Permission denied</p>
            <p className="text-green-400 mt-2 hacker:text-green-300">anphan991㉿kali:~$ <span className="inline-block w-2 h-4 bg-white animate-pulse"></span></p>
          </div>

          {/* BENTO 3: FUN STATS (404 Sleep) */}
          <motion.div 
            className="md:col-span-1 md:row-span-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hacker:border-green-500/30"
            whileHover={{ x: [0, -10, 10, -10, 10, 0], y: [0, 5, -5, 5, -5, 0], transition: { duration: 0.3, repeat: Infinity } }}
          >
            <div className="text-4xl mb-2">☕</div>
            <h3 className="text-3xl font-black text-white hacker:text-green-300">404</h3>
            <p className="text-slate-400 text-sm font-medium hacker:text-green-400/80">Sleep Not Found</p>
          </motion.div>

          {/* BENTO 4: CTF PROJECT */}
          <Link href="/blog" className="md:col-span-1">
            <motion.div 
              className="h-full bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-6 group cursor-pointer hover:border-blue-500/50 transition-all relative overflow-hidden"
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="text-3xl mb-3">🚩</div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400">CTF Training</h3>
                  <p className="text-slate-400 text-xs">A note dump of my CTF journey / where confusion slowly turns into “ohhh”</p>
                </div>
                
                {/* Phần gạch ngang, tag và chấm xanh đã được gộp chung vào đây */}
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[10px] text-blue-400/80 bg-blue-500/10 px-2 py-1 rounded">#CyberSec</span>
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* BENTO 5: IOT PROJECT */}
          <Link href="/projects/rfid" className="md:col-span-1">
          <motion.div 
            className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-6 group cursor-pointer hover:border-purple-500/50 transition-all relative overflow-hidden"
            whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
          >
            <div className="absolute inset-0 bg-purple-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="text-3xl mb-3">📟</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors hacker:text-green-300">IoT RFID</h3>
                <p className="text-slate-400 text-sm leading-relaxed hacker:text-green-400/70">Final chance to run it with my G / updating soon...</p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-purple-400/80 bg-purple-500/10 px-2 py-1 rounded">#IoT #Supabase</span>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
            </div>
          </motion.div>
        </Link>
        
          {/* BENTO 6: RICKROLL COOKIE */}
          <motion.a 
            href="/free-cookie" target="_blank" rel="noopener noreferrer"
            className="bg-gradient-to-br from-amber-950/40 to-amber-900/50 border border-amber-500/20 rounded-3xl p-6 group cursor-help transition-all hover:scale-105 hover:border-amber-400/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-4xl">🍪</div>
              <h3 className="text-lg font-bold text-amber-100">Free Cookie Here:</h3>
            </div>
            <p className="text-amber-300/60 text-xs font-mono">🍪🍪🍪🍪🍪</p>
            <div className="mt-4 flex justify-end">
              <span className="text-[10px] px-2 py-1 bg-amber-600/20 text-amber-200 rounded border border-amber-500/30">Do Not Click</span>
            </div>
          </motion.a>

        </div>
      </div>
      
{/* Nút bấm Terminal lơ lửng ở góc phải dưới (Chỉ hiện trên điện thoại) */}
      <motion.button
        className="lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-black/80 border border-lime-500/50 rounded-full text-lime-400 backdrop-blur-md shadow-lg shadow-lime-900/40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsIntelOpen(true)}
      >
        <Terminal className="w-6 h-6" />
      </motion.button>

      {/* Cửa sổ Popup (Modal) */}
      <AnimatePresence>
        {isIntelOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="lg:hidden fixed inset-0 z-50 p-6 flex flex-col justify-center items-center bg-black/80"
            onClick={() => setIsIntelOpen(false)} // Bấm ra ngoài vùng tối sẽ tự đóng
          >
            {/* Khung chứa bảng IntelFeed */}
          {/* FIX: Tăng chiều cao lên 650px và max-h-[85vh] để dài y như bản Web */}
            <motion.div 
              initial={{ scale: 1, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm h-[650px] max-h-[85vh] relative" 
              onClick={(e) => e.stopPropagation()} 
            >
              {/* Nút X để tắt */}
              <button 
                className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white bg-white/10 rounded-full backdrop-blur-md border border-white/10"
                onClick={() => setIsIntelOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Render lại IntelFeed ở đây */}
              <IntelFeed />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      
      {/* Footer */}
      <footer className="w-full max-w-7xl py-8 border-t border-white/5 text-xs text-slate-600 flex justify-between items-center transition-colors hacker:text-green-800">
        <div className="flex gap-4">
          <span>wakeupTeddy...</span>
          <span>© 2026 An Phan</span>
          <span>Seeing a suspicious amount of emojis 👀</span>
          <span>that’s my doing, no regrets</span>
          <span>if they look dumb… AI caught in 4K 🧠❌</span>
        </div>
        <motion.span 
          className="hover:text-pink-400 cursor-crosshair text-lg transition-colors duration-300" 
          title="Bocchi the Rock!"
          whileHover={{ scale: 1.2, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
        >
          🎸
        </motion.span>
      </footer>

    </main>
  );
}