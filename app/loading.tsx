'use client'; // <-- Quan trọng: Biến thành Client Component để dùng Framer Motion

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Cấu hình hiệu ứng rung mạnh cho Meme
const shakeAnimation = {
  hover: {
    x: [0, -10, 10, -10, 10, 0],
    y: [0, 5, -5, 5, -5, 0],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  }
};

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-slate-200 overflow-hidden z-0 font-sans p-4 md:p-8 flex items-center justify-center">
      
      {/* Background Gradient */}
      <div className="fixed top-[-20%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-blue-600/10 blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] rounded-full bg-purple-600/10 blur-[120px] -z-10 pointer-events-none"></div>

      {/* BENTO BOX GRID CONTAINER */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]">
        
        {/* BENTO 1: HERO CARD */}
        <div className="md:col-span-2 md:row-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>
          
          <div className="z-10">
            {/* Meme Tương tác: Rung khi hover */}
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-xs font-medium text-slate-300 mb-6 cursor-help"
              whileHover={{ rotate: [0, -5, 5, -5, 5, 0], scale: 1.1 }}
            >
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              System: Online | Social Battery: 1%
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
              An Phan
              {/* Meme Tương tác: Chim cánh cụt spin siêu tốc khi click */}
              <motion.span 
                className="inline-block cursor-pointer text-4xl"
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 360, transition: { duration: 0.5, repeat: Infinity } }}
                whileTap={{ scale: 1.5, rotate: 1080 }} // Click/Tap thì quay lộn vòng
              >
                🐧
              </motion.span>
            </h1>
            <h2 className="text-xl font-medium text-blue-400 mb-4">
              InfoSec Student & Break-stuff Enthusiast
            </h2>
            <p className="text-slate-400 max-w-md leading-relaxed">
              "Please excuse me for being antisocial 🙏"<br/>
              Hết sương cạn gió, vết mưa mạn phố.🏍️🤺
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap gap-3 mt-8 z-10">
            {['https://github.com/anphan991', 'https://x.com/wakeupTeddyQQ', 'mailto:an0915129080@gmail.com'].map((href, index) => (
              <motion.a 
                key={index}
                href={href} target="_blank" rel="noopener noreferrer" 
                className="p-3 bg-black/50 border border-white/10 hover:border-blue-500 rounded-xl transition-colors"
                whileHover={{ scale: 1.2, y: -5, transition: { type: "spring", stiffness: 300 } }}
              >
                {/* SVG icons here... */}
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
          <p className="text-green-400">anphan991㉿kali:~$ <span className="text-white">./get_sleep.sh</span></p>
          <p className="text-red-400 mt-1">bash: ./get_sleep.sh: Permission denied</p>
          {/* Meme: Nháy con trỏ Terminal */}
          <p className="text-green-400 mt-2">anphan991㉿kali:~$ <span className="inline-block w-2 h-4 bg-white animate-pulse"></span></p>
        </div>

        {/* BENTO 3: FUN STATS */}
        {/* Meme: Tương tác: Rung khi hover */}
        <motion.div 
          className="md:col-span-1 md:row-span-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer"
          whileHover="hover"
          variants={shakeAnimation}
        >
          <div className="text-4xl mb-2 group-hover:animate-pulse">☕</div>
          <h3 className="text-3xl font-black text-white">404</h3>
          <p className="text-slate-400 text-sm font-medium">Sleep Not Found</p>
        </motion.div>

        {/* BENTO 4: CTF PROJECT */}
        <motion.div 
          className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-6 group cursor-pointer hover:border-blue-500/50 transition-all relative overflow-hidden block"
          whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
        >
          <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10">
            <div className="text-3xl mb-3">🚩</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">CTF Writeups & Exploit</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Nơi cất giữ các script Python "pháp sư" dùng để vượt rào Pwnable và Web Exploitation. Nếu code chạy được, xin đừng hỏi tại sao.</p>
          </div>
        </motion.div>

        {/* BENTO 5: IOT PROJECT */}
        <motion.div 
          className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-6 group cursor-pointer hover:border-purple-500/50 transition-all relative overflow-hidden"
          whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
        >
          <div className="absolute inset-0 bg-purple-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="text-3xl mb-3">📟</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">IoT RFID</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Hệ thống ESP32 + Supabase. Từng hiến tế 2 con cảm biến cho thần lửa.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">Status: Stable</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-4 text-xs text-slate-600 flex gap-2 items-center">
        <span>wakeupTeddy...</span>
        <span>|</span>
        {/* Bocchi Tương tác: Rung liên tục */}
        <motion.span 
          className="hover:text-pink-400 cursor-crosshair text-lg" 
          title="Bocchi the Rock!"
          animate={{ x: [0, -1, 1, -1, 1, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatType: "loop" }}
        >🎸</motion.span>
      </footer>

    </main>
  );
}