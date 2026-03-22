import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

// 1. Hàm tự động hút data từ thư mục content
function getPosts() {
  const contentDir = path.join(process.cwd(), 'content');
  
  // Tránh lỗi nếu lỡ quên tạo thư mục
  if (!fs.existsSync(contentDir)) return [];

  const files = fs.readdirSync(contentDir);

  const posts = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent); // gray-matter tách phần Frontmatter ra

      return {
        slug: file.replace('.md', ''),
        title: data.title || 'No Title',
        date: data.date || 'Unknown Date',
        description: data.description || '',
        tags: data.tags || [],
      };
    })
    // Sắp xếp bài mới nhất lên đầu
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

// 2. Giao diện trang Blog
export default function BlogPage() {
  const posts = getPosts();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-slate-200 py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            ← Quay lại (Home)
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
             My journey in learning <span className="text-blue-500">CTF and cybersecurity_</span>
          </h1>
          <p className="text-slate-400">
            Random notes, zero structure / Updated weekly… if I remember 🤡.
          </p>
        </div>

        {/* Danh sách bài viết */}
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug}>
              <div className="group p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 cursor-pointer shadow-lg relative overflow-hidden">
                
                {/* Hiệu ứng tia sáng chạy ngang khi hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  <span className="text-sm font-mono text-slate-500 whitespace-nowrap">
                    [{post.date}]
                  </span>
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {post.description}
                </p>

                {/* Render Tags */}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-slate-800 text-blue-300 text-xs font-mono rounded border border-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>

              </div>
            </Link>
          ))}
          
          {posts.length === 0 && (
            <div className="p-8 text-center border border-dashed border-slate-700 rounded-2xl text-slate-500">
              Chưa có log nào được ghi lại. Chắc đang bận chạy deadline rùi 🐧
            </div>
          )}
        </div>

      </div>
    </main>
  );
}