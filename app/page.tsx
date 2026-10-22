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
import { triggerAura } from '@/components/BrainrotSuite';

const EASE_OUT = [0.16, 1, 0.3, 1] as [number, number, number, number];

function HeroTypewriter() {
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
          timeout = setTimeout(tick, 2000);
        }
      } else if (phase === 2) {
        phase = 3;
        timeout = setTimeout(tick, 100);
      } else if (phase === 3) {
        if (j > 0) {
          current2 = current2.slice(0, -1);
          setTypedTitle({ line1: current1, line2: current2, cursorLine: 2 });
          j--;
          timeout = setTimeout(tick, 50);
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
          timeout = setTimeout(tick, 800);
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

  return (
    <motion.h1 
      className="hero__title font-mono text-[#3B82F6] [text-shadow:0_0_30px_rgba(59,130,246,0.45)] text-[clamp(4rem,12vw,12rem)] leading-[0.85] tracking-tight uppercase"
    >
      <span className="hero__line block">
        {typedTitle.line1}{typedTitle.cursorLine === 1 && <span className="animate-pulse">/</span>}
      </span>
      <span className="hero__line block italic">
        {typedTitle.line2}{typedTitle.cursorLine === 2 && <span className="animate-pulse">/</span>}
      </span>
    </motion.h1>
  );
}

function FooterClock() {
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

  return (
    <div className="flex flex-col gap-1 cursor-pointer group" onClick={() => setClockFormat(prev => prev === 'bin' ? 'hex' : prev === 'hex' ? 'dec' : 'bin')}>
      <span className="font-mono text-xl text-[#F5F5F0] block group-hover:text-[#3B82F6] transition-colors">{timeStr || '00:00:00'}</span>
      <span className="font-mono text-[9px] text-[#A9A9A2] uppercase tracking-widest block">
        SYS_TIME [{clockFormat.toUpperCase()}] - CLICK TO CYCLE FORMAT
      </span>
    </div>
  );
}

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

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isDestructing, setIsDestructing] = useState(false);
  const [activeBulletinIdx, setActiveBulletinIdx] = useState(4);
  const [isTimelineOpen, setIsTimelineOpen] = useState(true);
  const [egovTampered, setEgovTampered] = useState(false);

  const RELEASES = [
    {
      id: 'works',
      short: 'Selected Works',
      title: 'Archive',
      date: 'MAR-15',
      isLatest: false,
      summary: 'Just yapping btw',
      targetId: 'sec-works',
      href: '/info-sec',
      updates: [
        { date: 'MAY-21', note: 'Auth & Access Control' },
        { date: 'MAY-14', note: 'Malware 101' },
        { date: 'MAY-10', note: 'Software Security 101' },
        { date: 'MAY-06', note: 'Cryptography 101' },
        { date: 'MAR-29', note: 'CTF Day 3' },
        { date: 'MAR-22', note: 'CTF Day 2' },
        { date: 'MAR-15', note: 'CTF Day 1' },
      ],
    },
    {
      id: 'rfid',
      short: 'IoT RFID Vault',
      title: 'IoT RFID Vault',
      date: '10-20',
      isLatest: false,
      summary: 'An automated IoT Attendance System using ESP32, RFID, and FastAPI.',
      targetId: 'sec-rfid',
      href: '/projects/rfid',
      updates: [
        { date: 'OCT-10', note: 'Rebuilt this section' },
        { date: 'FEB-28', note: 'Initial section' },
      ],
    },
    {
      id: 'egov',
      short: 'e-Gov Signature',
      title: 'Applied Crypto: e-Gov Signature',
      date: 'JUL-14',
      isLatest: false,
      summary: 'Zero-Trust PAdES digital signing infrastructure with SoftHSM2, OCSP, and WORM audit chain.',
      targetId: 'sec-egov',
      href: '/projects/e-gov',
      updates: [
        { date: 'JUL-14', note: 'PAdES-B-LT, OCSP Kill-Switch & WORM ledger' },
        { date: 'MAY-29', note: 'Initial PKCS#11 SoftHSM2 & mTLS gateway' },
      ],
    },
    {
      id: 'soc',
      short: 'WAZUH',
      title: 'WAZUH',
      date: 'OCT-09',
      isLatest: false,
      summary: 'Multi-layer Cyber Kill Chain detection lab with Wazuh SIEM, Suricata IDS, ModSecurity WAF, and FIM.',
      targetId: 'sec-topic',
      href: '/soc-lab/05-recon-web-waf-wazuh',
      updates: [
        { date: 'OCT-09', note: 'Recon, Web, WAF & Wazuh Kill Chain Lab' },
        { date: 'AUG-18', note: 'Initial' },
      ],
    },
    {
      id: 'embedded',
      short: 'Embedded System',
      title: 'Embedded System: FallGuard',
      date: 'OCT-09',
      isLatest: true,
      summary: 'Private monitoring for older adults living alone',
      targetId: 'sec-fallguard',
      href: '/projects/fallguard',
      updates: [
        { date: 'OCT-09', note: 'New section released' },
      ],
    },
  ];
  const activeRelease = RELEASES[activeBulletinIdx] || RELEASES[RELEASES.length - 1];
  const jumpToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (isDestructing) {
      const timer = setTimeout(() => {
        window.location.href = "/free-cookie?auto=1";
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isDestructing]);

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
      hi:      () => { setPetMood('happy');  setSpeech('Hello! Systems are 100% green today.'); triggerAura(100, 'Chào hỏi mèo lịch sự (+100 Aura)', '🐈'); },
      hello:   () => { setPetMood('happy');  setSpeech('Hello! Systems are 100% green today.'); triggerAura(100, 'Chào hỏi mèo lịch sự (+100 Aura)', '🐈'); },
      coffee:  () => { setPetMood('happy');  setSpeech('System injected! Compile speed +50%... ☕'); triggerAura(250, 'Cho mèo uống cà phê: Tốc độ gõ phím +50%!', '☕'); },
      feed:    () => { setPetMood('happy');  setSpeech('System injected! Compile speed +50%... ☕'); triggerAura(250, 'Đã cho mèo ăn pate!', '🐟'); },
      hack:    () => { setPetMood('hack');   setSpeech('Bypassing firewall... Please wait for the Flag.'); triggerAura(500, 'Đang chạy script pháp sư vượt tường lửa...', '💻'); },
      pwn:     () => { setPetMood('hack');   setSpeech('Bypassing firewall... Please wait for the Flag.'); triggerAura(500, 'Root shell acquired!', '🚩'); },
      shield:  () => { setPetMood('shield'); setSpeech('Shields UP! Monitoring for suspicious packets.'); triggerAura(300, 'Đã bật khiên chống rớt môn!', '🛡️'); },
      secure:  () => { setPetMood('shield'); setSpeech('Shields UP! Monitoring for suspicious packets.'); },
      brainrot:() => { setPetMood('dance');  setSpeech('Deploying Subway Surfers focus module... 🧠'); window.dispatchEvent(new CustomEvent('toggle-brainrot')); },
      skibidi: () => { setPetMood('dance');  setSpeech('Brainrot level: MAXIMUM OVERDRIVE 🗿'); triggerAura(777, 'Phát hiện từ khóa cấm! +777 Aura vô tri', '🗿'); },
      whoami:  () => { setSpeech('You are the Admin. I am your Loyal Cyber-Companion.'); },
      status:  () => { setSpeech('CPU: Chill | Mood: Stable | Hunger: Coffee_Required'); },
      help:    () => { setSpeech('Try: hi, coffee, hack, shield, brainrot, skibidi, whoami, clear'); },
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
        <style>{`
          .service-item:hover .service-item__title {
            font-style: italic;
            color: #3B82F6 !important;
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.35) !important;
          }
          .service-item:hover .service-item__arrow {
            transform: translate(4px, -4px);
            color: #3B82F6 !important;
          }
          .scroll-reveal-line.is-bright.service-item__title {
            color: #3B82F6 !important;
          }
          html.light-theme {
            --light-bg: #D8D3C8;
            --light-bg-2: #E2DDD3;
            --light-bg-3: #CEC8BC;
            --light-text: #1C1B18;
            --light-text-2: #524F49;
            --light-border: #BEB7AA;
            --light-accent: #234E70;
            background-color: var(--light-bg) !important;
          }
          html.light-theme .hero img {
            filter: invert(1) contrast(1.08) !important;
            mix-blend-mode: multiply !important;
            opacity: 0.36 !important;
          }
          html.light-theme .hero .bg-gradient-to-t {
            background: linear-gradient(
              to top,
              #D8D3C8 0%,
              rgba(216, 211, 200, 0.25) 45%,
              rgba(216, 211, 200, 0.45) 100%
            ) !important;
            mix-blend-mode: normal !important;
          }
          html.light-theme .hero__title {
            color: #234E70 !important;
            text-shadow: 0 8px 24px rgba(35, 78, 112, 0.14), 2px 2px 0 rgba(28, 27, 24, 0.06) !important;
          }
          html.light-theme .khz-nav:not(.is-scrolled) {
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border-bottom-color: transparent !important;
          }
          html.light-theme .khz-nav.is-scrolled {
            background: rgba(216, 211, 200, 0.62) !important;
            backdrop-filter: blur(16px) saturate(140%) !important;
            -webkit-backdrop-filter: blur(16px) saturate(140%) !important;
            border-bottom: 1px solid rgba(28, 27, 24, 0.12) !important;
          }
          html.light-theme .bg-\\[\\#070707\\],
          html.light-theme .bg-\\[\\#0B0B0B\\],
          html.light-theme .bg-\\[\\#080808\\] {
            background-color: #CEC8BC !important;
          }
          html.light-theme .hover\\:bg-\\[\\#111111\\]:hover {
            background-color: rgba(35, 78, 112, 0.1) !important;
          }
          html.light-theme .group:hover .group-hover\\:text-white {
            color: #234E70 !important;
          }
          html.light-theme .border-\\[\\#222220\\],
          html.light-theme .border-\\[\\#1A1A1A\\] {
            border-color: #BEB7AA !important;
          }
          html.light-theme .text-\\[\\#3B82F6\\],
          html.light-theme .text-blue-400,
          html.light-theme .scroll-reveal-line.is-bright.service-item__title,
          html.light-theme .service-item:hover .service-item__title {
            color: #234E70 !important;
          }
          html.light-theme .ms-section > div:not(.section-label) {
            background:
              linear-gradient(#E2DDD3, #E2DDD3) padding-box,
              conic-gradient(from var(--border-angle), #BEB7AA 20%, #2B5B84 50%, #BEB7AA 80%) border-box !important;
            box-shadow: 0 18px 42px -15px rgba(28, 27, 24, 0.1), 0 1px 3px rgba(28, 27, 24, 0.06) !important;
          }
        `}</style>
        
        {/* Interactive network particles */}
        <NetworkParticles key="blue-particles-v2" />

        {/* 3D Wireframes Parallax */}
        <ParallaxWireframes />

        {/* Chaos grid bg */}
        <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000
          ${chaosMode ? 'opacity-20 bg-[radial-gradient(circle_at_2px_2px,#ef4444_1px,transparent_0)] bg-[size:24px_24px]' : 'opacity-0'}`}
        />

        {/* ══ NAVIGATION ══════════════════════════════ */}
        <nav className="khz-nav">
          <div className="flex flex-col leading-none">
            <span className={`font-mono text-2xl tracking-wider uppercase transition-colors ${chaosMode ? 'text-red-400' : 'text-[#3B82F6]'}`}>Ka</span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-blue-400 font-mono mt-1">
              {chaosMode ? 'STATUS: COMPROMISED' : '@( * O * )@'}
            </span>
          </div>

          <div className="flex items-center gap-8">
              <div className="relative hidden md:block">
                <button 
                  onClick={() => setNavOpen(!navOpen)} 
                  className="text-[11px] uppercase tracking-widest text-blue-400 font-mono hover:text-[#3B82F6] transition-colors duration-300 flex items-center gap-2"
                >
                  [ MENU ] <span className="text-[8px]">{navOpen ? '▲' : '▼'}</span>
                </button>
                
                {navOpen && (
                  <div className="absolute top-full right-0 mt-4 bg-[#111111] border border-[#333330] p-4 flex flex-col gap-4 text-[11px] uppercase tracking-widest text-blue-400 font-mono min-w-[160px] shadow-2xl z-50">
                    <button onClick={() => { document.getElementById('sec-manifesto')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#3B82F6] transition-colors duration-300"><HackerText text="[01] MANIFESTO" /></button>
                    <button onClick={() => { document.getElementById('sec-archive')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#3B82F6] transition-colors duration-300"><HackerText text="[02] ARCHIVE" /></button>
                    <button onClick={() => { document.getElementById('sec-bulletin')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#3B82F6] transition-colors duration-300"><HackerText text="[03] INDEX" /></button>
                    <button onClick={() => { document.getElementById('sec-works')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#3B82F6] transition-colors duration-300"><HackerText text="[04] WORKS" /></button>
                    <button onClick={() => { document.getElementById('sec-rfid')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#3B82F6] transition-colors duration-300"><HackerText text="[05] RFID VAULT" /></button>
                    <button onClick={() => { document.getElementById('sec-egov')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#3B82F6] transition-colors duration-300"><HackerText text="[06] E-GOV PKI" /></button>
                    <button onClick={() => { document.getElementById('sec-topic')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#3B82F6] transition-colors duration-300"><HackerText text="[07] WAZUH" /></button>
                    <button onClick={() => { document.getElementById('sec-fallguard')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#3B82F6] transition-colors duration-300"><HackerText text="[08] FALLGUARD" /></button>
                    <button onClick={() => { document.getElementById('sec-theme')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#3B82F6] transition-colors duration-300"><HackerText text="[09] THEMES" /></button>
                    <button onClick={() => { document.getElementById('sec-connect')?.scrollIntoView({behavior: 'smooth'}); setNavOpen(false); }} className="text-left hover:text-[#3B82F6] transition-colors duration-300"><HackerText text="[10] CONNECT" /></button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => {
                  const isNowLight = document.documentElement.classList.toggle('light-theme');
                  triggerAura(
                    isNowLight ? -500 : 500,
                    isNowLight
                      ? 'FLASHBANG DEPLOYED!'
                      : 'Dark Mode. +2 mắt',
                    isNowLight ? '🔦' : '🕶️'
                  );
                }}
                className="w-8 h-8 flex items-center justify-center border border-[#333330] rounded-full text-[#A9A9A2] hover:text-[#3B82F6] hover:border-[#3B82F6] transition-all"
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
            <HeroTypewriter />
            
            <div className="mt-8 overflow-hidden">
              <motion.span 
                className="block uppercase tracking-[0.2em] text-[11px] md:text-[13px] text-[#3B82F6] font-mono"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.7 }}
              >
                {chaosMode ? 'SECURITY BREACH DETECTED' : 'YAPPING ALL DAY LONG'}
              </motion.span>
            </div>
          </div>

          {/* Right vertical text */}
          <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-10 hidden md:block">
            <div className="rotate-90 origin-right text-[10px] tracking-[0.25em] text-[#3B82F6] whitespace-nowrap uppercase font-mono">
              \\\\\
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-12 md:bottom-24 right-8 md:right-16 z-10 flex items-center gap-4">
            <span className="text-[9px] uppercase tracking-[0.28em] text-[#3B82F6] font-mono">Scroll</span>
            <div className="w-16 h-[1px] bg-blue-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-400 origin-left" style={{ animation: 'scanLineX 2s infinite' }}></div>
            </div>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24" style={{ paddingBottom: '160px' }}>
          
          {/* ══ MANIFESTO ════════════════════════════════ */}
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
                      {bsodState ? 'ERROR: 418' : 'nonchaloir'}
                    </button>
                  </div>
                  
                  <motion.button
                    suppressHydrationWarning
                    onMouseEnter={handleHireHover}
                    onMouseLeave={() => setRunawayPos({ x: 0, y: 0 })}
                    onClick={() => {
                      if (!chaosMode) {
                        triggerAura(99999, 'TÓM SỐNG DEV! Phản xạ thần sầu, gửi offer ngay thôi!', '🏆');
                        alert('Bắt được rồiii! 🐧');
                      }
                    }}
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
                  <span className="px-3 py-1 border border-[#333330] text-[9px] uppercase tracking-widest font-mono text-[#3B82F6]">
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
                  <span className="scroll-reveal-line" data-reveal-delay="0">InfoSec Student </span><br/>
                  <span className="scroll-reveal-line italic text-[#A9A9A2] text-[0.65em] inline-block pt-1" data-reveal-delay="2">Please excuse me for being weird.</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
                  {/* === CỘT TRÁI: Chứa toàn bộ chữ === */}
                  <p className="scroll-reveal-line">
                    <span className="scroll-reveal-line" data-reveal-delay="3">Я не знаю почему это работает, но не трогай.</span><br/>
                    <span className="scroll-reveal-line" data-reveal-delay="4">Сделано для ПК — мобилка это побочный квест.</span>
                    
                    <span className="scroll-reveal-line block mt-8 text-4xl md:text-5xl font-serif italic text-white" data-reveal-delay="5">
                      - May all your delulu come trululu cuz being delulu is the solulu -
                    </span>
                  </p>
                  
                  <div className="flex flex-col items-end w-full translate-y-10"> 
                    
                    <img src="/pic2.jpg" alt="Meme 1" className="max-w-full max-h-[35vh] object-contain border border-[#333330] bg-[#0A0A0A] scale-[1.15]" />
                    
                    <div className="mt-8 w-full text-right">
                    <span className="block font-mono text-[16px] text-[#A9A9A2]/60 uppercase tracking-widest">
                      The enemy cannot know your next move if u don't know it either
                    </span>
                    <span className="block font-mono text-[12px] text-[#A9A9A2]/60 tracking-widest mt-1">
                      - Lao Tzu didn't say that
                    </span>
                  </div>
                  </div>
                </div>
            </motion.div>
            </div>


          </section>

          {/* ══ VISUAL ARCHIVE (MEME GRID) ═══════════════ */}
          
            


            <section id="sec-archive" className="ms-section">
            <div className="section-label">RANDOM THINGS</div>
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

          {/* ══ SYSTEM BULLETIN // COMPACT TIMELINE WITH DROPDOWN REVISIONS ═══════════════ */}
          <section id="sec-bulletin" className="ms-section">
            <div className="section-label">Index</div>
            <div className="flex flex-col space-y-5 font-mono">
              {/* Header with clear typography */}
              <div className="flex items-baseline justify-between border-b border-[#222220] pb-3.5">
                <h3 className="font-serif text-3xl sm:text-4xl text-white font-light">
                  What&apos;s New <span className="italic text-[#3B82F6]">&amp; Updates</span>
                </h3>
                <span className="text-xs uppercase tracking-widest text-[#A9A9A2] hidden sm:inline-block">
                  Select a section to inspect
                </span>
              </div>

              {/* Unified Panel */}
              <div className="border border-[#222220] bg-[#0A0A0A] p-5 sm:p-6 space-y-5">
                {/* 5 Segmented Tabs with enhanced font size */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 border-b border-[#1A1A1A] pb-4">
                  {RELEASES.map((item, idx) => {
                    const isSelected = idx === activeBulletinIdx;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveBulletinIdx(idx)}
                        className={`p-3 text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#3B82F6] bg-[#0E1522] text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                            : 'border-[#1C1C1A] bg-[#070707] text-[#888882] hover:text-[#D8D8D1] hover:border-[#333]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`text-sm ${isSelected ? 'text-[#3B82F6] font-bold' : 'text-[#666]'}`}>
                            0{idx + 1}
                          </span>
                          <span className="text-sm sm:text-base font-semibold truncate">{item.short}</span>
                        </div>
                        {item.isLatest ? (
                          <span className="px-2 py-0.5 bg-[#3B82F6] text-black text-xs font-bold shrink-0">
                            NEW
                          </span>
                        ) : (
                          <span className="text-xs text-[#777] shrink-0 font-mono">{item.date}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Section Info + Actions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeRelease.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-3xl">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-serif text-2xl sm:text-3xl text-white font-light">
                            {activeRelease.title}
                          </span>
                          <span className="text-[#444]">·</span>
                          <span className="text-sm text-[#3B82F6] font-mono">{activeRelease.date}.2026</span>
                          {activeRelease.isLatest && (
                            <span className="px-2 py-0.5 bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/40 text-xs font-bold">
                              LATEST RELEASE
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base text-[#D8D8D1] font-sans leading-relaxed">
                          {activeRelease.summary}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                        <Link
                          href={activeRelease.href}
                          className="px-4 py-2.5 border border-[#333] bg-[#070707] hover:border-[#3B82F6] hover:text-[#3B82F6] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
                        >
                          Open →
                        </Link>
                        <button
                          type="button"
                          onClick={() => jumpToSection(activeRelease.targetId)}
                          className="px-5 py-2.5 border border-[#3B82F6] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-black text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Jump to Section ↓
                        </button>
                      </div>
                    </div>

                    {/* Dropdown Menu for Section-Specific Timeline (Managed without fake version numbers) */}
                    <div className="pt-3 border-t border-[#1A1A1A] space-y-2.5">
                      <button
                        type="button"
                        onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                        className="w-full flex items-center justify-between py-2.5 px-3.5 border border-[#222220] bg-[#080808] hover:border-[#3B82F6]/50 hover:bg-[#0D121B] transition-colors cursor-pointer text-xs sm:text-sm"
                      >
                        <span className="flex items-center gap-2 text-white font-semibold">
                          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                          <span>TIMELINE </span>
                        </span>
                        <div className="flex items-center gap-2 text-[#A9A9A2]">
                          <span className="text-xs text-[#3B82F6] font-bold">
                            {isTimelineOpen ? 'COLLAPSE' : 'EXPAND'}
                          </span>
                          <span className="text-xs">{isTimelineOpen ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {/* Dropdown Content with Scrollable Overflow for Easy Long-Term Management */}
                      <AnimatePresence>
                        {isTimelineOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="max-h-56 overflow-y-auto space-y-2 pt-1 pr-1 scrollbar-thin">
                              {activeRelease.updates.map((upd, uIdx) => (
                                <div
                                  key={`${upd.date}-${uIdx}`}
                                  className={`p-3 border text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                                    uIdx === 0
                                      ? 'border-[#3B82F6]/50 bg-[#0E1522] text-[#D8D8D1]'
                                      : 'border-[#1C1C1A] bg-[#070707] text-[#A9A9A2]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 shrink-0">
                                    <span
                                      className={`font-mono text-xs sm:text-sm font-bold px-2 py-0.5 border ${
                                        uIdx === 0
                                          ? 'border-[#3B82F6] text-[#3B82F6] bg-[#3B82F6]/10'
                                          : 'border-[#262624] text-[#A9A9A2] bg-[#111111]'
                                      }`}
                                    >
                                      {upd.date}
                                    </span>
                                    {uIdx === 0 && (
                                      <span className="text-[10px] text-[#3B82F6] font-mono font-bold tracking-wider">
                                        [LATEST]
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs sm:text-sm font-sans text-[#D8D8D1] flex-1 sm:pl-3 sm:border-l sm:border-[#222220] leading-relaxed">
                                    {upd.note}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* ══ SELECTED WORKS ───────────────────────── */}
          <section id="sec-works" className="ms-section">
            <div className="section-label">Selected Works</div>
            <div className="flex flex-col">

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                <TiltCard><Link href="/info-sec" className="service-item">
                  <div className="service-item__body">
                    <h3 className="service-item__title scroll-reveal-line" data-reveal-delay="0">Notes</h3>
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

          {/* ══ PROJECT: RFID VAULT ════════════════════════════════════════ */}
          <section id="sec-rfid" className="ms-section">
            <div className="section-label">Project: RFID Vault</div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Minimal Typography & Story */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: false, amount: 0.1 }} 
                transition={{ duration: 0.8, ease: EASE_OUT }}
                className="lg:col-span-5 flex flex-col gap-6"
              >
                <div>
                  <h3 className="font-serif text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] font-light text-white tracking-tight">
                    RFID Vault
                  </h3>
                </div>

                <p className="text-[#A9A9A2] font-mono font-light text-sm sm:text-base leading-relaxed">
                  An automated IoT Attendance System using ESP32, RFID, and FastAPI
                </p>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#A9A9A2]">
                  <span className="px-3 py-1 border border-[#222220] bg-[#0A0A0A]">
                    13.56MHz Mifare
                  </span>
                  <span className="px-3 py-1 border border-[#222220] bg-[#0A0A0A]">
                    ESP32 FreeRTOS
                  </span>
                  <span className="px-3 py-1 border border-[#222220] bg-[#0A0A0A]">
                    FastAPI Mutex
                  </span>
                </div>

                <div className="pt-2">
                  <MagneticWrapper>
                    <Link href="/projects/rfid" className="cta-link inline-block">
                      <HackerText text="Enter Project →" />
                    </Link>
                  </MagneticWrapper>
                </div>
              </motion.div>

              {/* Right Column: Tactile Matte Smart Keycard */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: false, amount: 0.1 }} 
                transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
                className="lg:col-span-7 flex justify-center"
              >
                <div className="w-full max-w-lg">
                  <TiltCard>
                    <Link
                      href="/projects/rfid"
                      className="group block relative w-full aspect-[1.586/1] bg-gradient-to-br from-[#121212] via-[#0A0A0A] to-[#050505] border border-[#2A2A28] hover:border-[#3B82F6] rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer"
                    >
                      {/* Subtle Holographic Shimmer Effect on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none group-hover:opacity-100 transition-opacity" />

                      {/* Top Row: IC Chip + Contactless Wave Icon + Frequency */}
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-3 sm:gap-4">
                          {/* Gold IC Contact Chip */}
                          <div className="w-11 h-8 rounded border border-[#856404]/70 bg-gradient-to-br from-[#d4af37]/25 via-[#aa820a]/35 to-[#5c4604]/25 relative overflow-hidden flex items-center justify-center shadow-inner">
                            <div className="absolute inset-x-0 h-[1px] bg-[#d4af37]/40" />
                            <div className="absolute inset-y-0 w-[1px] bg-[#d4af37]/40" />
                            <div className="w-4 h-3.5 border border-[#d4af37]/60 rounded-sm" />
                          </div>
                          {/* Contactless Waves */}
                          <svg className="w-5 h-5 text-[#A9A9A2] group-hover:text-[#3B82F6] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                            <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                            <path d="M10.8 13.2c-.8-.8-.8-2.1 0-2.8" />
                          </svg>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-[10px] tracking-widest text-[#A9A9A2] uppercase block">
                            MIFARE 1K
                          </span>
                          <span className="text-xs text-[#3B82F6] font-bold tracking-wider">
                            13.56 MHz
                          </span>
                        </div>
                      </div>

                      {/* Center: Big Embossed Monospace UID */}
                      <div className="relative z-10 my-auto py-2">
                        <span className="text-[9px] font-mono tracking-[0.2em] text-[#666660] uppercase block mb-1">
                          CARD SERIAL NUMBER (UID)
                        </span>
                        <div className="font-mono text-2xl sm:text-3xl font-bold tracking-[0.16em] text-white group-hover:text-[#3B82F6] transition-colors">
                          E2 : 4A : 8B : 1C
                        </div>
                      </div>

                      {/* Bottom Row: Holder Name + Access Verified Pill */}
                      <div className="flex items-end justify-between relative z-10 pt-3 border-t border-[#1C1C1A]">
                        <div className="font-mono">
                          <div className="text-xs sm:text-sm font-bold text-white tracking-wider">
                            ABCD JQK XYZ
                          </div>
                          <div className="text-[10px] text-[#A9A9A2]">
                            ID: 21110XXX
                          </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#3B82F6]/10 border border-[#3B82F6]/40 text-[#3B82F6] font-mono text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ══ PROJECT: E-GOV DIGITAL SIGNATURE ════════════════════════════════ */}
          <section id="sec-egov" className="ms-section">
            <div className="section-label">Applied Cryptography: e-Gov PKI</div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Tactile PAdES Sealed Decree & Interactive Byte-Flipper */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, ease: EASE_OUT }}
                className="lg:col-span-7 order-2 lg:order-1 flex justify-center"
              >
                <div className="w-full max-w-lg relative">
                  {/* Subtle Stacked Paper Back-Sheet */}
                  <div
                    className={`absolute inset-0 translate-x-2 translate-y-2 -rotate-1 rounded-sm border transition-colors duration-500 pointer-events-none ${
                      egovTampered
                        ? 'border-red-500/20 bg-red-950/[0.04]'
                        : 'border-[#222220] bg-[#080808]'
                    }`}
                  />

                  <TiltCard>
                    <Link
                      href="/projects/e-gov"
                      className={`group block relative w-full bg-[#0A0A0A] border rounded-sm p-5 sm:p-6 transition-all duration-300 shadow-2xl overflow-hidden cursor-pointer ${
                        egovTampered
                          ? 'border-red-500/60 hover:border-red-400'
                          : 'border-[#2A2A28] hover:border-[#3B82F6]'
                      }`}
                    >
                      {/* Subtle Corner Registration Marks */}
                      <span className="absolute top-2 left-2.5 font-mono text-xs text-[#A9A9A2]/50 select-none">+</span>
                      <span className="absolute top-2 right-2.5 font-mono text-xs text-[#A9A9A2]/50 select-none">+</span>
                      <span className="absolute bottom-2 left-2.5 font-mono text-xs text-[#A9A9A2]/50 select-none">+</span>
                      <span className="absolute bottom-2 right-2.5 font-mono text-xs text-[#A9A9A2]/50 select-none">+</span>

                      {/* Top Verification Ribbon + Interactive 1-Byte Tamper Trigger */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-[#222220] relative z-10">
                        <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              egovTampered ? 'bg-red-500 animate-ping' : 'bg-[#3B82F6] animate-pulse'
                            }`}
                          />
                          <span
                            className={`font-bold tracking-wider uppercase ${
                              egovTampered ? 'text-red-400' : 'text-white'
                            }`}
                          >
                            {egovTampered ? 'CWE-345 // DIGEST MISMATCH' : 'PAdES-B-LT // HSM SLOT 0x02'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const nextTampered = !egovTampered;
                            setEgovTampered(nextTampered);
                            triggerAura(
                              nextTampered ? -9999 : 1000,
                              nextTampered
                                ? 'Phát hiện sửa 1 byte trái phép! Công an phường đang định vị IP của bạn...'
                                : 'Đã khôi phục byte 0x4A hợp lệ. Tạm tha tội làm giả sắc lệnh!',
                              nextTampered ? '🚨' : '🛡️'
                            );
                          }}
                          className={`px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                            egovTampered
                              ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'border-[#333330] bg-[#111111] text-[#D8D8D1] hover:text-white hover:border-[#3B82F6]'
                          }`}
                        >
                          {egovTampered ? '[ RESTORE 0x4A ]' : '[ TAMPER 1 BYTE ]'}
                        </button>
                      </div>

                      {/* Middle: Redacted Decree Geometry + Live /ByteRange Hex Stream */}
                      <div className="py-4 space-y-4 relative z-10">
                        {/* Minimalist Document Structural Bars (Zero Prose Clutter) */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] sm:text-xs text-[#A9A9A2] uppercase tracking-wider mb-1.5">
                            <span>DECREE_2026_signed.pdf</span>
                            <span>/ByteRange [0 18420 51188 14902]</span>
                          </div>
                          <div className="h-2 w-3/4 bg-[#222220] rounded-xs" />
                          <div className="h-2 w-full bg-[#1A1A1A] rounded-xs" />
                          <div className="h-2 w-5/6 bg-[#1A1A1A] rounded-xs" />
                        </div>

                        {/* Interactive Hex Byte Strip & Avalanche SHA-256 Digest */}
                        <div
                          className={`p-3.5 sm:p-4 border transition-colors ${
                            egovTampered
                              ? 'border-red-500/30 bg-red-950/10'
                              : 'border-[#222220] bg-[#080808]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 font-mono mb-2.5">
                            <span className="text-[#A9A9A2] text-xs uppercase tracking-wider">
                              OFFSET 0x047F0
                            </span>
                            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm">
                              <span className="px-2 py-0.5 bg-[#111111] border border-[#222220] text-[#A9A9A2]">25</span>
                              <span className="px-2 py-0.5 bg-[#111111] border border-[#222220] text-[#A9A9A2]">50</span>
                              <span className="px-2 py-0.5 bg-[#111111] border border-[#222220] text-[#A9A9A2]">44</span>
                              <span
                                className={`px-2 py-0.5 font-bold border transition-all ${
                                  egovTampered
                                    ? 'bg-red-500/20 border-red-500 text-red-400 scale-105'
                                    : 'bg-[#3B82F6]/15 border-[#3B82F6]/50 text-[#3B82F6]'
                                }`}
                              >
                                {egovTampered ? 'FF' : '4A'}
                              </span>
                              <span className="px-2 py-0.5 bg-[#111111] border border-[#222220] text-[#A9A9A2]">2D</span>
                              <span className="px-2 py-0.5 bg-[#111111] border border-[#222220] text-[#A9A9A2]">31</span>
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-[#222220] flex items-center justify-between gap-3 font-mono">
                            <span className="text-xs text-[#A9A9A2] uppercase tracking-wider shrink-0">
                              SHA-256
                            </span>
                            <span
                              className={`text-xs sm:text-sm font-semibold tracking-wider truncate transition-colors ${
                                egovTampered ? 'text-red-400' : 'text-[#D8D8D1] group-hover:text-[#3B82F6]'
                              }`}
                            >
                              {egovTampered
                                ? 'e3b0c44298fc1c14...7852b855'
                                : '8f434346648f6b96...dc327aa4'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: O2O QR Matrix + Signer Meta + Circular Cryptographic Stamp */}
                      <div className="pt-3.5 border-t border-[#222220] flex flex-wrap items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                          {/* Crisp Geometric SVG QR Matrix */}
                          <div className="w-11 h-11 p-1.5 border border-[#222220] bg-[#080808] shrink-0 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-full h-full fill-current text-[#D8D8D1]">
                              <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm9-2h3v2h-3v-2zm4 0h3v3h-2v-1h-1v-2zm-4 4h2v3h-2v-3zm3 1h4v2h-4v-2z" />
                            </svg>
                          </div>
                          <div className="font-mono">
                            <div className="text-xs sm:text-sm font-bold text-white tracking-wider">
                              ABCD JQK XYZ
                            </div>
                            <div className="text-[11px] sm:text-xs text-[#A9A9A2] tracking-wider">
                              RFC 3161 TSA // WORM #0042
                            </div>
                          </div>
                        </div>

                        {/* Rotated Circular Cryptographic Wax Seal Stamp */}
                        <div
                          className={`px-3.5 py-1.5 rounded-full border-2 border-dashed -rotate-6 transition-all font-mono text-[11px] sm:text-xs font-bold tracking-[0.14em] uppercase select-none ${
                            egovTampered
                              ? 'border-red-500/70 bg-red-500/10 text-red-400'
                              : 'border-[#3B82F6]/60 bg-[#3B82F6]/10 text-[#3B82F6]'
                          }`}
                        >
                          {egovTampered ? 'SIGNATURE BROKEN' : 'ECDSA-P256 SEALED'}
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </div>
              </motion.div>

              {/* Right Column: Concise Editorial Typography */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
                className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-5"
              >
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6] mb-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                    ZERO-TRUST PKI & PADES
                  </div>
                  <h3 className="font-serif text-[clamp(2.4rem,4vw,3.6rem)] leading-[1.06] font-light text-white">
                    e-Gov Signature.
                  </h3>
                </div>

                <p className="text-[#A9A9A2] font-mono font-light text-sm sm:text-base leading-relaxed">
                  Sovereign PAdES-B-LT signing infrastructure isolating ECDSA P-256 private keys inside SoftHSM2 over a 5-zone mTLS network with RFC 3161 timestamping and WORM audit logs.
                </p>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#A9A9A2]">
                  <span className="px-3 py-1 border border-[#222220] bg-[#0A0A0A]">
                    PKCS#11 SoftHSM2
                  </span>
                  <span className="px-3 py-1 border border-[#222220] bg-[#0A0A0A]">
                    PAdES-B-LT / TSA
                  </span>
                  <span className="px-3 py-1 border border-[#222220] bg-[#0A0A0A]">
                    WORM Hash-Chain
                  </span>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-6">
                  <MagneticWrapper>
                    <Link href="/projects/e-gov" className="cta-link inline-block">
                      <HackerText text="Enter Project →" />
                    </Link>
                  </MagneticWrapper>
                </div>
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
                  <span className="scroll-reveal-line" data-reveal-delay="0">Wazuh</span><br/>
                </h3>
                
                <p className="text-[#A9A9A2] font-mono font-light text-sm sm:text-base leading-relaxed mt-2 scroll-reveal-line" data-reveal-delay="3">
                  Multi-layer telemetry and Cyber Kill Chain detection lab in an isolated VMware network using Wazuh SIEM, Suricata IDS, ModSecurity WAF, and FIM.
                </p>
                
                <div className="mt-4 border-l-2 border-[#333330] pl-6 font-mono text-[13px] text-[#A9A9A2] uppercase tracking-[0.15em] flex flex-col gap-3.5">
                  <p className="scroll-reveal-line" data-reveal-delay="4">› Stack: Wazuh + Suricata + WAF</p>
                  <p className="scroll-reveal-line" data-reveal-delay="5">› Scope: Recon, DVWA, C2 &amp; Exfil</p>
                  <p className="scroll-reveal-line" data-reveal-delay="6">› Nodes: Kali / Ubuntu / Windows</p>
                </div>

                <p className="mt-4 font-mono text-sm text-[#333330] tracking-widest scroll-reveal-line" data-reveal-delay="7">
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
                    "05-recon-web-waf-wazuh.md",
                    "Coming Soon...",
                    "Coming Soon..."
                  ].map((file, i) => (
                    <TiltCard key={i}><a href={`/soc-lab/${file.replace('.md', '')}`} className="flex justify-between items-center py-4 border-b border-[#111111] hover:bg-[#111111] transition-colors group cursor-pointer px-4">
                      <span className="flex gap-5 items-center">
                        <span className="text-[#333330] group-hover:text-[#3B82F6] text-sm">[{String(i+1).padStart(2, '0')}]</span>
                        <span className="text-[#D8D8D1] group-hover:text-white transition-colors text-base">{file}</span>
                      </span>
                      <span className="text-[#333330] group-hover:text-[#3B82F6] transition-colors text-sm">
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

          {/* ══ PROJECT: FALLGUARD ════════════════════════════════════════ */}
          <section id="sec-fallguard" className="ms-section">
            <div className="section-label">Project: FallGuard</div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Info */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:col-span-5 flex flex-col gap-5"
              >
                <h3 className="font-serif text-[clamp(2.5rem,4vw,3.8rem)] leading-[1.1] font-light text-white scroll-reveal-line">
                  <span className="scroll-reveal-line" data-reveal-delay="0">FallGuard</span><br/>
                  <span className="scroll-reveal-line" data-reveal-delay="1">SYSTEM</span>
                </h3>
                <div className="flex gap-4 items-center mt-2">
                </div>
                
                <p className="text-[#A9A9A2] font-mono font-light text-base leading-relaxed mt-2 scroll-reveal-line" data-reveal-delay="3">
                  Privacy-preserving fall detection and spatial monitoring system for elderly people living alone.
                </p>
                
                <div className="mt-4 border-l-2 border-[#333330] pl-6 font-mono text-[13px] text-[#A9A9A2] uppercase tracking-[0.15em] flex flex-col gap-3">
                  <p className="scroll-reveal-line" data-reveal-delay="4">› AI: YOLOv8m-Pose + BoT-SORT</p>
                  <p className="scroll-reveal-line" data-reveal-delay="5">› Hardware: Dual ESP32 + LD2450</p>
                  <p className="scroll-reveal-line" data-reveal-delay="5">› Access: Tailscale Mesh VPN</p>
                </div>

                <div className="mt-4">
                  <MagneticWrapper>
                    <Link href="/projects/fallguard" className="cta-link inline-block">
                      <HackerText text="Enter Project →" />
                    </Link>
                  </MagneticWrapper>
                </div>
              </motion.div>

              {/* Right Clickable Architecture Portal Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="lg:col-span-7"
              >
                <TiltCard>
                  <Link
                    href="/projects/fallguard"
                    className="group block bg-[#050505] border border-[#333330] hover:border-[#3B82F6] transition-colors overflow-hidden font-mono"
                  >
                    {/* Portal Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-[#333330] bg-[#0A0A0A] text-sm">
                      <span className="text-[#A9A9A2] group-hover:text-white transition-colors">~/projects/fallguard</span>
                      <span className="text-xs text-[#3B82F6] uppercase tracking-widest flex items-center gap-2">
                        <span>OPEN DOSSIER</span>
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>

                    {/* 4-Stage Architecture Overview Grid */}
                    <div className="p-6 md:p-8 space-y-6 bg-[#070707]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {
                            step: 'STAGE 01',
                            title: 'Edge Sensing',
                            spec: 'ESP32-CAM (:81) + LD2450 (256kbps)',
                            desc: 'Streams MJPEG video and decodes 24GHz mmWave radar targets over UART2.',
                          },
                          {
                            step: 'STAGE 02',
                            title: 'AI Pose & Tracking',
                            spec: 'YOLOv8m-Pose + BoT-SORT',
                            desc: 'Evaluates spine inclination, bounding-box aspect ratio, and EMA-filtered keypoints.',
                          },
                          {
                            step: 'STAGE 03',
                            title: 'Pan/Tilt Kinematics',
                            spec: 'ESP32 DevKit + 2x MG996R (5V)',
                            desc: 'Computes azimuth/elevation angles and drives dual-axis servo tracking.',
                          },
                          {
                            step: 'STAGE 04',
                            title: 'Private Remote Access',
                            spec: 'Next.js 16 + Tailscale ACL + Telegram',
                            desc: 'Instant fall alerts and remote dashboard access without public port forwarding.',
                          },
                        ].map((item) => (
                          <div
                            key={item.step}
                            className="border border-[#222220] group-hover:border-[#333330] bg-[#0B0B0B] p-4 transition-colors space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs text-[#3B82F6]">
                              <span>[{item.step}]</span>
                              <span>● ONLINE</span>
                            </div>
                            <div className="text-base font-bold text-white">{item.title}</div>
                            <div className="text-xs text-[#A9A9A2]">{item.spec}</div>
                            <p className="text-xs text-[#D8D8D1] font-sans pt-1 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Command Bar inside Portal */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#1A1A1A] text-xs md:text-sm">
                        <span className="text-[#A9A9A2]">
                        </span>
                        <span className="font-serif italic text-base text-[#D8D8D1] group-hover:text-[#3B82F6] transition-colors">
                        </span>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
              
            </div>
          </section>

          {/* ══ THEME SELECTION SECTION ═════════════════════════ */}
          <section id="sec-theme" className="ms-section">
            <div className="section-label">Realities</div>
            
            <button 
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="flex flex-col mb-8 text-left w-full hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent outline-none"
            >
              <h2 className="font-mono text-2xl md:text-3xl text-white uppercase tracking-widest mb-2 flex items-center gap-4">
                <HackerText text="Select_Environment" /> 
                <span className="text-[#3B82F6] text-sm">{isThemeOpen ? '[-]' : '[+]'}</span>
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
                    { id: 'matrix', name: 'THE MATRIX', role: 'CURRENT REALITY', img: '/the_matrix.jpg', color: '#4ade80', link: 'https://kanp9.io.vn/' },
                    { id: 'crystal', name: 'CRYSTAL CARBON', role: 'DEEP DIVE', img: '/cyan_carbon.jpg', color: '#3B82F6', link: 'https://v3.kanp9.io.vn/' },
                    { id: 'cybercore', name: 'CYBERCORE OS', role: 'NOSTALGIA SECTOR', img: '/cyber_core.jpg', color: '#a855f7', link: 'https://v4.kanp9.io.vn/' }
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

          {/* ══ CONNECT & ASCII COMPANION ═════════════════════════ */}
          <section id="sec-connect" className="ms-section pb-0">
            <div className="section-label">Connect</div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Connect part */}
              <motion.div 
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 1.1, ease: EASE_OUT }}
                className="lg:col-span-7"
              >
                <h2 className="split-lines scroll-reveal-line font-serif text-[clamp(2.5rem,5vw,6.5rem)] leading-[1.5] text-white font-light mb-12 pb-6"
                  style={{
                    textShadow: `
                      1px 1px 0 rgba(59,130,246,0.4),
                      2px 2px 0 rgba(59,130,246,0.35),
                      3px 3px 0 rgba(59,130,246,0.3),
                      4px 4px 0 rgba(59,130,246,0.25),
                      5px 5px 0 rgba(59,130,246,0.2),
                      6px 6px 0 rgba(59,130,246,0.15),
                      7px 7px 0 rgba(59,130,246,0.1),
                      8px 8px 0 rgba(59,130,246,0.08),
                      0 0 60px rgba(59,130,246,0.15),
                      0 0 120px rgba(59,130,246,0.08)
                    `,
                    transform: 'perspective(600px) rotateY(-4deg) rotateX(2deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  See ya<br/>
                  <span className="italic">in the next chaos!</span>
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

              {/* Bottom Sign-off inside Connect Section */}
              <div className="lg:col-span-12 pt-6 border-t border-[#222220] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#3B82F6]">
                </span>
                <p className="font-serif italic text-2xl md:text-3xl text-white tracking-wide">
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* ══ FOOTER ═══════════════════════════════════ */}
        <footer className="py-16 px-6 md:px-10 border-t border-[#333330]">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <FooterClock />
            
          
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
