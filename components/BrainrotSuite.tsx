'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface AuraEvent {
  id: number;
  delta: number;
  reason: string;
  emoji: string;
  time: string;
}

interface IslandState {
  active: boolean;
  delta: number;
  combo: number;
  reason: string;
  emoji: string;
  key: number;
}

type BrainrotChannel = 'subway' | 'flappy' | 'crush' | 'gacha' | 'dvd';

const PAGE_TLDR: Record<string, { title: string; text: string }> = {
  '/': {
    title: 'TL;DR Homepage (5s)',
    text: 'Minimalist tech-zine exterior hiding memes, a cyber tamagotchi, and 3 AM security engineering rabbit holes.',
  },
  '/projects/e-gov': {
    title: 'TL;DR e-Gov Signature (5s)',
    text: 'Zero-Trust PAdES PDF signing locked inside 5 Docker subnets. Keys never leave SoftHSM2; flip 1 byte in a PDF and verification screams red while the WORM ledger logs it forever.',
  },
  '/projects/rfid': {
    title: 'TL;DR RFID Vault (5s)',
    text: 'Dual-core ESP32 FreeRTOS attendance terminal. Reads UIDs in <12ms with a 15-second anti-passback cooldown.',
  },
  '/projects/fallguard': {
    title: 'TL;DR FallGuard (5s)',
    text: 'Privacy-first YOLOv8 + mmWave Radar fall detection for seniors living alone. Fires instant Telegram alerts without leaking raw camera footage.',
  },
  '/soc-lab/05-recon-web-waf-wazuh': {
    title: 'TL;DR Wazuh Kill Chain Lab (5s)',
    text: 'Full attack-to-detection lab: Nmap recon -> DVWA command injection -> 91-byte CSV exfiltration, caught red-handed by Suricata IDS, ModSecurity WAF, and Wazuh SIEM.',
  },
};

export function triggerAura(delta: number, reason: string, emoji = '⚡') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aura-change', {
        detail: { delta, reason, emoji },
      })
    );
  }
}

export default function BrainrotSuite() {
  const pathname = usePathname();
  const router = useRouter();

  const [aura, setAura] = useState<number>(1000);
  // Aura Dynamic Island (headbar notifications with combo merging)
  const [island, setIsland] = useState<IslandState>({
    active: false,
    delta: 0,
    combo: 0,
    reason: '',
    emoji: '⚡',
    key: 0,
  });
  const [auraLog, setAuraLog] = useState<AuraEvent[]>([]);
  const [islandOpen, setIslandOpen] = useState<boolean>(false);
  const islandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventRef = useRef<{ t: number; sign: number }>({ t: 0, sign: 0 });
  const auraNumDomRef = useRef<HTMLSpanElement | null>(null);
  const displayedAuraRef = useRef<number>(1000);
  const [brainrotOpen, setBrainrotOpen] = useState<boolean>(false);
  const [isLargePip, setIsLargePip] = useState<boolean>(false);
  const [channel, setChannel] = useState<BrainrotChannel>('subway');
  const [showTldr, setShowTldr] = useState<boolean>(false);

  // Page-wide visual mutators
  const [australianMode, setAustralianMode] = useState<boolean>(false);
  const [raveMode, setRaveMode] = useState<boolean>(false);

  // Custom Right-Click Context Menu
  const [ctxMenu, setCtxMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  // 01. Subway Runner controls (score updated via DOM ref to avoid React re-renders!)
  const [runnerSpeedMult, setRunnerSpeedMult] = useState<number>(1);
  const runnerLaneRef = useRef<number>(1);
  const runnerSpeedRef = useRef<number>(1);
  const runnerScoreValRef = useRef<number>(0);
  const runnerScoreDomRef = useRef<HTMLSpanElement | null>(null);
  const [autoPilot, setAutoPilot] = useState<boolean>(true);
  const autoPilotRef = useRef<boolean>(true);

  // 02. Flappy Meme controls (score updated via DOM ref)
  const [flappyBot, setFlappyBot] = useState<boolean>(true);
  const flappyBotRef = useRef<boolean>(true);
  const [flappySkin, setFlappySkin] = useState<string>('🐧');
  const flappySkinRef = useRef<string>('🐧');
  const flappyScoreValRef = useRef<number>(0);
  const flappyScoreDomRef = useRef<HTMLSpanElement | null>(null);
  const flappyJumpTriggerRef = useRef<boolean>(false);

  // 03. Hydraulic Press / Particle Vortex triggers
  const crushTriggerRef = useRef<boolean>(false);
  const spawnBlocksTriggerRef = useRef<boolean>(false);

  // 04. Gacha Slot Machine state
  const [slots, setSlots] = useState<string[]>(['🗿', '7️⃣', '🐧']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [gachaMsg, setGachaMsg] = useState<string>('Bet your Aura to spin the reels!');

  // 05. Multi-DVD state (corner hits updated via DOM ref)
  const [dvdCount, setDvdCount] = useState<number>(3);
  const dvdCountRef = useRef<number>(3);
  const cornerHitsValRef = useRef<number>(0);
  const cornerHitsDomRef = useRef<HTMLSpanElement | null>(null);

  // Zero-rerender GPU Drag state for PiP window
  const pipWindowRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrolledPathsRef = useRef<Set<string>>(new Set());

  const addAuraToast = useCallback((delta: number, reason: string, emoji = '⚡') => {
    setAura((prev) => {
      const next = prev + delta;
      try {
        sessionStorage.setItem('ka_aura_points', String(next));
      } catch {}
      return next;
    });

    // Merge rapid same-sign events into a single combo instead of stacking popups
    const now = Date.now();
    const sign = delta >= 0 ? 1 : -1;
    const merge = now - lastEventRef.current.t < 2200 && lastEventRef.current.sign === sign;
    lastEventRef.current = { t: now, sign };

    setIsland((prev) =>
      merge && prev.active
        ? { ...prev, delta: prev.delta + delta, combo: prev.combo + 1, reason, emoji, key: now }
        : { active: true, delta, combo: 1, reason, emoji, key: now }
    );

    const d = new Date();
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
      2,
      '0'
    )}:${String(d.getSeconds()).padStart(2, '0')}`;
    setAuraLog((prev) => [{ id: now + Math.random(), delta, reason, emoji, time }, ...prev].slice(0, 6));

    if (islandTimerRef.current) clearTimeout(islandTimerRef.current);
    islandTimerRef.current = setTimeout(() => {
      setIsland((p) => ({ ...p, active: false }));
    }, 3000);
  }, []);

  // Rolling odometer for the Aura number (DOM-only, zero re-renders)
  useEffect(() => {
    const el = auraNumDomRef.current;
    if (!el) {
      displayedAuraRef.current = aura;
      return;
    }
    const from = displayedAuraRef.current;
    const to = aura;
    if (from === to) {
      el.textContent = to.toLocaleString();
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 650;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(from + (to - from) * eased);
      displayedAuraRef.current = v;
      el.textContent = v.toLocaleString();
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [aura]);

  useEffect(() => {
    return () => {
      if (islandTimerRef.current) clearTimeout(islandTimerRef.current);
    };
  }, []);

  // Load saved Aura + F12 Console Easter Egg
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ka_aura_points');
      if (saved !== null) setAura(parseInt(saved, 10) || 1000);
    } catch {}

    console.log(
      `%c
   /\\_/\\   [ KA_OS SECURITY MONITOR ]
  ( o.o )  Digging in F12 for a CTF flag, my friend?
   > ^ <   No flags here, only caffeine and questionable code 🐧
      `,
      'color: #3B82F6; font-family: monospace; font-weight: bold; font-size: 13px;'
    );
  }, []);

  // Australian Mode (180deg flip)
  useEffect(() => {
    const html = document.documentElement;
    if (australianMode) {
      html.style.transform = 'rotate(180deg)';
      html.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    } else {
      html.style.transform = '';
    }
  }, [australianMode]);

  // RGB Rave Mode (throttled cleanly to 120ms)
  useEffect(() => {
    if (!raveMode) {
      document.documentElement.style.filter = '';
      return;
    }
    let deg = 0;
    const id = setInterval(() => {
      if (document.hidden) return;
      deg = (deg + 20) % 360;
      document.documentElement.style.filter = `hue-rotate(${deg}deg) contrast(1.06)`;
    }, 120);
    return () => {
      clearInterval(id);
      document.documentElement.style.filter = '';
    };
  }, [raveMode]);

  // Listen to global aura-change and toggle-brainrot events
  useEffect(() => {
    const handleAuraEvent = (e: Event) => {
      const custom = e as CustomEvent<{ delta: number; reason: string; emoji?: string }>;
      if (custom.detail) {
        addAuraToast(custom.detail.delta, custom.detail.reason, custom.detail.emoji || '⚡');
      }
    };

    const handleToggleBrainrot = () => {
      setBrainrotOpen((prev) => {
        const next = !prev;
        if (next) {
          dragOffsetRef.current = { x: 0, y: 0 };
        }
        addAuraToast(
          next ? 500 : 100,
          next
            ? 'ADHD Stimulator ONLINE: Focus boosted by 200%!'
            : 'ADHD Stimulator OFFLINE: Dopamine levels stabilizing.',
          next ? '🧠' : '🧘'
        );
        return next;
      });
    };

    window.addEventListener('aura-change', handleAuraEvent);
    window.addEventListener('toggle-brainrot', handleToggleBrainrot);
    return () => {
      window.removeEventListener('aura-change', handleAuraEvent);
      window.removeEventListener('toggle-brainrot', handleToggleBrainrot);
    };
  }, [addAuraToast]);

  // Reward user when scrolling to bottom of subpages (throttled passive check)
  useEffect(() => {
    if (!pathname || pathname === '/') return;
    let ticking = false;

    const onScroll = () => {
      if (ticking || scrolledPathsRef.current.has(pathname)) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (scrolledPathsRef.current.has(pathname)) return;
        const scrolledToBottom =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 180;
        if (scrolledToBottom && document.documentElement.scrollHeight > window.innerHeight * 1.4) {
          scrolledPathsRef.current.add(pathname);
          addAuraToast(2500, 'Read all the way to the bottom! +2,500 Braincells', '🎓');
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname, addAuraToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-brainrot'));
      }
      if (e.key === 'Escape' && ctxMenu.visible) {
        setCtxMenu((prev) => ({ ...prev, visible: false }));
      }
      if (brainrotOpen && channel === 'subway') {
        if (e.key === 'ArrowLeft') {
          setAutoPilot(false);
          autoPilotRef.current = false;
          runnerLaneRef.current = Math.max(0, runnerLaneRef.current - 1);
        } else if (e.key === 'ArrowRight') {
          setAutoPilot(false);
          autoPilotRef.current = false;
          runnerLaneRef.current = Math.min(2, runnerLaneRef.current + 1);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ctxMenu.visible, brainrotOpen, channel]);

  // Custom Context Menu listener
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      if (ctxMenu.visible) {
        setCtxMenu({ visible: false, x: 0, y: 0 });
        return;
      }
      e.preventDefault();
      const menuWidth = 288;
      const menuHeight = 355;
      const x = Math.min(e.clientX, window.innerWidth - menuWidth - 16);
      const y = Math.min(e.clientY, window.innerHeight - menuHeight - 16);
      setCtxMenu({ visible: true, x: Math.max(12, x), y: Math.max(12, y) });
    };

    const onClickAnywhere = () => {
      if (ctxMenu.visible) {
        setCtxMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('click', onClickAnywhere);
    return () => {
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('click', onClickAnywhere);
    };
  }, [ctxMenu.visible]);

  // Sync refs for Canvas loops
  useEffect(() => {
    runnerSpeedRef.current = runnerSpeedMult;
  }, [runnerSpeedMult]);

  useEffect(() => {
    autoPilotRef.current = autoPilot;
  }, [autoPilot]);

  useEffect(() => {
    flappyBotRef.current = flappyBot;
  }, [flappyBot]);

  useEffect(() => {
    flappySkinRef.current = flappySkin;
  }, [flappySkin]);

  useEffect(() => {
    dvdCountRef.current = dvdCount;
  }, [dvdCount]);

  // Zero-rerender Pointer Drag handlers for PiP Header
  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: dragOffsetRef.current.x,
      origY: dragOffsetRef.current.y,
    };
  };

  const handleHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current.active || !pipWindowRef.current) return;
    const nx = dragStartRef.current.origX + (e.clientX - dragStartRef.current.startX);
    const ny = dragStartRef.current.origY + (e.clientY - dragStartRef.current.startY);
    dragOffsetRef.current = { x: nx, y: ny };
    pipWindowRef.current.style.transform = `translate3d(${nx}px, ${ny}px, 0)`;
  };

  const handleHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current.active) return;
    dragStartRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Gacha Slot Machine handler
  const spinGacha = (bet: number) => {
    if (isSpinning) return;
    setIsSpinning(true);
    setAura((prev) => prev - bet);
    setGachaMsg('Spinning reels...');

    const symbols = ['🐧', '🗿', '💎', '7️⃣', '💀', '🔥'];
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setSlots([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);

      if (ticks >= 14) {
        clearInterval(interval);
        const roll = Math.random();
        if (roll < 0.25) {
          const winSym = ['7️⃣', '🗿', '💎', '🐧'][Math.floor(Math.random() * 4)];
          const reward = bet * 15;
          setSlots([winSym, winSym, winSym]);
          setGachaMsg(`JACKPOT ${winSym}${winSym}${winSym}! Won +${reward.toLocaleString()} AURA!`);
          addAuraToast(reward, `GACHA JACKPOT ${winSym}${winSym}${winSym}! Generational wealth!`, '🎰');
        } else if (roll < 0.55) {
          const pairSym = symbols[Math.floor(Math.random() * 4)];
          const reward = Math.floor(bet * 2.5);
          setSlots([pairSym, pairSym, '🔥']);
          setGachaMsg(`Double match ${pairSym}${pairSym}! +${reward.toLocaleString()} AURA`);
          addAuraToast(reward, `Rolled a pair of ${pairSym}${pairSym}!`, '✨');
        } else {
          setSlots(['💀', '🐧', '🗿']);
          setGachaMsg(`Cooked (-${bet.toLocaleString()} Aura)! 99% of gamblers quit before hitting big!`);
        }
        setIsSpinning(false);
      }
    }, 70);
  };

  // Optimized Canvas Engine (Capped at 45 FPS, 0 React setStates inside loop, auto-pauses when tab hidden)
  useEffect(() => {
    if (!brainrotOpen || channel === 'gacha') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let lastTime = 0;
    const FPS_INTERVAL = 1000 / 45; // Smooth 45fps cap prevents CPU burn on 144Hz+ monitors
    const W = canvas.width;
    const H = canvas.height;

    if (channel === 'subway') {
      let tick = 0;
      const obstacles: { lane: number; z: number; color: string }[] = [
        { lane: 0, z: 0.1, color: '#EF4444' },
        { lane: 2, z: 0.55, color: '#F97316' },
      ];
      const coins: { lane: number; z: number }[] = [
        { lane: 1, z: 0.2 },
        { lane: 1, z: 0.45 },
      ];

      const horizonY = 56;
      const groundH = H - horizonY;

      const project = (lane: number, z: number) => {
        const scale = 0.22 + z * 0.78;
        const y = horizonY + Math.pow(z, 1.35) * groundH;
        const roadWidth = W * scale;
        const leftEdge = (W - roadWidth) / 2;
        const laneW = roadWidth / 3;
        const x = leftEdge + lane * laneW + laneW / 2;
        return { x, y, scale, laneW };
      };

      const renderSubway = (now: number) => {
        animId = requestAnimationFrame(renderSubway);
        if (document.hidden || now - lastTime < FPS_INTERVAL) return;
        lastTime = now;

        const mult = runnerSpeedRef.current;
        const zStep = 0.016 * mult;
        tick++;

        ctx.fillStyle = '#050811';
        ctx.fillRect(0, 0, W, horizonY);

        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        ctx.arc(W / 2, horizonY, 32, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#070A12';
        ctx.fillRect(0, horizonY, W, groundH);

        // Perspective Lanes (batched path)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= 3; i++) {
          const topX = W * 0.39 + (i * (W * 0.22)) / 3;
          const botX = (i * W) / 3;
          ctx.moveTo(topX, horizonY);
          ctx.lineTo(botX, H);
        }
        ctx.stroke();

        // Moving horizontal ties (batched path)
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.14)';
        ctx.beginPath();
        for (let n = 0; n < 8; n++) {
          const z = (n / 8 + tick * zStep) % 1;
          const pLeft = project(0, z);
          const pRight = project(2, z);
          ctx.moveTo(pLeft.x - pLeft.laneW / 2, pLeft.y);
          ctx.lineTo(pRight.x + pRight.laneW / 2, pRight.y);
        }
        ctx.stroke();

        if (tick % Math.max(12, Math.floor(32 / mult)) === 0) {
          const obLane = Math.floor(Math.random() * 3);
          obstacles.push({
            lane: obLane,
            z: 0.01,
            color: obLane === 1 ? '#EF4444' : '#F97316',
          });
          const coinLane = (obLane + 1 + Math.floor(Math.random() * 2)) % 3;
          coins.push({ lane: coinLane, z: 0.01 });
        }

        const playerZ = 0.88;
        if (autoPilotRef.current) {
          const danger = obstacles.find(
            (o) => o.lane === runnerLaneRef.current && o.z > 0.56 && o.z < 0.94
          );
          if (danger) {
            const safeLanes = [0, 1, 2].filter(
              (l) => !obstacles.some((o) => o.lane === l && o.z > 0.48 && o.z < 0.96)
            );
            if (safeLanes.length > 0) {
              runnerLaneRef.current = safeLanes[0];
            }
          }
        }

        let scoreChanged = false;

        for (let i = coins.length - 1; i >= 0; i--) {
          const c = coins[i];
          c.z += zStep;
          const p = project(c.lane, c.z);
          const r = Math.max(3, 11 * p.scale);

          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.arc(p.x, p.y - r, r, 0, Math.PI * 2);
          ctx.fill();

          if (Math.abs(c.z - playerZ) < 0.07 && c.lane === runnerLaneRef.current) {
            runnerScoreValRef.current += 10;
            scoreChanged = true;
            coins.splice(i, 1);
          } else if (c.z > 1.05) {
            coins.splice(i, 1);
          }
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i];
          o.z += zStep;
          const p = project(o.lane, o.z);
          const w = p.laneW * 0.72;
          const h = 46 * p.scale;

          ctx.fillStyle = o.color;
          ctx.fillRect(p.x - w / 2, p.y - h, w, h);
          ctx.fillStyle = '#E0F2FE';
          ctx.fillRect(p.x - w * 0.36, p.y - h * 0.82, w * 0.72, h * 0.28);

          if (Math.abs(o.z - playerZ) < 0.06 && o.lane === runnerLaneRef.current && !autoPilotRef.current) {
            obstacles.splice(i, 1);
            runnerScoreValRef.current = Math.max(0, runnerScoreValRef.current - 25);
            scoreChanged = true;
          } else if (o.z > 1.05) {
            obstacles.splice(i, 1);
            runnerScoreValRef.current += 2;
            scoreChanged = true;
          }
        }

        if (scoreChanged && runnerScoreDomRef.current) {
          runnerScoreDomRef.current.textContent = String(runnerScoreValRef.current);
        }

        const playerProj = project(runnerLaneRef.current, playerZ);
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(playerProj.x, playerProj.y - 18, 17, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🐧', playerProj.x, playerProj.y - 12);
      };

      animId = requestAnimationFrame(renderSubway);
    } else if (channel === 'flappy') {
      let birdY = H / 2;
      let birdV = 0;
      const gravity = 0.34;
      const jump = -6.0;
      const pipes: { x: number; gapTop: number; passed: boolean }[] = [
        { x: W * 0.65, gapTop: 70, passed: false },
        { x: W + 80, gapTop: 120, passed: false },
      ];
      const gapH = 98;
      const pipeW = 46;
      const birdX = 76;

      const renderFlappy = (now: number) => {
        animId = requestAnimationFrame(renderFlappy);
        if (document.hidden || now - lastTime < FPS_INTERVAL) return;
        lastTime = now;

        ctx.fillStyle = '#060911';
        ctx.fillRect(0, 0, W, H);

        const nextPipe = pipes.find((p) => p.x + pipeW > birdX - 12);
        if (flappyBotRef.current && nextPipe) {
          const targetY = nextPipe.gapTop + gapH * 0.62;
          if (birdY > targetY && birdV >= -1.2) {
            birdV = jump;
          }
        }

        if (flappyJumpTriggerRef.current) {
          birdV = jump;
          flappyJumpTriggerRef.current = false;
        }

        birdV += gravity;
        birdY += birdV;

        if (birdY < 18) {
          birdY = 18;
          birdV = 0;
        }
        if (birdY > H - 18) {
          birdY = H / 2;
          birdV = jump;
        }

        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;

        for (let i = pipes.length - 1; i >= 0; i--) {
          const p = pipes[i];
          p.x -= 2.8;

          ctx.fillRect(p.x, 0, pipeW, p.gapTop);
          ctx.strokeRect(p.x, 0, pipeW, p.gapTop);

          const botY = p.gapTop + gapH;
          ctx.fillRect(p.x, botY, pipeW, H - botY);
          ctx.strokeRect(p.x, botY, pipeW, H - botY);

          if (!p.passed && p.x + pipeW < birdX) {
            p.passed = true;
            flappyScoreValRef.current += 1;
            if (flappyScoreDomRef.current) {
              flappyScoreDomRef.current.textContent = String(flappyScoreValRef.current);
            }
          }

          if (
            !flappyBotRef.current &&
            birdX + 12 > p.x &&
            birdX - 12 < p.x + pipeW &&
            (birdY - 12 < p.gapTop || birdY + 12 > p.gapTop + gapH)
          ) {
            birdY = H / 2;
            birdV = 0;
            flappyScoreValRef.current = 0;
            if (flappyScoreDomRef.current) {
              flappyScoreDomRef.current.textContent = '0';
            }
          }

          if (p.x < -pipeW) {
            pipes.splice(i, 1);
            const lastX = pipes.length > 0 ? Math.max(...pipes.map((item) => item.x)) : W;
            pipes.push({
              x: Math.max(W, lastX + 195),
              gapTop: 35 + Math.random() * (H - gapH - 75),
              passed: false,
            });
          }
        }

        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(flappySkinRef.current, birdX, birdY);
      };

      animId = requestAnimationFrame(renderFlappy);
    } else if (channel === 'crush') {
      interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: string;
      }
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#A855F7', '#F43F5E'];
      const particles: Particle[] = [];
      let pressY = 18;
      let pressing = false;

      const spawnTower = () => {
        if (particles.length > 160) particles.splice(0, particles.length - 100);
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 8; c++) {
            particles.push({
              x: W / 2 - 64 + c * 18,
              y: H - 22 - r * 18,
              vx: (Math.random() - 0.5) * 0.5,
              vy: 0,
              size: 15,
              color: colors[(r + c) % colors.length],
            });
          }
        }
      };
      spawnTower();

      let mouseDown = false;
      let mx = W / 2;
      let my = H / 2;

      const onDown = (e: MouseEvent) => {
        mouseDown = true;
        const rect = canvas.getBoundingClientRect();
        mx = ((e.clientX - rect.left) / rect.width) * W;
        my = ((e.clientY - rect.top) / rect.height) * H;
      };
      const onMove = (e: MouseEvent) => {
        if (!mouseDown) return;
        const rect = canvas.getBoundingClientRect();
        mx = ((e.clientX - rect.left) / rect.width) * W;
        my = ((e.clientY - rect.top) / rect.height) * H;
      };
      const onUp = () => {
        mouseDown = false;
      };

      canvas.addEventListener('mousedown', onDown);
      canvas.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);

      const renderCrush = (now: number) => {
        animId = requestAnimationFrame(renderCrush);
        if (document.hidden || now - lastTime < FPS_INTERVAL) return;
        lastTime = now;

        ctx.fillStyle = '#06080E';
        ctx.fillRect(0, 0, W, H);

        if (spawnBlocksTriggerRef.current) {
          spawnTower();
          spawnBlocksTriggerRef.current = false;
        }

        if (crushTriggerRef.current) {
          pressing = true;
          crushTriggerRef.current = false;
        }

        if (pressing) {
          pressY += 16;
          if (pressY >= H - 45) {
            pressing = false;
            for (const p of particles) {
              p.vx = (Math.random() - 0.5) * 18;
              p.vy = -Math.random() * 15 - 4;
              p.size = Math.max(6, p.size * 0.78);
            }
          }
        } else if (pressY > 18) {
          pressY = Math.max(18, pressY - 5);
        }

        ctx.fillStyle = '#334155';
        ctx.fillRect(W / 2 - 22, 0, 44, pressY);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(40, pressY, W - 80, 22);

        if (mouseDown) {
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(mx, my, 24, 0, Math.PI * 2);
          ctx.stroke();
        }

        for (const p of particles) {
          if (mouseDown) {
            const dx = mx - p.x;
            const dy = my - p.y;
            const dist = Math.max(12, Math.hypot(dx, dy));
            p.vx += (dx / dist) * 1.6;
            p.vy += (dy / dist) * 1.6;
          } else {
            p.vy += 0.42;
          }

          p.vx *= 0.985;
          p.vy *= 0.985;
          p.x += p.vx;
          p.y += p.vy;

          if (p.y - p.size / 2 < pressY + 22 && p.x > 40 && p.x < W - 40) {
            p.y = pressY + 22 + p.size / 2;
            p.vy = Math.abs(p.vy) * 0.6 + 4;
            p.vx += (Math.random() - 0.5) * 8;
          }

          if (p.x < p.size / 2) {
            p.x = p.size / 2;
            p.vx *= -0.8;
          }
          if (p.x > W - p.size / 2) {
            p.x = W - p.size / 2;
            p.vx *= -0.8;
          }
          if (p.y > H - p.size / 2) {
            p.y = H - p.size / 2;
            p.vy *= -0.65;
          }

          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      };

      animId = requestAnimationFrame(renderCrush);
      return () => {
        cancelAnimationFrame(animId);
        canvas.removeEventListener('mousedown', onDown);
        canvas.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    } else if (channel === 'dvd') {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#A855F7', '#06B6D4'];
      const bw = 64;
      const bh = 30;
      const logos = Array.from({ length: 20 }, (_, i) => ({
        x: 20 + ((i * 53) % (W - bw - 40)),
        y: 20 + ((i * 41) % (H - bh - 40)),
        vx: (i % 2 === 0 ? 1 : -1) * (2.6 + (i % 3) * 0.6),
        vy: (i % 3 === 0 ? 1 : -1) * (2.1 + (i % 2) * 0.6),
        colorIdx: i % colors.length,
      }));

      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';

      const renderDvd = (now: number) => {
        animId = requestAnimationFrame(renderDvd);
        if (document.hidden || now - lastTime < FPS_INTERVAL) return;
        lastTime = now;

        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);

        const activeCount = Math.min(logos.length, dvdCountRef.current);
        for (let i = 0; i < activeCount; i++) {
          const d = logos[i];
          d.x += d.vx;
          d.y += d.vy;

          let hitX = false;
          let hitY = false;

          if (d.x <= 0 || d.x + bw >= W) {
            d.vx = -d.vx;
            hitX = true;
            d.colorIdx = (d.colorIdx + 1) % colors.length;
          }
          if (d.y <= 0 || d.y + bh >= H) {
            d.vy = -d.vy;
            hitY = true;
            d.colorIdx = (d.colorIdx + 1) % colors.length;
          }

          if (hitX && hitY) {
            cornerHitsValRef.current += 1;
            if (cornerHitsDomRef.current) {
              cornerHitsDomRef.current.textContent = String(cornerHitsValRef.current);
            }
            addAuraToast(5000, 'DVD HIT THE EXACT CORNER! +5,000 AURA!', '🎯');
          }

          ctx.fillStyle = colors[d.colorIdx];
          ctx.fillRect(d.x, d.y, bw, bh);
          ctx.fillStyle = '#050505';
          ctx.fillText('DVD', d.x + bw / 2, d.y + 19);
        }
      };

      animId = requestAnimationFrame(renderDvd);
    }

    return () => cancelAnimationFrame(animId);
  }, [brainrotOpen, channel, isLargePip, addAuraToast]);

  const currentTldr =
    PAGE_TLDR[pathname] ||
    (pathname?.startsWith('/soc-lab/')
      ? {
          title: 'TL;DR SOC Lab (5s)',
          text: 'Spin up VMs, generate noisy attack traffic, and hunt every packet inside Wazuh Dashboard.',
        }
      : pathname?.startsWith('/info-sec')
      ? {
          title: 'TL;DR Security Notes (5s)',
          text: 'Field notes from script-kiddie beginnings to overthinking every single line of C and Python.',
        }
      : pathname?.startsWith('/blog')
      ? {
          title: 'TL;DR CTF Writeups (5s)',
          text: 'Capturing flags with cursed Python scripts, hex editors, and sheer caffeine.',
        }
      : null);

  const auraRank =
    aura >= 10000
      ? 'SIGMA ARCH GOD 🗿'
      : aura >= 2500
      ? 'ELITE HACKERMAN 💻'
      : aura >= 0
      ? 'CHILL GUY 🐧'
      : aura > -5000
      ? 'SUSPICIOUS IP 👀'
      : 'COOKED // WANTED 🚨';

  return (
    <div className="brainrot-hud-root">
      {/* ══ 1. FLOATING AURA & ADHD HUD PILLS (NO EXPENSIVE BACKDROP-BLUR) ═══ */}
      <div className="fixed bottom-4 left-16 z-[9990] flex flex-wrap items-center gap-2 font-mono text-xs select-none">
        <button
          type="button"
          onClick={() =>
            addAuraToast(
              100,
              `Rank: ${auraRank} (Right-click anywhere to open the Secret Root Menu!)`,
              '✨'
            )
          }
          className={`px-3.5 py-2 border transition-colors cursor-pointer flex items-center gap-2 shadow-lg ${
            aura < 0
              ? 'bg-[#260808] border-red-500/60 text-red-300'
              : 'bg-[#0A0A0A] border-[#333330] hover:border-[#3B82F6] text-[#F5F5F0]'
          }`}
        >
          <span className={aura < 0 ? 'text-red-400' : 'text-[#3B82F6]'}>●</span>
          <span className="font-bold">AURA: {aura.toLocaleString()}</span>
        </button>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-brainrot'))}
          className={`px-3.5 py-2 border transition-colors cursor-pointer flex items-center gap-2 shadow-lg font-bold ${
            brainrotOpen
              ? 'bg-[#3B82F6] border-[#3B82F6] text-black'
              : 'bg-[#0A0A0A] border-[#333330] hover:border-[#3B82F6] text-[#D8D8D1] hover:text-white'
          }`}
        >
          <span>🧠</span>
          <span>{brainrotOpen ? 'ADHD: ON' : 'ADHD_MODE'}</span>
        </button>

        {currentTldr && pathname !== '/' && (
          <button
            type="button"
            onClick={() => {
              setShowTldr((prev) => !prev);
              if (!showTldr) {
                addAuraToast(250, 'Activated 5-second TL;DR speedrun mode!', '📖');
              }
            }}
            className={`px-3.5 py-2 border transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg ${
              showTldr
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold'
                : 'bg-[#0A0A0A] border-[#333330] hover:border-[#3B82F6] text-[#D8D8D1] hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>TL;DR 5s</span>
          </button>
        )}
      </div>

      {/* ══ 2. TL;DR SUMMARY POPUP BANNER ════════════════════════════════════ */}
      {showTldr && currentTldr && (
        <div className="fixed bottom-16 left-16 z-[9991] max-w-md bg-[#0D131F] border border-[#3B82F6] p-4 shadow-2xl font-mono text-xs sm:text-sm text-[#F5F5F0]">
          <div className="flex items-center justify-between gap-3 border-b border-[#3B82F6]/30 pb-2 mb-2">
            <span className="text-[#3B82F6] font-bold uppercase tracking-wider">
              🧠 {currentTldr.title}
            </span>
            <button
              type="button"
              onClick={() => setShowTldr(false)}
              className="text-[#A9A9A2] hover:text-white px-1.5 cursor-pointer"
            >
              [X]
            </button>
          </div>
          <p className="font-sans text-[#D8D8D1] leading-relaxed">{currentTldr.text}</p>
        </div>
      )}

      {/* ══ 3. AURA DYNAMIC ISLAND (TOP-CENTER HEADBAR, ONLY POPS IN ON AURA EVENTS) ══ */}
      <div
        className={`fixed top-3 left-1/2 -translate-x-1/2 z-[9995] font-mono select-none flex flex-col items-center transition-all duration-300 ease-out ${
          island.active || islandOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-6 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={() => setIslandOpen((o) => !o)}
          className={`aura-island relative overflow-hidden flex items-center gap-2.5 border rounded-full bg-[#070707] cursor-pointer ${
            island.active
              ? island.delta >= 0
                ? 'aura-island--open border-[#3B82F6] shadow-[0_0_24px_rgba(59,130,246,0.4)]'
                : 'aura-island--open border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.4)]'
              : 'border-[#262624] hover:border-[#3B82F6]'
          }`}
          title="Aura Ledger (click to toggle transaction log)"
        >
          {/* Scanline sweep on each new event */}
          {island.active && (
            <span
              key={island.key}
              className={`aura-island__sweep ${island.delta >= 0 ? 'bg-[#3B82F6]/25' : 'bg-red-500/25'}`}
            />
          )}

          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              aura < 0 ? 'bg-red-500' : island.active ? 'bg-[#3B82F6] animate-pulse' : 'bg-[#3B82F6]/60'
            }`}
          />

          {island.active ? (
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-sm leading-none">{island.emoji}</span>
              <span
                className={`text-xs font-bold tabular-nums ${
                  island.delta >= 0 ? 'text-[#60A5FA]' : 'text-red-400'
                }`}
              >
                {island.delta >= 0 ? '+' : ''}
                {island.delta.toLocaleString()}
              </span>
              {island.combo > 1 && (
                <span key={island.combo} className="aura-island__combo text-[10px] font-bold text-amber-300">
                  x{island.combo} COMBO
                </span>
              )}
              <span className="text-[10px] text-[#A9A9A2] whitespace-nowrap">
                {island.reason}
              </span>
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#A9A9A2]">
              aura<span className="text-[#3B82F6]">.ledger</span>
            </span>
          )}

          <span className="text-[10px] text-[#666660]">|</span>
          <span className={`text-xs font-bold tabular-nums ${aura < 0 ? 'text-red-400' : 'text-[#F5F5F0]'}`}>
            <span ref={auraNumDomRef} />
          </span>
        </button>

        {/* Expandable ledger: last 6 transactions */}
        {islandOpen && (
          <div className="mt-2 w-[min(94vw,460px)] bg-[#070707] border border-[#262624] shadow-[0_16px_40px_rgba(0,0,0,0.85)] text-[11px]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1C1C1A]">
              <span className="text-[#3B82F6] font-bold uppercase tracking-wider">$ tail -f aura.log</span>
              <div className="flex items-center gap-2">
                <span className="text-[#A9A9A2]">{auraRank}</span>
                <button
                  type="button"
                  onClick={() => setIslandOpen(false)}
                  className="text-[#666660] hover:text-white px-1 cursor-pointer"
                  title="Close log"
                >
                  [X]
                </button>
              </div>
            </div>
            {auraLog.length === 0 ? (
              <div className="px-3 py-3 text-[#A9A9A2]">No transactions yet. Go pet the companion.</div>
            ) : (
              <ul className="divide-y divide-[#141413]">
                {auraLog.map((l) => (
                  <li key={l.id} className="flex items-center gap-2.5 px-3 py-1.5">
                    <span className="text-[#666660] tabular-nums shrink-0">{l.time}</span>
                    <span className="shrink-0">{l.emoji}</span>
                    <span
                      className={`font-bold tabular-nums shrink-0 w-16 ${
                        l.delta >= 0 ? 'text-[#60A5FA]' : 'text-red-400'
                      }`}
                    >
                      {l.delta >= 0 ? '+' : ''}
                      {l.delta.toLocaleString()}
                    </span>
                    <span className="text-[#D8D8D1] break-words">{l.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ══ 4. ZERO-DEPENDENCY GPU-DRAGGABLE ADHD ARCADE PIP WIDGET ══════════ */}
      {brainrotOpen && (
        <div
          ref={pipWindowRef}
          style={{
            transform: `translate3d(${dragOffsetRef.current.x}px, ${dragOffsetRef.current.y}px, 0)`,
            willChange: 'transform',
          }}
          className={`fixed bottom-16 right-6 z-[9992] bg-[#0A0A0A] border-2 border-[#3B82F6] shadow-[0_16px_48px_rgba(0,0,0,0.85)] font-mono text-xs overflow-hidden select-none ${
            isLargePip ? 'w-[94vw] sm:w-[580px]' : 'w-[90vw] sm:w-[440px]'
          }`}
        >
          {/* PiP Drag Header (Native Pointer Capture) */}
          <div
            onPointerDown={handleHeaderPointerDown}
            onPointerMove={handleHeaderPointerMove}
            onPointerUp={handleHeaderPointerUp}
            onPointerCancel={handleHeaderPointerUp}
            className="px-4 py-2.5 bg-[#111111] border-b border-[#262624] flex items-center justify-between cursor-move touch-none"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
              <span className="font-bold text-white tracking-wider uppercase text-xs sm:text-sm">
                ADHD_ARCADE_OS // {channel.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLargePip((prev) => !prev)}
                className="px-2 py-0.5 border border-[#333330] bg-[#181818] text-[#D8D8D1] hover:border-[#3B82F6] hover:text-white text-[11px] cursor-pointer"
                title="Expand / Compact window"
              >
                {isLargePip ? '[ ⛶ COMPACT ]' : '[ ⛶ EXPAND ]'}
              </button>
              <button
                type="button"
                onClick={() => setBrainrotOpen(false)}
                className="px-2 py-0.5 border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-black font-bold text-[11px] cursor-pointer"
              >
                [X]
              </button>
            </div>
          </div>

          {/* 5 Lightweight Channel Tabs (Bocchi GIF Removed) */}
          <div className="grid grid-cols-5 border-b border-[#222220] bg-[#070707] text-[11px]">
            {[
              { id: 'subway', label: '🚄 SUBWAY' },
              { id: 'flappy', label: '🐧 FLAPPY' },
              { id: 'crush', label: '💥 CRUSH' },
              { id: 'gacha', label: '🎰 GACHA' },
              { id: 'dvd', label: '💿 DVDx20' },
            ].map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannel(ch.id as BrainrotChannel)}
                className={`py-2 font-bold uppercase transition-colors cursor-pointer truncate px-1 ${
                  channel === ch.id
                    ? 'bg-[#3B82F6] text-black'
                    : 'text-[#A9A9A2] hover:text-white hover:bg-[#141414]'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Viewport Content */}
          <div
            className={`relative bg-[#050505] flex flex-col items-center justify-center overflow-hidden ${
              isLargePip ? 'h-[390px]' : 'h-[310px]'
            }`}
          >
            {/* CHANNEL 04: GACHA SLOT MACHINE */}
            {channel === 'gacha' && (
              <div className="w-full h-full p-6 flex flex-col items-center justify-between bg-gradient-to-b from-[#080D1A] to-[#050505]">
                <div className="text-center space-y-1">
                  <div className="text-xs text-[#3B82F6] font-bold uppercase tracking-widest">
                    AURA CASINO //PROVABLY UNFAIR RNG
                  </div>
                  <div className="text-sm text-[#D8D8D1]">{gachaMsg}</div>
                </div>

                <div className="flex items-center gap-4 my-2">
                  {slots.map((sym, i) => (
                    <div
                      key={i}
                      className={`w-20 h-24 sm:w-24 sm:h-28 border-2 flex items-center justify-center text-4xl sm:text-5xl bg-[#0A0A0A] transition-transform ${
                        isSpinning ? 'border-[#3B82F6] scale-95' : 'border-[#333330]'
                      }`}
                    >
                      {sym}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
                  <button
                    type="button"
                    disabled={isSpinning}
                    onClick={() => spinGacha(100)}
                    className="px-3.5 py-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-black font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    SPIN (-100)
                  </button>
                  <button
                    type="button"
                    disabled={isSpinning}
                    onClick={() => spinGacha(1000)}
                    className="px-3.5 py-2 border border-amber-400 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    VIP SPIN (-1,000)
                  </button>
                  <button
                    type="button"
                    disabled={isSpinning}
                    onClick={() => spinGacha(Math.max(500, Math.abs(Math.floor(aura / 2))))}
                    className="px-3.5 py-2 border border-red-500 bg-red-500/15 hover:bg-red-500/25 text-red-300 font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    ALL-IN 50% 💀
                  </button>
                </div>
              </div>
            )}

            {/* CANVAS CHANNELS: SUBWAY, FLAPPY, CRUSH, DVD */}
            {channel !== 'gacha' && (
              <canvas
                ref={canvasRef}
                width={isLargePip ? 560 : 436}
                height={isLargePip ? 390 : 310}
                onClick={() => {
                  if (channel === 'flappy') {
                    if (flappyBotRef.current) setFlappyBot(false);
                    flappyJumpTriggerRef.current = true;
                  }
                }}
                className="w-full h-full block cursor-pointer"
              />
            )}

            {/* SUBWAY OVERLAY CONTROLS */}
            {channel === 'subway' && (
              <div className="absolute inset-x-0 bottom-3 px-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAutoPilot(false);
                      autoPilotRef.current = false;
                      runnerLaneRef.current = Math.max(0, runnerLaneRef.current - 1);
                    }}
                    className="px-3 py-1.5 bg-black/90 border border-[#333330] text-white hover:border-[#3B82F6] cursor-pointer font-bold"
                  >
                    ◀ LEFT
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoPilot(false);
                      autoPilotRef.current = false;
                      runnerLaneRef.current = Math.min(2, runnerLaneRef.current + 1);
                    }}
                    className="px-3 py-1.5 bg-black/90 border border-[#333330] text-white hover:border-[#3B82F6] cursor-pointer font-bold"
                  >
                    RIGHT ▶
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAutoPilot((a) => !a)}
                    className={`px-2.5 py-1.5 border cursor-pointer font-bold ${
                      autoPilot
                        ? 'bg-[#3B82F6] border-[#3B82F6] text-black'
                        : 'bg-black/90 border-[#333330] text-[#D8D8D1]'
                    }`}
                  >
                    {autoPilot ? '🤖 AUTO: ON' : '🎮 MANUAL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRunnerSpeedMult((m) => (m >= 3 ? 1 : m + 1))}
                    className="px-2.5 py-1.5 bg-black/90 border border-[#333330] hover:border-[#3B82F6] text-cyan-400 font-bold cursor-pointer"
                  >
                    {runnerSpeedMult}x SPEED
                  </button>
                </div>

                <span className="px-3 py-1.5 bg-black/90 border border-yellow-500/40 text-yellow-400 font-bold">
                  🪙 <span ref={runnerScoreDomRef}>{runnerScoreValRef.current}</span>
                </span>
              </div>
            )}

            {/* FLAPPY MEME OVERLAY CONTROLS */}
            {channel === 'flappy' && (
              <div className="absolute inset-x-0 bottom-3 px-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1">
                  {['🐧', '🗿', '🤡', '💀'].map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => setFlappySkin(sk)}
                      className={`px-2 py-1 border cursor-pointer ${
                        flappySkin === sk
                          ? 'border-[#3B82F6] bg-[#3B82F6]/20'
                          : 'border-[#262624] bg-black/90'
                      }`}
                    >
                      {sk}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setFlappyBot((b) => !b)}
                  className={`px-2.5 py-1 border font-bold cursor-pointer ${
                    flappyBot
                      ? 'bg-[#3B82F6] border-[#3B82F6] text-black'
                      : 'bg-black/90 border-[#333330] text-white'
                  }`}
                >
                  {flappyBot ? '🤖 BOT: ON (Click to Play)' : '🎮 MANUAL'}
                </button>

                <span className="px-2.5 py-1 bg-black/90 border border-[#333330] text-emerald-400 font-bold">
                  SCORE: <span ref={flappyScoreDomRef}>{flappyScoreValRef.current}</span>
                </span>
              </div>
            )}

            {/* HYDRAULIC CRUSH OVERLAY CONTROLS */}
            {channel === 'crush' && (
              <div className="absolute inset-x-0 bottom-3 px-3 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    crushTriggerRef.current = true;
                    addAuraToast(150, '-1 deadline crushed!', '💥');
                  }}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-black font-bold uppercase cursor-pointer"
                >
                  💥 CRUSH PRESS
                </button>
                <span className="text-[10px] text-[#A9A9A2] bg-black/90 px-2 py-1 border border-[#222220] hidden sm:inline-block">
                  Hold mouse to spawn Gravity Vortex
                </span>
                <button
                  type="button"
                  onClick={() => {
                    spawnBlocksTriggerRef.current = true;
                  }}
                  className="px-3 py-1.5 bg-black/90 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-black font-bold cursor-pointer"
                >
                  + DROP BLOCKS
                </button>
              </div>
            )}

            {/* MULTI-DVD OVERLAY CONTROLS */}
            {channel === 'dvd' && (
              <div className="absolute inset-x-0 bottom-3 px-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDvdCount((c) => Math.min(20, c + 3))}
                    className="px-3 py-1.5 bg-[#3B82F6] text-black font-bold cursor-pointer"
                  >
                    + ADD DVD ({dvdCount}/20)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDvdCount(1)}
                    className="px-2.5 py-1.5 bg-black/90 border border-[#333330] text-[#A9A9A2] hover:text-white cursor-pointer"
                  >
                    RESET (1)
                  </button>
                </div>
                <span className="px-3 py-1.5 bg-black/90 border border-emerald-500/40 text-emerald-400 font-bold">
                  🎯 CORNERS: <span ref={cornerHitsDomRef}>{cornerHitsValRef.current}</span>
                </span>
              </div>
            )}
          </div>

          {/* Footer Status Bar */}
          <div className="px-4 py-2 bg-[#0D0D0D] border-t border-[#222220] text-[11px] text-[#A9A9A2] flex items-center justify-between">
            <span>Drag header to move window</span>
            <span className="text-[#3B82F6] font-bold">AURA: {aura.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ══ 5. CUSTOM RIGHT-CLICK CONTEXT MENU (ENGLISH, ZERO FRAMER-MOTION) ══ */}
      {ctxMenu.visible && (
        <div
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
          className="fixed z-[99999] w-72 bg-[#0A0A0A] border border-[#3B82F6] shadow-[0_12px_40px_rgba(0,0,0,0.9)] font-mono text-xs text-[#F5F5F0] overflow-hidden select-none"
        >
          <div className="px-3.5 py-2 bg-[#111111] border-b border-[#262624] flex items-center justify-between text-[10px]">
            <span className="text-[#3B82F6] font-bold uppercase tracking-wider">
              ROOT // MENU
            </span>
            <span className="text-[#A9A9A2]">AURA: {aura.toLocaleString()}</span>
          </div>

          <div className="p-1.5 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggle-brainrot'));
                setCtxMenu({ visible: false, x: 0, y: 0 });
              }}
              className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>🧠 {brainrotOpen ? 'Close ADHD Arcade' : 'Open ADHD Arcade'}</span>
              <span className="text-[10px] text-[#A9A9A2]">Alt+B</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBrainrotOpen(true);
                setChannel('gacha');
                setCtxMenu({ visible: false, x: 0, y: 0 });
              }}
              className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>🎰 Open Aura Casino</span>
              <span className="text-[10px] text-amber-400">CASINO</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !australianMode;
                setAustralianMode(next);
                addAuraToast(
                  next ? 777 : 100,
                  next
                    ? 'Australian Mode ON: Flipped the world 180°!'
                    : 'Gravity restored to normal.',
                  '🙃'
                );
                setCtxMenu({ visible: false, x: 0, y: 0 });
              }}
              className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>🙃 {australianMode ? 'Disable 180° Flip' : 'Flip Web 180°'}</span>
              <span className="text-[10px] text-[#A9A9A2]">FLIP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !raveMode;
                setRaveMode(next);
                addAuraToast(
                  next ? 888 : 100,
                  next ? 'RGB RAVE OVERDRIVE! -1 GPU' : 'RGB Rave disabled.',
                  '🌈'
                );
                setCtxMenu({ visible: false, x: 0, y: 0 });
              }}
              className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>🌈 {raveMode ? 'Disable RGB' : 'Enable RGB'}</span>
              <span className="text-[10px] text-pink-400">RAVE</span>
            </button>

            <button
              type="button"
              onClick={() => {
                addAuraToast(1000, 'Dirty buff +1,000 Aura successful!', '💸');
                setCtxMenu({ visible: false, x: 0, y: 0 });
              }}
              className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>⚡ Dirty Buff +1,000 Aura</span>
              <span className="text-[10px] text-emerald-400">+1K</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const isNowLight = document.documentElement.classList.toggle('light-theme');
                addAuraToast(
                  isNowLight ? -500 : 500,
                  isNowLight
                    ? 'FLASHBANG DEPLOYED! Are your retinas okay?!'
                    : 'Back to Dark Mode. Your eyes have been saved.',
                  isNowLight ? '🔦' : '🕶️'
                );
                setCtxMenu({ visible: false, x: 0, y: 0 });
              }}
              className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>🔦 Toggle Light / Dark Theme</span>
              <span className="text-[10px] text-[#A9A9A2]">THEME</span>
            </button>

            <div className="my-1 border-t border-[#222220]" />

            <button
              type="button"
              onClick={() => {
                addAuraToast(-2000, 'Fell for the free cookie bait!', '🍪');
                setCtxMenu({ visible: false, x: 0, y: 0 });
                router.push('/free-cookie');
              }}
              className="w-full px-3 py-2 text-left hover:bg-red-500/15 hover:text-red-400 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>🍪 Claim Free Cookie</span>
              <span className="text-[10px] text-green-400">100% LEGIT</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCtxMenu({ visible: false, x: 0, y: 0 });
                router.push('/');
              }}
              className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>🏠 Return Home</span>
              <span className="text-[10px] text-[#A9A9A2]">/</span>
            </button>
          </div>

          <div className="px-3 py-1.5 bg-[#070707] border-t border-[#1C1C1A] text-[9px] text-[#A9A9A2]">
            Right-click again for native browser menu
          </div>
        </div>
      )}
    </div>
  );
}
