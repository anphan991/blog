'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

import { Cookie, Bug, Zap, Mail, Github, Twitter, Gamepad2, FileText, Cpu, FolderTree, Radar, Network } from 'lucide-react';
import HackerText from '@/components/HackerText';
import TiltCard from '@/components/TiltCard';
import MagneticWrapper from '@/components/MagneticWrapper';
import CyberChat from '@/components/CyberChat';
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
  const [isBooting, setIsBooting] = useState(true);
  const [openWindows, setOpenWindows] = useState({
    manifesto: false,
    archive: false,
    works: false,
    topic: false,
    connect: false
  });

    
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const [maximized, setMaximized] = useState<Record<string, boolean>>({});
  const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});

  
  const rndRefs = {
    manifesto: useRef<any>(null),
    archive: useRef<any>(null),
    works: useRef<any>(null),
    topic: useRef<any>(null),
    connect: useRef<any>(null)
  };

  const zoomWindow = (key: keyof typeof rndRefs) => {
    const ref = rndRefs[key].current;
    if (ref) {
      ref.updatePosition({ x: window.innerWidth / 2 - 325, y: window.innerHeight / 2 - 250 });
      ref.updateSize({ width: 650, height: 500 });
    }
  };

  const toggleMaximize = (key: string) => {
    setMaximized(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const refreshWindow = (key: string) => {
    setRefreshKeys(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const toggleWindow = (key: keyof typeof openWindows, force?: boolean) => {
    setOpenWindows(prev => ({
      ...prev,
      [key]: force !== undefined ? force : !prev[key]
    }));
  };

  const [typedTitle, setTypedTitle] = useState({ line1: '', line2: '', cursorLine: 1 });

  useEffect(() => {
    const text1 = "ALL PANELS ARE FULLY DRAGGABLE AND RESIZABLE";
    const text2 = "ENGAGE WITH WINDOW CONTROLS TO MANAGE WORKSPACES.";
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
  const [speech, setSpeech] = useState('System online. Awaiting orders,... ðŸˆ');
  const [command, setCommand] = useState('');
  const asciiFrames = {
    chill: `  |\\__/,|   (\`\\ \n _.0-0._ |  _) ) \n_(_(_/-(_(_/  `,
    happy: `  /\\_/\\  \n ( ^.^ )  *purr*\n  > ~ <   `,
    hack:  `  /\\_/\\   [ðŸ˜Ž] \n ( -.- )  [SSH]\n  > ^ <   [BUSY]`,
    angry: `  /\\_/\\  \n ( >_< )  *HISS!\n  vv vv  `,
    shield:`  /\\_/\\   [ðŸ›¡ï¸]\n ( o.o )  [SEC]\n  > ^ <   `,
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
      coffee:  () => { setPetMood('happy');  setSpeech('System injected! Compile speed +50%... â˜•'); },
      feed:    () => { setPetMood('happy');  setSpeech('System injected! Compile speed +50%... â˜•'); },
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

  // â”€â”€ INIT KHZ DOM EFFECTS â”€â”€
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
      <main className="h-screen w-screen overflow-hidden relative bg-[#02020a]">

      {/* BOOT SCREEN */}
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
            <div className="noise-overlay opacity-50"></div>
            
            <div className="z-10 text-center flex flex-col items-center max-w-2xl px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mb-8"
              >
                <div className="w-16 h-16 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin mx-auto mb-6"></div>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="text-cyan-400 font-['Share_Tech_Mono',_monospace] text-xl md:text-2xl mb-4 tracking-widest uppercase"
              >
                STASIS TERMINATED
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 1.5 }}
                className="text-slate-300 font-['Share_Tech_Mono',_monospace] text-sm md:text-base tracking-[0.2em] leading-relaxed"
              >
                <p>WAKE UP...</p>
                <p className="mt-2 text-cyan-200">YOU HAVE BEEN DREAMING FOR FAR TOO LONG.</p>
              </motion.div>
              
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 3.5, ease: "linear" }}
                className="w-full h-[1px] bg-cyan-800 mt-12 origin-left relative"
              >
                <div className="absolute top-0 left-0 h-full bg-cyan-400 w-[20%] animate-ping"></div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 0.5, duration: 1.5, repeat: Infinity }}
                className="text-[10px] text-cyan-600 font-['Share_Tech_Mono',_monospace] mt-2 tracking-widest uppercase"
              >
                INITIALIZING REALITY MODULES
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


        
        {/* Interactive network particles */}
        <NetworkParticles />

        {/* 3D Wireframes Parallax */}
        <ParallaxWireframes />

        {/* Chaos grid bg */}
        <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000
          ${chaosMode ? 'opacity-20 bg-[radial-gradient(circle_at_2px_2px,#ef4444_1px,transparent_0)] bg-[size:24px_24px]' : 'opacity-0'}`}
        />

        {/* â•â• NAVIGATION â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        

        {/* â•â• HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div className="hero-desktop-bg absolute inset-0 z-0 pointer-events-none">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img src="/pic1.jpg" alt="Hero Background" className="w-full h-auto object-cover opacity-50 select-none pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent mix-blend-multiply"></div>
          </div>
          
          <div className="hero__content absolute bottom-12 md:bottom-24 left-8 md:left-16 lg:left-24 z-10 flex flex-col items-start text-left w-full">
            <motion.h1 
              className="hero__title font-['Share_Tech_Mono',_monospace] text-[#22d3ee] [text-shadow:0_0_30px_rgba(34,211,238,0.4)] text-[2rem] md:text-[3.5rem] leading-[0.85] tracking-tight uppercase"
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
                className="block uppercase tracking-[0.2em] text-[8px] md:text-[9px] text-[#22d3ee] font-[\'Share_Tech_Mono\',_monospace]"
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
            <div className="rotate-90 origin-right text-[7px] tracking-[0.25em] text-[#22d3ee] whitespace-nowrap uppercase font-[\'Share_Tech_Mono\',_monospace]">
              \\\\\
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-12 md:bottom-24 right-8 md:right-16 z-10 flex items-center gap-4">
            <span className="text-[9px] uppercase tracking-[0.28em] text-[#22d3ee] font-['Share_Tech_Mono',_monospace]">Am I dreaming?</span>
            <div className="w-16 h-[1px] bg-cyan-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-400 origin-left" style={{ animation: 'scanLineX 2s infinite' }}></div>
            </div>
          </div>
        </div>

<div className="desktop-windows absolute inset-0 z-10 pointer-events-none ">
          <div className="absolute top-12 left-12 flex flex-col gap-8 z-0 pointer-events-auto">
            <button onClick={() => toggleWindow('manifesto', true)} className="flex flex-col items-center gap-2 group outline-none hover:scale-110 transition-transform">
              <FileText size={52} strokeWidth={1} className="text-cyan-500/70 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="text-[10px] md:text-sm font-['Share_Tech_Mono',_monospace] bg-black/50 text-[#22d3ee] px-2 py-1 group-hover:bg-[#22d3ee] group-hover:text-black">MANIFESTO.TXT</span>
            </button>
            <button onClick={() => toggleWindow('archive', true)} className="flex flex-col items-center gap-2 group outline-none hover:scale-110 transition-transform">
              <Cpu size={52} strokeWidth={1} className="text-cyan-500/70 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="text-[10px] md:text-sm font-['Share_Tech_Mono',_monospace] bg-black/50 text-[#22d3ee] px-2 py-1 group-hover:bg-[#22d3ee] group-hover:text-black">ARCHIVE.EXE</span>
            </button>
            <button onClick={() => toggleWindow('works', true)} className="flex flex-col items-center gap-2 group outline-none hover:scale-110 transition-transform">
              <FolderTree size={52} strokeWidth={1} className="text-cyan-500/70 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="text-[10px] md:text-sm font-['Share_Tech_Mono',_monospace] bg-black/50 text-[#22d3ee] px-2 py-1 group-hover:bg-[#22d3ee] group-hover:text-black">WORKS.DIR</span>
            </button>
            <button onClick={() => toggleWindow('topic', true)} className="flex flex-col items-center gap-2 group outline-none hover:scale-110 transition-transform">
              <Radar size={52} strokeWidth={1} className="text-cyan-500/70 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="text-[10px] md:text-sm font-['Share_Tech_Mono',_monospace] bg-black/50 text-[#22d3ee] px-2 py-1 group-hover:bg-[#22d3ee] group-hover:text-black">SOC_LAB.EXE</span>
            </button>
            <button onClick={() => toggleWindow('connect', true)} className="flex flex-col items-center gap-2 group outline-none hover:scale-110 transition-transform">
              <Network size={52} strokeWidth={1} className="text-cyan-500/70 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="text-[10px] md:text-sm font-['Share_Tech_Mono',_monospace] bg-black/50 text-[#22d3ee] px-2 py-1 group-hover:bg-[#22d3ee] group-hover:text-black">CONNECT.BAT</span>
            </button>
          </div>

          
          {/* â•â• MANIFESTO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <Rnd ref={rndRefs.manifesto} key={`window-manifesto-${refreshKeys["manifesto"] || 0}`} 
            default={{ x: 250, y: 60, width: 360, height: 270 }}
            minWidth={200}
            minHeight={150}
            bounds="parent"
            dragHandleClassName="section-label"
             className={`z-10 hover:z-50 shadow-2xl transition-opacity duration-200 ${!openWindows.manifesto ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto visible'}`}>
            <section id="sec-manifesto" className="ms-section bg-[#030310] w-full h-full" style={{ resize: 'none' }}>
              <div className="section-label flex justify-between w-full">
                <span>Manifesto</span>
                <div className="flex gap-4 text-[14px] tracking-widest">
                  <button className="hover:text-white" onClick={() => refreshWindow('manifesto')} title="Refresh">R</button>
                  <button className="hover:text-white" onClick={() => zoomWindow('manifesto')} title="Maximize">[ ]</button>
                  <button className="hover:text-white" onClick={() => toggleWindow('manifesto', false)} title="Close">X</button>
                </div>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
              
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}
                className="md:col-span-3 flex flex-col gap-10"
              >
                <div className="flex flex-col gap-4 items-start">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 border border-[#22d3ee] text-[9px] uppercase tracking-widest font-['Share_Tech_Mono',_monospace] text-[#22d3ee]">
                      Copy-Paste Architect
                    </span>
                    <button
                      className={`px-3 py-1 border text-[9px] uppercase tracking-widest font-['Share_Tech_Mono',_monospace] transition-all duration-300 cursor-pointer ${bsodState ? 'bg-white text-black border-white' : 'border-[#22d3ee] text-[#22d3ee] hover:border-[#D8D8D1] hover:text-[#22d3ee]'}`}
                      onClick={handleStatusClick}
                    >
                      {bsodState ? 'ERROR: 418' : 'Professional Googler'}
                    </button>
                  </div>
                  
                  <motion.button
                    suppressHydrationWarning
                    onMouseEnter={handleHireHover}
                    onMouseLeave={() => setRunawayPos({ x: 0, y: 0 })}
                    onClick={() => { if (!chaosMode) alert('Báº¯t Ä‘Æ°á»£c rá»“iii! ðŸ§'); }}
                    animate={{ x: runawayPos.x, y: runawayPos.y }}
                    transition={{ type: 'spring', stiffness: 350, damping: 12 }}
                    className="cta-link cta-link--ghost relative z-20 border border-[#22d3ee] text-center mt-6"
                    style={{ display: 'inline-block' }}
                  >
                    Hire Me?
                  </motion.button>
                </div>
                
                {/* Khung áº£nh bÃªn trÃ¡i dÆ°á»›i chá»¯ Hire Me */}
                <div className="mt-auto pt-16 hidden md:block w-full">
                  <img src="/meme5.jpg" alt="Left Image" className="w-full aspect-square object-cover border border-[#22d3ee] rounded-sm opacity-100" />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 }}
                className="md:col-span-9 relative"
              >
                {/* Khung nhÃ£n gÃ³c trÃªn bÃªn pháº£i */}
                <div className="absolute top-0 right-0 hidden md:flex flex-col items-end gap-2 z-10">
                  <span className="px-3 py-1 border border-[#22d3ee] text-[9px] uppercase tracking-widest font-['Share_Tech_Mono',_monospace] text-[#22d3ee]">
                    SYS.STATUS: ONLINE
                  </span>
                  <span className="px-3 py-1 border border-[#22d3ee] text-[9px] uppercase tracking-widest font-['Share_Tech_Mono',_monospace] text-[#22d3ee]">
                    CAFFEINE: 99%
                  </span>
                  <span className="px-3 py-1 border border-[#22d3ee] text-[9px] uppercase tracking-widest font-['Share_Tech_Mono',_monospace] text-[#22d3ee]">
                    SLEEP: DEPRIVED
                  </span>
                </div>
                {bsodState && (
                  <div className="border border-white/20 p-6 font-['Share_Tech_Mono',_monospace] text-xs mb-8 bg-white/5">
                    <p className="scroll-reveal-line">System Crash</p>
                    <p className="scroll-reveal-line">An exception 0E has occurred at 0xDEADBEEF.</p>
                    <p className="scroll-reveal-line" onClick={() => setBsodState(false)}>
                      â€º Reboot System
                    </p>
                  </div>
                )}
                
                <h2 className="split-lines scroll-reveal-line font-['VT323',_monospace] text-[clamp(2rem,4vw,3.5rem)] leading-[1.4] text-white font-light mb-12">
                  <span className="scroll-reveal-line" data-reveal-delay="0">InfoSec Student &amp; </span><br/>
                  <span className="scroll-reveal-line" data-reveal-delay="1">Break-stuff Enthusiast.</span><br/>
                  <span className="scroll-reveal-line italic text-[#22d3ee] text-[0.65em] inline-block pt-1" data-reveal-delay="2">Please excuse me for being antisocial.</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
                  <p className="scroll-reveal-line">
                    <span className="scroll-reveal-line" data-reveal-delay="3">Ð¯ Ð½Ðµ Ð·Ð½Ð°ÑŽ Ð¿Ð¾Ñ‡ÐµÐ¼Ñƒ ÑÑ‚Ð¾ Ñ€Ð°Ð±Ð¾Ñ‚Ð°ÐµÑ‚, Ð½Ð¾ Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°Ð¹.</span><br/>
                    <span className="scroll-reveal-line" data-reveal-delay="4">Ð¡Ð´ÐµÐ»Ð°Ð½Ð¾ Ð´Ð»Ñ ÐŸÐš â€” Ð¼Ð¾Ð±Ð¸Ð»ÐºÐ° ÑÑ‚Ð¾ Ð¿Ð¾Ð±Ð¾Ñ‡Ð½Ñ‹Ð¹ ÐºÐ²ÐµÑÑ‚.</span>
                  </p>
                  <img src="/pic2.jpg" alt="Meme 1" className="max-w-full max-h-[35vh] object-contain border border-[#22d3ee] bg-black scale-[1.15] translate-y-15" />
                </div>
              </motion.div>
            </div>


          </section></Rnd>

          {/* â•â• VISUAL ARCHIVE (MEME GRID) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <Rnd ref={rndRefs.archive} key={`window-archive-${refreshKeys["archive"] || 0}`} 
            default={{ x: 650, y: 80, width: 300, height: 330 }}
            minWidth={200}
            minHeight={150}
            bounds="parent"
            dragHandleClassName="section-label"
             className={`z-10 hover:z-50 shadow-2xl transition-opacity duration-200 ${!openWindows.archive ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto visible'}`}>
            <section id="sec-archive" className="ms-section bg-[#030310] w-full h-full" style={{ resize: 'none' }}>
              <div className="section-label flex justify-between w-full">
                <span>Visual Archive</span>
                <div className="flex gap-4 text-[14px] tracking-widest">
                  <button className="hover:text-white" onClick={() => refreshWindow('archive')} title="Refresh">R</button>
                  <button className="hover:text-white" onClick={() => zoomWindow('archive')} title="Maximize">[ ]</button>
                  <button className="hover:text-white" onClick={() => toggleWindow('archive', false)} title="Close">X</button>
                </div>
              </div>
            <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center h-auto">
              <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }} className="flex-1 h-auto w-full min-w-0 min-h-0 flex items-center justify-center">
                <img src="/p1.jpg" alt="Portrait Meme" className="max-w-full max-h-auto object-contain border border-[#22d3ee] bg-black" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.2 }} className="flex-1 flex flex-col gap-6 h-auto w-full min-w-0 min-h-0">
                <div className="flex-1 w-full min-h-0 flex items-center justify-center"><img src="/meme3.jpg" alt="Landscape Meme 1" className="max-w-full max-h-auto object-contain border border-[#22d3ee] bg-black" /></div>
                <div className="flex-1 w-full min-h-0 flex items-center justify-center"><img src="/meme4.jpg" alt="Landscape Meme 2" className="max-w-full max-h-auto object-contain border border-[#22d3ee] bg-black" /></div>
              </motion.div>
             <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.4 }} className="flex-1 h-auto w-full min-w-0 min-h-0 flex items-center justify-center">
                <img src="/p2.jpg" alt="Portrait Meme" className="max-w-full max-h-auto object-contain border border-[#22d3ee] bg-black" />
              </motion.div>

            </div>
          </section></Rnd>

          {/* â•â• SELECTED WORKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Rnd ref={rndRefs.works} key={`window-works-${refreshKeys["works"] || 0}`} 
            default={{ x: 300, y: 380, width: 360, height: 240 }}
            minWidth={200}
            minHeight={150}
            bounds="parent"
            dragHandleClassName="section-label"
             className={`z-10 hover:z-50 shadow-2xl transition-opacity duration-200 ${!openWindows.works ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto visible'}`}>
            <section id="sec-works" className="ms-section bg-[#030310] w-full h-full" style={{ resize: 'none' }}>
              <div className="section-label flex justify-between w-full">
                <span>Selected Works</span>
                <div className="flex gap-4 text-[14px] tracking-widest">
                  <button className="hover:text-white" onClick={() => refreshWindow('works')} title="Refresh">R</button>
                  <button className="hover:text-white" onClick={() => zoomWindow('works')} title="Maximize">[ ]</button>
                  <button className="hover:text-white" onClick={() => toggleWindow('works', false)} title="Close">X</button>
                </div>
              </div>
            <div className="flex flex-col">

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <TiltCard><Link href="/info-sec" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title scroll-reveal-line" data-reveal-delay="0">InfoSec Notes</h3>
                    <div className="service-item__meta mt-2 scroll-reveal-line" data-reveal-delay="1">Transition from a script kiddie to a professional overthinker.</div>
                  </div>
                  <span className="service-item__arrow">â†’</span>
                </Link></TiltCard>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <TiltCard><Link href="/blog" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title scroll-reveal-line" data-reveal-delay="0">CTF Training</h3>
                    <div className="service-item__meta mt-2 scroll-reveal-line" data-reveal-delay="1">A note dump of my CTF journey</div>
                  </div>
                  <span className="service-item__arrow">â†’</span>
                </Link></TiltCard>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <TiltCard><Link href="/projects/rfid" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title scroll-reveal-line" data-reveal-delay="0">IoT RFID Vault</h3>
                    <div className="service-item__meta mt-2 scroll-reveal-line" data-reveal-delay="1">Final chance to run it with mah G.</div>
                  </div>
                  <span className="service-item__arrow">â†’</span>
                </Link></TiltCard>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <TiltCard><a href="/free-cookie" target="_blank" rel="noopener noreferrer" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title scroll-reveal-line flex items-center gap-2">
                      Free Cookie <Cookie size={20} className="text-cyan-400 animate-pulse" />
                    </h3>
                    <div className="service-item__meta mt-2 scroll-reveal-line" data-reveal-delay="1">Totally safe. Not a rickroll. I promise.</div>
                  </div>
                  <span className="service-item__arrow">â†’</span>
                </a></TiltCard>
              </motion.div>
            </div>
          </section></Rnd>
          {/* â•â• HOME SOC LAB â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <Rnd ref={rndRefs.topic} key={`window-topic-${refreshKeys["topic"] || 0}`} 
            default={{ x: 800, y: 420, width: 330, height: 270 }}
            minWidth={200}
            minHeight={150}
            bounds="parent"
            dragHandleClassName="section-label"
             className={`z-10 hover:z-50 shadow-2xl transition-opacity duration-200 ${!openWindows.topic ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto visible'}`}>
            <section id="sec-topic" className="ms-section bg-[#030310] w-full h-full" style={{ resize: 'none' }}>
              <div className="section-label flex justify-between w-full">
                <span>Project: SOC Lab</span>
                <div className="flex gap-4 text-[14px] tracking-widest">
                  <button className="hover:text-white" onClick={() => refreshWindow('topic')} title="Refresh">R</button>
                  <button className="hover:text-white" onClick={() => zoomWindow('topic')} title="Maximize">[ ]</button>
                  <button className="hover:text-white" onClick={() => toggleWindow('topic', false)} title="Close">X</button>
                </div>
              </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start h-auto">
              
              {/* Left Info */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:col-span-4 flex flex-col gap-6"
              >
                <h3 className="font-['VT323',_monospace] text-[clamp(2.5rem,4vw,3.8rem)] leading-[1.1] font-light text-white scroll-reveal-line">
                  <span className="scroll-reveal-line" data-reveal-delay="0">Home SOC</span><br/>
                  <span className="scroll-reveal-line" data-reveal-delay="1">LAB.</span>
                </h3>
                <div className="flex gap-4 items-center mt-6">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-auto w-full rounded-full bg-[#22d3ee] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#22d3ee]"></span>
                  </span>
                  <span className="font-['Share_Tech_Mono',_monospace] text-[13px] font-semibold text-[#22d3ee] uppercase tracking-widest scroll-reveal-line" data-reveal-delay="2">
                    4 MODULES ONLINE
                  </span>
                </div>
                
                <p className="text-[#22d3ee] font-['Share_Tech_Mono',_monospace] font-light text-base mt-6 scroll-reveal-line" data-reveal-delay="3">
                  ///abcdexyzjqk 
                </p>
                
                <div className="mt-10 border-l-2 border-[#22d3ee] pl-6 font-['Share_Tech_Mono',_monospace] text-[13px] text-[#22d3ee] uppercase tracking-[0.15em] flex flex-col gap-4">
                  <p className="scroll-reveal-line" data-reveal-delay="4">â€º Stack: Wazuh</p>
                  <p className="scroll-reveal-line" data-reveal-delay="5">â€º Status: Deploying</p>
                  <p className="scroll-reveal-line" data-reveal-delay="6">â€º Access: Classified</p>
                </div>

                <p className="mt-8 font-['Share_Tech_Mono',_monospace] text-sm text-[#333330] tracking-widest scroll-reveal-line" data-reveal-delay="7">
                  |||||
                </p>

              </motion.div>

              {/* Right Terminal List */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="lg:col-span-8 bg-[#02020a] border border-[#22d3ee] flex flex-col font-['Share_Tech_Mono',_monospace] text-sm h-auto max-h-[600px]"
              >
                {/* Terminal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#22d3ee] bg-black">
                  <span className="text-[#22d3ee] text-sm">~/projects/home-soc-lab</span>
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
                    <TiltCard key={i}><a href={`/soc-lab/${file.replace('.md', '')}`} className="flex justify-between items-center py-4 border-b border-[#111111] hover:bg-[#02020a] transition-colors group cursor-pointer px-4">
                      <span className="flex gap-5 items-center">
                        <span className="text-[#333330] group-hover:text-[#22d3ee] text-sm">[{String(i+1).padStart(2, '0')}]</span>
                        <span className="text-[#22d3ee] group-hover:text-white transition-colors text-base">{file}</span>
                      </span>
                      <span className="text-[#333330] group-hover:text-[#22d3ee] transition-colors text-sm">
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
          </section></Rnd>

          {/* â•â• CONNECT & ASCII COMPANION â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <Rnd ref={rndRefs.connect} key={`window-connect-${refreshKeys["connect"] || 0}`} 
            default={{ x: 400, y: 660, width: 654, height: 180 }}
            minWidth={200}
            minHeight={150}
            bounds="parent"
            dragHandleClassName="section-label"
             className={`z-10 hover:z-50 shadow-2xl transition-opacity duration-200 ${!openWindows.connect ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto visible'}`}>
            <section id="sec-connect" className="ms-section bg-[#030310] w-full h-full" style={{ resize: 'none' }}>
              <div className="section-label flex justify-between w-full">
                <span>Connect & Companion</span>
                <div className="flex gap-4 text-[14px] tracking-widest">
                  <button className="hover:text-white" onClick={() => refreshWindow('connect')} title="Refresh">R</button>
                  <button className="hover:text-white" onClick={() => zoomWindow('connect')} title="Maximize">[ ]</button>
                  <button className="hover:text-white" onClick={() => toggleWindow('connect', false)} title="Close">X</button>
                </div>
              </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Connect part */}
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}
                className="lg:col-span-7"
              >
                <h2 className="split-lines scroll-reveal-line font-['VT323',_monospace] text-[clamp(2.5rem,5vw,6.5rem)] leading-[1.5] text-white font-light mb-12 pb-6"
                  style={{
                    textShadow: `
                      1px 1px 0 rgba(34,211,238,0.4),
                      2px 2px 0 rgba(34,211,238,0.35),
                      3px 3px 0 rgba(34,211,238,0.3),
                      4px 4px 0 rgba(34,211,238,0.25),
                      5px 5px 0 rgba(34,211,238,0.2),
                      6px 6px 0 rgba(34,211,238,0.15),
                      7px 7px 0 rgba(34,211,238,0.1),
                      8px 8px 0 rgba(34,211,238,0.08),
                      0 0 60px rgba(34,211,238,0.15),
                      0 0 120px rgba(34,211,238,0.08)
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
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 }}
                className="lg:col-span-5 flex flex-col items-center"
              >
                <div 
                  className="w-full flex flex-col items-center justify-center h-48 border border-[#22d3ee] cursor-pointer transition-all hover:border-[#D8D8D1] bg-black mb-6"
                  onClick={() => { setPetMood('angry'); setSpeech('Hiss! I am compiling Kernel! Do not disturb.'); }}
                >
                  <AnimatePresence mode="wait">
                    <motion.pre
                      key={chaosMode ? 'chaos' : petMood}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-['Share_Tech_Mono',_monospace] text-[10px] md:text-[11px] leading-snug text-center text-[#22d3ee]"
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
                      className="text-[#22d3ee] text-[11px] font-light mb-4 font-['Share_Tech_Mono',_monospace] min-h-[2rem]"
                    >
                      {speech}
                    </motion.p>
                  </AnimatePresence>
                  
                  <div className="flex items-center gap-3 border-b border-[#22d3ee] pb-2">
                    <span className="font-['Share_Tech_Mono',_monospace] text-[10px] text-[#22d3ee]">root@terminal:~$</span>
                    <input
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      onKeyDown={handleCommand}
                      placeholder="Type 'help'..."
                      className="flex-1 bg-transparent border-none outline-none text-white text-[11px] placeholder:text-[#22d3ee]/50 font-['Share_Tech_Mono',_monospace] tracking-wide"
                    />
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['hi', 'hack', 'whoami', 'clear'].map((cmd) => (
                      <button
                        key={cmd}
                        onClick={() => setCommand(cmd)}
                        onDoubleClick={() => { setCommand(cmd); handleCommand({ key: 'Enter' } as any); }}
                        className="font-['Share_Tech_Mono',_monospace] text-[9px] text-[#22d3ee] border border-[#22d3ee] px-2 py-1 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section></Rnd>

        </div>

        {/* â•â• FOOTER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        

        <CyberChat />
      </main>
    </>
  );
}


















