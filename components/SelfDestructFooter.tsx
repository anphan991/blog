'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TriangleAlert, Bomb, TerminalSquare, Github, Twitter, PlayCircle, Skull } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function SelfDestructFooter() {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [terminalStep, setTerminalStep] = useState(0);

  const triggerDestruct = () => {
    setPhase(1);
    setTimeout(() => {
      setPhase(2);
    }, 3500);
  };

  useEffect(() => {
    if (phase === 2) {
      const timings = [800, 1800, 2800, 4000];
      timings.forEach((time, index) => {
        setTimeout(() => setTerminalStep(index + 1), time);
      });
    }
  }, [phase]);

  return (
    <div className="w-full relative bg-[#050505] min-h-[60vh] flex flex-col items-center justify-center overflow-hidden mt-32 z-50">
      
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${phase === 2 ? 'opacity-0' : 'opacity-20'}`}
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #3f3f46 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <AnimatePresence mode="wait">
        
        {/* PHASE 0: THE BUTTON */}
        {phase === 0 && (
          <motion.div key="idle" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} className="relative z-10 flex flex-col items-center group">
            <TriangleAlert size={48} className="text-red-500 mb-6 opacity-80" />
            <button onClick={triggerDestruct} className="relative overflow-hidden px-8 py-4 bg-zinc-950 border border-red-500/50 hover:border-red-500 rounded-xl flex items-center gap-3 transition-all group-hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#eab308,#eab308_10px,#000_10px,#000_20px)] opacity-50" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#eab308,#eab308_10px,#000_10px,#000_20px)] opacity-50" />
              <Bomb className="text-red-500" />
              <span className="font-black uppercase tracking-[0.2em] text-red-500 text-sm md:text-base">Wipe System Logs & Exit</span>
            </button>
          </motion.div>
        )}

        {/* PHASE 1: CHAOS */}
        {phase === 1 && (
          <motion.div key="wiping" animate={{ x: [-15, 15, -10, 10, -20, 20, 0], y: [-10, 10, -15, 15, -5, 5, 0] }} transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }} className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center pointer-events-none">
            <motion.div animate={{ opacity: [0, 0.8, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="absolute inset-0 bg-red-600 mix-blend-overlay" />
            <Skull size={100} className="text-red-500 mb-8 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-black text-red-500 tracking-tighter uppercase italic">OVERWRITING SECTORS...</h1>
          </motion.div>
        )}

        {/* PHASE 2: TERMINAL OUTRO - ĐÃ SỬA NÚT Ở ĐÂY */}
        {phase === 2 && (
          <motion.div key="terminal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="w-full max-w-3xl mx-auto p-6 md:p-12 font-mono">
            <div className="flex items-center gap-3 mb-8 text-zinc-500 border-b border-zinc-800 pb-4">
              <TerminalSquare size={24} />
              <span className="text-sm uppercase tracking-widest font-black">root@anphan-sec-node:~#</span>
            </div>

            <div className="space-y-4 text-xs md:text-sm">
              <p className="text-lime-500">&gt; Logs successfully purged. Evidence: None. <span className="text-white font-black ml-2">[OK]</span></p>

              {terminalStep >= 1 && (
                <p className="text-zinc-400">&gt; Encrypted assets recovery available via backup node...</p>
              )}

              {terminalStep >= 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-8">
                  <p className="text-white mb-6 font-bold uppercase tracking-widest text-[10px]">
                    // Secure_Assets_Access_Point
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* NÚT 1: SOURCE CODE */}
                    <a href="https://github.com/anphan991/IoT-Student-Attendance-System" target="_blank" className="flex flex-col items-center gap-3 p-5 border border-zinc-800 rounded-lg hover:border-lime-500 hover:bg-lime-500/10 transition-all group cursor-none">
                      <Github className="text-zinc-500 group-hover:text-lime-500 transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Source_Code</span>
                    </a>

                    {/* NÚT 2: TWITTER */}
                    <a href="https://x.com/TezD991" target="_blank" className="flex flex-col items-center gap-3 p-5 border border-zinc-800 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-all group cursor-none">
                      <Twitter className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Twitter_X</span>
                    </a>

                    {/* NÚT 3: VIDEO DEMO */}
                    <a href="https://drive.google.com/file/d/10L3jvclMYc2lfLkkUZcmZdWlb1N288H6/view" target="_blank" className="flex flex-col items-center gap-3 p-5 border border-zinc-800 rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-all group cursor-none">
                      <PlayCircle className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Video_Demo</span>
                    </a>
                  </div>
                </motion.div>
              )}

              {terminalStep >= 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center">
                  <span className="animate-pulse text-lime-500 font-black">_</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}