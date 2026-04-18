# 🛡️ PROJECT RULES & CONTEXT (FOR AI ASSISTANTS)

## 🏗️ Core Tech Stack
- **Framework:** Next.js 14/15 (App Router).
- **Language:** TypeScript (Strict mode).
- **Styling:** Tailwind CSS v4 (IMPORTANT: No `tailwind.config.ts`, config is in `globals.css`).
- **Deployment:** Vercel.
- **Content:** Markdown-based blog using `gray-matter`, `remark`, and `remark-gfm`.

## 🎨 Design System & UI
- **Theme:** Dark mode by default (`bg-[#0a0a0a]`).
- **Colors:** Primary accents are Lime Green (`text-lime-500`) and Cyber Blue (`text-blue-400`).
- **Vibe:** InfoSec / Terminal / Hacker aesthetic. Use `font-mono` for technical elements.
- **Typography:** Inter for headings, JetBrains Mono for code/terminal elements.

## 🛠️ Specific Architectural Rules
1. **Server vs Client:** - Default to Server Components for performance/SEO.
   - Use `'use client';` ONLY for interactive components (buttons, state, effects).
2. **Tailwind v4 Handling:**
   - DO NOT suggest editing `tailwind.config.ts`.
   - All plugins (like `@tailwindcss/typography`) are loaded via `@plugin` in `app/globals.css`.
3. **Blog Rendering:**
   - Markdown tables MUST use `remark-gfm`.
   - Use `article` with class `prose prose-invert` to display blog content on dark background.
4. **Rickroll Trap Logic:**
   - PC: Use `iframe` with `autoplay` and user-interaction gate for audio.
   - Mobile: Use `img` with local GIF (`/rickroll.gif`) to bypass mobile autoplay restrictions.

## 📂 Directory Structure
- `/app`: Pages and Layouts (App Router).
- `/components`: Reusable UI elements (IntelFeed, ViewCounter, etc.).
- `/content`: Source `.md` files for blog posts.
- `/public`: Static assets (GIFs, images).

## 🚫 Critical Constraints (DO NOT BREACH)
- NEVER remove the `prose-invert` class from blog articles.
- NEVER suggest libraries that conflict with Next.js App Router.
- DO NOT overwrite existing logic in `app/blog/[slug]/page.tsx` regarding Markdown processing.
- When suggesting code, ensure it matches the existing technical and "vô tri" wordplay style.