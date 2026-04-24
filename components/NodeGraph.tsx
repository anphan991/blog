'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Server, Database, Lock, ShieldCheck, Zap, Activity, Bug } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function NodeGraph() {
  // Trạng thái của luồng dữ liệu: 0 = Nghỉ, 1 = ESP32 Đọc, 2 = Gửi API, 3 = API Xử lý, 4 = Gửi DB, 5 = Hoàn tất
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const triggerFlow = () => {
    if (step !== 0 && step !== 5) return;
    
    setStep(1);
    setLogs(["[ESP32] UID Scanned: E2:4A:8B:1C"]);

    setTimeout(() => {
      setStep(2);
      setLogs(prev => ["[NETWORK] Encrypting payload via TLS...", ...prev]);
    }, 1000);

    setTimeout(() => {
      setStep(3);
      setLogs(prev => ["[FastAPI] Validating JWT & Parsing Data...", ...prev]);
    }, 2500);

    setTimeout(() => {
      setStep(4);
      setLogs(prev => ["[Supabase] Executing RPC Insert...", ...prev]);
    }, 4000);

    setTimeout(() => {
      setStep(5);
      setLogs(prev => ["[SUCCESS] Attendance logged successfully. RTT: 0.8s", ...prev]);
    }, 5500);
  };

  // Node Component dùng chung cho đẹp
  const NetworkNode = ({ icon: Icon, title, sub, isActive, isSuccess, isError = false }: any) => (
    <motion.div 
      animate={isActive ? { scale: 1.05, y: -5 } : { scale: 1, y: 0 }}
      className={`relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-2xl border-2 flex flex-col items-center justify-center bg-black transition-colors duration-500
        ${isActive ? 'border-lime-500 shadow-[0_0_30px_rgba(132,204,22,0.3)]' : 
          isSuccess ? 'border-zinc-500 text-zinc-300' : 'border-zinc-800 text-zinc-600'}`}
    >
      <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none`} />
      
      {/* Vòng tròn nhấp nháy khi active */}
      {isActive && <div className="absolute inset-0 border-2 border-lime-500 rounded-2xl animate-ping opacity-20" />}
      
      <Icon size={32} className={`mb-3 ${isActive ? 'text-lime-500 animate-pulse' : ''}`} />
      <h4 className="font-black text-xs md:text-sm uppercase tracking-widest text-center">{title}</h4>
      <p className="text-[9px] md:text-[10px] font-mono opacity-50 mt-1">{sub}</p>
    </motion.div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#050505] border border-zinc-800 rounded-3xl p-6 md:p-12 overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #3f3f46 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Header & Nút Bấm */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 relative z-20 gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase flex items-center gap-3">
             <Activity className="text-lime-500" /> System_Architecture
          </h2>
          <p className="text-zinc-500 font-mono text-xs mt-1">Edge-to-Cloud Secure Data Pipeline</p>
        </div>
        <button 
          onClick={triggerFlow}
          disabled={step !== 0 && step !== 5}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-lime-500/50 hover:bg-lime-500/10 hover:border-lime-500 text-lime-500 rounded-xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap size={16} className={step > 0 && step < 5 ? "animate-spin" : ""} />
          {step > 0 && step < 5 ? "Simulating..." : "Simulate Transfer"}
        </button>
      </div>

      {/* === KHU VỰC ĐỒ THỊ (GRAPH) === */}
      <div className="relative flex items-center justify-between w-full mb-16">
        
        {/* Đường dây kết nối nền (Chưa active) */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-zinc-800 -translate-y-1/2" />

        {/* NODE 1: ESP32 */}
        <NetworkNode 
          icon={Cpu} title="ESP32 Edge" sub="Hardware Node" 
          isActive={step === 1 || step === 2} isSuccess={step > 2} 
        />

        {/* Dây chuyển dữ liệu 1: ESP32 -> API */}
        <div className="flex-1 relative h-10 -mx-2 z-0">
          <AnimatePresence>
            {step === 2 && (
              <motion.div 
                initial={{ left: "10%" }} animate={{ left: "80%" }} transition={{ duration: 1.2, ease: "linear" }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center gap-1 text-lime-500 drop-shadow-[0_0_10px_lime]"
              >
                <Lock size={16} />
                <span className="text-[8px] font-black tracking-widest">TLS_ENCRYPTED</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NODE 2: FastAPI */}
        <NetworkNode 
          icon={Server} title="FastAPI" sub="Cloud Gateway" 
          isActive={step === 3 || step === 4} isSuccess={step > 4} 
        />

        {/* Dây chuyển dữ liệu 2: API -> Supabase */}
        <div className="flex-1 relative h-10 -mx-2 z-0">
          <AnimatePresence>
            {step === 4 && (
              <motion.div 
                initial={{ left: "10%" }} animate={{ left: "80%" }} transition={{ duration: 1.2, ease: "linear" }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center gap-1 text-purple-500 drop-shadow-[0_0_10px_purple]"
              >
                <ShieldCheck size={16} />
                <span className="text-[8px] font-black tracking-widest">VERIFIED_JSON</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NODE 3: Supabase */}
        <NetworkNode 
          icon={Database} title="Supabase" sub="PostgreSQL Vault" 
          isActive={step === 5} isSuccess={step === 5} 
        />
      </div>

      {/* === KHU VỰC LOG HỆ THỐNG === */}
      <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 h-40 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#050505] to-transparent z-10" />
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#050505] to-transparent z-10" />
        
        <div className="flex flex-col gap-2 font-mono text-[10px] md:text-xs pt-6">
          <AnimatePresence>
            {logs.map((log, index) => (
              <motion.div 
                key={log + index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`border-l-2 pl-3 py-0.5 ${index === 0 ? 'border-lime-500 text-lime-400 font-bold' : 'border-zinc-700 text-zinc-500'}`}
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
          {step === 0 && <div className="text-zinc-600 italic">Waiting for simulation trigger...</div>}
        </div>
      </div>

    </div>
  );
}