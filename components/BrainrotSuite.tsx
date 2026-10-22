'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface AuraToast {
  id: string;
  delta: number;
  reason: string;
  emoji: string;
}

type BrainrotChannel = 'subway' | 'flappy' | 'crush' | 'gacha' | 'dvd' | 'bocchi';

const PAGE_TLDR: Record<string, { title: string; text: string }> = {
  '/': {
    title: 'TL;DR Trang Chủ',
    text: 'Giao diện tối giản kiểu tạp chí công nghệ, bên trong chứa meme, mèo ASCII và các dự án thức trắng đêm.',
  },
  '/projects/e-gov': {
    title: 'TL;DR e-Gov Signature (5s)',
    text: 'Hệ thống ký số PDF bọc thép 5 lớp mạng Docker. Giấu khóa trong SoftHSM2, ai lén sửa đúng 1 byte trong PDF là chữ ký báo đỏ lòm, sổ cái WORM ghi vết vĩnh viễn.',
  },
  '/projects/rfid': {
    title: 'TL;DR RFID Vault (5s)',
    text: 'Hệ thống điểm danh ESP32 2 nhân độc lập. Đọc thẻ dưới 12ms, có khóa chống spam 15 giây.',
  },
  '/projects/fallguard': {
    title: 'TL;DR FallGuard (5s)',
    text: 'Hệ thống AI YOLOv8 + Radar mmWave giám sát người cao tuổi ở một mình. Phát hiện té ngã là bắn cảnh báo qua Telegram.',
  },
  '/soc-lab/05-recon-web-waf-wazuh': {
    title: 'TL;DR Lab Wazuh Kill Chain (5s)',
    text: 'Coming soon...',
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
  const [toasts, setToasts] = useState<AuraToast[]>([]);
  const [brainrotOpen, setBrainrotOpen] = useState<boolean>(false);
  const [isLargePip, setIsLargePip] = useState<boolean>(false);
  const [channel, setChannel] = useState<BrainrotChannel>('subway');
  const [showTldr, setShowTldr] = useState<boolean>(false);

  // Weird Page-Wide Visual Mutators
  const [australianMode, setAustralianMode] = useState<boolean>(false);
  const [raveMode, setRaveMode] = useState<boolean>(false);

  // Custom Right-Click Context Menu state
  const [ctxMenu, setCtxMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  // 01. Subway Runner state
  const [runnerLane, setRunnerLane] = useState<number>(1);
  const [runnerScore, setRunnerScore] = useState<number>(0);
  const [runnerSpeedMult, setRunnerSpeedMult] = useState<number>(1);
  const runnerLaneRef = useRef<number>(1);
  const runnerSpeedRef = useRef<number>(1);
  const [autoPilot, setAutoPilot] = useState<boolean>(true);
  const autoPilotRef = useRef<boolean>(true);

  // 02. Flappy Meme state
  const [flappyBot, setFlappyBot] = useState<boolean>(true);
  const flappyBotRef = useRef<boolean>(true);
  const [flappySkin, setFlappySkin] = useState<string>('🐧');
  const flappySkinRef = useRef<string>('🐧');
  const [flappyScore, setFlappyScore] = useState<number>(0);
  const flappyJumpTriggerRef = useRef<boolean>(false);

  // 03. Hydraulic Press / Particle Vortex state
  const crushTriggerRef = useRef<boolean>(false);
  const spawnBlocksTriggerRef = useRef<boolean>(false);

  // 04. Gacha Slot Machine state
  const [slots, setSlots] = useState<string[]>(['🗿', '7️⃣', '🐧']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [gachaMsg, setGachaMsg] = useState<string>('Đặt cược Aura để quay số đổi đời!');

  // 05. Multi-DVD state
  const [dvdCount, setDvdCount] = useState<number>(3);
  const dvdCountRef = useRef<number>(3);
  const [cornerHits, setCornerHits] = useState<number>(0);

  // 06. Bocchi Meme Studio state
  // CÁCH THÊM GIF MỚI: Bỏ file .gif/.webp vào thư mục public/images/ rồi thêm vào danh sách dưới đây,
  // hoặc dán trực tiếp link GIF (Giphy/Tenor/Discord) vào trường `src`!
  const [overdriveLevel, setOverdriveLevel] = useState<number>(2);
  const [bocchiImgIdx, setBocchiImgIdx] = useState<number>(0);
  const [bocchiFxMode, setBocchiFxMode] = useState<'normal' | 'deepfry' | 'livecam' | 'panic'>('livecam');
  const [bocchiCaptionIdx, setBocchiCaptionIdx] = useState<number>(0);
  const [showAddGifInput, setShowAddGifInput] = useState<boolean>(false);
  const [customGifUrl, setCustomGifUrl] = useState<string>('');
  const [bocchiStickers, setBocchiStickers] = useState<
    { id: number; x: number; y: number; emoji: string }[]
  >([]);
  const [bocchiMemes, setBocchiMemes] = useState<
    { src: string; name: string }[]
  >([
    { src: '/images/bocchi-the-rock-bocchi.gif', name: 'Bocchi Glitch.gif' },
    { src: '/rickroll.gif', name: 'Never Gonna Give You Up.gif' },
    { src: '/images/68b59-malware-meme.webp', name: 'Malware Panic.webp' },
    { src: '/images/ransomware_meme.webp', name: 'Ransomware Moment.webp' },
    { src: '/images/hidden_rootkits.webp', name: 'Hidden Rootkit.webp' },
    { src: '/meme3.jpg', name: 'Security Mood.jpg' },
  ]);

  const BOCCHI_CAPTIONS = [
    { top: '', bottom: '' }, // Tắt chữ
  ];

  const BOCCHI_LIVE_CHAT = [
    { user: 'root_penguin', msg: 'hết cứu thật sự 💀💀', color: '#3B82F6' },
    { user: '67_bot', msg: 'ALERT LEVEL 15: Tế bào não vừa bốc hơi', color: '#EF4444' },
    { user: 'sigma_coder', msg: 'sudo rm -rf / --no-preserve-root 🐧', color: '#10B981' },
    { user: 'bocchi_fan99', msg: 'hay', color: '#EC4899' },
    { user: 'rong_thanh_hoa', msg: '+9999 aura pha xử lý này 🗿', color: '#F59E0B' },
  ];

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

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, delta, reason, emoji }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Load saved Aura + print F12 Console Easter Egg
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ka_aura_points');
      if (saved !== null) setAura(parseInt(saved, 10) || 1000);
    } catch {}

    console.log(
      `%c
   /\\_/\\   [ There's nothing here lmao]
  ( o.o )  🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧
   > ^ <   🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧🐧
      `,
      'color: #3B82F6; font-family: monospace; font-weight: bold; font-size: 13px;'
    );
  }, []);

  // Apply Australian Mode (180deg flip) & RGB Rave Mode to document body
  useEffect(() => {
    const html = document.documentElement;
    if (australianMode) {
      html.style.transform = 'rotate(180deg)';
      html.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    } else {
      html.style.transform = '';
    }
  }, [australianMode]);

  useEffect(() => {
    if (!raveMode) {
      document.documentElement.style.filter = '';
      return;
    }
    let deg = 0;
    const id = setInterval(() => {
      deg = (deg + 15) % 360;
      document.documentElement.style.filter = `hue-rotate(${deg}deg) contrast(1.08)`;
    }, 80);
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
        addAuraToast(
          next ? 500 : 100,
          next
            ? 'Đã bật ADHD Stimulator: Tăng 200% độ tập trung!'
            : 'Đã tắt ADHD Stimulator.',
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

  // Reward user when scrolling to the bottom of an article / project pageết
  useEffect(() => {
    if (!pathname || pathname === '/') return;

    const onScroll = () => {
      if (scrolledPathsRef.current.has(pathname)) return;
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 180;
      if (scrolledToBottom && document.documentElement.scrollHeight > window.innerHeight * 1.4) {
        scrolledPathsRef.current.add(pathname);
        addAuraToast(
          2500,
          'Đọc hết bài! +2,500 Tế bào não',
          '🎓'
        );
      }
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
          setRunnerLane((l) => Math.max(0, l - 1));
        } else if (e.key === 'ArrowRight') {
          setAutoPilot(false);
          setRunnerLane((l) => Math.min(2, l + 1));
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
      const menuWidth = 280;
      const menuHeight = 350;
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
    runnerLaneRef.current = runnerLane;
  }, [runnerLane]);

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

  // Gacha Slot Machine handler
  const spinGacha = (bet: number) => {
    if (isSpinning) return;
    setIsSpinning(true);
    setAura((prev) => prev - bet);
    setGachaMsg('Đang quay số...');

    const symbols = ['🐧', '🗿', '💎', '7️⃣', '💀', '🔥'];
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setSlots([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);

      if (ticks >= 16) {
        clearInterval(interval);
        // Determine outcome with generous fun odds
        const roll = Math.random();
        let finalSlots: string[];
        if (roll < 0.25) {
          // Jackpot 3 of a kind!
          const winSym = ['7️⃣', '🗿', '💎', '🐧'][Math.floor(Math.random() * 4)];
          finalSlots = [winSym, winSym, winSym];
          const reward = bet * 15;
          setSlots(finalSlots);
          setGachaMsg(`JACKPOT ${winSym}${winSym}${winSym}! Nhận +${reward.toLocaleString()} AURA!`);
          addAuraToast(reward, `NỔ HŨ GACHA ${winSym}${winSym}${winSym}! Tày r!`, '🎰');
        } else if (roll < 0.55) {
          // 2 of a kind
          const pairSym = symbols[Math.floor(Math.random() * 4)];
          finalSlots = [pairSym, pairSym, '🔥'];
          const reward = Math.floor(bet * 2.5);
          setSlots(finalSlots);
          setGachaMsg(`Trúng cặp đôi ${pairSym}${pairSym}! +${reward.toLocaleString()} AURA`);
          addAuraToast(reward, `Quay trúng cặp đôi ${pairSym}${pairSym}!`, '✨');
        } else {
          // Bust
          finalSlots = ['💀', '🐧', '🗿'];
          setSlots(finalSlots);
          setGachaMsg(`Toác (-${bet} Aura)! Còn thở là còn gỡ!`);
        }
        setIsSpinning(false);
      }
    }, 65);
  };

  // Main Canvas Engine for Subway 3D, Flappy Meme, Hydraulic Crush, and Multi-DVD
  useEffect(() => {
    if (!brainrotOpen || channel === 'gacha' || channel === 'bocchi') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const W = canvas.width;
    const H = canvas.height;

    if (channel === 'subway') {
      // 3D-Perspective Cyber Subway Surfers
      let tick = 0;
      const obstacles: { lane: number; z: number; color: string }[] = [
        { lane: 0, z: 0.1, color: '#EF4444' },
        { lane: 2, z: 0.55, color: '#F97316' },
      ];
      const coins: { lane: number; z: number }[] = [
        { lane: 1, z: 0.2 },
        { lane: 1, z: 0.4 },
        { lane: 1, z: 0.6 },
      ];

      const horizonY = 58;
      const groundH = H - horizonY;

      const project = (lane: number, z: number) => {
        // z goes from 0 (horizon) to 1 (bottom player plane)
        const scale = 0.22 + z * 0.78;
        const y = horizonY + Math.pow(z, 1.35) * groundH;
        const roadWidth = W * scale;
        const leftEdge = (W - roadWidth) / 2;
        const laneW = roadWidth / 3;
        const x = leftEdge + lane * laneW + laneW / 2;
        return { x, y, scale, laneW };
      };

      const renderSubway = () => {
        const mult = runnerSpeedRef.current;
        const zStep = 0.014 * mult;
        tick++;

        // Cyber Sky & Horizon
        ctx.fillStyle = '#050811';
        ctx.fillRect(0, 0, W, horizonY);

        // Retro Sun at horizon
        const sunGrad = ctx.createLinearGradient(0, 12, 0, horizonY);
        sunGrad.addColorStop(0, '#3B82F6');
        sunGrad.addColorStop(1, '#1D4ED8');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(W / 2, horizonY, 34, Math.PI, 0);
        ctx.fill();

        // Ground
        ctx.fillStyle = '#070A12';
        ctx.fillRect(0, horizonY, W, groundH);

        // Perspective Lanes
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i <= 3; i++) {
          const topX = W * 0.39 + (i * (W * 0.22)) / 3;
          const botX = (i * W) / 3;
          ctx.beginPath();
          ctx.moveTo(topX, horizonY);
          ctx.lineTo(botX, H);
          ctx.stroke();
        }

        // Moving horizontal ties
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.14)';
        for (let n = 0; n < 10; n++) {
          const z = ((n / 10 + tick * zStep) % 1);
          const pLeft = project(0, z);
          const pRight = project(2, z);
          ctx.beginPath();
          ctx.moveTo(pLeft.x - pLeft.laneW / 2, pLeft.y);
          ctx.lineTo(pRight.x + pRight.laneW / 2, pRight.y);
          ctx.stroke();
        }

        // Spawn trains & coins
        if (tick % Math.max(14, Math.floor(38 / mult)) === 0) {
          const obLane = Math.floor(Math.random() * 3);
          obstacles.push({
            lane: obLane,
            z: 0.01,
            color: obLane === 1 ? '#EF4444' : '#F97316',
          });
          const coinLane = (obLane + 1 + Math.floor(Math.random() * 2)) % 3;
          coins.push({ lane: coinLane, z: 0.01 });
        }

        // Auto-pilot dodge
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
              setRunnerLane(safeLanes[0]);
            }
          }
        }

        // Draw coins
        for (let i = coins.length - 1; i >= 0; i--) {
          const c = coins[i];
          c.z += zStep;
          const p = project(c.lane, c.z);
          const r = Math.max(3, 12 * p.scale);

          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.arc(p.x, p.y - r, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FEF08A';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          if (Math.abs(c.z - playerZ) < 0.07 && c.lane === runnerLaneRef.current) {
            setRunnerScore((s) => s + 10);
            coins.splice(i, 1);
          } else if (c.z > 1.05) {
            coins.splice(i, 1);
          }
        }

        // Draw oncoming trains
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i];
          o.z += zStep;
          const p = project(o.lane, o.z);
          const w = p.laneW * 0.72;
          const h = 48 * p.scale;

          ctx.fillStyle = o.color;
          ctx.fillRect(p.x - w / 2, p.y - h, w, h);
          // Train windshield & headlights
          ctx.fillStyle = '#E0F2FE';
          ctx.fillRect(p.x - w * 0.36, p.y - h * 0.82, w * 0.72, h * 0.28);
          ctx.fillStyle = '#FEF08A';
          ctx.fillRect(p.x - w * 0.36, p.y - h * 0.22, w * 0.2, h * 0.12);
          ctx.fillRect(p.x + w * 0.16, p.y - h * 0.22, w * 0.2, h * 0.12);

          if (Math.abs(o.z - playerZ) < 0.06 && o.lane === runnerLaneRef.current && !autoPilotRef.current) {
            obstacles.splice(i, 1);
            setRunnerScore((s) => Math.max(0, s - 25));
          } else if (o.z > 1.05) {
            obstacles.splice(i, 1);
            setRunnerScore((s) => s + 2);
          }
        }

        // Draw Player Surfer
        const playerProj = project(runnerLaneRef.current, playerZ);
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(playerProj.x, playerProj.y - 18, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#93C5FD';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🐧', playerProj.x, playerProj.y - 12);

        animId = requestAnimationFrame(renderSubway);
      };

      animId = requestAnimationFrame(renderSubway);
    } else if (channel === 'flappy') {
      // Playable / AI-Bot Flappy Meme
      let birdY = H / 2;
      let birdV = 0;
      const gravity = 0.28;
      const jump = -5.6;
      const pipes: { x: number; gapTop: number; passed: boolean }[] = [
        { x: W * 0.65, gapTop: 70, passed: false },
        { x: W + 80, gapTop: 120, passed: false },
      ];
      const gapH = 98;
      const pipeW = 46;
      const birdX = 76;

      const renderFlappy = () => {
        ctx.fillStyle = '#060911';
        ctx.fillRect(0, 0, W, H);

        // Background cyber grid
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        for (let gx = 0; gx < W; gx += 32) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, H);
          ctx.stroke();
        }

        // AI Bot auto-flap logic
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

        // Update & draw laser pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
          const p = pipes[i];
          p.x -= 2.5;

          ctx.fillStyle = '#1E293B';
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2;

          // Top pipe
          ctx.fillRect(p.x, 0, pipeW, p.gapTop);
          ctx.strokeRect(p.x, 0, pipeW, p.gapTop);

          // Bottom pipe
          const botY = p.gapTop + gapH;
          ctx.fillRect(p.x, botY, pipeW, H - botY);
          ctx.strokeRect(p.x, botY, pipeW, H - botY);

          if (!p.passed && p.x + pipeW < birdX) {
            p.passed = true;
            setFlappyScore((s) => s + 1);
          }

          // Collision check in manual mode
          if (
            !flappyBotRef.current &&
            birdX + 12 > p.x &&
            birdX - 12 < p.x + pipeW &&
            (birdY - 12 < p.gapTop || birdY + 12 > p.gapTop + gapH)
          ) {
            birdY = H / 2;
            birdV = 0;
            setFlappyScore(0);
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

        // Draw Bird Skin
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(flappySkinRef.current, birdX, birdY);

        animId = requestAnimationFrame(renderFlappy);
      };

      animId = requestAnimationFrame(renderFlappy);
    } else if (channel === 'crush') {
      // Hydraulic Crusher & Gravity Particle Sandbox
      interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: string;
      }
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#A855F7', '#F43F5E'];
      let particles: Particle[] = [];
      let pressY = 18;
      let pressing = false;

      const spawnTower = () => {
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 9; c++) {
            particles.push({
              x: W / 2 - 72 + c * 18,
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

      const renderCrush = () => {
        ctx.fillStyle = 'rgba(6, 8, 14, 0.35)';
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
          pressY += 14;
          if (pressY >= H - 45) {
            pressing = false;
            // Shatter particles outward!
            for (const p of particles) {
              p.vx = (Math.random() - 0.5) * 18;
              p.vy = -Math.random() * 15 - 4;
              p.size = Math.max(6, p.size * 0.75);
            }
          }
        } else if (pressY > 18) {
          pressY = Math.max(18, pressY - 4);
        }

        // Draw Hydraulic Press Head
        ctx.fillStyle = '#334155';
        ctx.fillRect(W / 2 - 22, 0, 44, pressY);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(40, pressY, W - 80, 22);
        ctx.strokeStyle = '#FCA5A5';
        ctx.strokeRect(40, pressY, W - 80, 22);

        // Black Hole Vortex when holding mouse
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
            p.vx += (dx / dist) * 1.4;
            p.vy += (dy / dist) * 1.4;
          } else {
            p.vy += 0.38; // gravity
          }

          p.vx *= 0.985;
          p.vy *= 0.985;
          p.x += p.vx;
          p.y += p.vy;

          // Collide with Hydraulic Press
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

        animId = requestAnimationFrame(renderCrush);
      };

      animId = requestAnimationFrame(renderCrush);
      return () => {
        cancelAnimationFrame(animId);
        canvas.removeEventListener('mousedown', onDown);
        canvas.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    } else if (channel === 'dvd') {
      // Multi-DVD Chaos Bouncer
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#A855F7', '#06B6D4'];
      const bw = 64;
      const bh = 30;
      const logos = Array.from({ length: 20 }, (_, i) => ({
        x: 20 + ((i * 53) % (W - bw - 40)),
        y: 20 + ((i * 41) % (H - bh - 40)),
        vx: (i % 2 === 0 ? 1 : -1) * (2.4 + (i % 3) * 0.6),
        vy: (i % 3 === 0 ? 1 : -1) * (1.9 + (i % 2) * 0.6),
        colorIdx: i % colors.length,
      }));

      const renderDvd = () => {
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
            setCornerHits((c) => c + 1);
            addAuraToast(5000, 'DVD ĐẬP TRÚNG GÓC VUÔNG! +5,000 AURA!', '🎯');
          }

          ctx.fillStyle = colors[d.colorIdx];
          ctx.fillRect(d.x, d.y, bw, bh);
          ctx.fillStyle = '#050505';
          ctx.font = 'bold 13px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('DVD', d.x + bw / 2, d.y + 19);
        }

        animId = requestAnimationFrame(renderDvd);
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
          text: 'Bật máy ảo, chạy lệnh sinh log rồi vào Wazuh Dashboard soi.',
        }
      : pathname?.startsWith('/info-sec')
      ? {
          title: 'TL;DR (5s)',
          text: 'just yapping',
        }
      : pathname?.startsWith('/blog')
      ? {
          title: 'TL;DR Nhật ký CTF (5s)',
          text: 'just yapping and yapping',
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
      {/* ══ 1. FLOATING AURA & BRAINROT HUD PILL (SHIFTED RIGHT OF DEV ICON) ═══ */}
      <div className="fixed bottom-4 left-16 z-[9990] flex flex-wrap items-center gap-2 font-mono text-xs select-none">
        {/* Aura Counter Pill */}
        <button
          type="button"
          onClick={() =>
            addAuraToast(
              100,
              `Danh hiệu: ${auraRank} (Bấm chuột phải bất kỳ đâu để mở Menu Bí Mật!)`,
              '✨'
            )
          }
          className={`px-3.5 py-2 border backdrop-blur-md transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
            aura < 0
              ? 'bg-red-950/90 border-red-500/60 text-red-300'
              : 'bg-[#0A0A0A]/95 border-[#333330] hover:border-[#3B82F6] text-[#F5F5F0]'
          }`}
        >
          <span className={aura < 0 ? 'text-red-400 animate-ping' : 'text-[#3B82F6]'}>●</span>
          <span className="font-bold">AURA: {aura.toLocaleString()}</span>
        </button>

        {/* ADHD / Brainrot Mode Toggle Button */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-brainrot'))}
          className={`px-3.5 py-2 border backdrop-blur-md transition-all cursor-pointer flex items-center gap-2 shadow-lg font-bold ${
            brainrotOpen
              ? 'bg-[#3B82F6] border-[#3B82F6] text-black'
              : 'bg-[#0A0A0A]/95 border-[#333330] hover:border-[#3B82F6] text-[#D8D8D1] hover:text-white'
          }`}
        >
          <span>🧠</span>
          <span>{brainrotOpen ? 'ADHD: ON' : 'ADHD_MODE'}</span>
        </button>

        {/* TL;DR Brainrot Summary Button on Subpages */}
        {currentTldr && pathname !== '/' && (
          <button
            type="button"
            onClick={() => {
              setShowTldr((prev) => !prev);
              if (!showTldr) {
                addAuraToast(250, 'Siêu tóm tắt', '📖');
              }
            }}
            className={`px-3.5 py-2 border backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-lg ${
              showTldr
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                : 'bg-[#0A0A0A]/95 border-[#333330] hover:border-[#3B82F6] text-[#D8D8D1] hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>TL;DR 5s</span>
          </button>
        )}
      </div>

      {/* ══ 2. TL;DR BRAINROT SUMMARY POPUP BANNER ══════════════════════════════ */}
      <AnimatePresence>
        {showTldr && currentTldr && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 left-16 z-[9991] max-w-md bg-[#0D131F]/95 border border-[#3B82F6] p-4 shadow-2xl font-mono text-xs sm:text-sm text-[#F5F5F0] backdrop-blur-md"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 3. AURA / SOCIAL CREDIT TOAST NOTIFICATIONS (TOP RIGHT) ═════════════ */}
      <div className="fixed top-20 right-4 z-[9995] flex flex-col gap-2.5 max-w-xs sm:max-w-sm w-full pointer-events-none font-mono">
        <AnimatePresence>
          {toasts.map((t) => {
            const isPositive = t.delta >= 0;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 50, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className={`p-3.5 border backdrop-blur-md shadow-2xl pointer-events-auto flex items-start gap-3 ${
                  isPositive
                    ? 'bg-[#09131C]/95 border-[#3B82F6] text-white'
                    : 'bg-[#1F0909]/95 border-red-500 text-red-100'
                }`}
              >
                <span className="text-xl leading-none shrink-0 mt-0.5">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isPositive ? 'text-[#3B82F6]' : 'text-red-400'
                    }`}
                  >
                    {isPositive ? `+${t.delta.toLocaleString()} AURA` : `${t.delta.toLocaleString()} SOCIAL CREDIT`}
                  </div>
                  <p className="text-xs text-[#D8D8D1] font-sans leading-snug mt-1 break-words">
                    {t.reason}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ══ 4. ENLARGED DRAGGABLE ADHD / BRAINROT ARCADE PIP WIDGET ═════════════ */}
      <AnimatePresence>
        {brainrotOpen && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            className={`fixed bottom-16 right-6 z-[9992] bg-[#0A0A0A] border-2 border-[#3B82F6] shadow-[0_0_50px_rgba(59,130,246,0.35)] font-mono text-xs overflow-hidden select-none transition-all duration-200 ${
              isLargePip ? 'w-[94vw] sm:w-[580px]' : 'w-[90vw] sm:w-[440px]'
            }`}
          >
            {/* PiP Drag Header */}
            <div className="px-4 py-2.5 bg-[#111111] border-b border-[#262624] flex items-center justify-between cursor-move">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] animate-ping" />
                <span className="font-bold text-white tracking-wider uppercase text-xs sm:text-sm">
                  ADHD_ARCADE_OS // {channel.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLargePip((prev) => !prev)}
                  className="px-2 py-0.5 border border-[#333330] bg-[#181818] text-[#D8D8D1] hover:border-[#3B82F6] hover:text-white text-[11px] cursor-pointer"
                  title="Phóng to / Thu gọn cửa sổ ADHD"
                >
                  {isLargePip ? '[ ⛶ COMPACT ]' : '[ ⛶ PHÓNG TO ]'}
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

            {/* 6 Unique Channel Switcher Tabs */}
            <div className="grid grid-cols-6 border-b border-[#222220] bg-[#070707] text-[11px]">
              {[
                { id: 'subway', label: '🚄 SUBWAY' },
                { id: 'flappy', label: '🐧 FLAPPY' },
                { id: 'crush', label: '💥 CRUSH' },
                { id: 'gacha', label: '🎰 GACHA' },
                { id: 'dvd', label: '💿 DVDx20' },
                { id: 'bocchi', label: '🎸 BOCCHI' },
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
                isLargePip ? 'h-[400px]' : 'h-[320px]'
              }`}
            >
              {/* CHANNEL 04: GACHA SLOT MACHINE */}
              {channel === 'gacha' && (
                <div className="w-full h-full p-6 flex flex-col items-center justify-between bg-gradient-to-b from-[#080D1A] to-[#050505]">
                  <div className="text-center space-y-1">
                    <div className="text-xs text-[#3B82F6] font-bold uppercase tracking-widest">
                      AURA CASINO // QUAY SỐ ĐỔI ĐỜI
                    </div>
                    <div className="text-sm text-[#D8D8D1]">{gachaMsg}</div>
                  </div>

                  {/* 3 Slot Reels */}
                  <div className="flex items-center gap-4 my-2">
                    {slots.map((sym, i) => (
                      <div
                        key={i}
                        className={`w-20 h-24 sm:w-24 sm:h-28 border-2 flex items-center justify-center text-4xl sm:text-5xl bg-[#0A0A0A] shadow-inner transition-transform ${
                          isSpinning
                            ? 'border-[#3B82F6] animate-pulse scale-95'
                            : 'border-[#333330]'
                        }`}
                      >
                        {sym}
                      </div>
                    ))}
                  </div>

                  {/* Bet Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <button
                      type="button"
                      disabled={isSpinning}
                      onClick={() => spinGacha(100)}
                      className="px-4 py-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-black font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                    >
                      QUAY (-100 AURA)
                    </button>
                    <button
                      type="button"
                      disabled={isSpinning}
                      onClick={() => spinGacha(1000)}
                      className="px-4 py-2 border border-amber-400 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                    >
                      VIP SPIN (-1,000)
                    </button>
                    <button
                      type="button"
                      disabled={isSpinning}
                      onClick={() => spinGacha(Math.max(500, Math.abs(Math.floor(aura / 2))))}
                      className="px-4 py-2 border border-red-500 bg-red-500/15 hover:bg-red-500/25 text-red-300 font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                    >
                      KHÔ MÁU 50% 💀
                    </button>
                  </div>
                </div>
              )}

              {/* CHANNEL 06: BOCCHI MEME STUDIO OVERDRIVE */}
              {channel === 'bocchi' && (
                <div className="w-full h-full p-3 flex flex-col justify-between bg-black relative overflow-hidden gap-2">
                  {/* Top Control Strip: Filter Mode + Caption + Add GIF */}
                  <div className="w-full flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: 'livecam', label: '🔴 LIVE CAM' },
                          { id: 'deepfry', label: '🔥 CHIÊN GIÒN' },
                          { id: 'panic', label: '🚨 PANIC' },
                          { id: 'normal', label: '✨ GỐC' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setBocchiFxMode(m.id)}
                          className={`px-2 py-0.5 border font-bold cursor-pointer transition-colors ${
                            bocchiFxMode === m.id
                              ? 'bg-[#3B82F6] border-[#3B82F6] text-black'
                              : 'bg-[#111111] border-[#333330] text-[#D8D8D1] hover:border-[#3B82F6]'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setBocchiCaptionIdx((i) => (i + 1) % BOCCHI_CAPTIONS.length)
                        }
                        className="px-2 py-0.5 bg-[#111111] border border-[#333330] hover:border-[#3B82F6] text-amber-300 font-bold cursor-pointer"
                        title="Đổi dòng chữ Meme trên ảnh"
                      >
                        
                        + THÊM GIF
                      </button>
                    </div>
                  </div>

                  {/* Quick Paste GIF URL Input Drawer */}
                  {showAddGifInput && (
                    <div className="w-full flex items-center gap-1.5 bg-[#111111] border border-[#3B82F6] p-1.5 text-[11px]">
                      <input
                        type="text"
                        value={customGifUrl}
                        onChange={(e) => setCustomGifUrl(e.target.value)}
                        placeholder="Dán link .gif (Giphy/Tenor/Discord) hoặc /images/ten-file.gif..."
                        className="flex-1 bg-black border border-[#333330] px-2 py-1 text-white outline-none focus:border-[#3B82F6]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = customGifUrl.trim();
                          if (!trimmed) return;
                          const nextList = [
                            ...bocchiMemes,
                            { src: trimmed, name: `Custom #${bocchiMemes.length + 1}` },
                          ];
                          setBocchiMemes(nextList);
                          setBocchiImgIdx(nextList.length - 1);
                          setCustomGifUrl('');
                          setShowAddGifInput(false);
                          addAuraToast(500, 'Đã nạp thêm GIF mới vào đài phát sóng Bocchi!', '🎸');
                        }}
                        className="px-2.5 py-1 bg-[#3B82F6] text-black font-bold cursor-pointer shrink-0"
                      >
                        LƯU GIF
                      </button>
                    </div>
                  )}

                  {/* Main Meme Viewport (Click to throw stickers!) */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const emojis = ['🎸', '💀', '🐧', '🗿', '🔥', '😭', '🚨', '⚡'];
                      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                      const id = Date.now() + Math.random();
                      setBocchiStickers((prev) => [...prev.slice(-14), { id, x, y, emoji }]);
                      addAuraToast(25, `Spam sticker ${emoji} lên màn hình Bocchi!`, emoji);
                    }}
                    className={`relative w-full flex-1 overflow-hidden border flex items-center justify-center bg-[#080808] cursor-crosshair ${
                      bocchiFxMode === 'panic'
                        ? 'border-red-500 shadow-[inset_0_0_30px_rgba(239,68,68,0.5)]'
                        : 'border-[#262624]'
                    }`}
                  >
                    <img
                      src={bocchiMemes[bocchiImgIdx]?.src || '/images/bocchi-the-rock-bocchi.gif'}
                      alt="Bocchi Meme Studio"
                      style={{
                        filter:
                          bocchiFxMode === 'deepfry'
                            ? `contrast(${220 + overdriveLevel * 25}%) saturate(${320 + overdriveLevel * 60}%) hue-rotate(${overdriveLevel * 12}deg)`
                            : bocchiFxMode === 'panic'
                            ? `contrast(${150 + overdriveLevel * 20}%) invert(${overdriveLevel >= 8 ? 100 : 0}%) hue-rotate(${overdriveLevel * 36}deg)`
                            : `contrast(${100 + overdriveLevel * 12}%) saturate(${100 + overdriveLevel * 22}%)`,
                        transform: `scale(${1 + (overdriveLevel - 1) * 0.04}) rotate(${
                          bocchiFxMode === 'panic' ? (overdriveLevel - 5) * 2.5 : 0
                        }deg)`,
                      }}
                      className={`w-full h-full object-contain transition-transform ${
                        overdriveLevel >= 5 || bocchiFxMode === 'deepfry' || bocchiFxMode === 'panic'
                          ? 'animate-pulse'
                          : ''
                      }`}
                    />

                    {/* Classic Impact Meme Top & Bottom Text Overlay */}
                    {BOCCHI_CAPTIONS[bocchiCaptionIdx]?.top && (
                      <div className="absolute top-2 inset-x-2 text-center pointer-events-none">
                        <span className="px-2 py-0.5 bg-black/80 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider border border-white/20 shadow-lg">
                          {BOCCHI_CAPTIONS[bocchiCaptionIdx].top}
                        </span>
                      </div>
                    )}
                    {BOCCHI_CAPTIONS[bocchiCaptionIdx]?.bottom && (
                      <div className="absolute bottom-2 inset-x-2 text-center pointer-events-none">
                        <span className="px-2 py-0.5 bg-black/80 text-yellow-300 font-extrabold text-xs sm:text-sm uppercase tracking-wider border border-yellow-400/30 shadow-lg">
                          {BOCCHI_CAPTIONS[bocchiCaptionIdx].bottom}
                        </span>
                      </div>
                    )}

                    {/* LIVE REACTION CAM OVERLAY */}
                    {bocchiFxMode === 'livecam' && (
                      <>
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md pointer-events-none">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>CLICK TO SPAM AURA</span>
                        </div>
                        <div className="absolute bottom-2 right-2 w-44 bg-black/80 border border-[#333330] p-1.5 text-[9px] space-y-1 pointer-events-none backdrop-blur-sm hidden sm:block">
                          <div className="text-[#A9A9A2] border-b border-[#222220] pb-0.5 font-bold">
                            💬 LIVE CHAT
                          </div>
                          {BOCCHI_LIVE_CHAT.map((c, idx) => (
                            <div key={idx} className="truncate">
                              <span style={{ color: c.color }} className="font-bold">
                                {c.user}:
                              </span>{' '}
                              <span className="text-[#D8D8D1]">{c.msg}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* PANIC SIREN BANNER */}
                    {bocchiFxMode === 'panic' && (
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-red-600/90 text-black font-extrabold text-center py-1 text-xs uppercase tracking-widest animate-bounce pointer-events-none">
                        🚨 SOCIAL ANXIETY OVERFLOW: {overdriveLevel * 99}% 🚨
                      </div>
                    )}

                    {/* Spawned Click Stickers */}
                    {bocchiStickers.map((st) => (
                      <motion.span
                        key={st.id}
                        initial={{ scale: 0.4, opacity: 1, y: 0 }}
                        animate={{ scale: 1.5, opacity: 0, y: -45 }}
                        transition={{ duration: 0.9 }}
                        style={{ left: st.x - 12, top: st.y - 12 }}
                        className="absolute text-2xl pointer-events-none select-none"
                      >
                        {st.emoji}
                      </motion.span>
                    ))}
                  </div>

                  {/* Bottom Bar: Overdrive Slider + Prev/Next GIF Switcher */}
                  <div className="w-full flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[10px] text-[#A9A9A2] shrink-0">
                        HỖN LOẠN ({overdriveLevel * 10}%):
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={overdriveLevel}
                        onChange={(e) => setOverdriveLevel(Number(e.target.value))}
                        className="w-full accent-[#3B82F6] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setBocchiImgIdx(
                            (i) => (i - 1 + bocchiMemes.length) % bocchiMemes.length
                          )
                        }
                        className="px-2 py-1 bg-[#111111] border border-[#333330] hover:border-[#3B82F6] text-white text-[11px] font-bold cursor-pointer"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        onClick={() => setBocchiImgIdx((i) => (i + 1) % bocchiMemes.length)}
                        className="px-2.5 py-1 bg-[#3B82F6] text-black text-[11px] font-bold cursor-pointer"
                      >
                        ĐỔI GIF ({bocchiImgIdx + 1}/{bocchiMemes.length}) ▶
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CANVAS CHANNELS: SUBWAY, FLAPPY, CRUSH, DVD */}
              {channel !== 'gacha' && channel !== 'bocchi' && (
                <canvas
                  ref={canvasRef}
                  width={isLargePip ? 560 : 436}
                  height={isLargePip ? 400 : 320}
                  onClick={() => {
                    if (channel === 'flappy') {
                      setFlappyBot(false);
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
                        setRunnerLane((l) => Math.max(0, l - 1));
                      }}
                      className="px-3 py-1.5 bg-black/85 border border-[#333330] text-white hover:border-[#3B82F6] cursor-pointer font-bold"
                    >
                      ◀ TRÁI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoPilot(false);
                        setRunnerLane((l) => Math.min(2, l + 1));
                      }}
                      className="px-3 py-1.5 bg-black/85 border border-[#333330] text-white hover:border-[#3B82F6] cursor-pointer font-bold"
                    >
                      PHẢI ▶
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAutoPilot((a) => !a)}
                      className={`px-2.5 py-1.5 border cursor-pointer font-bold ${
                        autoPilot
                          ? 'bg-[#3B82F6] border-[#3B82F6] text-black'
                          : 'bg-black/85 border-[#333330] text-[#D8D8D1]'
                      }`}
                    >
                      {autoPilot ? '🤖 AUTO: ON' : '🎮 MANUAL'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRunnerSpeedMult((m) => (m >= 3 ? 1 : m + 1))}
                      className="px-2.5 py-1.5 bg-black/85 border border-[#333330] hover:border-[#3B82F6] text-cyan-400 font-bold cursor-pointer"
                    >
                      {runnerSpeedMult}x SPEED
                    </button>
                  </div>

                  <span className="px-3 py-1.5 bg-black/90 border border-yellow-500/40 text-yellow-400 font-bold">
                    🪙 {runnerScore}
                  </span>
                </div>
              )}

              {/* FLAPPY MEME OVERLAY CONTROLS */}
              {channel === 'flappy' && (
                <div className="absolute inset-x-0 bottom-3 px-3 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {['🐧', '🗿', '🤡', '💀'].map((sk) => (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => setFlappySkin(sk)}
                        className={`px-2 py-1 border cursor-pointer ${
                          flappySkin === sk
                            ? 'border-[#3B82F6] bg-[#3B82F6]/20'
                            : 'border-[#262624] bg-black/80'
                        }`}
                      >
                        {sk}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setFlappyBot((b) => !b)}
                    className={`px-3 py-1 border font-bold cursor-pointer ${
                      flappyBot
                        ? 'bg-[#3B82F6] border-[#3B82F6] text-black'
                        : 'bg-black/85 border-[#333330] text-white'
                    }`}
                  >
                    {flappyBot ? '🤖 BOT: ON (Click màn hình để tự chơi)' : '🎮 TỰ CHƠI'}
                  </button>

                  <span className="px-2.5 py-1 bg-black/85 border border-[#333330] text-emerald-400 font-bold">
                    SCORE: {flappyScore}
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
                      addAuraToast(150, '-1 deadline!', '💥');
                    }}
                    className="px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-black font-bold uppercase cursor-pointer"
                  >
                    💥 DẬP THỦY LỰC
                  </button>
                  <span className="text-[11px] text-[#A9A9A2] bg-black/80 px-2 py-1 border border-[#222220]">
                    Giữ chuột trên màn hình để hút hạt
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      spawnBlocksTriggerRef.current = true;
                    }}
                    className="px-3 py-1.5 bg-black/85 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-black font-bold cursor-pointer"
                  >
                    + THẢ GẠCH
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
                      + THÊM DVD ({dvdCount}/20)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDvdCount(1)}
                      className="px-2.5 py-1.5 bg-black/85 border border-[#333330] text-[#A9A9A2] hover:text-white cursor-pointer"
                    >
                      RESET (1)
                    </button>
                  </div>
                  <span className="px-3 py-1.5 bg-black/85 border border-emerald-500/40 text-emerald-400 font-bold">
                    🎯 TRÚNG GÓC: {cornerHits}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Status Bar */}
            <div className="px-4 py-2 bg-[#0D0D0D] border-t border-[#222220] text-[11px] text-[#A9A9A2] flex items-center justify-between">
              <span>Giữ thanh tiêu đề để kéo thả cửa sổ</span>
              <span className="text-[#3B82F6] font-bold">AURA: {aura.toLocaleString()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 5. CUSTOM RIGHT-CLICK CONTEXT MENU (NO GENERIC QUOTES) ══════════════ */}
      <AnimatePresence>
        {ctxMenu.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.12 }}
            style={{ top: ctxMenu.y, left: ctxMenu.x }}
            className="fixed z-[99999] w-72 bg-[#0A0A0A]/95 border border-[#3B82F6] shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md font-mono text-xs text-[#F5F5F0] overflow-hidden select-none"
          >
            <div className="px-3.5 py-2 bg-[#111111] border-b border-[#262624] flex items-center justify-between text-[10px]">
              <span className="text-[#3B82F6] font-bold uppercase tracking-wider">
                ROOT// MENU
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
                <span>🧠 {brainrotOpen ? 'Tắt ADHD Arcade' : 'Mở ADHD Arcade'}</span>
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
                <span>🎰 Mở Sòng Gacha Aura</span>
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
                      ? 'Đã kích hoạt Australian Mode: Lật ngược thế giới 180°!'
                      : 'Đã xoay màn hình về lại bình thường.',
                    '🙃'
                  );
                  setCtxMenu({ visible: false, x: 0, y: 0 });
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🙃 {australianMode ? 'Tắt Lật Ngược 180°' : 'Lật Ngược Web 180°'}</span>
                <span className="text-[10px] text-[#A9A9A2]">FLIP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !raveMode;
                  setRaveMode(next);
                  addAuraToast(
                    next ? 888 : 100,
                    next
                      ? 'RGB RAVE OVERDRIVE! -1 Card màn hình '
                      : 'Đã tắt RGB.',
                    '🌈'
                  );
                  setCtxMenu({ visible: false, x: 0, y: 0 });
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🌈 {raveMode ? 'Tắt RGB' : 'Bật RGB'}</span>
                <span className="text-[10px] text-pink-400">RAVE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addAuraToast(
                    1000,
                    'Buff bẩn +1,000 Aura thành công!',
                    '💸'
                  );
                  setCtxMenu({ visible: false, x: 0, y: 0 });
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>⚡ Buff bẩn +1,000 Aura</span>
                <span className="text-[10px] text-emerald-400">+1K</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const isNowLight = document.documentElement.classList.toggle('light-theme');
                  addAuraToast(
                    isNowLight ? -500 : 500,
                    isNowLight
                      ? 'FLASHBANG DEPLOYED! -2 Mắt'
                      : 'Đã quay về Dark Mode.',
                    isNowLight ? '🔦' : '🕶️'
                  );
                  setCtxMenu({ visible: false, x: 0, y: 0 });
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#3B82F6]/15 hover:text-[#3B82F6] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🔦 Đổi giao diện Sáng / Tối</span>
                <span className="text-[10px] text-[#A9A9A2]">THEME</span>
              </button>

              <div className="my-1 border-t border-[#222220]" />

              <button
                type="button"
                onClick={() => {
                  addAuraToast(-2000, 'Hơi non', '🍪');
                  setCtxMenu({ visible: false, x: 0, y: 0 });
                  router.push('/free-cookie');
                }}
                className="w-full px-3 py-2 text-left hover:bg-red-500/15 hover:text-red-400 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🍪 Nhận Bánh Quy Miễn Phí</span>
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
                <span>🏠 Về Trang Chủ</span>
                <span className="text-[10px] text-[#A9A9A2]">/</span>
              </button>
            </div>

            <div className="px-3 py-1.5 bg-[#070707] border-t border-[#1C1C1A] text-[9px] text-[#A9A9A2]">
              Chuột phải lần 2 để mở menu trình duyệt
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
