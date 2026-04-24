'use client';

import { motion } from 'framer-motion';
import { Smartphone, AlertTriangle, XSquare } from 'lucide-react';
import { useState } from 'react';

export default function LandscapeEnforcer() {
  const [isBypassed, setIsBypassed] = useState(false);

  if (isBypassed) return null;

  return (
    // Tailwind magic: Chỉ hiện ở màn hình nhỏ (dưới md) VÀ khi đang cầm dọc (portrait).
    // Khi xoay ngang (landscape) hoặc dùng PC (md), nó tự động display: hidden.
    <div className="fixed inset-0 z-[10000] bg-[#050505]/95 backdrop-blur-2xl flex-col items-center justify-center p-8 landscape:hidden md:hidden flex">
      
      {/* Khung viền cảnh báo */}
      <div className="absolute inset-4 border border-red-500/30 rounded-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      {/* Hiệu ứng Đèn cảnh báo nhấp nháy */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-red-500 shadow-[0_0_50px_red] animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center text-center w-full max-w-sm"
      >
        <AlertTriangle size={48} className="text-red-500 mb-6 animate-pulse" />
        
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">
          [ VIEWPORT_RESTRICTED ]
        </h2>
        
        <p className="text-xs font-mono text-red-400 mb-12 uppercase tracking-widest">
          Tactical Width: Critical
        </p>

        {/* Biểu tượng điện thoại xoay */}
        <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
          <motion.div
            animate={{ rotate: -90 }}
            transition={{ 
              duration: 2, 
              ease: "easeInOut", 
              repeat: Infinity, 
              repeatType: "reverse",
              repeatDelay: 1 
            }}
            className="text-lime-500"
          >
            <Smartphone size={80} strokeWidth={1.5} />
          </motion.div>
          {/* Mũi tên hướng dẫn xoay */}
          <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -right-4 top-1/2 -translate-y-1/2 text-lime-500 font-black text-2xl"
          >
            ↻
          </motion.div>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed mb-8">
          Giao diện <span className="text-white font-bold">RFID project</span> chứa dữ liệu mật độ cao. <br/>
          Vui lòng <strong className="text-lime-500">XOAY NGANG THIẾT BỊ</strong> để kích hoạt toàn bộ khả năng hiển thị.
        </p>

        <p className="text-[10px] text-zinc-600 italic mb-8 border-l-2 border-pink-500 pl-3 text-left w-full">
          "Không gian dọc hẹp quá, Bocchi không thở được..."
        </p>

        {/* Nút Bypass (Dành cho những người lỳ lợm vẫn muốn xem dọc) */}
        <button 
          onClick={() => setIsBypassed(true)}
          className="flex items-center gap-2 px-4 py-2 bg-transparent border border-zinc-700 text-zinc-500 hover:text-white hover:border-white rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all"
        >
          <XSquare size={14} />
          <span>[ OVERRIDE_WARNING ]</span>
        </button>
      </motion.div>

      {/* Các dòng Code chạy nền */}
      <div className="absolute bottom-4 left-4 text-[8px] font-mono text-zinc-700 uppercase space-y-1">
        <p>sys_req: width &gt; 768px</p>
        <p>current_state: portrait_lock</p>
        <p className="animate-pulse text-red-900">waiting_for_rotation...</p>
      </div>
    </div>
  );
}