'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Bug, Zap, Mail, Github, Twitter, Gamepad2 } from 'lucide-react';
import HackerText from '@/components/HackerText';
import TiltCard from '@/components/TiltCard';
import MagneticWrapper from '@/components/MagneticWrapper';

import NetworkParticles from '@/components/NetworkParticles';
import ParallaxWireframes from '@/components/ParallaxWireframes';

const EASE_OUT = [0.16, 1, 0.3, 1] as [number, number, number, number];






// MAIN PAGE
// ==========================================
export default function Home() {
  useEffect(() => {
    document.documentElement.classList.add('snap-enabled');
    return () => document.documentElement.classList.remove('snap-enabled');
  }, []);
  const [chaosMode, setChaosMode] = useState(false);
  const [runawayPos, setRunawayPos] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [bsodState, setBsodState] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const [clockFormat, setClockFormat] = useState<'dec' | 'bin' | 'hex'>('bin');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      
      if (clockFormat === 'bin') {
        setTimeStr(`${h.toString(2).padStart(5,'0')}:${m.toString(2).padStart(6,'0')}:${s.toString(2).padStart(6,'0')}`);
      } else if (clockFormat === 'hex') {
        setTimeStr(`${h.toString(16).padStart(2,'0')}:${m.toString(16).padStart(2,'0')}:${s.toString(16).padStart(2,'0')}`.toUpperCase());
      } else {
        setTimeStr(`${h.toString(10).padStart(2,'0')}:${m.toString(10).padStart(2,'0')}:${s.toString(10).padStart(2,'0')}`);
      }
    };
    const t = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(t);
  }, [clockFormat]);

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isDestructing, setIsDestructing] = useState(false);

  useEffect(() => {
    if (isDestructing) {
      const timer = setTimeout(() => {
        window.location.href = "/free-cookie?auto=1";
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isDestructing]);
  const [typedTitle, setTypedTitle] = useState({ line1: '', line2: '', cursorLine: 1 });

  useEffect(() => {
    const text1 = "HELLO";
    const text2 = "WORLD!";
    let current1 = "";
    let current2 = "";
    let i = 0;
    let j = 0;
    let phase = 0; // 0: type1, 1: type2, 2: wait, 3: del2, 4: del1, 5: wait
    let timeout: NodeJS.Timeout;
    let isMounted = true;

    const tick = () => {
      if (!isMounted) return;
      if (phase === 0) {
        if (i < text1.length) {
          current1 += text1[i];
          setTypedTitle({ line1: current1, line2: current2, cursorLine: 1 });
          i++;
          timeout = setTimeout(tick, 100);
        } else {
          phase = 1;
          setTypedTitle({ line1: current1, line2: current2, cursorLine: 2 });
          timeout = setTimeout(tick, 100);
        }
      } else if (phase === 1) {
        if (j < text2.length) {
          current2 += text2[j];
          setTypedTitle({ line1: current1, line2: current2, cursorLine: 2 });
          j++;
          timeout = setTimeout(tick, 100);
        } else {
          phase = 2;
          timeout = setTimeout(tick, 2000); // Wait 2s before deleting
        }
      } else if (phase === 2) {
        phase = 3;
        timeout = setTimeout(tick, 100);
      } else if (phase === 3) {
        if (j > 0) {
          current2 = current2.slice(0, -1);
          setTypedTitle({ line1: current1, line2: current2, cursorLine: 2 });
          j--;
          timeout = setTimeout(tick, 50); // Delete faster
        } else {
          phase = 4;
          setTypedTitle({ line1: current1, line2: current2, cursorLine: 1 });
          timeout = setTimeout(tick, 50);
        }
      } else if (phase === 4) {
        if (i > 0) {
          current1 = current1.slice(0, -1);
          setTypedTitle({ line1: current1, line2: current2, cursorLine: 1 });
          i--;
          timeout = setTimeout(tick, 50);
        } else {
          phase = 5;
          timeout = setTimeout(tick, 800); // Wait 0.8s before typing again
        }
      } else if (phase === 5) {
        phase = 0;
        timeout = setTimeout(tick, 100);
      }
    };

    timeout = setTimeout(tick, 400);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);
  // CyberCat
  const [petMood, setPetMood] = useState<'chill'|'happy'|'hack'|'angry'|'shield'|'chaos'|'dance'>('chill');
  const [speech, setSpeech] = useState('System online. Awaiting orders,... 🐈');
  const [command, setCommand] = useState('');
  const asciiFrames = {
    chill: `  |\\__/,|   (\`\\ \n _.0-0._ |  _) ) \n_(_(_/-(_(_/  `,
    happy: `  /\\_/\\  \n ( ^.^ )  *purr*\n  > ~ <   `,
    hack:  `  /\\_/\\   [😎] \n ( -.- )  [SSH]\n  > ^ <   [BUSY]`,
    angry: `  /\\_/\\  \n ( >_< )  *HISS!\n  vv vv  `,
    shield:`  /\\_/\\   [🛡️]\n ( o.o )  [SEC]\n  > ^ <   `,
    chaos: `  /\\_/\\  \n ( X.X )  FATAL\n  UNSTABLE`,
    dance: `  /\\_/\\  \n ~( v.v )~\n  > ^ <   `,
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const cmd = command.trim().toLowerCase();
    setCommand('');
    const map: Record<string, () => void> = {
      hi:      () => { setPetMood('happy');  setSpeech('Hello! Systems are 100% green today.'); },
      hello:   () => { setPetMood('happy');  setSpeech('Hello! Systems are 100% green today.'); },
      coffee:  () => { setPetMood('happy');  setSpeech('System injected! Compile speed +50%... ☕'); },
      feed:    () => { setPetMood('happy');  setSpeech('System injected! Compile speed +50%... ☕'); },
      hack:    () => { setPetMood('hack');   setSpeech('Bypassing firewall... Please wait for the Flag.'); },
      pwn:     () => { setPetMood('hack');   setSpeech('Bypassing firewall... Please wait for the Flag.'); },
      shield:  () => { setPetMood('shield'); setSpeech('Shields UP! Monitoring for suspicious packets.'); },
      secure:  () => { setPetMood('shield'); setSpeech('Shields UP! Monitoring for suspicious packets.'); },
      whoami:  () => { setSpeech('You are the Admin. I am your Loyal Cyber-Companion.'); },
      status:  () => { setSpeech('CPU: Chill | Mood: Stable | Hunger: Coffee_Required'); },
      help:    () => { setSpeech('Try: hi, coffee, hack, shield, whoami, status, clear'); },
      clear:   () => { setPetMood('chill');  setSpeech('Terminal reset. Chilling in the background...'); },
    };
    (map[cmd] || (() => { setPetMood('angry'); setSpeech(`Unknown command: "${cmd}". My database is confused.`); }))();
  };

  const handleStatusClick = () => {
    if (bsodState) { setBsodState(false); setClickCount(0); return; }
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount > 5) setBsodState(true);
    setTimeout(() => setClickCount(0), 2000);
  };



  const handleHireHover = () => {
    if (!chaosMode) setRunawayPos({ x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 400 });
  };

  // ── INIT KHZ DOM EFFECTS ──
  useEffect(() => {
    // Toggle chaos mode on body
    document.body.classList.toggle('chaos-mode', chaosMode);

    // Nav scroll
    const nav = document.querySelector('.khz-nav');
    const handleScrollNav = () => {
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScrollNav, { passive: true });

    // Hero fade & bg crossfade
    const heroContent = document.querySelector('.hero__content');
    const heroBgA = document.querySelector('.hero__bg--a');
    const heroBgB = document.querySelector('.hero__bg--b');
    
    const handleScrollHero = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const progress = Math.min(1, scrollY / (vh * 0.55));
      if (heroContent) {
        (heroContent as HTMLElement).style.opacity = String(1 - progress);
        (heroContent as HTMLElement).style.transform = `translateY(${progress * -36}px)`;
      }
    };
    window.addEventListener('scroll', handleScrollHero, { passive: true });
    
    // Crossfade background every 7s
    const bgInterval = setInterval(() => {
      if (heroBgA && heroBgB) {
        heroBgA.classList.toggle('is-active');
        heroBgB.classList.toggle('is-active');
      }
    }, 7000);

    // Split lines processing
    document.querySelectorAll('.split-lines:not(.processed)').forEach(el => {
      const parts = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = parts.map((part, i) =>
        `<span class="sline"><span class="sline__in" style="--line-i:${i}">${part}</span></span>`
      ).join('');
      el.classList.add('processed');
    });

    // Auto numbering section labels
    document.querySelectorAll('.section-label').forEach((el, i) => {
      el.setAttribute('data-no', (i < 9 ? '0' : '') + (i + 1));
    });

        // Scroll Reveal: observe each text element directly for perfect bidirectional trigger
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-bright');
          } else {
            entry.target.classList.remove('is-bright');
          }
        });
      },
      // Trigger when element is slightly inside viewport
      { threshold: [0, 1], rootMargin: "0px" }
    );
    document.querySelectorAll('.scroll-reveal-line').forEach((el) => revealObserver.observe(el));


    // Section label sweep animation
    const labelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('.section-label').forEach((el) => labelObserver.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScrollNav);
      window.removeEventListener('scroll', handleScrollHero);
      clearInterval(bgInterval);
      revealObserver.disconnect();
      labelObserver.disconnect();
    };
  }, [chaosMode]);

  return (
    <>
      <main className="min-h-[100dvh]">

        
        {/* Interactive network particles */}
        <NetworkParticles />

        {/* 3D Wireframes Parallax */}
        <ParallaxWireframes />

        {/* Chaos grid bg */}
        <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000
          ${chaosMode ? 'opacity-20 bg-[radial-gradient(circle_at_2px_2px,#ef4444_1px,transparent_0)] bg-[size:24px_24px]' : 'opacity-0'}`}
        />

        {/* ══ NAVIGATION ══════════════════════════════ */}
        <nav className="khz-nav">
          <div className="flex flex-col leading-none">
            <span className={`font-mono text-2xl tracking-wider uppercase transition-colors ${chaosMode ? 'text-red-400' : 'text-[#4ade80]'}`}>Ka</span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-green-500 font-mono mt-1">
              {chaosMode ? 'STATUS: COMPROMISED' : '@( * O * )@'}
            </span>
          </div>

          <div className="flex items-center gap-8">
              <div className="relative hidden md:block">
                <button 
                  onClick={() => setNavOpen(!navOpen)} 
                  className="text-[11px] uppercase tracking-widest text-green-600 font-mono hover:text-[#4ade80] transition-colors duration-300 flex items-center gap-2"
                >
                  [ MENU ] <span className="text-[8px]">{navOpen ? '▲' : '▼'}</span>
                </button>
                
                {navOpen && (
                  <div className="absolute top-full right-0 mt-4 bg-[#111111] border border-[#333330] p-4 flex flex-col gap-4 text-[11px] uppercase tracking-widest text-green-600 font-mono min-w-[160px] shadow-2xl z-50">
                    <button onClick={() => { document.getElementById('sec-manifesto')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#4ade80] transition-colors duration-300"><HackerText text="[01] MANIFESTO" /></button>
                    <button onClick={() => { document.getElementById('sec-theme')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#4ade80] transition-colors duration-300"><HackerText text="[02] THEMES" /></button>
                      <button onClick={() => { document.getElementById('sec-archive')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#4ade80] transition-colors duration-300"><HackerText text="[03] ARCHIVE" /></button>
                    <button onClick={() => { document.getElementById('sec-works')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#4ade80] transition-colors duration-300"><HackerText text="[04] WORKS" /></button>
                    <button onClick={() => { document.getElementById('sec-topic')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#4ade80] transition-colors duration-300"><HackerText text="[05] TOPICS" /></button>
                      <button onClick={() => { document.getElementById('sec-connect')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#4ade80] transition-colors duration-300"><HackerText text="[06] CONNECT" /></button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => document.documentElement.classList.toggle('light-theme')}
                className="w-8 h-8 flex items-center justify-center border border-[#333330] rounded-full text-[#A9A9A2] hover:text-[#4ade80] hover:border-[#4ade80] transition-all"
                title="Toggle Theme"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </button>
            </div>
        </nav>

        {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
        <section className="hero relative overflow-hidden h-[100dvh] bg-[#050505]">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img src="/pic1.jpg" alt="Hero Background" className="w-full h-full object-cover opacity-50 select-none pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent mix-blend-multiply"></div>
          </div>
          
          <div className="hero__content absolute bottom-12 md:bottom-24 left-8 md:left-16 lg:left-24 z-10 flex flex-col items-start text-left w-full">
            <motion.h1 
              className="hero__title font-mono text-[#4ade80] [text-shadow:0_0_30px_rgba(74,222,128,0.4)] text-[clamp(4rem,12vw,12rem)] leading-[0.85] tracking-tight uppercase"
            >
              <span className="hero__line block">
                {typedTitle.line1}{typedTitle.cursorLine === 1 && <span className="animate-pulse">/</span>}
              </span>
              <span className="hero__line block italic">
                {typedTitle.line2}{typedTitle.cursorLine === 2 && <span className="animate-pulse">/</span>}
              </span>
            </motion.h1>
            
            <div className="mt-8 overflow-hidden">
              <motion.span 
                className="block uppercase tracking-[0.2em] text-[11px] md:text-[13px] text-[#4ade80] font-mono"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.7 }}
              >
                {chaosMode ? 'SECURITY BREACH DETECTED' : 'THE WORLD BEGINS IN THE SPACE WE LEAVE.'}
              </motion.span>
            </div>
          </div>

          {/* Right vertical text */}
          <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-10 hidden md:block">
            <div className="rotate-90 origin-right text-[10px] tracking-[0.25em] text-[#4ade80] whitespace-nowrap uppercase font-mono">
              \\\\\
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-12 md:bottom-24 right-8 md:right-16 z-10 flex items-center gap-4">
            <span className="text-[9px] uppercase tracking-[0.28em] text-[#4ade80] font-mono">Scroll</span>
            <div className="w-16 h-[1px] bg-green-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-green-400 origin-left" style={{ animation: 'scanLineX 2s infinite' }}></div>
            </div>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24" style={{ paddingBottom: '160px' }}>
          
          {/* ══ MANIFESTO ════════════════════════════════ */}
          {/* THEME SELECTION SECTION */}
            <section id="sec-theme" className="ms-section">
              <div className="section-label">Realities</div>
              
              <button 
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="flex flex-col mb-8 text-left w-full hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent outline-none"
              >
                <h2 className="font-mono text-2xl md:text-3xl text-white uppercase tracking-widest mb-2 flex items-center gap-4">
                  <HackerText text="Select_Environment" /> 
                  <span className="text-[#4ade80] text-sm">{isThemeOpen ? '[-]' : '[+]'}</span>
                </h2>
                <p className="font-mono text-[10px] md:text-xs text-[#A9A9A2] opacity-70 tracking-[0.2em] uppercase">
                  &gt; CLICK TO DEPLOY THEME_SELECTION_MODULE
                </p>
              </button>

              <AnimatePresence>
                {isThemeOpen && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-8 md:gap-12 w-full justify-center items-center overflow-hidden py-8"
                  >
                    {[
                      { id: 'matrix', name: 'THE MATRIX', role: 'CURRENT REALITY', img: '/pic2.jpg', color: '#4ade80', link: '#' },
                      { id: 'cyber', name: 'CYBERCORE', role: 'DEEP DIVE', img: '/pic2.jpg', color: '#22d3ee', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                      { id: 'win98', name: 'WINDOWS 98', role: 'NOSTALGIA SECTOR', img: '/pic2.jpg', color: '#a855f7', link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
                    ].map((theme, i) => (
                      <motion.a
                        key={theme.id}
                        href={theme.link}
                        initial={{ opacity: 0, y: 50, rotateY: 30, borderColor: "#333330", boxShadow: "0 0 0px rgba(0,0,0,0)" }}
                        whileInView={{ opacity: 1, y: 0, rotateY: 0, borderColor: "#333330", boxShadow: "0 0 0px rgba(0,0,0,0)" }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ delay: 0.01 + i * 0.15, type: "spring", stiffness: 700, damping: 20 }}
                        whileHover={{ 
                          scale: 1.05, 
                          y: -15, 
                          boxShadow: `0 0 30px ${theme.color}40`,
                          borderColor: theme.color
                        }}
                        className="relative group bg-[#0A0A0A] border border-[#333330] p-6 w-48 md:w-56 flex flex-col items-center transition-all duration-50 no-underline cursor-pointer"
                        style={{
                          transformStyle: 'preserve-3d',
                          perspective: '1000px'
                        }}
                      >
                        {/* Image Container */}
                        <div className="w-24 h-24 md:w-28 md:h-28 overflow-hidden mb-6 border border-[#333330] group-hover:border-transparent transition-colors relative bg-[#050505]">
                          <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-colors z-10"></div>
                          <img src={theme.img} alt={theme.name} className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        
                        {/* Text Info */}
                        <h3 
                          className="font-mono text-xl tracking-widest text-center transition-colors uppercase group-hover:text-white"
                          style={{ color: '#A9A9A2' }}
                        >
                          {theme.name}
                        </h3>
                        <p className="font-mono text-[9px] text-[#A9A9A2] opacity-50 tracking-[0.2em] text-center mt-2 group-hover:opacity-100 transition-colors uppercase">
                          {theme.role}
                        </p>

                        {theme.id === 'matrix' && (
                          <div className="absolute -top-3 right-4 bg-[#A9A9A2] text-black text-[8px] font-bold px-2 py-1 uppercase tracking-widest">
                            Active
                          </div>
                        )}
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section id="sec-manifesto" className="ms-section">
            <div className="section-label">Manifesto</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
              
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT }}
                className="md:col-span-3 flex flex-col gap-10"
              >
                <div className="flex flex-col gap-4 items-start">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 border border-[#333330] text-[9px] uppercase tracking-widest font-mono text-[#A9A9A2]">
                      Copy-Paste Architect
                    </span>
                    <button
                      className={`px-3 py-1 border text-[9px] uppercase tracking-widest font-mono transition-all duration-300 cursor-pointer ${bsodState ? 'bg-white text-black border-white' : 'border-[#333330] text-[#A9A9A2] hover:border-[#D8D8D1] hover:text-[#D8D8D1]'}`}
                      onClick={handleStatusClick}
                    >
                      {bsodState ? 'ERROR: 418' : 'Professional Googler'}
                    </button>
                  </div>
                  
                  <motion.button
                    suppressHydrationWarning
                    onMouseEnter={handleHireHover}
                    onMouseLeave={() => setRunawayPos({ x: 0, y: 0 })}
                    onClick={() => { if (!chaosMode) alert('Bắt được rồiii! 🐧'); }}
                    animate={{ x: runawayPos.x, y: runawayPos.y }}
                    transition={{ type: 'spring', stiffness: 350, damping: 12 }}
                    className="cta-link cta-link--ghost relative z-20 border border-[#333330] text-center mt-6"
                    style={{ display: 'inline-block' }}
                  >
                    Hire Me?
                  </motion.button>
                </div>
                
                {/* Khung ảnh bên trái dưới chữ Hire Me */}
                <div className="mt-auto pt-16 hidden md:block w-full">
                  <img src="/meme5.jpg" alt="Left Image" className="w-full aspect-square object-cover border border-[#333330] rounded-sm opacity-100" />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 }}
                className="md:col-span-9 relative"
              >
                {/* Khung nhãn góc trên bên phải */}
                <div className="absolute top-0 right-0 hidden md:flex flex-col items-end gap-2 z-10">
                  <span className="px-3 py-1 border border-[#333330] text-[9px] uppercase tracking-widest font-mono text-[#4ade80]">
                    SYS.STATUS: ONLINE
                  </span>
                  <span className="px-3 py-1 border border-[#333330] text-[9px] uppercase tracking-widest font-mono text-[#A9A9A2]">
                    CAFFEINE: 99%
                  </span>
                  <span className="px-3 py-1 border border-[#333330] text-[9px] uppercase tracking-widest font-mono text-[#A9A9A2]">
                    SLEEP: DEPRIVED
                  </span>
                </div>
                {bsodState && (
                  <div className="border border-white/20 p-6 font-mono text-xs mb-8 bg-white/5">
                    <p className="scroll-reveal-line">System Crash</p>
                    <p className="scroll-reveal-line">An exception 0E has occurred at 0xDEADBEEF.</p>
                    <p className="scroll-reveal-line" onClick={() => setBsodState(false)}>
                      › Reboot System
                    </p>
                  </div>
                )}
                
                <h2 className="split-lines scroll-reveal-line font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[1.4] text-white font-light mb-12">
                  <span className="scroll-reveal-line" data-reveal-delay="0">InfoSec Student &amp; </span><br/>
                  <span className="scroll-reveal-line" data-reveal-delay="1">Break-stuff Enthusiast.</span><br/>
                  <span className="scroll-reveal-line italic text-[#A9A9A2] text-[0.65em] inline-block pt-1" data-reveal-delay="2">Please excuse me for being antisocial.</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
                  <p className="scroll-reveal-line">
                    <span className="scroll-reveal-line" data-reveal-delay="3">Я не знаю почему это работает, но не трогай.</span><br/>
                    <span className="scroll-reveal-line" data-reveal-delay="4">Сделано для ПК — мобилка это побочный квест.</span>
                  </p>
                  <img src="/pic2.jpg" alt="Meme 1" className="max-w-full max-h-[35vh] object-contain border border-[#333330] bg-[#0A0A0A] scale-[1.15] translate-y-15" />
                </div>
              </motion.div>
            </div>


          </section>

          {/* ══ VISUAL ARCHIVE (MEME GRID) ═══════════════ */}
          
            


            <section id="sec-archive" className="ms-section">
            <div className="section-label">Visual Archive</div>
            <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center h-[75vh]">
              <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT }} className="flex-1 h-full w-full min-w-0 min-h-0 flex items-center justify-center">
                <img src="/p1.jpg" alt="Portrait Meme" className="max-w-full max-h-full object-contain border border-[#333330] bg-[#0A0A0A]" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.2 }} className="flex-1 flex flex-col gap-6 h-full w-full min-w-0 min-h-0">
                <div className="flex-1 w-full min-h-0 flex items-center justify-center"><img src="/meme3.jpg" alt="Landscape Meme 1" className="max-w-full max-h-full object-contain border border-[#333330] bg-[#0A0A0A]" /></div>
                <div className="flex-1 w-full min-h-0 flex items-center justify-center"><img src="/meme4.jpg" alt="Landscape Meme 2" className="max-w-full max-h-full object-contain border border-[#333330] bg-[#0A0A0A]" /></div>
              </motion.div>
             <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.4 }} className="flex-1 h-full w-full min-w-0 min-h-0 flex items-center justify-center">
                <img src="/p2.jpg" alt="Portrait Meme" className="max-w-full max-h-full object-contain border border-[#333330] bg-[#0A0A0A]" />
              </motion.div>

            </div>
          </section>

          {/* ══ SELECTED WORKS ───────────────────────── */}
          <section id="sec-works" className="ms-section">
            <div className="section-label">Selected Works</div>
            <div className="flex flex-col">

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <TiltCard><Link href="/info-sec" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title scroll-reveal-line" data-reveal-delay="0">InfoSec Notes</h3>
                    <div className="service-item__meta mt-2 scroll-reveal-line" data-reveal-delay="1">Transition from a script kiddie to a professional overthinker.</div>
                  </div>
                  <span className="service-item__arrow">→</span>
                </Link></TiltCard>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <TiltCard><Link href="/blog" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title scroll-reveal-line" data-reveal-delay="0">CTF Training</h3>
                    <div className="service-item__meta mt-2 scroll-reveal-line" data-reveal-delay="1">A note dump of my CTF journey</div>
                  </div>
                  <span className="service-item__arrow">→</span>
                </Link></TiltCard>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <TiltCard><Link href="/projects/rfid" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title scroll-reveal-line" data-reveal-delay="0">IoT RFID Vault</h3>
                    <div className="service-item__meta mt-2 scroll-reveal-line" data-reveal-delay="1">Final chance to run it with mah G.</div>
                  </div>
                  <span className="service-item__arrow">→</span>
                </Link></TiltCard>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <TiltCard><a href="/free-cookie" target="_blank" rel="noopener noreferrer" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title scroll-reveal-line">Free Cookie {chaosMode ? '☢️' : '🍪'}</h3>
                    <div className="service-item__meta mt-2 scroll-reveal-line" data-reveal-delay="1">Totally safe. Not a rickroll. I promise.</div>
                  </div>
                  <span className="service-item__arrow">→</span>
                </a></TiltCard>
              </motion.div>
            </div>
          </section>
          {/* ══ HOME SOC LAB ════════════════════════════════════════ */}
          <section id="sec-topic" className="ms-section">
            <div className="section-label">Project: SOC Lab</div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start h-full">
              
              {/* Left Info */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:col-span-4 flex flex-col gap-6"
              >
                <h3 className="font-serif text-[clamp(2.5rem,4vw,3.8rem)] leading-[1.1] font-light text-white scroll-reveal-line">
                  <span className="scroll-reveal-line" data-reveal-delay="0">Home SOC</span><br/>
                  <span className="scroll-reveal-line" data-reveal-delay="1">LAB.</span>
                </h3>
                <div className="flex gap-4 items-center mt-6">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#4ade80]"></span>
                  </span>
                  <span className="font-mono text-[13px] font-semibold text-[#4ade80] uppercase tracking-widest scroll-reveal-line" data-reveal-delay="2">
                    4 MODULES ONLINE
                  </span>
                </div>
                
                <p className="text-[#A9A9A2] font-mono font-light text-base mt-6 scroll-reveal-line" data-reveal-delay="3">
                  ///abcdexyzjqk 
                </p>
                
                <div className="mt-10 border-l-2 border-[#333330] pl-6 font-mono text-[13px] text-[#A9A9A2] uppercase tracking-[0.15em] flex flex-col gap-4">
                  <p className="scroll-reveal-line" data-reveal-delay="4">› Stack: Wazuh</p>
                  <p className="scroll-reveal-line" data-reveal-delay="5">› Status: Deploying</p>
                  <p className="scroll-reveal-line" data-reveal-delay="6">› Access: Classified</p>
                </div>

                <p className="mt-8 font-mono text-sm text-[#333330] tracking-widest scroll-reveal-line" data-reveal-delay="7">
                  |||||
                </p>

              </motion.div>

              {/* Right Terminal List */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="lg:col-span-8 bg-[#050505] border border-[#333330] flex flex-col font-mono text-sm h-[65vh] max-h-[600px]"
              >
                {/* Terminal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#333330] bg-[#0A0A0A]">
                  <span className="text-[#A9A9A2] text-sm">~/projects/home-soc-lab</span>
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#333330]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#333330]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#333330]"></div>
                  </div>
                </div>
                
                {/* File List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
                  {[
                    "01-deploy-wazuh-server.md",
                    "02-connect-agents-and-sysmon.md",
                    "03-generate-and-read-telemetry.md",
                    "04-build-dashboard.md",
                    "Coming Soon...",
                    "Coming Soon...",
                    "Coming Soon..."
                  ].map((file, i) => (
                    <TiltCard key={i}><a href={`/soc-lab/${file.replace('.md', '')}`} className="flex justify-between items-center py-4 border-b border-[#111111] hover:bg-[#111111] transition-colors group cursor-pointer px-4">
                      <span className="flex gap-5 items-center">
                        <span className="text-[#333330] group-hover:text-[#4ade80] text-sm">[{String(i+1).padStart(2, '0')}]</span>
                        <span className="text-[#D8D8D1] group-hover:text-white transition-colors text-base">{file}</span>
                      </span>
                      <span className="text-[#333330] group-hover:text-[#4ade80] transition-colors text-sm">
                        {10 + i * 2}.4kb
                      </span>
                    </a></TiltCard>
                  ))}
                  <div className="py-6 text-[#333330] px-4">
                    <span className="animate-pulse text-base">_</span>
                  </div>
                </div>
              </motion.div>
              
            </div>
          </section>

          {/* ══ CONNECT & ASCII COMPANION ═════════════════════════ */}
          <section id="sec-connect" className="ms-section pb-0">
            <div className="section-label">Connect & Companion</div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Connect part */}
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT }}
                className="lg:col-span-7"
              >
                <h2 className="split-lines scroll-reveal-line font-serif text-[clamp(2.5rem,5vw,6.5rem)] leading-[1.5] text-white font-light mb-12 pb-6"
                  style={{
                    textShadow: `
                      1px 1px 0 rgba(74,222,128,0.4),
                      2px 2px 0 rgba(74,222,128,0.35),
                      3px 3px 0 rgba(74,222,128,0.3),
                      4px 4px 0 rgba(74,222,128,0.25),
                      5px 5px 0 rgba(74,222,128,0.2),
                      6px 6px 0 rgba(74,222,128,0.15),
                      7px 7px 0 rgba(74,222,128,0.1),
                      8px 8px 0 rgba(74,222,128,0.08),
                      0 0 60px rgba(74,222,128,0.15),
                      0 0 120px rgba(74,222,128,0.08)
                    `,
                    transform: 'perspective(600px) rotateY(-4deg) rotateX(2deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  Let's break things<br/>
                  <span className="italic">together.</span>
                </h2>
                <div className="cta-row">
                  <MagneticWrapper><a href="mailto:an0915129080@gmail.com" className="cta-link"><HackerText text="Email"/></a></MagneticWrapper>
                  <MagneticWrapper><a href="https://github.com/anphan991" target="_blank" rel="noopener noreferrer" className="cta-link"><HackerText text="GitHub"/></a></MagneticWrapper>
                  <MagneticWrapper><a href="https://x.com/TezD991" target="_blank" rel="noopener noreferrer" className="cta-link"><HackerText text="Twitter"/></a></MagneticWrapper>
                </div>
              </motion.div>

              {/* ASCII Companion (Smaller) */}
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 }}
                className="lg:col-span-5 flex flex-col items-center"
              >
                <div 
                  className="w-full flex flex-col items-center justify-center h-48 border border-[#333330] cursor-pointer transition-all hover:border-[#D8D8D1] bg-[#0A0A0A] mb-6"
                  onClick={() => { setPetMood('angry'); setSpeech('Hiss! I am compiling Kernel! Do not disturb.'); }}
                >
                  <AnimatePresence mode="wait">
                    <motion.pre
                      key={chaosMode ? 'chaos' : petMood}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-mono text-[10px] md:text-[11px] leading-snug text-center text-[#D8D8D1]"
                    >
                      {chaosMode ? asciiFrames.chaos : asciiFrames[petMood]}
                    </motion.pre>
                  </AnimatePresence>
                </div>
                
                <div className="w-full">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={speech}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-[#A9A9A2] text-[11px] font-light mb-4 font-mono min-h-[2rem]"
                    >
                      {speech}
                    </motion.p>
                  </AnimatePresence>
                  
                  <div className="flex items-center gap-3 border-b border-[#333330] pb-2">
                    <span className="font-mono text-[10px] text-[#A9A9A2]">root@terminal:~$</span>
                    <input
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      onKeyDown={handleCommand}
                      placeholder="Type 'help'..."
                      className="flex-1 bg-transparent border-none outline-none text-white text-[11px] placeholder:text-[#A9A9A2]/50 font-mono tracking-wide"
                    />
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['hi', 'hack', 'whoami', 'clear'].map((cmd) => (
                      <button
                        key={cmd}
                        onClick={() => setCommand(cmd)}
                        onDoubleClick={() => { setCommand(cmd); handleCommand({ key: 'Enter' } as any); }}
                        className="font-mono text-[9px] text-[#A9A9A2] border border-[#333330] px-2 py-1 uppercase tracking-widest hover:text-[#F5F5F0] transition-colors"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

        </div>

        {/* ══ FOOTER ═══════════════════════════════════ */}
        <footer className="py-16 px-6 md:px-10 border-t border-[#333330]">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col gap-1 cursor-pointer group" onClick={() => setClockFormat(prev => prev === 'bin' ? 'hex' : prev === 'hex' ? 'dec' : 'bin')}>
                <span className="font-mono text-xl text-[#F5F5F0] block group-hover:text-[#4ade80] transition-colors">{timeStr || '00:00:00'}</span>
                <span className="font-mono text-[9px] text-[#A9A9A2] uppercase tracking-widest block">
                  SYS_TIME [{clockFormat.toUpperCase()}] - CLICK TO CYCLE FORMAT
                </span>
              </div>
            
          
              <button
                onClick={() => setIsDestructing(true)}
                className="flex items-center gap-3 px-5 py-2.5 border border-[#333330] text-[10px] font-mono uppercase tracking-widest text-[#A9A9A2] hover:text-red-500 hover:border-red-500 hover:bg-red-950/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all group"
              >
                <span className="text-red-500 group-hover:animate-pulse">?</span>
                execute(wipe_data.sh)
              </button>
            </div>
        </footer>

        
      
        {/* SELF DESTRUCT OVERLAY */}
        <AnimatePresence>
          {isDestructing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 z-[999999] bg-red-950 flex flex-col items-center justify-center pointer-events-auto overflow-hidden"
            >
              {/* Scanlines and intense noise */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay"></div>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.3) 2px, rgba(255,0,0,0.3) 4px)' }}></div>
              
              <motion.h1 
                animate={{ x: [-10, 10, -10, 10, 0], y: [-5, 5, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                className="text-5xl md:text-8xl font-['VT323',_monospace] text-white tracking-widest uppercase drop-shadow-[0_0_20px_rgba(255,0,0,1)] mix-blend-difference"
              >
                SYSTEM_FAILURE
              </motion.h1>
              <motion.p 
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-red-400 mt-4 font-mono text-sm md:text-xl tracking-[0.3em] uppercase bg-black/50 px-4 py-2"
              >
                Initiating Critical Wipe...
              </motion.p>
              
              <div className="absolute bottom-10 left-10 text-red-500 font-mono text-xs opacity-50 flex flex-col gap-1">
                {[...Array(15)].map((_, i) => (
                  <motion.div key={i} animate={{ opacity: [0, 1, 0] }} transition={{ delay: i * 0.1, duration: 0.2, repeat: Infinity }}>
                    &gt; Deleting sector 0x00{i}F{i * 2}A...
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </>
  );
}
