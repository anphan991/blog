'use client';
import { useState, useEffect } from 'react';

export default function FreeCookiePage() {
  const [activated, setActivated] = useState(false);

  // Tự động kích hoạt sau khi User tương tác
  const handleStart = () => {
    setActivated(true);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center font-mono overflow-hidden z-[9999]">
      {!activated ? (
        /* === MÀN HÌNH MỒI NHỬ (DÀNH CHO MOBILE) === */
        <div 
          onClick={handleStart}
          className="flex flex-col items-center justify-center space-y-6 cursor-pointer group"
        >
          {/* Vibe Terminal cho dân InfoSec */}
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <div className="w-12 h-12 border-2 border-lime-500 rounded-full flex items-center justify-center mb-2">
              <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
            </div>
            <p className="text-lime-500 text-[10px] tracking-[0.2em] uppercase">
              Encrypted Package Received
            </p>
          </div>

          <div className="text-center">
            <h1 className="text-white text-xl font-bold mb-2">FREE_COOKIE.bin</h1>
            <p className="text-zinc-500 text-[15px] max-w-[200px]">
              SHA-256: 3b8f...e2a1 <br/>
              Size: 3.6 MB
            </p>
          </div>

          {/* Nút bấm giả để lấy quyền Audio trên Mobile */}
          <div className="px-6 py-3 border border-white/20 group-hover:border-lime-500 group-hover:bg-lime-500/10 transition-all rounded-sm text-white text-xs">
            [ TAP TO DECRYPT & CLAIM ]
          </div>
          
          <p className="text-zinc-700 text-[20px] absolute bottom-10 italic">
            * Go on, press it 👆
          </p>
        </div>
      ) : (
        /* === RICKROLL TRAP (OPTIMIZED FOR MOBILE) === */
        <div className="w-full h-full relative animate-in fade-in zoom-in duration-700">
          <iframe
            // playsinline=1: Quan trọng nhất để phát ngay trên web mobile thay vì bung ra trình phát video của máy
            src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1"
            title="Rickroll"
            className="absolute inset-0 w-full h-full pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
          
          {/* Lớp phủ chặn tương tác để nạn nhân không bấm dừng được */}
          <div className="absolute inset-0 bg-transparent" />
          
        <div className="absolute top-5 left-5 text-[15px] text-lime-500/50 uppercase tracking-tighter">
          <div>System compromised</div>
          <div>Enjoy the cookie...</div>
        </div>
        </div>
      )}
    </div>
  );
}