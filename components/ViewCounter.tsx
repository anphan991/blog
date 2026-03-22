'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Đảm bảo bạn đã tạo file lib/supabase.ts nhé

export default function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const incrementView = async () => {
      // Gọi hàm tăng view đã tạo trên Supabase
      await supabase.rpc('increment_view_count', { post_slug: slug });
    };

    if (slug) {
      incrementView();
    }
  }, [slug]);

  return null;
}