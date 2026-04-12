'use client';
import { useState } from 'react';

export default function FreeCookiePage() {
  const [activated, setActivated] = useState(false);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center font-mono overflow-hidden z-[9999]">
      
      {/* === 1. GIAO DIỆN DÀNH CHO MOBILE (Hiện GIF Local ngay lập tức) === */}
      <div className="block md:hidden w-full h-full flex flex-col items-center justify-center p-6 text-center bg-black">
        <div className="mb-6 text-lime-500 text-[10px] animate-pulse tracking-widest">
          [SYSTEM] PAYLOAD_DELIVERED
        </div>
        
        {/* Đảm bảo khung hình cố định, viền hacker */}
        <div className="w-full max-w-[350px] aspect-square relative rounded-xl overflow-hidden border border-zinc-800 shadow-[0_0_30px_rgba(59,130,246,0.2)] bg-zinc-900">
          {/* Load GIF từ máy local để chống lỗi mạng/tunnel */}
          <img 
            src="/rickroll.gif" 
            alt="Rickroll Mobile" 
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        <p className="mt-8 text-zinc-500 text-[9px] uppercase">
          You got the cookie 🍪
        </p>
        <a href="/" className="mt-4 text-blue-400 text-[10px] underline hover:text-blue-300 transition-colors">
          ./back_to_safety
        </a>
      </div>

      {/* === 2. GIAO DIỆN DÀNH CHO PC (Trap Video có tiếng) === */}
      <div className="hidden md:flex w-full h-full items-center justify-center">
        {!activated ? (
          /* Màn hình mồi nhử PC */
          <div 
            onClick={() => setActivated(true)}
            className="flex flex-col items-center justify-center space-y-6 cursor-pointer group"
          >
            <div className="w-16 h-16 border-2 border-lime-500 rounded-full flex items-center justify-center animate-bounce">
              <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
            </div>
            <div className="text-center">
              <h1 className="text-white text-2xl font-bold mb-2 tracking-tighter group-hover:text-lime-400 transition-colors">
                FREE_COOKIE.exe
              </h1>
              <p className="text-lime-500 text-xs uppercase tracking-widest opacity-70">
                Click to decrypt payload
              </p>
            </div>
            <div className="px-6 py-2 border border-white/10 group-hover:border-lime-500 transition-all text-zinc-500 text-[10px] group-hover:text-lime-500">
              [ Go on, press it ]
            </div>
          </div>
        ) : (
          /* Video Rickroll Bất tử cho PC */
          <div className="w-full h-full relative animate-in fade-in duration-1000">
            <iframe
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1"
              title="Rickroll PC"
              className="absolute inset-0 w-full h-full pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
            {/* Lớp phủ tàng hình ngăn nạn nhân bấm Pause */}
            <div className="absolute inset-0 bg-transparent z-10" />
            <div className="absolute top-5 left-5 text-[10px] text-lime-500/50 uppercase tracking-tighter z-20 pointer-events-none">
              [ SYSTEM COMPROMISED ]
            </div>
          </div>
        )}
      </div>

    </div>
  );
}