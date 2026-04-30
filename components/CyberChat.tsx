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

  // Gợi ý nhanh cho người dùng (Chỉ tập trung vào tính năng Blog)
  const quickActions = [
    { label: 'Cyber Fly?', icon: <Zap size={10} />, query: 'Làm sao để chơi game Cyber Fly?' },
    { label: 'Tech Stack', icon: <Globe size={10} />, query: 'Blog này sử dụng những công nghệ gì?' },
    { label: 'Chức năng', icon: <Terminal size={10} />, query: 'Hệ thống này có những tính năng gì nổi bật?' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
        content: '[ERROR]: Kết nối hệ thống bị gián đoạn.' 
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
    <div className="fixed bottom-24 md:bottom-6 right-6 md:right-24 z-[50] font-mono">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="p-4 rounded-full bg-[#0d1117] border border-[#3B82F6]/50 text-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-110 transition-all"
          >
            <Bot size={24} />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[320px] md:w-[360px] h-[480px] bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#3B82F6]">
                <Cpu size={14} className={isLoading ? "animate-spin" : "animate-pulse"} />
                <span className="text-[10px] font-black uppercase tracking-widest">System_Assistant.v2</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white"><X size={16} /></button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-gradient-to-b from-transparent to-black/20">
              {messages.length === 0 && (
                <div className="text-white/20 text-[10px] text-center mt-20 italic px-6 uppercase tracking-tight">
                  Core initialized. Awaiting system commands or inquiries.
                </div>
              )}
              
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-[11px] leading-relaxed shadow-sm ${
                    m.role === 'user' ? 'bg-[#3B82F6] text-white rounded-br-none' : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-none'
                  }`}>
                    <span className="font-black block mb-1 opacity-40 uppercase text-[8px] tracking-tighter">
                      {m.role === 'user' ? 'Guest@Root' : 'Core_AI'}
                    </span>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions - FIX SPACE ISSUE HERE */}
            <div className="px-3 py-2 flex flex-wrap gap-2 bg-black/20">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={(e) => {
                    sendMessage(action.query);
                    (e.currentTarget as HTMLButtonElement).blur(); // NHẢ FOCUS ĐỂ SPACE DÙNG CHO GAME
                  }}
                  className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-md bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-all active:scale-95"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleSubmit} 
              className="p-3 bg-black/40 border-t border-white/10 flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                // NGĂN PHÍM SPACE KÍCH HOẠT GAME KHI ĐANG GÕ
                onKeyDown={(e) => {
                  if (e.code === 'Space') e.stopPropagation();
                }}
                placeholder="Nhập lệnh..."
                className="flex-1 bg-transparent border-none outline-none text-white text-xs placeholder:text-white/20"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="text-[#3B82F6] disabled:opacity-30 p-1 hover:scale-110 transition-transform"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}