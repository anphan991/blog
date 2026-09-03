'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Bug, Zap, Mail, Github, Twitter, Gamepad2 } from 'lucide-react';
import CyberChat from '@/components/CyberChat';
import NetworkParticles from '@/components/NetworkParticles';
import ParallaxWireframes from '@/components/ParallaxWireframes';

const EASE_OUT = [0.16, 1, 0.3, 1] as [number, number, number, number];






// MAIN PAGE
// ==========================================
export default function Home() {
  const [chaosMode, setChaosMode] = useState(false);
  const [runawayPos, setRunawayPos] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [bsodState, setBsodState] = useState(false);
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

    return () => {
      window.removeEventListener('scroll', handleScrollNav);
      window.removeEventListener('scroll', handleScrollHero);
      clearInterval(bgInterval);
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
            <div className="hidden md:flex gap-6 text-[11px] uppercase tracking-widest text-green-600 font-mono">
              <a href="https://github.com/anphan991" target="_blank" rel="noopener noreferrer" className="hover:text-[#4ade80] transition-colors duration-300">GitHub</a>
              <a href="https://x.com/TezD991" target="_blank" rel="noopener noreferrer" className="hover:text-[#4ade80] transition-colors duration-300">Twitter</a>
              <a href="mailto:an0915129080@gmail.com" className="hover:text-[#4ade80] transition-colors duration-300">Mail</a>
            </div>
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
          <section className="ms-section">
            <div className="section-label">Manifesto</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
              
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}
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
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 }}
                className="md:col-span-9"
              >
                {bsodState && (
                  <div className="border border-white/20 p-6 font-mono text-xs mb-8 bg-white/5">
                    <p className="bg-white text-black w-fit px-2 mb-3 font-bold text-[10px] uppercase tracking-widest">System Crash</p>
                    <p className="text-white/70">An exception 0E has occurred at 0xDEADBEEF.</p>
                    <p className="mt-4 text-white/50 cursor-pointer hover:text-white transition-colors" onClick={() => setBsodState(false)}>
                      › Reboot System
                    </p>
                  </div>
                )}
                
                <h2 className="split-lines font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[1.1] text-white font-light mb-12">
                  InfoSec Student & <br/>
                  Break-stuff Enthusiast.<br/>
                  <span className="italic text-[#A9A9A2]">Please excuse me for being antisocial.</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <p className="text-[#A9A9A2] font-sans font-light text-lg">
                    Я не знаю почему это работает, но не трогай.<br/>
                    Сделано для ПК — мобилка это побочный квест.
                  </p>
                  <img src="/meme1.jpg" alt="Meme 1" className="max-w-full max-h-[35vh] object-contain border border-[#333330] bg-[#0A0A0A]" />
                </div>
              </motion.div>
            </div>
          </section>

          {/* ══ VISUAL ARCHIVE (MEME GRID) ═══════════════ */}
          <section className="ms-section">
            <div className="section-label">Visual Archive</div>
            <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center h-[75vh]">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }} className="flex-1 h-full w-full min-w-0 min-h-0 flex items-center justify-center">
                <img src="/meme2.jpg" alt="Portrait Meme" className="max-w-full max-h-full object-contain border border-[#333330] bg-[#0A0A0A]" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.1 }} className="flex-1 flex flex-col gap-6 h-full w-full min-w-0 min-h-0">
                <div className="flex-1 w-full min-h-0 flex items-center justify-center"><img src="/meme3.jpg" alt="Landscape Meme 1" className="max-w-full max-h-full object-contain border border-[#333330] bg-[#0A0A0A]" /></div>
                <div className="flex-1 w-full min-h-0 flex items-center justify-center"><img src="/meme4.jpg" alt="Landscape Meme 2" className="max-w-full max-h-full object-contain border border-[#333330] bg-[#0A0A0A]" /></div>
              </motion.div>
            </div>
          </section>

          {/* ══ SELECTED WORKS ───────────────────────── */}
          <section className="ms-section">
            <div className="section-label">Selected Works</div>
            
            <div className="flex flex-col">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <Link href="/blog" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title">CTF Training</h3>
                    <div className="service-item__meta mt-2">A note dump of my CTF journey</div>
                  </div>
                  <span className="service-item__arrow">→</span>
                </Link>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <Link href="/projects/rfid" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title">IoT RFID Vault</h3>
                    <div className="service-item__meta mt-2">Final chance to run it with mah G.</div>
                  </div>
                  <span className="service-item__arrow">→</span>
                </Link>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <Link href="/info-sec" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title">InfoSec Notes</h3>
                    <div className="service-item__meta mt-2">Transition from a script kiddie to a professional overthinker.</div>
                  </div>
                  <span className="service-item__arrow">→</span>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <a href="/free-cookie" target="_blank" rel="noopener noreferrer" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title">Free Cookie {chaosMode ? '☢️' : '🍪'}</h3>
                    <div className="service-item__meta mt-2">Totally safe. Not a rickroll. I promise.</div>
                  </div>
                  <span className="service-item__arrow">→</span>
                </a>
              </motion.div>
            </div>
          </section>

                    {/* ══ CONNECT & ASCII COMPANION ═════════════════════════ */}
          <section className="ms-section pb-0">
            <div className="section-label">Connect & Companion</div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Connect part */}
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}
                className="lg:col-span-7"
              >
                <h2 className="contact-heading split-lines mb-12">
                  Let's break things<br/>
                  <span className="italic">together.</span>
                </h2>
                <div className="cta-row">
                  <a href="mailto:an0915129080@gmail.com" className="cta-link">Email</a>
                  <a href="https://github.com/anphan991" target="_blank" rel="noopener noreferrer" className="cta-link">GitHub</a>
                  <a href="https://x.com/TezD991" target="_blank" rel="noopener noreferrer" className="cta-link">Twitter</a>
                </div>
              </motion.div>

              {/* ASCII Companion (Smaller) */}
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 }}
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
            <div>
              <span className="font-serif text-xl text-[#F5F5F0] block">||||||||||</span>
              <span className="font-mono text-[9px] text-[#A9A9A2] uppercase tracking-widest mt-1 block">© 2026 — All rights reserved.</span>
            </div>
            <button
              onClick={() => setChaosMode(!chaosMode)}
              className="flex items-center gap-3 px-5 py-2.5 border border-[#333330] text-[10px] font-mono uppercase tracking-widest text-[#A9A9A2] hover:text-[#F5F5F0] hover:border-[#D8D8D1] transition-all"
            >
              {chaosMode ? <Bug size={14} /> : <Zap size={14} />}
              {chaosMode ? 'Deactivate Chaos' : 'Optimize Code ×10'}
            </button>
          </div>
        </footer>

        <CyberChat />
      </main>
    </>
  );
}
