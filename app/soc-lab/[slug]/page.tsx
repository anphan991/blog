import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import Link from 'next/link';

export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), 'content', 'soc-lab');
  if (!fs.existsSync(contentDir)) return [];
  const files = fs.readdirSync(contentDir);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => ({ slug: file.replace(/\.md$/, '') }));
}

async function getPostData(slug: string) {
  const fullPath = path.join(process.cwd(), 'content', 'soc-lab', `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  const matterResult = matter(fileContents);
  const processedContent = await remark()
    .use(gfm)
    .use(html, { sanitize: false })
    .process(matterResult.content);
    
  return {
    slug,
    contentHtml: processedContent.toString(),
    ...matterResult.data
  };
}

export default async function SocLabPost({ params }: { params: { slug: string } }) {
  // Wait for params in Next 15+
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  let postData: any;
  try {
    postData = await getPostData(slug);
  } catch (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono flex-col gap-4">
        <h1 className="text-red-500 text-2xl">404: FILE NOT FOUND</h1>
        <p className="text-[#A9A9A2]">Error: content/soc-lab/{slug}.md does not exist.</p>
        <Link href="/#sec-topic" className="mt-4 px-4 py-2 border border-[#333330] hover:text-[#4ade80] transition-colors">
          › Return to System
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F0] font-sans selection:bg-[#4ade80] selection:text-black pb-24 relative">
      
      {/* Scanline Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03]" 
        style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}
      ></div>

      {/* Navbar / Header */}
      <nav className="border-b border-[#333330] bg-[#0A0A0A] px-6 py-4 flex items-center justify-between sticky top-0 z-40 relative shadow-md shadow-black/50">
        <Link href="/#sec-topic" className="font-mono text-xs uppercase tracking-widest text-[#A9A9A2] hover:text-[#4ade80] transition-colors flex items-center gap-2">
          <span>←</span> <span>TERMINAL_RETURN</span>
        </Link>
        <span className="font-mono text-[10px] text-[#4ade80] uppercase tracking-widest border border-[#4ade80]/30 bg-[#4ade80]/10 px-2 py-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></span>
          SOC_LAB_MODULE
        </span>
      </nav>

      {/* Article Content */}
      <main className="max-w-[1100px] mx-auto mt-12 px-6 relative z-10">
        
        {/* Terminal Window Wrapper */}
        <div className="bg-[#0A0A0A] border border-[#333330] rounded-t-lg overflow-hidden shadow-2xl shadow-green-900/5">
          {/* Mac-style Terminal Header */}
          <div className="flex items-center px-4 py-3 bg-[#111111] border-b border-[#333330]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="mx-auto font-mono text-[10px] text-[#A9A9A2] tracking-widest uppercase">
              ~/soc-lab/{slug}.md
            </div>
          </div>

          <div className="p-8 md:p-12">
            <header className="mb-12 border-b border-[#333330]/50 pb-8 relative">
              <div className="absolute top-0 right-0 font-mono text-[10px] text-green-500/30 hidden md:block">
                CLASSIFIED DATA
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-light mb-4 text-white shadow-green-500/20 drop-shadow-md">
                {postData.title || slug.replace(/_/g, ' ')}
              </h1>
              <div className="flex gap-4 font-mono text-xs text-[#A9A9A2] uppercase tracking-widest mt-6">
                {postData.date && <span>DATE: {postData.date}</span>}
                <span className="text-[#4ade80]">STATUS: VERIFIED</span>
              </div>
            </header>

            <article 
              className="prose prose-lg prose-invert prose-green max-w-none prose-headings:font-serif prose-headings:font-light prose-h2:text-[#4ade80] prose-h3:text-[#D8D8D1] prose-a:text-[#4ade80] hover:prose-a:text-green-400 prose-pre:bg-[#050505] prose-pre:border prose-pre:border-[#333330] prose-img:border prose-img:border-[#333330] prose-img:rounded-sm prose-img:mx-auto prose-blockquote:border-l-[#4ade80] prose-blockquote:bg-[#111111] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-[#A9A9A2] prose-code:text-[#4ade80]"
              dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
            />
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/#sec-topic" className="font-mono text-xs uppercase tracking-widest text-[#A9A9A2] hover:text-[#4ade80] transition-colors inline-flex items-center gap-2 border border-transparent hover:border-[#4ade80]/30 hover:bg-[#4ade80]/5 px-4 py-2 rounded-sm">
            [ CLOSE CONNECTION ]
          </Link>
        </div>
      </main>
    </div>
  );
}
