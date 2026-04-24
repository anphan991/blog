'use client';

import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { Cpu, ShieldCheck, Wifi, Fingerprint, Ghost, Scan, Barcode } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function RFIDCard3D() {
  const [isBocchiPanic, setIsBocchiPanic] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // 1. Tọa độ thẻ
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 2. Lò xo vật lý (Siêu êm ái khi nhả tay)
  const springConfig = { stiffness: 60, damping: 20, mass: 1 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // 3. Quy đổi thành góc nghiêng (Tối đa 35 độ)
  const rotateX = useTransform(ySpring, [-200, 200], ["35deg", "-35deg"]);
  const rotateY = useTransform(xSpring, [-200, 200], ["-35deg", "35deg"]);

  // 4. ĐỘNG CƠ KHÔNG TRỌNG LỰC (Organic Float)
  useEffect(() => {
    if (isDragging) return;

    const floatX = animate(x, [-80, 80, -80], { duration: 10, ease: "easeInOut", repeat: Infinity });
    const floatY = animate(y, [50, -50, 50], { duration: 7, ease: "easeInOut", repeat: Infinity });

    return () => {
      floatX.stop();
      floatY.stop();
    };
  }, [isDragging, x, y]);

  return (
    <div className="perspective-2000 w-full max-w-[460px] h-80 relative flex items-center justify-center group">
      
      {/* === DÒNG CHỮ HƯỚNG DẪN TRÔI LƠ LỬNG PHÍA TRÊN THẺ === */}
      <motion.div 
        animate={{ opacity: isDragging ? 0 : 1 }}
        className="absolute -top-6 text-[10px] font-black text-lime-500 uppercase tracking-widest animate-pulse pointer-events-none z-50"
      >
        [ Double Click on the Shield ]
      </motion.div>

      {/* KHỐI NÂNG HẠ TỰ ĐỘNG */}
      <motion.div
        animate={isDragging ? { y: 0 } : { y: [-10, 10, -10] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        className="w-full h-full relative mt-4"
      >
        <motion.div
          onPanStart={() => setIsDragging(true)}
          onPan={(e, info) => {
            x.set(info.offset.x);
            y.set(info.offset.y);
          }}
          onPanEnd={() => setIsDragging(false)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95, cursor: "grabbing" }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className={`relative w-full h-full rounded-[2rem] transition-colors duration-700 shadow-2xl cursor-grab overflow-hidden border border-white/10
            ${isBocchiPanic ? 'bg-pink-950/30 shadow-[0_0_80px_rgba(236,72,153,0.2)]' : 'bg-[#050505]/60 backdrop-blur-2xl'}`}
        >
          {/* === NỀN KÍNH & WATERMARK === */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black italic text-white/[0.02] pointer-events-none select-none tracking-tighter">
            UTE
          </div>

          {/* === NỘI DUNG 3D CHÍNH === */}
          <div className="relative z-20 h-full p-8 flex flex-col justify-between pointer-events-none" style={{ transform: "translateZ(60px)" }}>
            
            {/* Lớp 1: Header */}
            <div className="flex justify-between items-start" style={{ transform: "translateZ(30px)" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-16 bg-gradient-to-b from-amber-300 via-amber-600 to-amber-800 rounded-md flex flex-col items-center justify-center border border-amber-400/30 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-1 border border-black/20 rounded-sm" />
                  <Cpu size={24} className="text-amber-950/50 mb-1" />
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-amber-950/30 rounded-full" />
                    <div className="w-1 h-3 bg-amber-950/30 rounded-full" />
                    <div className="w-1 h-3 bg-amber-950/30 rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={`px-3 py-1 rounded-sm border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5
                    ${isBocchiPanic ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-lime-500/10 border-lime-500/50 text-lime-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isBocchiPanic ? 'bg-pink-400 animate-ping' : 'bg-lime-400 animate-pulse'}`} />
                    {isBocchiPanic ? 'PANIC_MODE' : 'ACTIVE_LINK'}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono">FRQ: 13.56 MHz</p>
                </div>
              </div>
              <Scan size={32} className={isBocchiPanic ? 'text-pink-500/30' : 'text-white/10'} />
            </div>

            {/* Lớp 2: Identity */}
            <div className="space-y-3 relative" style={{ transform: "translateZ(80px)" }}>
              <div className="absolute -left-8 top-2 w-1 h-14 bg-gradient-to-b from-transparent via-lime-500 to-transparent opacity-50" />
              
              <div className="flex items-center gap-2 mb-2">
                <Fingerprint size={16} className={isBocchiPanic ? 'text-pink-500' : 'text-lime-500'} />
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
                  {isBocchiPanic ? "ANOMALY_DETECTED" : "AUTHORIZED_PERSONNEL"}
                </span>
              </div>
              
              <h3 className={`text-4xl font-black uppercase tracking-tighter leading-tight drop-shadow-2xl transition-colors duration-500 
                ${isBocchiPanic ? 'text-pink-500' : 'text-white'}`}>
                {isBocchiPanic ? "BOCCHI " : "AN PHAN KHANH"}
              </h3>
              
              <div className="flex items-center gap-4 text-[12px] font-mono mt-4">
                 <span className="text-zinc-300 bg-white/10 px-2 py-1 rounded">ID: 21110XXX</span>
              </div>
            </div>

            {/* Lớp 3: Footer & Mã Vạch */}
            <div className="flex justify-between items-end pt-6" style={{ transform: "translateZ(40px)" }}>
              <div className="space-y-3">
                <Barcode size={36} strokeWidth={1} className="text-zinc-500 opacity-60" />
                <p className="font-mono text-[10px] text-zinc-400 tracking-widest">UID_E2:4A:8B:1C</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Security_Level</p>
                   <p className={`text-[13px] font-black uppercase ${isBocchiPanic ? 'text-pink-500' : 'text-lime-500'}`}>
                     {isBocchiPanic ? 'CRITICAL' : 'CLEARANCE_5'}
                   </p>
                </div>
                
                {/* NÚT SHIELD BẤM ĐƯỢC (Giữ nguyên tính năng Double Click) */}
                <div 
                  onDoubleClick={(e) => {
                    e.stopPropagation(); 
                    setIsBocchiPanic(!isBocchiPanic);
                  }}
                  className={`pointer-events-auto cursor-pointer p-4 rounded-xl border transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:scale-110
                  ${isBocchiPanic ? 'bg-pink-500 border-pink-400 text-white rotate-[360deg]' : 'bg-zinc-800 border-zinc-700 text-lime-400'}`}
                >
                   {isBocchiPanic ? <Ghost size={26} /> : <ShieldCheck size={26} />}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>

      {/* BÓNG ĐỔ VẬT LÝ DƯỚI GẦM THẺ */}
      <motion.div 
        animate={isDragging ? { scale: 0.8, opacity: 0.6 } : { scale: [0.6, 1, 0.6], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        className="absolute -bottom-12 left-10 right-10 h-8 bg-black blur-[25px] -z-10 rounded-[100%] transition-colors group-hover:bg-lime-500/10"
      />
    </div>
  );
}