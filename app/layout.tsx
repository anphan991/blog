import type { Metadata } from 'next'
// 1. Import font từ next/font/google
import { Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next";

// 2. Cấu hình Font Sans (Inter) với subset 'vietnamese'
const inter = Inter({ 
  subsets: ['vietnamese'], // BẮT BUỘC để không lỗi tiếng Việt
  variable: '--font-inter',
  display: 'swap',
})

// 3. Cấu hình Font Mono (JetBrains Mono) cho Terminal
const jetbrainsMono = JetBrains_Mono({
  subsets: ['vietnamese'], // BẮT BUỘC
  variable: '--font-mono',
  display: 'swap',
})

// Font Serif phong cách tạp chí nghệ thuật
const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600'],
  subsets: ['vietnamese'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: "ANPHAN991",
  description: "AP's playground for system tinkering and learning",

  manifest: '/favicon_io/site.webmanifest',
  
  icons: {
    icon: [
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon_io/apple-touch-icon.png' },
    ],
  },
};

import KhzCursor from '@/components/KhzCursor'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        {/* KHZ Intro Veil: sets show-intro class before first paint, once per session */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (!sessionStorage.getItem('khzIntro') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
              document.documentElement.classList.add('show-intro');
              sessionStorage.setItem('khzIntro', '1');
            }
          } catch(e) {}
        `}} />
      </head>
      {/* 4. Nhúng biến font vào thẻ body */}
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${cormorant.variable} font-sans antialiased bg-[#0a0a0a]`}>
        <KhzCursor />
        {/* Intro veil overlay */}
        <div className="intro-veil" aria-hidden="true">
          <span className="intro-veil__mark">@AP991</span>
        </div>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
