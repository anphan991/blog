import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Hello World!",
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
      {/* 4. Font variables trên <html> để cascade đúng chuẩn Next.js docs */}
      <body className="font-sans antialiased bg-[#060d14]">
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
