import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { Home, TerminalSquare, ShieldAlert, Cpu, Zap } from 'lucide-react';

function getInfoSecPosts() {
  const folderPath = path.join(process.cwd(), 'content', 'infosec');
  if (!fs.existsSync(folderPath)) return [];
  const files = fs.readdirSync(folderPath);
  
  return files
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace('.md', '');
      const fullPath = path.join(folderPath, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title || slug,
        date: data.date || 'No Date',
        description: data.description || 'Nội dung đã bị mã hóa...',
        level: data.level || 'ROOT_ACCESS',
      };
    })
    .sort((a, b) => (new Date(b.date).getTime() > new Date(a.date).getTime() ? 1 : -1));
}

export default function InfoSecIndex() {
  const posts = getInfoSecPosts();

  return (
    <main className="min-h-screen bg-[#050505] text-[#94A3B8] pt-24 pb-12 font-mono selection:bg-[#22d3ee] selection:text-white relative overflow-hidden">
      
      {/* 🟦 HIỆU ỨNG MÀN HÌNH CRT & GRID CYBERPUNK 🟦 */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee15_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee15_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 -z-10" />
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#22d3ee]/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Nút Back - Style Nút Bấm Cơ Học */}
        <Link 
          href="/" 
          className="group inline-flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest bg-[#111] border-2 border-white/20 px-5 py-3 mb-10 transition-all hover:bg-[#22d3ee] hover:border-[#22d3ee] hover:shadow-[4px_4px_0px_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          <Home size={16} className="group-hover:animate-bounce" />
          <span>[ Esc ] </span>
        </Link>

        {/* Header - Glitch & Brutalism Bùng Nổ */}
        <div className="mb-16 relative">
          <div className="absolute -left-4 top-0 w-2 h-full bg-[#22d3ee] shadow-[0_0_20px_#22d3ee] animate-pulse"></div>
          
          <div className="relative inline-block">
            {/* Chữ Glitch được xử lý bằng CSS ở dưới */}
            <h1 className="glitch-text text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mix-blend-difference mb-4" data-text="SECURE_VAULT">
              SECURE_<br/>
              <span className="text-[#22d3ee] flex items-center gap-4">
                VAULT <ShieldAlert className="animate-spin-slow drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" size={50} />
              </span>
            </h1>
            {/* Hào quang chớp chớp đằng sau chữ */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#22d3ee] blur-[60px] opacity-20 -z-10 animate-pulse"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center bg-cyan-950/30 border border-[#22d3ee]/30 p-4 rounded-none shadow-[4px_4px_0px_#22d3ee] w-fit mt-4">
            <Cpu className="text-[#22d3ee]" size={24} />
            <div className="text-xs text-blue-300">
              <p>SYSTEM: <span className="font-bold text-white">anphan@991</span></p>
              <p>STATUS: <span className="animate-pulse bg-[#22d3ee] text-white px-1">DEFENDING / BOCCHI IN A TRASH CAN</span></p>
            </div>
          </div>
        </div>
        
        {/* Lưới Bài Viết */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.length === 0 ? (
            <div className="col-span-2 p-12 border-2 border-[#22d3ee]/20 border-dashed text-center flex flex-col items-center gap-4 bg-[#22d3ee]/5">
              <Zap className="text-[#22d3ee] opacity-50" size={48} />
              <p className="text-[#22d3ee] font-black text-xl uppercase tracking-widest">Database Empty</p>
              <p className="text-xs text-slate-500">I use Arch btw... but I haven't written any notes yet.</p>
            </div>
          ) : (
            posts.map(post => (
              <Link 
                key={post.slug} 
                href={`/info-sec/${post.slug}`} 
                className="group block bg-[#0a0a0a] border-2 border-white/10 p-6 transition-all duration-300 hover:-translate-y-2 hover:-translate-x-2 hover:border-[#22d3ee] hover:shadow-[8px_8px_0px_#22d3ee] relative overflow-hidden"
              >
                {/* Decoration Barcode / Hex */}
                <div className="absolute top-4 right-4 text-[8px] leading-none text-[#22d3ee]/30 font-black text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  01101000<br/>01100001<br/>01100011<br/>01101011
                </div>

                <div className="flex flex-col h-full justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black bg-[#22d3ee] text-white px-2 py-0.5 uppercase tracking-wider">
                        {post.level || 'ROOT'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-bold">
                        <TerminalSquare size={12} className="text-[#22d3ee]" /> {post.date}
                      </span>
                    </div>
                    <h2 className="text-2xl text-white font-black uppercase tracking-tight group-hover:text-[#22d3ee] transition-colors">
                      {post.title}
                    </h2>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm text-slate-400 font-sans line-clamp-2">
                      {post.description}
                    </p>
                    <div className="mt-4 text-[11px] font-black text-[#22d3ee] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                      [ INITIATING PROTOCOL... ] <span className="animate-pulse w-2 h-3 bg-[#22d3ee]"></span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 💥 SIÊU HIỆU ỨNG GLITCH CSS CHO CHỮ SECURE_VAULT 💥 */}
      <style dangerouslySetInnerHTML={{__html: `
        .glitch-text {
          position: relative;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #050505;
        }
        .glitch-text::before {
          left: 3px;
          text-shadow: -2px 0 cyan;
          animation: glitch-anim-1 2s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -3px;
          text-shadow: 2px 0 blue;
          animation: glitch-anim-2 3s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim-1 {
          0% { clip: rect(20px, 9999px, 85px, 0); }
          20% { clip: rect(92px, 9999px, 14px, 0); }
          40% { clip: rect(43px, 9999px, 65px, 0); }
          60% { clip: rect(10px, 9999px, 40px, 0); }
          80% { clip: rect(70px, 9999px, 15px, 0); }
          100% { clip: rect(55px, 9999px, 90px, 0); }
        }
        @keyframes glitch-anim-2 {
          0% { clip: rect(15px, 9999px, 90px, 0); }
          20% { clip: rect(80px, 9999px, 30px, 0); }
          40% { clip: rect(20px, 9999px, 50px, 0); }
          60% { clip: rect(60px, 9999px, 10px, 0); }
          80% { clip: rect(35px, 9999px, 80px, 0); }
          100% { clip: rect(95px, 9999px, 20px, 0); }
        }
      `}} />
    </main>
  );
}