import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ViewCounter from '@/components/ViewCounter'; // Import từ thư mục components vừa tạo
import remarkGfm from 'remark-gfm';

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  
  // 1. Giải mã Slug
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  
  const contentDir = path.join(process.cwd(), 'content');
  const filePath = path.join(contentDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    notFound(); 
  }

  // 2. Đọc Markdown
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  const processedContent = await remark()
    .use(remarkGfm) // <--- Cực kỳ quan trọng: Phải nằm TRƯỚC .use(html)
    .use(html)
    .process(content);

    const contentHtml = processedContent.toString();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-slate-200 py-20 px-6 font-sans">
      {/* 🟢 Máy đếm view chạy ngầm ở đây */}
      <ViewCounter slug={slug} />

      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/blog" className="inline-flex items-center text-sm font-mono text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
          <span className="mr-2">cd ..</span> Quay lại 
        </Link>

        <article className="space-y-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <header className="space-y-4 border-b border-white/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight italic font-[family-name:var(--font-inter)]">
          {data.title}
        </h1>
            <div className="flex flex-wrap gap-4 text-slate-500 font-mono text-xs items-center">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {data.date}
              </span>
              <span>|</span>
              <div className="flex gap-2">
                {data.tags?.map((tag: string) => (
                  <span key={tag} className="text-blue-400/60">#{tag}</span>
                ))}
              </div>
            </div>
          </header>

          {/* Nội dung bài viết */}
          <div 
            className="prose prose-invert prose-blue max-w-none 
                       prose-headings:font-bold prose-h2:text-blue-400 
                       prose-table:border-collapse prose-th:border prose-th:border-white/20 prose-th:p-2 
                       prose-td:border prose-td:border-white/20 prose-td:p-2
                       prose-code:text-pink-400 prose-code:bg-slate-800/50 prose-code:px-1.5 prose-code:rounded-md"
            dangerouslySetInnerHTML={{ __html: contentHtml }} 
          />
        </article>
      </div>
    </main>
  );
}