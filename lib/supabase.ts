import { createClient } from '@supabase/supabase-js'

// Kiểm tra xem các biến môi trường đã được khai báo chưa
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Thiếu cấu hình Supabase trong file .env.local!")
}

// Khởi tạo Client dùng chung cho toàn bộ ứng dụng
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)