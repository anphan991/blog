import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, TerminalSquare, ShieldAlert } from 'lucide-react';

async function getPostContent(slug: string) {
  const fullPath = path.join(process.cwd(), 'content', 'infosec', `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  
  const processedContent = await remark()
    .use(remarkGfm)
    .use(html)
    .process(content);
    
  return { data, contentHtml: processedContent.toString() };
}

export default async function InfoSecPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const post = await getPostContent(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050505] text-[#94A3B8] p-4 md:p-8 pt-24 font-mono selection:bg-[#3B82F6] selection:text-white relative">
      
      {/* Lưới Nền Mờ Xanh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B82F608_1px,transparent_1px),linear-gradient(to_bottom,#3B82F608_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Nút Back - Style Hacker Lệnh Cơ Học */}
        <Link 
          href="/info-sec" 
          className="inline-flex items-center gap-2 text-xs font-bold text-[#3B82F6] hover:text-white mb-8 transition-colors border border-[#3B82F6]/30 bg-blue-950/20 px-4 py-2 hover:bg-[#3B82F6] hover:border-[#3B82F6] shadow-[2px_2px_0px_#3B82F6] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          <ChevronLeft size={16} /> 
          <span>./escape</span>
        </Link>
        
        {/* KHUNG GIAO DIỆN TERMINAL BRUTALISM */}
        <article className="bg-[#0a0a0a] border-2 border-slate-800 shadow-[10px_10px_0px_rgba(0,0,0,1)] ring-1 ring-[#3B82F6]/20 relative overflow-hidden">
          
          {/* Thanh Control Window Linux */}
          <div className="bg-[#111] border-b-2 border-slate-800 p-3 flex items-center justify-between sticky top-0 z-20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer"></div>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <TerminalSquare size={12} /> root@991:/vault/notes
            </div>
            <div className="w-10"></div> {/* Spacer để căn giữa text */}
          </div>

          <div className="p-6 md:p-12">
            <header className="mb-12 border-b-2 border-dashed border-blue-900/50 pb-8">
              <div className="flex items-center gap-2 text-[#3B82F6] mb-4 bg-[#3B82F6]/10 w-fit px-3 py-1 text-xs font-bold uppercase border border-[#3B82F6]/20">
                <ShieldAlert size={14} /> CLASSIFIED INFORMATION
              </div>
              <h1 className="text-4xl md:text-6xl text-white font-black tracking-tight mb-6 leading-none">
                {post.data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold font-mono">
                <span className="text-slate-400">TIMESTAMP:</span>
                <span className="text-[#3B82F6]">{post.data.date}</span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-400">AUTHOR:</span>
                <span className="text-white bg-slate-800 px-2 py-0.5">anphan991</span>
              </div>
            </header>
            
            {/* Nội Dung Render - Tối ưu hiển thị Markdown cho Hacker (Xanh) */}
            <div 
              className="prose prose-invert prose-blue max-w-none font-sans text-slate-300 leading-relaxed
                        prose-headings:font-mono prose-headings:font-black prose-headings:uppercase prose-headings:text-white
                        prose-h2:border-b-2 prose-h2:border-blue-900/50 prose-h2:pb-2 prose-h2:mt-12
                        prose-a:text-[#3B82F6] prose-a:font-bold prose-a:underline prose-a:decoration-blue-900 hover:prose-a:decoration-[#3B82F6] hover:prose-a:text-white transition-colors
                        prose-strong:text-white
                        prose-blockquote:border-l-4 prose-blockquote:border-[#3B82F6] prose-blockquote:bg-blue-950/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic
                        prose-code:text-cyan-300 prose-code:bg-[#111] prose-code:px-1.5 prose-code:py-0.5 prose-code:border prose-code:border-white/10 prose-code:rounded-none prose-code:font-mono
                        prose-pre:bg-[#080808] prose-pre:border-2 prose-pre:border-slate-800 prose-pre:rounded-none prose-pre:p-4
                        prose-img:border-2 prose-img:border-slate-800 prose-img:rounded-none
                        prose-table:border-collapse prose-th:border-2 prose-th:border-slate-800 prose-th:p-3 prose-th:bg-[#111] prose-th:text-white
                        prose-td:border-2 prose-td:border-slate-800 prose-td:p-3"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
            />

            {/* End of File Marker */}
            <div className="mt-16 pt-8 border-t-2 border-slate-800 text-center">
              <span className="text-[#3B82F6] font-bold animate-pulse text-xl">Bye World!</span>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}