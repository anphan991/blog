'use client';

import { X, Send, Cpu, Bot, Zap, Globe, Terminal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function CyberChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Gợi ý nhanh cho người dùng
  const quickActions = [
    { label: 'Flappy Clone?', icon: <Zap size={12} />, query: 'Làm sao để chơi game Flappy Clone?' },
    { label: 'Tech Stack', icon: <Globe size={12} />, query: 'Hệ thống này sử dụng những công nghệ gì?' },
    { label: 'Chức năng', icon: <Terminal size={12} />, query: 'Blog có những tính năng gì nổi bật?' },
  ];

  // Auto-scroll xuống cuối cùng
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Bộ phân tích Markdown siêu nhẹ tự code (Không cần cài thư viện)
  const formatMarkdown = (text: string) => {
    let formatted = text;
    // 1. Xử lý in đậm: **text** -> in đậm, đổi màu nhấn
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#60A5FA] font-black tracking-wide">$1</strong>');
    
    // 2. Xử lý gạch đầu dòng: * text hoặc - text -> Thẻ <li>
    formatted = formatted.replace(/^(?:\*|-)\s+(.*)/gm, '<li class="ml-4 list-disc marker:text-[#3B82F6] mb-1">$1</li>');
    
    // 3. Xử lý in nghiêng: *text* formatted = formatted.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="text-gray-400 italic">$1</em>');
    
    // 4. Xử lý xuống dòng: \n -> <br />
    formatted = formatted.replace(/\n/g, '<br />');
    
    // 5. Fix lỗi <br /> thừa lọt vào giữa các list
    formatted = formatted.replace(/<\/li><br \/>/g, '</li>');

    return formatted;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error('AI_Core Offline');
      if (!res.body) throw new Error('Stream Error');

      const aiMsgId = 'ai-' + Date.now().toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value, { stream: true });
        
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], content: aiText };
          return updated;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: 'err-' + Date.now(), 
        role: 'assistant', 
        content: '**[LỖI HỆ THỐNG]:** Kết nối tới AI_Core bị gián đoạn. Vui lòng thử lại sau.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 md:right-10 z-[50] font-mono">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="p-4 rounded-full bg-[#0d1117] border border-[#3B82F6]/50 text-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-110 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all"
          >
            <Bot size={28} />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            // TĂNG KÍCH THƯỚC KHUNG CHAT (Rộng hơn, cao hơn)
            className="w-[340px] md:w-[420px] h-[550px] md:h-[600px] bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#3B82F6]">
                <Cpu size={18} className={isLoading ? "animate-spin" : "animate-pulse"} />
                <span className="text-[12px] font-black uppercase tracking-widest text-blue-100 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                  System_Assistant
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 no-scrollbar bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px]">
              {messages.length === 0 && (
                <div className="text-white/30 text-xs text-center mt-24 italic px-6 uppercase tracking-widest leading-relaxed">
                  <Bot size={40} className="mx-auto mb-4 opacity-20" />
                  Core initialized.<br/>Awaiting system commands.
                </div>
              )}
              
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] p-3.5 md:p-4 rounded-xl text-[13px] md:text-sm leading-relaxed shadow-md ${
                    m.role === 'user' 
                      ? 'bg-[#2563EB] text-white rounded-br-none' 
                      : 'bg-[#1e293b]/80 border border-white/10 text-gray-200 rounded-bl-none shadow-inner'
                  }`}>
                    <span className="font-black block mb-2 opacity-50 uppercase text-[10px] tracking-widest border-b border-white/10 pb-1">
                      {m.role === 'user' ? 'Guest@Root' : 'Core_AI'}
                    </span>
                    
                    {/* KHU VỰC HIỂN THỊ MARKDOWN */}
                    <div 
                      className="font-sans"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 flex flex-wrap gap-2 bg-black/40 border-t border-white/5">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={(e) => {
                    sendMessage(action.query);
                    (e.currentTarget as HTMLButtonElement).blur();
                  }}
                  className="flex items-center gap-1.5 text-[11px] md:text-xs px-2.5 py-1.5 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-blue-300 hover:bg-[#3B82F6]/20 hover:text-white transition-all active:scale-95"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleSubmit} 
              className="p-3 md:p-4 bg-[#090c10] border-t border-white/10 flex gap-3 items-center"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.code === 'Space') e.stopPropagation();
                }}
                placeholder="Nhập lệnh hoặc câu hỏi..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none text-white text-sm placeholder:text-white/30 focus:border-blue-500/50 transition-colors"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="text-white bg-[#3B82F6] disabled:bg-gray-700 disabled:text-gray-400 p-2.5 rounded-lg hover:bg-blue-500 transition-colors disabled:hover:bg-gray-700"
              >
                <Send size={18} className={isLoading ? "opacity-50" : ""} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}