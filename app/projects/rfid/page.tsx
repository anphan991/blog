'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Cpu, Database, Globe, Zap, Bug,
  ShieldAlert, Users, ExternalLink, PlayCircle, ArrowLeft, ChevronRight, 
  ChevronDown, FileText, Folder, Activity,
  Coffee, Lock 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import InteractiveTerminal from '@/components/Terminal'; // Hoặc '../../components/Terminal' tùy config alias
import ViewCounter from '@/components/Terminal'; // Tui thấy ông có file này, nhớ gọi ra luôn cho xịn!
import { Terminal as TerminalIcon, ShieldCheck,  } from 'lucide-react';

// --- 1. DỮ LIỆU NHIỆM VỤ (MISSION DATA) ---
const MissionData = [
{
  id: 'ch1',
  title: 'PHASE 01: THE INFILTRATION (Tổng quan đề tài)',
  content: (
    <div className="space-y-10 font-mono text-base"> {/* Tăng base size lên text-base */}
      
      {/* 1.1 Đặt vấn đề: The Legacy Crisis */}
      <section className="relative p-8 bg-red-950/5 border border-red-900/20 rounded-3xl">
        <div className="absolute -top-4 left-8 px-3 py-1 bg-[#0a0a0a] text-red-500 font-black flex items-center gap-2 text-sm border border-red-900/30 rounded-lg">
          <ShieldAlert size={18} /> 1.1_PROBLEM_DETECTION
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4">
          <div className="lg:col-span-3 space-y-4">
            <p className="text-white text-lg font-black tracking-tighter uppercase underline decoration-red-500/50 underline-offset-4">
              ⚠️ Tình trạng "Khủng hoảng chuyên cần":
            </p>
            <ul className="space-y-3 text-slate-300 text-sm md:text-base"> {/* Tăng từ text-xs lên text-base */}
              <li className="flex gap-3">
                <span className="text-red-500 font-bold shrink-0">[LOST]</span> 10-15 phút vàng ngọc mỗi tiết chỉ để gọi tên.
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-bold shrink-0">[VOID]</span> "Điểm danh hộ" - Ma thuật đen truyền kiếp của sinh viên.
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-bold shrink-0">[LAG]</span> Dữ liệu giấy có độ trễ cao hơn cả ping server Global.
              </li>
            </ul>
          </div>
          <div className="lg:col-span-2 bg-black/60 p-6 rounded-2xl border border-white/10 italic text-sm text-slate-400 flex flex-col justify-center leading-relaxed">
            "Trong kỷ nguyên 4.0, giảng viên vẫn phải cầm sớ đọc tên? 
            Đó không phải là giáo dục thông minh, đó là sự kiên nhẫn vô tận." 
            <div className="mt-2 text-blue-400 font-bold not-italic">— Một Giáo sư nào đó ko nói như vậy</div>
          </div>
        </div>
      </section>

      {/* 1.2 Tình hình nghiên cứu: Global Intel Scan */}
      <section className="space-y-6">
        <h3 className="text-white text-xl font-black flex items-center gap-3 border-b border-white/10 pb-3">
          <Globe size={22} className="text-blue-500" /> 1.2_GLOBAL_INTEL_SCAN
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nội địa */}
          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl hover:bg-blue-500/10 transition-all">
            <p className="text-blue-400 font-black mb-3 text-sm tracking-widest uppercase">🇻🇳 Local Systems</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Vân tay (Snail speed), QR Code (Proxy King - screenshot là xong), Arduino (Toy-level, thiếu Web/DB xịn).
            </p>
          </div>
          {/* Quốc tế */}
          <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl hover:bg-purple-500/10 transition-all">
            <p className="text-purple-400 font-black mb-3 text-sm tracking-widest uppercase">🌍 Foreign Systems</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Face ID (GPU tốn kém), Long-range RFID (Nhiễu tín hiệu, giá 'chát' như trà sữa full topping).
            </p>
          </div>
          {/* Giải pháp tối ưu */}
          <div className="p-6 bg-lime-500/10 border border-lime-500/20 rounded-2xl hover:bg-lime-500/20 transition-all shadow-[0_0_20px_rgba(132,204,22,0.1)]">
            <p className="text-lime-400 font-black mb-3 text-sm tracking-widest uppercase flex items-center gap-2">
              💡 THE GOAT
            </p>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              RFID 13.56 MHz + Edge Caching + REST API. 
              <br/>Phản hồi &lt; 0.1s. Phù hợp cho đỗ nghèo khỉ nhưng vẫn muốn hít hàng thơm.
            </p>
          </div>
        </div>
      </section>

      {/* 1.3 & 1.4: Reasons & Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lý do chọn đề tài */}
        <div className="space-y-6">
          <h3 className="text-white text-xl font-black flex items-center gap-3">
            <Zap size={22} className="text-yellow-500" /> 1.3_THE_CORE_WHY
          </h3>
          <div className="space-y-3">
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-500/5 text-sm md:text-base">
              <span className="text-yellow-500 font-black mr-2">#1:</span> RFID Balance - Rẻ, bền, tốc độ ánh sáng.
            </div>
            <div className="p-4 border-l-4 border-blue-500 bg-blue-500/5 text-sm md:text-base">
              <span className="text-blue-500 font-black mr-2">#2:</span> Self-built Backend - Kiểm soát tuyệt đối.
            </div>
            <div className="p-4 border-l-4 border-purple-500 bg-purple-500/5 text-sm md:text-base">
              <span className="text-purple-500 font-black mr-2">#3:</span> Mutex Lock - Chống "loạn nhịp đa luồng" a.k.a Race Condition.
            </div>
          </div>
        </div>

        {/* Mục tiêu & Phạm vi */}
        <div className="space-y-6">
          <h3 className="text-white text-xl font-black flex items-center gap-3">
            <Activity size={22} className="text-green-500" /> 1.4_MISSION_SCOPE
          </h3>
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-tighter">Target Scale:</span>
              <span className="text-green-400 font-black italic">50 - 100 Students</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-tighter">Protocol:</span>
              <span className="text-green-400 font-black italic">Mifare Classic 1K</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '85%' }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-green-500 h-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              />
            </div>
            <p className="text-xs text-slate-500 italic leading-relaxed pt-5">
              "Kiến trúc Module hóa. Sẵn sàng nâng cấp AI nhận diện khuôn mặt trong Season tiếp theo."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
},

{
  id: 'ch2',
  title: 'PHASE 02: THE HARDWARE LAB (Cơ sở lý thuyết)',
  content: (
    <div className="space-y-12 font-mono text-base">
      
      {/* 2.1 ESP32: The Beast with Two Hearts */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Cpu size={24} className="text-purple-500" />
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">2.1_THE_DUAL_CORE_BEAST</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              Trái tim của hệ thống là <span className="text-purple-400 font-bold">ESP32</span>. Không giống như mấy con chip 8-bit "cổ lỗ sĩ", con này có tận 2 lõi (Dual-core). 
            </p>
            
            <div className="bg-black/40 rounded-3xl border border-white/5 overflow-hidden shadow-inner mt-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-purple-500/10 text-purple-400 font-black uppercase text-xs">
                  <tr>
                    <th className="p-4">Component</th>
                    <th className="p-4">Specifications</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-slate-200 uppercase">CPU</td>
                    <td className="p-4 italic">Xtensa® Dual-core 32-bit LX6 (240MHz)</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-slate-200 uppercase">Wireless</td>
                    <td className="p-4 italic">Wi-Fi 150Mbps + Bluetooth Dual-mode</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-slate-200 uppercase">Security</td>
                    <td className="p-4 italic">Hardware Encryption (AES, SHA, RSA)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RTOS Meme Box - ĐÃ FIX IN ĐẬM */}
          <div className="bg-purple-950/5 border border-purple-500/20 rounded-3xl p-8 flex flex-col justify-center relative group">
            <div className="absolute top-4 right-6 text-purple-900 group-hover:text-purple-500 transition-colors">
              <Activity size={40} />
            </div>
            <p className="text-purple-400 font-black mb-4 flex items-center gap-2 italic">
              <Zap size={18} /> OPERATING_SYSTEM: FreeRTOS
            </p>
            <p className="text-slate-400 leading-relaxed italic text-sm md:text-base">
              "Lập trình nhúng thông thường giống như đi thang bộ. <strong className="text-white font-bold">FreeRTOS</strong> cho ông đi thang máy. Lõi 0 lo 'hóng hớt' Wifi, Lõi 1 lo 'quẹt thẻ'. Hai anh em làm việc riêng, không ai đụng hàng ai, triệt tiêu hoàn toàn tình trạng treo máy."
            </p>
          </div>
        </div>
      </section>

      {/* 2.2 RFID: Wireless Magic */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Activity size={24} className="text-blue-500" />
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">2.2_WIRELESS_INTEL (13.56 MHz)</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-6">
            <p className="text-white font-bold text-xl flex items-center gap-2">
              <Zap size={20} className="text-blue-400" /> Định luật Faraday: "Năng lượng từ hư không"
            </p>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base italic">
              "Thẻ RFID không có pin, nhưng khi bước vào vùng phủ sóng của Reader, nó tự 'sống' dậy nhờ cảm ứng điện từ. Reader phát sóng, thẻ nhận năng lượng, 'hú' lại cái mã UID. Đơn giản như cách ông thấy crush rồi tim đập nhanh vậy."
            </p>
            <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-[12px] text-blue-400/80 font-mono">
               // Signal Protocol Detected... <br/>
               // Frequency: 13.56 MHz | Data Rate: 106 kbps
            </div>
          </div>

          {/* BIG MEMORY MAP - PHÓNG TO VÀ CHI TIẾT HƠN */}
          <div className="lg:col-span-2 p-8 bg-zinc-900 border border-white/10 rounded-3xl flex flex-col justify-between group shadow-xl">
             <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-slate-200 uppercase font-black tracking-widest italic">Memory_Map: Mifare_1K</p>
                <Database size={16} className="text-blue-500 animate-pulse" />
             </div>
             
             {/* Grid 4x4 đại diện cho 16 Sector */}
             <div className="grid grid-cols-4 gap-3">
               {[...Array(16)].map((_, i) => (
                 <div 
                   key={i} 
                   className={`h-10 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                     i === 0 
                     ? 'bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.4)] text-white animate-pulse' 
                     : 'bg-blue-600/20 border border-blue-500/20 text-blue-400/40 group-hover:bg-blue-600/40 group-hover:text-blue-200'
                   }`}
                   title={i === 0 ? "Sector 0: Manufacturer Data" : `Sector ${i}`}
                 >
                   S{i}
                 </div>
               ))}
             </div>

             <div className="mt-8 space-y-3">
                <p className="text-[12px] text-slate-400 leading-tight italic border-l-2 border-red-500 pl-4">
                  <strong className="text-red-400">Sector 0 (S0):</strong> Chứa UID "bất tử". Không thể sửa, không thể giả mạo. Linh hồn của sinh viên nằm ở đây.
                </p>
                <p className="text-[12px] text-slate-500 leading-tight italic border-l-2 border-blue-500/30 pl-4">
                  <strong className="text-blue-400">S1 - S15:</strong> Vùng nhớ dữ liệu. Có thể ghi thêm nếu ông muốn lưu điểm số hay mã số bí mật.
                </p>
             </div>
          </div>
        </div>
        
      </section>

      {/* 2.3 ACID & API: The Backend Contract */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Database size={24} className="text-green-500" />
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">2.3_THE_ETERNAL_LEDGER (ACID)</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 p-8 bg-green-500/5 border border-green-500/10 rounded-3xl">
            <h4 className="text-green-400 font-black text-sm tracking-widest italic mb-6 uppercase">The_ACID_Contract</h4>
            <ul className="space-y-5 text-sm md:text-base text-slate-400">
              <li><strong className="text-white font-bold">Atomicity:</strong> Điểm danh hoặc thành công, hoặc không có gì. Tuyệt đối không có chuyện 'quẹt nửa vời'.</li>
              <li><strong className="text-white font-bold">Consistency:</strong> Database sạch như cách ông dọn dẹp folder sau khi nộp bài.</li>
              <li><strong className="text-white font-bold">Isolation:</strong> 100 ông quẹt cùng lúc cũng không được 'chen lấn' dữ liệu.</li>
            </ul>
          </div>

          {/* Race Condition Meme - ĐÃ FIX IN ĐẬM */}
          <div className="lg:col-span-3 p-8 bg-red-950/10 border border-red-500/20 rounded-3xl relative overflow-hidden flex flex-col justify-center shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
               <ShieldAlert size={120} />
             </div>
             <h4 className="text-red-500 font-black text-2xl mb-4 flex items-center gap-2 italic tracking-tighter uppercase">
               Race_Condition: Đua xe dữ liệu
             </h4>
             <p className="text-slate-300 leading-relaxed italic text-sm md:text-base">
               "Hãy tưởng tượng 2 sinh viên cùng quẹt thẻ vào đúng 1 millisecond. Nếu không có <strong className="text-white font-bold">Mutex Lock</strong>, Database sẽ 'lú' và ghi nhận sai. Một ông đi học nhưng bị vắng, một ông ở nhà nhưng lại có mặt. Đó là lý do chúng ta cần khóa cửa khu vực găng!"
             </p>
          </div>
        </div>
      </section>

      {/* Footer Chapter Note */}
      <div className="pt-8 border-t border-white/5 flex justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500 bg-zinc-900 px-8 py-4 rounded-full border border-white/10 shadow-2xl">
          <Coffee size={16} className="text-amber-600" />
          <span className="font-bold tracking-tight">DEBUG_TIP: Luôn check pin MISO/MOSI trước khi than vãn RFID không chạy.</span>
        </div>
      </div>
    </div>
  )
},

{
  id: 'ch3',
  title: 'PHASE 03: THE BLUEPRINT (Thiết kế hệ thống)',
  content: (
    <div className="space-y-12 font-mono text-base">
      
      {/* 3.1 Sơ đồ khối: Edge-to-Cloud */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Zap size={24} className="text-blue-400" />
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">3.1_ARCH_PIPELINE</h3>
        </div>

        <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
            <Globe size={120} />
          </div>
          <p className="text-white font-bold text-lg mb-6 flex items-center gap-2 italic">
            <Activity size={20} className="text-blue-400" /> Edge-to-Cloud Pipeline
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8">
            <div className="px-6 py-4 bg-zinc-900 border border-purple-500/50 rounded-xl text-center shadow-lg shadow-purple-500/10">
              <p className="text-xs text-purple-400 font-black mb-1 tracking-widest">EDGE NODE</p>
              <p className="font-bold text-white text-lg">ESP32</p>
              <p className="text-[10px] text-slate-500">RFID + Edge Caching</p>
            </div>
            <div className="h-0.5 w-8 bg-slate-800 hidden md:block"></div>
            <div className="px-6 py-4 bg-zinc-900 border border-green-500/50 rounded-xl text-center shadow-lg shadow-green-500/10">
              <p className="text-xs text-green-400 font-black mb-1 tracking-widest">LOGIC ENGINE</p>
              <p className="font-bold text-white text-lg">FastAPI</p>
              <p className="text-[10px] text-slate-500">Mutex Lock / JWT</p>
            </div>
            <div className="h-0.5 w-8 bg-slate-800 hidden md:block"></div>
            <div className="px-6 py-4 bg-zinc-900 border border-blue-500/50 rounded-xl text-center shadow-lg shadow-blue-500/10">
              <p className="text-xs text-blue-400 font-black mb-1 tracking-widest">THE VAULT</p>
              <p className="font-bold text-white text-lg">Supabase</p>
              <p className="text-[10px] text-slate-500">PostgreSQL (ACID)</p>
            </div>
          </div>
          
          <p className="text-base text-slate-400 italic leading-relaxed pt-6 border-t border-white/5">
            <strong className="text-white font-bold">Smart Edge Caching:</strong> Vũ khí bí mật giúp phản hồi &lt; 0.5s. Thay vì hỏi Server mọi lúc, ESP32 tự "ghi nhớ" danh sách ca học vào RAM. Nhanh hơn cả cách ông bị đuổi khỏi group lớp vì gửi meme nhạy cảm.
          </p>
        </div>
      </section>

      {/* 3.2 Database: The Eternal Vault */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Database size={24} className="text-green-500" />
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">3.2_DATABASE_SCHEMA_INTEL</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-3xl group hover:border-purple-500/30 transition-all">
            <p className="text-purple-400 font-black text-xs tracking-widest mb-4">TABLE: admin_users</p>
            <div className="space-y-3 text-sm font-mono">
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">admin_username</span> <span className="text-white">TEXT (PK)</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">password_hash</span> <span className="text-white">TEXT (Bcrypt)</span></div>
              <div className="flex justify-between pb-1"><span className="text-slate-500">ho_ten</span> <span className="text-white">TEXT</span></div>
            </div>
            <p className="mt-4 text-[11px] text-slate-500 italic">"Băm mật khẩu (Bcrypt) - No Plaintext No Cry."</p>
          </div>

          <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-3xl group hover:border-blue-500/30 transition-all">
            <p className="text-blue-400 font-black text-xs tracking-widest mb-4">TABLE: lop_hoc</p>
            <div className="space-y-3 text-sm font-mono">
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">ma_lop</span> <span className="text-white">TEXT (PK)</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">gio_bat_dau</span> <span className="text-white">TIME</span></div>
              <div className="flex justify-between pb-1"><span className="text-slate-500">so_buoi_max</span> <span className="text-white">INT (15)</span></div>
            </div>
            <p className="mt-4 text-[11px] text-slate-500 italic">"Cấu hình ca học - Cẩn thận kẻo Set nhầm 07:30 thành 19:30."</p>
          </div>

          <div className="p-6 bg-red-950/5 border border-red-500/20 rounded-3xl group hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all flex flex-col justify-between">
            <div>
              <p className="text-red-500 font-black text-xs tracking-widest mb-4 uppercase">Table: Status_Warning</p>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">mssv</span> <span className="text-white font-bold">FK</span></div>
                <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">so_buoi_vang</span> <span className="text-white">INT</span></div>
                <div className="flex justify-between pb-1"><span className="text-slate-500">trang_thai</span> <span className="text-red-400 font-black">INELIGIBLE?</span></div>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-red-500/70 italic font-bold uppercase tracking-tighter">
              "System: Cấm thi tự động dựa trên vắng học."
            </p>
          </div>
        </div>
      </section>

      {/* 3.3 Algorithms: Dual-Core Logic */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Activity size={24} className="text-purple-500" />
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">3.3_THE_GHOST_IN_THE_MACHINE</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 bg-zinc-900/80 border border-white/5 rounded-3xl relative shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
              <p className="text-white font-black text-base italic">CORE_01: RFID_SENTRY (Thực địa)</p>
            </div>
            <ul className="space-y-4 text-sm md:text-base text-slate-400 italic">
              <li className="flex gap-2 font-mono tracking-tighter"><span className="text-red-500">01_</span> Cấu hình MFRC522 qua giao thức SPI.</li>
              <li className="flex gap-2 font-mono tracking-tighter"><span className="text-red-500">02_</span> Đợi thẻ bước vào vùng 13.56 MHz.</li>
              <li className="flex gap-2 font-mono tracking-tighter"><span className="text-red-500">03_</span> Đối soát UID với <strong className="text-white">Edge Cache</strong> trong RAM.</li>
              <li className="flex gap-2 font-mono tracking-tighter"><span className="text-red-500">04_</span> LCD Update + <strong className="text-white">Push to Queue</strong>.</li>
            </ul>
          </div>

          <div className="p-8 bg-zinc-900/80 border border-white/5 rounded-3xl relative shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <p className="text-white font-black text-base italic">CORE_00: WIFI_MESSENGER (Upload nền)</p>
            </div>
            <ul className="space-y-4 text-sm md:text-base text-slate-400 italic">
              <li className="flex gap-2 font-mono tracking-tighter"><span className="text-blue-500">01_</span> Ngủ gật (Sleep) cho đến khi Queue có dữ liệu.</li>
              <li className="flex gap-2 font-mono tracking-tighter"><span className="text-blue-500">02_</span> "Hốt" dữ liệu quẹt thẻ từ Core 1.</li>
              <li className="flex gap-2 font-mono tracking-tighter"><span className="text-blue-500">03_</span> POST về /api/attendance qua Wifi.</li>
              <li className="flex gap-2 font-mono tracking-tighter"><span className="text-blue-500">04_</span> Reset Task & Quay lại bước 01.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3.4 API Endpoints */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Globe size={24} className="text-lime-500" />
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">3.4_API_HANDSHAKE_PROTOCOLS</h3>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02] shadow-2xl">
          <table className="w-full text-base text-left border-collapse">
            <thead>
              <tr className="bg-lime-500/10 text-lime-400 uppercase text-xs tracking-widest font-black">
                <th className="p-6">METHOD</th>
                <th className="p-6">ENDPOINT</th>
                <th className="p-6">ACTION_INTEL</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-6"><span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg font-black text-sm">GET</span></td>
                <td className="p-6 font-mono text-sm">/api/students/&lcub;dev_id&rcub;</td>
                <td className="p-6 italic">"Hốt" danh sách sinh viên về Edge Cache.</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-6"><span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg font-black text-sm">POST</span></td>
                <td className="p-6 font-mono text-sm">/api/attendance</td>
                <td className="p-6 italic text-blue-300">Ghi nhận quẹt thẻ. <strong className="text-white">Mutex Lock Active!</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer Chapter Note */}
      <div className="pt-10 border-t border-white/5 flex justify-center">
        <div className="flex items-center gap-4 text-sm text-slate-500 bg-zinc-900 px-10 py-5 rounded-full border border-white/10 shadow-2xl">
          <Bug size={20} className="text-red-500 animate-bounce" />
          <span className="font-bold tracking-tight">THEORY_TIP: Đừng bao giờ hỏi "Tại sao code chạy?", hãy hỏi "Tại sao nó CHƯA CHẾT?".</span>
        </div>
      </div>
    </div>
  )
},

{
  id: 'ch4',
  title: 'PHASE 04: THE TACTICAL FORGE (Xây dựng & Mô phỏng)',
  content: (
    <div className="space-y-16 font-mono text-lg">
      
      {/* 4.1 Môi trường phát triển: THE FORGE */}
      <section className="relative p-10 bg-blue-950/5 border border-blue-500/20 rounded-[40px] shadow-2xl">
        <div className="absolute -top-5 left-10 px-6 py-2 bg-[#0a0a0a] text-blue-400 font-black flex items-center gap-3 text-base border border-blue-500/30 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Cpu size={22} /> 4.1_THE_TACTICAL_FORGE
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
          <div className="space-y-6">
            <p className="text-white text-2xl font-black italic tracking-tighter uppercase underline decoration-blue-500/30 underline-offset-8">
              🐳 Docker: Lời nguyền "Máy em chạy..."
            </p>
            <p className="text-slate-300 leading-relaxed text-lg">
              Để tiêu diệt triệt để thảm họa <strong className="text-white font-bold">"Máy em chạy bình thường mà máy thầy/server nó không chạy"</strong>, toàn bộ hệ thống được đóng gói vào Docker. 
              <br/>Dù là Ubuntu, Kali hay Windows, chỉ cần một lệnh <code className="text-blue-400 bg-blue-950/30 px-2 rounded">up --build</code> là mọi thứ vào guồng.
            </p>
            <div className="bg-black/60 p-6 rounded-2xl border border-white/10 text-sm text-blue-300 shadow-inner">
               // Launching Virtual Environment... <br/>
               // Container 01: FastAPI_Engine [ACTIVE] <br/>
               // Container 02: PostgreSQL_Vault [ACTIVE]
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/10 to-zinc-900 border border-white/5 p-10 rounded-[35px] flex flex-col justify-center space-y-4">
             <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-3xl">🤗</div>
               <div>
                 <p className="text-xl font-black text-white italic">Hugging Face Spaces</p>
                 <p className="text-sm text-slate-500">Căn cứ địa triển khai trực tuyến.</p>
               </div>
             </div>
             <p className="text-sm text-slate-400 italic border-l-2 border-yellow-500/50 pl-4">
               "Backend có thể hơi 'ngủ gật' (Cold Start) vì xài đồ free, nhưng khi đã tỉnh giấc thì quẹt thẻ nhanh như người yêu cũ trở mặt."
             </p>
          </div>
        </div>
      </section>

      {/* 4.2 Firmware: DUAL-CORE OVERDRIVE */}
      <section className="space-y-10">
        <h3 className="text-white text-3xl font-black flex items-center gap-4 border-b border-white/10 pb-6 italic uppercase tracking-widest">
          <Zap size={32} className="text-yellow-500" /> 4.2_FIRMWARE_OVERDRIVE
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="p-10 bg-zinc-900/50 border border-white/10 rounded-[40px] space-y-6 group hover:border-yellow-500/30 transition-all">
            <p className="text-yellow-500 font-black text-xl flex items-center gap-3">
              <Activity size={24} /> Core_01: The Grumpy Sentry
            </p>
            <p className="text-slate-300 leading-relaxed text-lg italic">
              "Nhiệm vụ: Quét thẻ 24/7. Phản hồi LCD &lt; 0.1s. 
              Sử dụng <strong className="text-white font-bold">uploadQueue</strong> để đẩy dữ liệu cho Core 0. 
              Nếu Core 0 bận cãi nhau với Wifi, Core 1 vẫn thản nhiên quẹt thẻ tiếp. Không có chuyện đơ máy!"
            </p>
          </div>

          <div className="p-10 bg-zinc-900/50 border border-white/10 rounded-[40px] space-y-6 group hover:border-blue-500/30 transition-all">
            <p className="text-blue-500 font-black text-xl flex items-center gap-3">
              <Globe size={24} /> Core_00: The Ninja Messenger
            </p>
            <p className="text-slate-300 leading-relaxed text-lg italic">
              "Nhiệm vụ: Chạy ngầm. Canh chừng Queue. 
              Thấy có dữ liệu là 'đóng gói' JSON rồi phi thẳng lên Backend. 
              Vận hành bất đồng bộ, không gây phiền hà cho Core 1."
            </p>
          </div>
        </div>
        
      </section>

{/* 4.4 Frontend: THE GLASS HUD - BOCCHI EXPLOSIVE VERSION */}
<section className="p-12 bg-purple-900/5 border border-purple-500/20 rounded-[60px] shadow-2xl relative overflow-hidden group">
  {/* Background Decor */}
  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 group-hover:opacity-20 transition-all duration-700">
    <Globe size={180} className="text-purple-500" />
  </div>
  
  <div className="relative z-10 space-y-12">
    <h3 className="text-white text-4xl font-black italic uppercase tracking-tighter border-l-[12px] border-purple-500 pl-8">
      4.4_THE_GLASS_HUD <span className="text-slate-500 text-2xl font-normal">(Vanilla JS)</span>
    </h3>
    
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
      {/* Cột trái: Text mô tả (5/12) */}
      <div className="lg:col-span-5 space-y-10">
        <p className="text-3xl text-slate-200 font-bold leading-tight italic">
          "Chúng ta không dùng React. Chúng ta dùng <strong className="text-purple-400 underline decoration-purple-500/30 underline-offset-8">Vanilla JS</strong> để tối ưu tốc độ bàn thờ."
        </p>
        <ul className="space-y-6 text-xl text-slate-400 italic">
          <li className="flex gap-5 items-start">
            <span className="text-purple-500 font-black text-2xl">●</span> 
            <span><strong className="text-white">Glassmorphism:</strong> Giao diện kính mờ xuyên thấu cực chill.</span>
          </li>
          <li className="flex gap-5 items-start">
            <span className="text-purple-500 font-black text-2xl">●</span> 
            <span><strong className="text-white">Dark Mode:</strong> Bảo vệ đôi mắt cú đêm của các Operator.</span>
          </li>
          <li className="flex gap-5 items-start">
            <span className="text-purple-500 font-black text-2xl">●</span> 
            <span><strong className="text-white">Toast Noti:</strong> Phản hồi ngọt ngào như cách crush rep tin nhắn.</span>
          </li>
        </ul>
      </div>

      {/* Cột phải: BOCCHI SHAKE CARD (7/12) - PHÓNG TO TOÀN DIỆN */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="w-full max-w-2xl bg-black/60 p-10 rounded-[50px] border border-red-500/40 flex flex-col items-center text-center shadow-[0_0_60px_rgba(239,68,68,0.15)] relative group/bocchi overflow-hidden hover:border-red-500 transition-all duration-500">
           
           {/* Glitch Status Label */}
           <div className="absolute top-6 left-8 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
              <span className="text-sm text-red-500 font-black tracking-widest uppercase italic">System_Status: BOCCHI_PANIC</span>
           </div>
           
           {/* BIG GIF Container - Đã gỡ Grayscale và cho to hơn */}
           <div className="relative w-full aspect-square max-w-[320px] mb-8 overflow-hidden rounded-[30px] border-4 border-white/5 shadow-2xl group-hover/bocchi:scale-105 group-hover/bocchi:rotate-2 transition-all duration-500">
              <Image 
                src="/images/bocchi-the-rock-bocchi.gif" 
                alt="Bocchi Shaking"
                fill
                unoptimized 
                className="object-cover" // ĐÃ GỠ GRAYSCALE
              />
           </div>

           <div className="space-y-4 max-w-md">
              <h4 className="text-red-500 font-black text-3xl italic uppercase tracking-widest">UX: SHAKE_ERROR</h4>
              <p className="text-lg text-slate-300 italic leading-relaxed">
                "Nhập sai Password? UI sẽ rung rinh như cái cách Bocchi tan biến khi phải giao tiếp xã hội."
              </p>
           </div>
           
           {/* BIG Anxiety Bar */}
           <div className="w-full mt-10 space-y-3">
              <div className="flex justify-between text-xs text-slate-500 font-black uppercase tracking-widest">
                 <span>Anxiety Level</span>
                 <span className="text-red-500 animate-pulse text-lg">999%</span>
              </div>
              <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden border border-white/5">
                 <motion.div 
                   initial={{ width: 0 }}
                   whileInView={{ width: '100%' }}
                   transition={{ duration: 2, ease: "easeInOut" }}
                   className="bg-gradient-to-r from-orange-600 via-red-500 to-red-600 h-full shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                 />
              </div>
           </div>

           {/* Decorative Glitch lines */}
           <div className="absolute -bottom-2 left-0 w-full h-1 bg-red-500/20 blur-sm"></div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* 4.5 & 4.6 War Games: Survival Tests */}
      <section className="space-y-10">
        <h3 className="text-white text-3xl font-black flex items-center gap-4 italic uppercase tracking-widest">
          <Activity size={32} className="text-red-500" /> 4.5_WAR_ROOM_SCENARIOS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-10 bg-red-950/10 border border-red-500/20 rounded-[40px] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all">
            <p className="text-red-500 font-black text-lg mb-6 uppercase tracking-widest">Latency Test</p>
            <p className="text-base text-slate-400 italic">
              "Quét thẻ. Bíp. 0.1s. <br/>Tốc độ bàn thờ, triệt tiêu ùn tắc cửa lớp."
            </p>
          </div>
          <div className="p-10 bg-orange-950/10 border border-orange-500/20 rounded-[40px] hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] transition-all">
            <p className="text-orange-500 font-black text-lg mb-6 uppercase tracking-widest">Stress Test</p>
            <p className="text-base text-slate-400 italic">
              "20 thẻ / 15 giây. <br/>Mutex Lock hoạt động hết công suất. Không một lỗi Race Condition."
            </p>
          </div>
          <div className="p-10 bg-green-950/10 border border-green-500/20 rounded-[40px] hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all">
            <p className="text-green-500 font-black text-lg mb-6 uppercase tracking-widest">Offline Test</p>
            <p className="text-base text-slate-400 italic">
              "Rút Wifi. <br/>Edge Cache tự gánh team. Sinh viên vẫn điểm danh u như kĩ."
            </p>
          </div>
        </div>
      </section>

      {/* Footer Chapter Note */}
      <div className="pt-10 border-t border-white/5 flex justify-center">
        <div className="flex items-center gap-4 text-base text-slate-500 bg-zinc-900 px-10 py-5 rounded-full border border-white/10 shadow-2xl group">
          <Bug size={24} className="text-red-500 group-hover:animate-spin transition-all" />
          <span className="font-black tracking-tight italic">
            MANTRA: "Code không có Bug chỉ là code chưa được viết xong."
          </span>
        </div>
      </div>
    </div>
  )
},

{
  id: 'ch5',
  title: 'PHASE 05: PHYSICAL BREACH (Triển khai & Sự cố)',
  content: (
    <div className="space-y-16 font-mono text-lg">
      
      {/* 5.1 Linh kiện & Sự hy sinh đầu tiên */}
      <section className="relative p-10 bg-red-950/5 border border-red-500/20 rounded-[40px] shadow-2xl">
        <div className="absolute -top-5 left-10 px-6 py-2 bg-[#0a0a0a] text-red-500 font-black flex items-center gap-3 text-base border border-red-500/30 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <Zap size={22} /> 5.1_HARDWARE_INTEL
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mt-6">
          <div className="lg:col-span-3 space-y-6">
            <p className="text-white text-2xl font-black italic tracking-tighter uppercase underline decoration-red-500/30 underline-offset-8">
              💀 The First Casualty (Sự hy sinh đầu tiên)
            </p>
            <p className="text-slate-300 leading-relaxed text-lg">
              Chiến dịch bắt đầu bằng một tổn thất đau đớn: <strong className="text-white">Con ESP32 đầu tiên đã tử trận</strong> do hỏng IC nguồn. Trạng thái: "Cắm không lên, nạp không vào". 
              <br/>Nhưng không sao, AE xã đoàn đã lập tức "triệu hồi" một chiến binh ESP32 mới để duy trì mạch máu cho hệ thống.
            </p>
            <ul className="grid grid-cols-2 gap-4 text-sm text-slate-400 italic">
              <li className="flex gap-2">● RC522 (13.56MHz)</li>
              <li className="flex gap-2">● LCD 16x2 + I2C</li>
              <li className="flex gap-2">● Active Buzzer (3 chân)</li>
              <li className="flex gap-2">● Relay 5V Module</li>
            </ul>
          </div>
        <div className="lg:col-span-2 bg-zinc-900 border-2 border-red-500/50 p-10 rounded-[40px] flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] group/warn">
          
          {/* Hiệu ứng tia chớp nền cảnh báo */}
          <div className="absolute inset-0 bg-red-500/5 animate-pulse group-hover/warn:bg-red-500/10 transition-colors"></div>
          
          {/* Emoji khói ma thuật */}
          <div className="text-7xl filter drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce">
            💨
          </div>

          <div className="space-y-4 relative z-10">
              <p className="text-red-500 font-black text-2xl tracking-[0.25em] uppercase italic">
                WARNING: MAGIC_SMOKE_RELEASED
              </p>
              <div className="h-1 w-20 bg-red-500 mx-auto rounded-full"></div>
              <p className="text-base text-slate-400 italic font-medium leading-relaxed max-w-xs mx-auto">
                "Smoke out → device dead → wallet crying."
              </p>
          </div>

          {/* Thêm một cái badge nhỏ ở góc */}
          <div className="absolute bottom-6 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-tighter">
            Unit_01: Killed In Action
          </div>
        </div>
        </div>
      </section>

      {/* 5.2 Incremental Testing: THE BAUD RATE WAR */}
      <section className="space-y-10">
        <h3 className="text-white text-3xl font-black flex items-center gap-4 border-b border-white/10 pb-6 italic uppercase tracking-widest">
          <Activity size={32} className="text-blue-500" /> 5.2_THE_BAUD_RATE_WAR
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="p-10 bg-zinc-900/50 border border-white/10 rounded-[40px] space-y-6">
            <p className="text-blue-400 font-black text-xl flex items-center gap-3 italic">
              <Terminal size={24} /> Serial Monitor Mojibake
            </p>
            <p className="text-slate-300 leading-relaxed text-lg">
              Khi nạp code thực tế, Serial Monitor bỗng nhiên "nói tiếng ngoài hành tinh" (ký tự rác). 
              <br/>Nguyên nhân: <strong className="text-white font-bold underline">Baud Rate Conflict</strong>. 
              Mạch phát 115200, IDE nhận 9600. Sau khi đồng bộ, RC522 đã chịu "khai báo" UID thật.
            </p>
          </div>
          
          <div className="p-10 bg-blue-900/5 border border-blue-500/20 rounded-[40px] flex flex-col justify-center shadow-xl">
             <p className="text-blue-400 font-black mb-4 italic text-xl uppercase tracking-tighter">Reality Check: SPI vs UART</p>
             <p className="text-slate-400 leading-relaxed text-base italic">
               "Trên Wokwi ông dùng UART cho khỏe, nhưng ngoài đời RC522 bắt buộc chơi hệ <strong className="text-white">SPI (Full-duplex)</strong>. Tốc độ bàn thờ, định danh trong chớp mắt!"
             </p>
          </div>
        </div>
      </section>

      {/* 5.3 Troubleshooting: THE 400/500 CRISIS */}
      <section className="p-12 bg-zinc-900 border border-white/10 rounded-[50px] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <ShieldAlert size={150} className="text-red-500" />
        </div>
        
        <div className="relative z-10 space-y-10">
          <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter border-l-8 border-red-500 pl-6">
            5.3_TROUBLESHOOTING_LOGS
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Lỗi 400 - Time Travel */}
            <div className="space-y-6 bg-red-950/10 p-8 rounded-[40px] border border-red-500/20">
              <p className="text-red-500 font-black text-xl flex items-center gap-3 uppercase italic">
                Error_400: Time Travel ESP32
              </p>
              <p className="text-slate-300 text-lg leading-relaxed italic">
                "ESP32 quét thẻ khi Wifi chưa kịp lấy giờ NTP. Nó tưởng sinh viên đang đi học vào năm <strong className="text-white">1970</strong> (Epoch 0). Backend bảo: 'Lịch học 2026 chứ 1970 ai dạy?'.
                <br/><strong className="text-green-500 font-bold">Fix:</strong> Ép vòng lặp Setup chờ NTP thành công mới cho quẹt!"
              </p>
            </div>

            {/* Lỗi 500 - The Ghost Student */}
            <div className="space-y-6 bg-orange-950/10 p-8 rounded-[40px] border border-orange-500/20">
              <p className="text-orange-500 font-black text-xl flex items-center gap-3 uppercase italic">
                Error_500: The Ghost Student
              </p>
              <p className="text-slate-300 text-lg leading-relaxed italic">
                "Thẻ lạ quẹt vào làm Supabase nổ lỗi Foreign Key vì không biết ông này là ai. 
                <br/><strong className="text-blue-500 font-bold">Solution:</strong> Tạo một 'Sinh viên Ma' (UNKNOWN) để lưu vết mọi thẻ lạ. Vừa giữ sạch DB, vừa giám sát được kẻ đột nhập!"
              </p>
              
            </div>
          </div>
        </div>
      </section>

      {/* Footer Chapter Note */}
      <div className="pt-10 border-t border-white/5 flex justify-center">
        <div className="flex items-center gap-4 text-base text-slate-500 bg-zinc-900 px-10 py-5 rounded-full border border-white/10 shadow-2xl group">
          <Coffee size={24} className="text-amber-600" />
          <span className="font-black tracking-tight italic">
            "Có những ngày trông như ông chủ tịch, có những ngày trông như thằng trông xe"
          </span>
        </div>
      </div>
    </div>
  )
},

{
  id: 'ch6',
  title: 'PHASE 06: THE PERFORMANCE AUDIT (Kết quả & Thực nghiệm)',
  content: (
    <div className="space-y-16 font-mono text-lg">
      
      {/* 6.1 Simulation Results: THE LAB REPORT */}
      <section className="relative p-10 bg-blue-950/5 border border-blue-500/20 rounded-[40px] shadow-2xl">
        <div className="absolute -top-5 left-10 px-6 py-2 bg-[#0a0a0a] text-blue-400 font-black flex items-center gap-3 text-base border border-blue-500/30 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Activity size={22} /> 6.1_SIMULATION_STATS (WOKWI)
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
          <div className="space-y-6">
            <h4 className="text-white text-xl font-black uppercase italic underline decoration-blue-500/30 underline-offset-8">
              Kịch bản 01: Latency Benchmark
            </h4>
            <div className="bg-black/60 rounded-3xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-blue-500/10 text-blue-400 font-black uppercase text-xs">
                  <tr>
                    <th className="p-4">Metric</th>
                    <th className="p-4">Sim Result</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-white/5"><td className="p-4">Local Latency</td><td className="p-4 font-bold">0.8s</td><td className="p-4 text-green-500">INSTANT</td></tr>
                  <tr className="border-b border-white/5"><td className="p-4">Cloud Latency</td><td className="p-4 font-bold">3.8s</td><td className="p-4 text-yellow-500">STABLE</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-400 italic">
              "Trong môi trường Lab, <strong className="text-white">Smart Edge Caching</strong> gánh team cực mạnh. Phản hồi tại chỗ nhanh đến mức sinh viên chưa kịp chớp mắt đã thấy tên mình hiện lên LCD."
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/10 to-zinc-900 border border-green-500/20 p-10 rounded-[35px] space-y-6">
             <div className="flex items-center justify-between">
                <p className="text-green-500 font-black text-xl italic uppercase">Stress Test: 0% Packet Loss</p>
                <Zap size={30} className="text-green-500 animate-pulse" />
             </div>
             <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                   initial={{ width: 0 }}
                   whileInView={{ width: '100%' }}
                   className="bg-green-500 h-full shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                />
             </div>
             <p className="text-slate-300 text-base leading-relaxed italic">
               "20 thẻ quét trong 15 giây. Kết quả: <strong className="text-white">20/20 bản ghi thành công</strong>. 
               xQueue và Mutex Lock phối hợp nhịp nhàng như cách anh em mình phối hợp khi... làm đồ án đêm khuya."
             </p>
          </div>
        </div>
      </section>

      {/* 6.2 Field Test: REALITY CHECK */}
      <section className="space-y-10">
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <Globe size={32} className="text-purple-500" />
          <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">6.2_REALITY_FIELD_REPORT</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latency Reality */}
          <div className="p-10 bg-zinc-900/50 border border-white/10 rounded-[40px] space-y-6 relative overflow-hidden group">
            <p className="text-purple-400 font-black text-xl uppercase italic">Reality Latency</p>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-slate-500">Local (Edge)</span>
                <span className="text-2xl font-black text-green-400">0.61s</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-slate-500">Cloud (Sync)</span>
                <span className="text-2xl font-black text-red-400">4.53s</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 italic pt-4 border-t border-white/5">
              "Tại thực địa, chip ESP32 thật quẩy còn gắt hơn mô phỏng (0.61s vs 0.8s). Dù Wifi trường đôi khi 'hơi lag' làm Cloud trễ lên 4.5s, nhưng Operator An vẫn cảm thấy hài lòng."
            </p>
          </div>

          {/* Accuracy Milestone */}
          <div className="p-10 bg-purple-900/10 border border-purple-500/30 rounded-[40px] flex flex-col justify-between shadow-2xl">
             <div className="space-y-2">
                <p className="text-purple-400 font-black text-xs tracking-widest uppercase">Accuracy_Metric</p>
                <p className="text-4xl font-black text-white tracking-tighter italic underline decoration-purple-500 underline-offset-8">100.00%</p>
             </div>
             <p className="text-base text-slate-400 leading-relaxed italic mt-6">
               "Thử nghiệm với 30 thẻ sinh viên thực tế. Không một ai bị bỏ lại phía sau. <strong className="text-white">Task Failed Successfully?</strong> Không, ở đây chúng tôi chỉ có <strong className="text-white">Task Succeeded</strong>."
             </p>
          </div>

          {/* Business Continuity */}
          <div className="p-10 bg-zinc-900 border border-white/10 rounded-[40px] relative group overflow-hidden">
             <div className="absolute top-4 right-6 opacity-10 group-hover:opacity-50 transition-opacity">
               <Zap size={50} className="text-yellow-500" />
             </div>
             <p className="text-yellow-500 font-black text-xl mb-6 uppercase italic">Offline Resilience</p>
             <div className="space-y-4 text-sm text-slate-300">
                <p className="flex gap-2">● <span className="text-white font-bold">Mất mạng:</span> Phản hồi &lt; 0.1s (RAM)</p>
                <p className="flex gap-2">● <span className="text-white font-bold">Có mạng:</span> Tự động đẩy 15 bản ghi tồn đọng</p>
             </div>
             <div className="mt-8 pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 font-black uppercase">Auto_Sync_Active</p>
             </div>
          </div>
        </div>
        
      </section>

      {/* Footer Chapter Note */}
      <div className="pt-10 border-t border-white/5 flex justify-center">
        <div className="flex items-center gap-4 text-base text-slate-500 bg-zinc-900 px-10 py-5 rounded-full border border-white/10 shadow-2xl group">
          <Bug size={24} className="text-green-500 group-hover:rotate-180 transition-all duration-500" />
          <span className="font-black tracking-tight italic">
            "Blog của anh ko thị trường nhưng mà thị trường lại ko có Blog của anh"
          </span>
        </div>
      </div>
    </div>
  )
},

{
  id: 'ch7',
  title: 'PHASE 07: MISSION DEBRIEF (Kết luận & Mở rộng)',
  content: (
    <div className="space-y-16 font-mono text-lg">
      
      {/* 7.1 Tổng kết chiến dịch: MISSION ACCOMPLISHED */}
      <section className="relative p-12 bg-lime-950/5 border border-lime-500/20 rounded-[50px] shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Zap size={180} className="text-lime-500" />
        </div>

        <div className="relative z-10 space-y-10">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-lime-500 rounded-xl text-black">
                <ShieldAlert size={32} />
             </div>
             <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">
               7.1_MISSION_ACCOMPLISHED
             </h3>
          </div>

          <p className="text-2xl text-slate-200 font-bold leading-tight italic border-l-8 border-lime-500 pl-8">
            "Hệ thống đã vận hành. Sinh viên đã bị khuất phục. <br/>
            Dữ liệu đã nằm gọn trong Vault (Supabase)."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Local Speed', val: '0.8s', color: 'text-blue-400', desc: 'Edge Caching gánh team.' },
              { label: 'Packet Loss', val: '0%', color: 'text-green-500', desc: 'Mutex Lock dẹp loạn.' },
              { label: 'Architecture', val: 'E2C', color: 'text-purple-400', desc: 'Edge-to-Cloud vô đối.' },
              { label: 'Reporting', val: 'Excel', color: 'text-yellow-500', desc: 'Trích xuất trong 1 nốt nhạc.' }
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-black/40 border border-white/10 rounded-3xl text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color} mb-2 tracking-tighter`}>{stat.val}</p>
                <p className="text-[11px] text-slate-400 italic">{stat.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-lg text-slate-400 leading-relaxed max-w-4xl">
            Trải qua những pha cháy chip "khét lẹt" và những đêm debug quên ăn quên ngủ, hệ thống đã đạt độ chín muồi về kỹ thuật. 
            Việc làm chủ <strong className="text-white font-bold">FastAPI</strong> và <strong className="text-white font-bold">Smart Edge Caching</strong> không chỉ giúp điểm danh nhanh mà còn bảo vệ lòng tự trọng của một lập trình viên: <span className="italic">"Nó chạy được, và nó chạy cực mượt!"</span>.
          </p>
        </div>
      </section>

      {/* 7.2 Hướng phát triển: NEXT SEASON PREVIEW */}
      <section className="space-y-10">
        <h3 className="text-white text-3xl font-black flex items-center gap-4 italic uppercase tracking-widest border-b border-white/10 pb-6">
          <Activity size={32} className="text-blue-500" /> 7.2_THE_NEXT_GEN_LEVEL_UP
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* AI Face ID - DLC Pack */}
          <div className="p-10 bg-zinc-900 border-2 border-purple-500/30 rounded-[40px] relative overflow-hidden group/card shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover/card:bg-purple-500/20 transition-all"></div>
            <p className="text-purple-400 font-black text-2xl mb-6 flex items-center gap-3 italic uppercase">
              <Users size={28} /> AI_FACE_ID_PATCH
            </p>
            <p className="text-slate-300 leading-relaxed text-lg">
              Sắp tới, chúng ta sẽ tung ra bản cập nhật <strong className="text-white font-bold">"Anti-Cheat 2.0"</strong>. 
              Tích hợp nhận diện khuôn mặt song song với RFID. Quẹt thẻ giùm? <br/>
              <span className="text-red-500 font-black animate-pulse">SYSTEM SAYS: NO!</span>
            </p>
          </div>

          {/* Industrial PCB - The Final Boss */}
          <div className="p-10 bg-zinc-900 border-2 border-blue-500/30 rounded-[40px] relative overflow-hidden group/card shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover/card:bg-blue-500/20 transition-all"></div>
            <p className="text-blue-400 font-black text-2xl mb-6 flex items-center gap-3 italic uppercase">
              <Cpu size={28} /> PCB_INDUSTRIAL_BUILD
            </p>
            <p className="text-slate-300 leading-relaxed text-lg">
              Tạm biệt dây cắm lằng nhằng (Breadboard vibes), chúng ta sẽ tiến tới <strong className="text-white font-bold">Thiết kế mạch in PCB</strong> chuyên dụng. 
              Đưa hệ thống lên tầm cao công nghiệp, bền bỉ chấp mọi loại độ ẩm và nhiệt độ phòng học.
            </p>
          </div>
        </div>
      </section>

      {/* 🛑 FINAL BOSS WARNING: THE LIMITATIONS */}
      <section className="p-10 bg-red-950/10 border border-red-500/20 rounded-[40px] flex items-center gap-8 shadow-xl">
        <div className="shrink-0 w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 text-4xl font-black">!</div>
        <div className="space-y-2">
           <p className="text-red-500 font-black text-xl uppercase tracking-widest italic">Remaining_Weakness: Power_Stability</p>
           <p className="text-base text-slate-400 italic">
             "Dù code có xịn đến đâu, hệ thống vẫn 'quỳ gối' trước một pha mất điện bất ngờ. UPS/Battery Pack sẽ là món vũ khí tiếp theo cần được trang bị."
           </p>
        </div>
      </section>

      {/* The Final Farewell Note */}
      <div className="pt-20 border-t border-white/5 text-center space-y-8">
        <div className="inline-flex items-center gap-6 text-xl text-slate-500 bg-zinc-900 px-12 py-6 rounded-full border border-white/10 shadow-[0_0_50px_rgba(112,26,117,0.2)] group cursor-wait">
          <Bug size={32} className="text-purple-500 group-hover:rotate-[360deg] transition-all duration-1000" />
          <span className="font-black tracking-tighter italic text-slate-300">
            FINAL_STATUS: <span className="text-green-500">MISSION_SUCCESSFUL_V2.5.0</span>
          </span>
        </div>
        <p className="text-sm text-slate-600 font-mono tracking-widest uppercase">
           Trình là chi đây người ơi mà sao cứ ối zồi ôi
        </p>
      </div>
    </div>
  )
},

];

// --- 2. COMPONENT PHỤ (NỘI DUNG CHI TIẾT) ---
function ProjectContent() {
  const [openSection, setOpenSection] = useState('ch1');

  return (
    <section className="max-w-6xl mx-auto mb-20 px-4">
      {/* Tiêu đề chính lớn hơn */}
      <div className="flex items-center gap-4 mb-10">
        <FileText className="text-purple-500 w-8 h-8" />
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic">
          Mission Logs <span className="text-slate-500 text-lg ml-2 font-normal not-italic">(Nội dung chi tiết)</span>
        </h2>
      </div>

      <div className="space-y-4">
        {MissionData.map((item) => (
          <div key={item.id} className="border border-white/10 rounded-3xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.05] transition-all">
            <button 
              onClick={() => setOpenSection(openSection === item.id ? '' : item.id)}
              className="w-full flex items-center justify-between p-6 text-left transition-colors"
            >
              <div className="flex items-center gap-5">
                {/* Icon Folder lớn hơn */}
                <Folder className={`w-6 h-6 ${openSection === item.id ? 'text-purple-400' : 'text-slate-600'}`} />
                {/* Title Phase to hơn: text-lg */}
                <span className={`text-lg md:text-xl font-bold tracking-tight ${openSection === item.id ? 'text-white' : 'text-slate-400'}`}>
                  {item.title}
                </span>
              </div>
              {openSection === item.id ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
            </button>
            
            <AnimatePresence>
              {openSection === item.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 pt-0 border-t border-white/5 overflow-hidden"
                >
                  {/* Tăng size chữ nội dung bên trong */}
                  <div className="pt-6 text-base leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- 3. COMPONENT CHÍNH (TRANG DỰ ÁN) ---
export default function RFIDProject() {
  const contributors = [
    { name: 'Nguyễn Đức Học', role: 'System Architect', alias: 'hoc0g', img: '/images/team/hoc0g.jpg' },
    { name: 'Lê Đặng Hoàng Anh', role: 'Backend Lead', alias: 'HAgudboi', img: '/images/team/hagudboi.jpg' },
    { name: 'Trần Công Khánh', role: 'UI/UX', alias: 'NCK', img: '/images/team/nck.jpg' },
    { name: 'Nguyễn Bá Nam', role: 'Database', alias: 'xepNam', img: '/images/team/xepnam.jpg' },
    { name: 'Phan Khánh An', role: 'Hardware & Integration', alias: 'ap991', img: '/images/team/ap991.jpg' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-mono p-4 md:p-8 lg:p-12 selection:bg-purple-500/30">
      
      {/* 🔙 NÚT BACK */}
      <nav className="max-w-6xl mx-auto mb-8">
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-slate-500 hover:text-lime-400 transition-colors w-fit"
        >
          <span className="text-lime-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowLeft size={16} />
          </span>
          <span className="font-bold tracking-tighter">
            [ <span className="group-hover:text-white transition-colors">cd ..</span> ]
          </span>
        </Link>
      </nav>
      
      {/* 🟢 HEADER: MISSION BRIEFING */}
      <header className="max-w-6xl mx-auto mb-16 relative">
        <div className="flex items-center gap-2 text-lime-500 mb-4 animate-pulse">
          <Terminal size={18} />
          <span className="text-xs tracking-widest uppercase font-bold">Project_Status: [RELEASED_V2.5.0]</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter italic uppercase leading-none">
          Smart <span className="text-purple-500">IoT</span> Attendance <br /> 
          <span className="inline-block pr-6 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            SYSTEM
          </span>
        </h1>

        <p className="max-w-2xl text-slate-400 leading-relaxed border-l-2 border-purple-500 pl-6 py-2 italic">
          "Một hệ thống giúp giảng viên bớt cực, sinh viên bớt 'fake' và quan trọng nhất là... nó chạy được mà không nổ ESP32."
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-8">
          <Link href="https://danganhle0623-iot.hf.space" target="_blank" className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-all hover:scale-105 shadow-lg shadow-purple-500/20">
            <Globe size={18} /> Access Portal
          </Link>
          <Link href="https://wokwi.com/projects/454856473504871425" target="_blank" className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white border border-white/10 rounded-full font-bold hover:bg-zinc-700 transition-all">
            <Cpu size={18} /> Wokwi Simulation
          </Link>
        </div>
      </header>

      {/* 🚀 TECH STACK: THE ARSENAL */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <Lock size={24} className="text-purple-500" /> Technical Arsenal (Vũ khí tác chiến)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:border-blue-500/50 transition-all">
            <Cpu className="text-blue-400 mb-4 group-hover:rotate-12 transition-transform" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Hardware Unit</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ESP32 DevKit V1 + RFID-RC522. Chạy giả lập trên Wokwi vì không có tiền mua linh kiện thật (đùa thôi, để debug cho sướng).
            </p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:border-green-500/50 transition-all">
            <Zap className="text-green-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Backend Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              FastAPI (Python). Deploy trên Hugging Face Spaces. Warning: Backend hay ngủ gật (Cold Start), cần kiên nhẫn như khi chờ crush rep tin nhắn.
            </p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:border-purple-500/50 transition-all">
            <Database className="text-purple-400 mb-4 group-hover:translate-y-1 transition-transform" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Hybrid Database</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sự kết hợp giữa Firebase (Real-time trigger) và Supabase (Relational data). SQL và NoSQL nắm tay nhau đi vào lòng đất.
            </p>
          </div>
        </div>
      </section>

      {/* ⚠️ SPECIAL NOTES: DANGER ZONE */}
      <section className="max-w-6xl mx-auto mb-20 p-8 bg-red-950/10 border border-red-500/20 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <ShieldAlert size={120} />
        </div>
        <h2 className="text-xl font-bold text-red-400 mb-8 flex items-center gap-2 uppercase tracking-widest border-b border-red-500/10 pb-4">
          <ShieldAlert size={20} /> Dev Logs & Security Warnings
        </h2>
        <div className="space-y-6 text-sm text-slate-400">
          {[
            { tag: '[!]', label: 'Attendance Warnings:', color: 'text-red-500', desc: 'Hệ thống tự động gán nhãn "Ineligible" (Cấm thi) nếu vắng quá buổi. Đừng trách AI.' },
            { tag: '[*]', label: 'Shift Lock:', color: 'text-blue-500', desc: 'API chỉ mở vào ca học (07:30-11:00 & 12:45-17:00). Ngoài giờ này DB "tàng hình".' },
            { tag: '[?]', label: 'Cold Start:', color: 'text-yellow-500', desc: 'Hugging Face đang pha cafe. Đợi tí, đừng F5 liên tục tội em nó.' }
          ].map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 md:gap-6 items-start group">
              <div className="flex gap-2 shrink-0">
                <span className={`${item.color} font-bold font-mono`}>{item.tag}</span>
                <span className={`${item.color} font-bold whitespace-nowrap`}>{item.label}</span>
              </div>
              <p className="leading-relaxed group-hover:text-slate-200 transition-colors">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 👥 THE OPERATORS: STRIKE TEAM */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <Users size={24} className="text-blue-500" /> The Order of Code (Strike Team)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 [perspective:1000px] relative z-0">
          {contributors.map((member, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.05, y: -15, zIndex: 50 }}
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
              className="group relative flex flex-col p-6 bg-black border border-white/5 rounded-3xl text-center hover:bg-purple-950/30 hover:border-purple-500/30 hover:shadow-[0_20px_60px_-15px_rgba(112,26,117,0.4)] transition-all duration-300 transform-gpu cursor-crosshair z-10"
            >
              <div className="relative w-20 h-20 mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-md opacity-0 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-zinc-800 group-hover:border-purple-500 transition-colors bg-zinc-900 z-10">
                  <Image 
                    src={member.img} alt={member.name} fill sizes="80px" priority={i < 5}
                    className="object-cover transition-all duration-500"
                  />
                </div>
                {member.alias === 'ap991' && (
                  <div className="absolute -bottom-1.5 -right-1.5 bg-purple-600 text-[10px] p-1 rounded-md border border-[#0a0a0a] z-20">🐧</div>
                )}
              </div>
              <p className="text-[10px] text-purple-400 font-mono mb-1 tracking-tighter group-hover:text-purple-200">{member.alias}</p>
              <p className="text-sm font-bold text-white truncate transition-colors leading-tight">{member.name}</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest transition-colors flex-grow flex items-end justify-center">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🚀 MISSION LOGS (CHI TIẾT) */}
      <ProjectContent />

      {/* 🖥️ THE INTERACTIVE CONSOLE - ĐIỂM NHẤN CUỐI CÙNG */}
      <section className="max-w-6xl mx-auto mt-40 mb-32 px-4 relative">
        {/* Decor line */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-lime-500/50"></div>
        
        <div className="mb-12 text-center space-y-4">
           <div className="inline-flex items-center gap-3 px-6 py-2 bg-lime-500/10 border border-lime-500/20 rounded-full text-lime-500 text-sm font-black tracking-widest uppercase">
              <ShieldCheck size={16} /> Encrypted Connection Established
           </div>
           <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
             [ SYSTEM_CONSOLE ]
           </h2>
           <p className="text-slate-500 text-lg md:text-xl italic max-w-2xl mx-auto">
             "Bản ghi logs chỉ là bề nổi. Hãy sử dụng Terminal để truy xuất các chỉ lệnh Intel tối mật."
           </p>
        </div>

        {/* Gọi Component từ file Terminal.tsx */}
        <InteractiveTerminal />
      </section>

      {/* 🔗 FOOTER */}
      <footer className="max-w-6xl mx-auto border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-50 hover:opacity-100 transition-opacity pb-12">
        <div className="flex gap-8 text-xs underline underline-offset-4">
          <Link href="https://drive.google.com/file/d/10L3jvclMYc2lfLkkUZcmZdWlb1N288H6/view?usp=sharing" className="flex items-center gap-1 hover:text-white transition-colors">
            <PlayCircle size={14} /> Video Demo
          </Link>
          <Link href="https://github.com/anphan991/IoT-Student-Attendance-System" className="flex items-center gap-1 hover:text-white transition-colors">
            <ExternalLink size={14} /> GitHub Repo
          </Link>
        </div>
        <p className="text-[10px]">
          Developed with <Coffee size={10} className="inline mx-1 text-amber-600" /> by Group 09 @ HCMUTE
        </p>
      </footer>
    </div>
  );
}

