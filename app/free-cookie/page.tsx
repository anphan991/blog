'use client';
import { useState } from 'react';

export default function FreeCookiePage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center font-mono z-[9999]">
      {!isPlaying ? (
        /* LỚP MỒI NHỬ: Ép người dùng click để trình duyệt cho phép phát tiếng */
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="text-lime-400 text-sm mb-4">
            [SYSTEM] ENCRYPTED_PACKAGE_READY
          </div>
          <button 
            onClick={() => setIsPlaying(true)}
            className="px-8 py-4 border-2 border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-black transition-all font-bold text-xl uppercase tracking-tighter shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            Claim Your Free Cookie 🍪
          </button>
          <p className="text-zinc-600 text-[10px]">Security verified by AES-256</p>
        </div>
      ) : (
        /* VIDEO CHÍNH: Sẽ phát có tiếng vì đã có tương tác Click ở trên */
        <div className="w-full h-full relative animate-in zoom-in duration-300">
          <iframe
            src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1"
            title="Rickroll"
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          
          {/* Overlay che phủ để không cho bấm dừng */}
          <div className="absolute inset-0 bg-transparent z-10" />
        </div>
      )}
    </div>
  );
}