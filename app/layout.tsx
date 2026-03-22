import type { Metadata } from 'next'
// 1. Import font từ next/font/google
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="dark">
      {/* 4. Nhúng 2 biến font này vào thẻ body */}
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0a0a0a]`}>
        {children}
      </body>
    </html>
  )
}
