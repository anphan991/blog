'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { triggerAura } from '@/lib/aura';

type PetMood =
  | 'chill'
  | 'happy'
  | 'hack'
  | 'angry'
  | 'shield'
  | 'sleep'
  | 'dizzy'
  | 'dead'
  | 'dance'
  | 'eat';

type PetModel = 'neko' | 'tux' | 'ghost' | 'fox';
type PetGear = 'none' | 'shades' | 'headset' | 'crown' | 'blackhat';

interface ThreatBug {
  alive: boolean;
  x: number; // percent of arena width
  y: number; // percent of arena height
  vx: number;
  vy: number;
  icon: string;
}

const BUG_POOL = 8;
const BUG_ICONS = ['🦠', '🕷️', '💣', '🐛'];

const MODELS: { id: PetModel; label: string; badge: string }[] = [
  { id: 'neko', label: '🐈‍⬛ NEKO', badge: 'STEALTH_CAT' },
  { id: 'tux', label: '🐧 TUX', badge: 'KERNEL_PENGUIN' },
  { id: 'ghost', label: '👻 GHOST', badge: 'DAEMON_SPIRIT' },
  { id: 'fox', label: '🦊 FOX', badge: 'FLIPPER_FOX' },
];

const GEARS: { id: PetGear; label: string }[] = [
  { id: 'none', label: '✨ BARE' },
  { id: 'shades', label: '🕶️ SHADES' },
  { id: 'headset', label: '🎧 HEADSET' },
  { id: 'crown', label: '👑 CROWN' },
  { id: 'blackhat', label: '🎩 BLACKHAT' },
];

const FORTUNES = [
  'Prophecy: Never git push --force after 5 PM on a Friday.',
  'Tarot [THE SEGFAULT]: Check your null pointers before deploying.',
  'Oracle: Works on localhost, explodes in production Docker.',
  'Fortune: One missing semicolon will cost 3 hours of sleep.',
  'Tarot [CHMOD 777]: Convenience today, Wazuh Level-15 alert tomorrow.',
];

const LEVEL_TITLES = [
  'Noob',
  'Noob',
  'Noob',
  'Noob',
  'Max',
];

function makeBar(val: number): string {
  const clamped = Math.max(0, Math.min(100, val));
  const filled = Math.round(clamped / 12.5);
  return '█'.repeat(filled) + '░'.repeat(8 - filled);
}

export default function CyberCompanion({ chaosMode = false }: { chaosMode?: boolean }) {
  const [model, setModel] = useState<PetModel>('neko');
  const [gearIdx, setGearIdx] = useState<number>(0);
  const [mood, setMood] = useState<PetMood>('chill');
  const [speech, setSpeech] = useState<string>(
    'Rub my head to pet, toggle 🔴 LASER to play, toss snacks, or defend against malware!'
  );
  const [command, setCommand] = useState<string>('');

  // Stats
  const [energy, setEnergy] = useState<number>(85);
  const [xp, setXp] = useState<number>(30);

  // Interactive Modes
  const [laserMode, setLaserMode] = useState<boolean>(false);
  const [fallingSnack, setFallingSnack] = useState<{ active: boolean; icon: string } | null>(null);
  const [floatingFx, setFloatingFx] = useState<
    { id: number; x: number; y: number; text: string }[]
  >([]);

  // Mini-Game: Malware Defense (bugs live in refs + rAF, zero per-frame React renders)
  const [defendActive, setDefendActive] = useState<boolean>(false);
  const [defendTimeLeft, setDefendTimeLeft] = useState<number>(0);
  const bugsRef = useRef<ThreatBug[]>(
    Array.from({ length: BUG_POOL }, () => ({ alive: false, x: 0, y: 0, vx: 0, vy: 0, icon: '🦠' }))
  );
  const bugDomRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const zapLineRef = useRef<SVGLineElement | null>(null);
  const zapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zapCountRef = useRef<number>(0);

  // Zero-lag GPU / DOM refs (No getBoundingClientRect or CSS transition conflicts on mousemove!)
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const arenaRectRef = useRef<DOMRect | null>(null);
  const petGroupRef = useRef<SVGGElement | null>(null);
  const eyeGroupRef = useRef<SVGGElement | null>(null);
  const laserDotDomRef = useRef<HTMLDivElement | null>(null);

  // Smooth Lerp Physics state for Laser Chasing (0 React re-renders!)
  const laserTargetRef = useRef<{ rx: number; ry: number; px: number; py: number; inside: boolean }>({
    rx: 0.5,
    ry: 0.5,
    px: 0,
    py: 0,
    inside: false,
  });
  const petCurrentPosRef = useRef<{ x: number; y: number; rot: number }>({ x: 0, y: 0, rot: 0 });

  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const rubDistRef = useRef<number>(0);
  const spinAccumRef = useRef<number>(0);
  const lastAngleRef = useRef<number | null>(null);
  const lastTriggerRef = useRef<number>(0);
  const pokeCountRef = useRef<number>(0);
  const pokeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gear = GEARS[gearIdx]?.id || 'none';
  const level = Math.min(5, Math.floor(xp / 100) + 1);
  const xpInLevel = xp % 100;
  const levelTitle = LEVEL_TITLES[level - 1] || LEVEL_TITLES[0];
  const activeMood: PetMood = chaosMode ? 'dead' : mood;

  const spawnFx = useCallback((text: string, x = 50, y = 30) => {
    const id = Date.now() + Math.random();
    setFloatingFx((prev) => [...prev.slice(-4), { id, x, y, text }]);
    setTimeout(() => {
      setFloatingFx((prev) => prev.filter((item) => item.id !== id));
    }, 850);
  }, []);

  useEffect(() => {
    return () => {
      if (pokeTimerRef.current) clearTimeout(pokeTimerRef.current);
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    };
  }, []);

  // Dedicated 60/120fps Zero-Lag Lerp Loop ONLY when Laser Mode is ON!
  useEffect(() => {
    if (!laserMode) {
      petCurrentPosRef.current = { x: 0, y: 0, rot: 0 };
      if (petGroupRef.current) {
        petGroupRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)';
      }
      return;
    }

    let rafId = 0;
    let pounceCooldown = 0;

    const tickLaser = () => {
      rafId = requestAnimationFrame(tickLaser);
      if (document.hidden || !petGroupRef.current) return;

      const target = laserTargetRef.current;
      const goalX = target.inside ? (target.rx - 0.5) * 68 : 0;
      const goalY = target.inside ? (target.ry - 0.52) * 34 : 0;
      const goalRot = target.inside ? (goalX - petCurrentPosRef.current.x) * 0.45 : 0;

      const cur = petCurrentPosRef.current;
      cur.x += (goalX - cur.x) * 0.16;
      cur.y += (goalY - cur.y) * 0.16;
      cur.rot += (goalRot - cur.rot) * 0.2;

      petGroupRef.current.style.transform = `translate(${cur.x.toFixed(2)}px, ${cur.y.toFixed(
        2
      )}px) rotate(${cur.rot.toFixed(2)}deg)`;

      // Also lock eyes onto laser dot smoothly
      if (eyeGroupRef.current) {
        const ex = target.inside ? (target.rx - 0.5) * 13 : 0;
        const ey = target.inside ? (target.ry - 0.5) * 8 : 0;
        eyeGroupRef.current.style.transform = `translate(${ex.toFixed(2)}px, ${ey.toFixed(2)}px)`;
      }

      // Trigger reward gently when pet catches close to the laser dot
      if (pounceCooldown > 0) {
        pounceCooldown--;
      } else if (
        target.inside &&
        Math.hypot(goalX - cur.x, goalY - cur.y) < 3.5 &&
        Math.hypot(goalX, goalY) > 10
      ) {
        pounceCooldown = 210; // ~3.5s cooldown so zero React state lag while moving!
        setXp((v) => v + 15);
        spawnFx('🐾 CAUGHT! +40', Math.round(target.rx * 76) + 12, Math.round(target.ry * 55) + 15);
        triggerAura(40, 'Companion pounced on the red laser dot!', '🔴');
      }
    };

    rafId = requestAnimationFrame(tickLaser);
    return () => cancelAnimationFrame(rafId);
  }, [laserMode, spawnFx]);

  // Malware Defense: single rAF loop, bugs move via direct DOM transforms
  useEffect(() => {
    if (!defendActive) return;

    const bugs = bugsRef.current;
    zapCountRef.current = 0;

    const hideBug = (i: number) => {
      bugs[i].alive = false;
      const el = bugDomRefs.current[i];
      if (el) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }
    };

    const spawnBug = (i: number) => {
      // Pick one of 4 edges: 0 = top, 1 = right, 2 = bottom, 3 = left
      const edge = Math.floor(Math.random() * 4);
      let sx = 0;
      let sy = 0;
      if (edge === 0) {
        // Top edge
        sx = 10 + Math.random() * 80;
        sy = 4;
      } else if (edge === 1) {
        // Right edge
        sx = 96;
        sy = 12 + Math.random() * 76;
      } else if (edge === 2) {
        // Bottom edge
        sx = 10 + Math.random() * 80;
        sy = 94;
      } else {
        // Left edge
        sx = 4;
        sy = 12 + Math.random() * 76;
      }

      // Fly towards pet center (50%, 50%)
      const tx = 50;
      const ty = 50;
      const dx = tx - sx;
      const dy = ty - sy;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = 0.38 + Math.random() * 0.16; // % per frame @60fps
      const b = bugs[i];
      b.alive = true;
      b.x = sx;
      b.y = sy;
      b.vx = (dx / dist) * speed;
      b.vy = (dy / dist) * speed;
      b.icon = BUG_ICONS[Math.floor(Math.random() * BUG_ICONS.length)];

      const el = bugDomRefs.current[i];
      if (el) {
        el.textContent = b.icon;
        el.style.left = `${b.x.toFixed(2)}%`;
        el.style.top = `${b.y.toFixed(2)}%`;
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      }
    };

    for (let i = 0; i < BUG_POOL; i++) hideBug(i);
    spawnBug(0);
    spawnBug(1);
    spawnBug(2);

    let raf = 0;
    let last = performance.now();
    let spawnClock = 0;
    let lastHitAt = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(2.5, (now - last) / 16.67); // frame-rate independent
      last = now;

      spawnClock += dt;
      if (spawnClock > 22) {
        spawnClock = 0;
        const free = bugs.findIndex((b) => !b.alive);
        const aliveCount = bugs.filter((b) => b.alive).length;
        if (free !== -1 && aliveCount < 5) {
          spawnBug(free);
        }
      }

      for (let i = 0; i < BUG_POOL; i++) {
        const b = bugs[i];
        if (!b.alive) continue;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Threat breaches firewall (hits central pet ~50%, 50%)
        if (Math.hypot(b.x - 50, b.y - 50) < 11) {
          hideBug(i);
          if (now - lastHitAt > 600) {
            lastHitAt = now;
            setMood('angry');
            setEnergy((e) => Math.max(5, e - 10));
            setSpeech('OUCH! Malware breached the firewall! Click threats to zap them!');
          }
          continue;
        }

        // Failsafe bounds check to recycle any stray bug
        if (b.x < -10 || b.x > 110 || b.y < -10 || b.y > 110) {
          hideBug(i);
          continue;
        }

        const el = bugDomRefs.current[i];
        if (el) {
          el.style.left = `${b.x.toFixed(2)}%`;
          el.style.top = `${b.y.toFixed(2)}%`;
        }
      }
    };
    raf = requestAnimationFrame(tick);

    const countdown = setInterval(() => {
      setDefendTimeLeft((t) => {
        if (t <= 1) {
          setDefendActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(countdown);
      for (let i = 0; i < BUG_POOL; i++) hideBug(i);
    };
  }, [defendActive]);

  // Wave end reward (fires once when the countdown finishes naturally)
  const prevDefendRef = useRef<boolean>(false);
  useEffect(() => {
    if (prevDefendRef.current && !defendActive && defendTimeLeft === 0) {
      const zaps = zapCountRef.current;
      setMood('happy');
      setXp((v) => v + 60 + zaps * 8);
      setSpeech(`🛡️ WAVE CLEARED! ${zaps} threats neutralized. (+400 Aura, +${60 + zaps * 8} XP)`);
      triggerAura(400, `Malware wave cleared (${zaps} zaps)`, '🛡️');
    }
    prevDefendRef.current = defendActive;
  }, [defendActive, defendTimeLeft]);

  useEffect(() => {
    return () => {
      if (zapTimerRef.current) clearTimeout(zapTimerRef.current);
    };
  }, []);

  const handleZapBug = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    const b = bugsRef.current[i];
    if (!b?.alive) return;
    b.alive = false;
    const el = bugDomRefs.current[i];
    if (el) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    }
    zapCountRef.current += 1;

    // Laser beam from pet center to bug (full-arena coordinates)
    const line = zapLineRef.current;
    if (line) {
      line.setAttribute('x2', `${b.x.toFixed(1)}%`);
      line.setAttribute('y2', `${b.y.toFixed(1)}%`);
      line.style.opacity = '1';
      if (zapTimerRef.current) clearTimeout(zapTimerRef.current);
      zapTimerRef.current = setTimeout(() => {
        if (zapLineRef.current) zapLineRef.current.style.opacity = '0';
      }, 140);
    }

    setMood('hack');
    spawnFx('⚡ ZAP', b.x, b.y);
    triggerAura(50, `Zapped ${b.icon} threat`, '⚡');
  };

  // Toss a snack from top into the pet's mouth
  const handleTossSnack = () => {
    if (fallingSnack?.active || activeMood === 'dead') return;
    const snacks = ['🐟', '☕', '🔋', '🍪', '💾'];
    const icon = snacks[Math.floor(Math.random() * snacks.length)];
    setMood('eat');
    setSpeech(`Oooh incoming ${icon} packet! Opening mouth port... :O`);
    setFallingSnack({ active: true, icon });

    if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    actionTimerRef.current = setTimeout(() => {
      setFallingSnack(null);
      setMood('happy');
      setEnergy((e) => Math.min(100, e + 25));
      setXp((v) => v + 25);
      setSpeech(`*CHOMP!* Delicious ${icon}! Energy restored to ${Math.min(100, energy + 25)}%!`);
      spawnFx(`+25 XP ${icon}`, 50, 30);
      triggerAura(120, `Fed ${icon} to Companion!`, icon);
    }, 550);
  };

  const handleArenaMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    arenaRectRef.current = e.currentTarget.getBoundingClientRect();
    laserTargetRef.current.inside = true;
    if (laserDotDomRef.current) {
      laserDotDomRef.current.style.opacity = '1';
    }
  };

  // Ultra-fast Mouse Move: 0 DOM layout queries, 0 CSS transition clashes!
  const handleArenaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = arenaRectRef.current || e.currentTarget.getBoundingClientRect();
    if (!arenaRectRef.current) arenaRectRef.current = rect;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const rx = Math.max(0, Math.min(1, px / rect.width));
    const ry = Math.max(0, Math.min(1, py / rect.height));

    // If Laser Mode is active: move GPU-composited HTML dot instantaneously (1:1 zero lag!)
    if (laserMode && activeMood !== 'dead') {
      laserTargetRef.current = { rx, ry, px, py, inside: true };
      if (laserDotDomRef.current) {
        laserDotDomRef.current.style.opacity = '1';
        laserDotDomRef.current.style.transform = `translate3d(${px - 9}px, ${py - 9}px, 0)`;
      }
      return;
    }

    // Normal mode: instant eye tracking + subtle body tilt (no CSS transition lag!)
    if (activeMood !== 'sleep' && activeMood !== 'dead') {
      if (eyeGroupRef.current) {
        const ex = (rx - 0.5) * 11;
        const ey = (ry - 0.5) * 7;
        eyeGroupRef.current.style.transform = `translate(${ex.toFixed(1)}px, ${ey.toFixed(1)}px)`;
      }
      if (petGroupRef.current) {
        const tilt = (rx - 0.5) * 5;
        petGroupRef.current.style.transform = `rotate(${tilt.toFixed(1)}deg)`;
      }
    }

    // Detect Circling Cursor -> Dizzy (@_@)
    const angle = Math.atan2(ry - 0.55, rx - 0.5);
    if (lastAngleRef.current !== null) {
      let delta = angle - lastAngleRef.current;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      spinAccumRef.current += Math.abs(delta);
      const now = Date.now();
      if (spinAccumRef.current > Math.PI * 5.5 && now - lastTriggerRef.current > 2800) {
        spinAccumRef.current = 0;
        lastTriggerRef.current = now;
        setMood('dizzy');
        setSpeech('@_@ Whoaaa stop spinning the cursor, my gyroscope is dizzy!!');
        spawnFx('🌀 DIZZY', 50, 24);
        return;
      }
    }
    lastAngleRef.current = angle;

    // Detect Gentle Head Rubbing -> Happy Petting (<3)
    if (ry > 0.15 && ry < 0.62 && rx > 0.24 && rx < 0.76 && activeMood !== 'dead') {
      if (lastPosRef.current) {
        rubDistRef.current += Math.abs(e.clientX - lastPosRef.current.x);
        const now = Date.now();
        if (rubDistRef.current > 250 && now - lastTriggerRef.current > 2200) {
          rubDistRef.current = 0;
          lastTriggerRef.current = now;
          setMood('happy');
          setXp((v) => v + 20);
          setSpeech('*purrrrr* // Headpats accepted! Happiness buffer at 100% <3');
          spawnFx('<3 +50', Math.round(rx * 70) + 15, Math.round(ry * 50) + 15);
          triggerAura(50, 'Headpatted the Companion!', '💖');
        }
      }
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleArenaMouseLeave = () => {
    arenaRectRef.current = null;
    lastPosRef.current = null;
    lastAngleRef.current = null;
    rubDistRef.current = 0;
    spinAccumRef.current = 0;
    laserTargetRef.current.inside = false;

    if (laserDotDomRef.current) {
      laserDotDomRef.current.style.opacity = '0';
    }
    if (!laserMode) {
      if (eyeGroupRef.current) eyeGroupRef.current.style.transform = 'translate(0px, 0px)';
      if (petGroupRef.current) petGroupRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)';
    }
  };

  const wakeUpPet = () => {
    setMood('chill');
    setSpeech('Yawn... Waking up from hibernation mode!');
    spawnFx('☀️ AWAKE', 50, 26);
  };

  // Click on Pet: Wake up if sleeping, or trigger Tazer if spam-poked!
  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (defendActive || laserMode || activeMood === 'dead') return;
    if (activeMood === 'sleep') {
      wakeUpPet();
      return;
    }

    pokeCountRef.current += 1;
    if (pokeTimerRef.current) clearTimeout(pokeTimerRef.current);
    pokeTimerRef.current = setTimeout(() => {
      pokeCountRef.current = 0;
    }, 2000);

    const rect = arenaRectRef.current || e.currentTarget.getBoundingClientRect();
    const px = Math.round(((e.clientX - rect.left) / rect.width) * 76) + 12;
    const py = Math.round(((e.clientY - rect.top) / rect.height) * 56) + 18;

    if (pokeCountRef.current >= 4) {
      pokeCountRef.current = 0;
      setMood('angry');
      setSpeech('⚡ TAZER COUNTERMEASURE! Stop poking my visor! (-100 Aura)');
      spawnFx('⚡ -100', px, py);
      triggerAura(-100, 'Shocked by Companion anti-poke tazer!', '⚡');
    } else {
      setMood('happy');
      setXp((v) => v + 8);
      setSpeech('Boop! Try 🔴 LASER chase, toss a 🐟 SNACK, or equip gear below!');
      spawnFx('♪', px, py);
    }
  };

  const runCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;
    setCommand('');

    if (cmd.startsWith('sudo')) {
      setMood('angry');
      setSpeech('sudo: Permission denied. Incident logged and forwarded to your mom 🐧');
      spawnFx('🚨 DENIED', 50, 26);
      triggerAura(-50, 'Unauthorized sudo attempt!', '🚨');
      return;
    }

    if (cmd === 'cat flag' || cmd === 'cat flag.txt' || cmd === 'ctf') {
      setMood('hack');
      setXp((v) => v + 50);
      setSpeech('FLAG{caffeine_overflow_0x991} // +500 Aura unlocked!');
      spawnFx('🚩 +500', 50, 26);
      triggerAura(500, 'Captured Companion CTF Flag!', '🚩');
      return;
    }

    if (cmd === 'kill -9' || cmd === 'rm -rf' || cmd === 'rm -rf /') {
      setMood('dead');
      setEnergy(0);
      setSpeech('[SIGKILL] Companion flatlined... restoring from snapshot in 3s...');
      spawnFx('💀 SIGKILL', 50, 26);
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
      actionTimerRef.current = setTimeout(() => {
        setMood('angry');
        setEnergy(65);
        setSpeech('Restored from ZFS snapshot! Did you seriously just run kill -9 on me?!');
      }, 3000);
      return;
    }

    if (cmd === 'fortune' || cmd === 'tarot') {
      setMood('dance');
      setXp((v) => v + 20);
      setSpeech(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
      spawnFx('🔮 ORACLE', 50, 26);
      triggerAura(100, 'Consulted the Cyber Oracle!', '🔮');
      return;
    }

    const map: Record<string, () => void> = {
      hi: () => {
        setMood('happy');
        setXp((v) => v + 15);
        setSpeech(`Hey Admin! ${MODELS.find((m) => m.id === model)?.badge} standing by.`);
        spawnFx('👋 +100', 50, 26);
        triggerAura(100, 'Greeted the Companion!', '✨');
      },
      coffee: () => handleTossSnack(),
      feed: () => handleTossSnack(),
      laser: () => {
        setDefendActive(false);
        setLaserMode((l) => !l);
      },
      defend: () => {
        setLaserMode(false);
        setDefendActive(true);
        setDefendTimeLeft(15);
        setMood('shield');
        setSpeech('🚨 MALWARE WAVE INCOMING! Click the bugs before they hit me!');
      },
      sleep: () => {
        setLaserMode(false);
        setMood('sleep');
        setEnergy(100);
        setSpeech('Zzz... Dreaming of 0 warnings, 0 vulnerabilities...');
        spawnFx('💤 Zzz', 55, 25);
      },
      dance: () => {
        setMood('dance');
        setXp((v) => v + 20);
        setSpeech('♪ Vibing to 3 AM synthwave while packets fly by ♫');
        spawnFx('♪ ♫', 50, 26);
        triggerAura(150, 'Dance party with Companion!', '🎵');
      },
      hack: () => {
        setMood('hack');
        setXp((v) => v + 35);
        setSpeech('Injecting payload on port 4444... Try `cat flag` next!');
        spawnFx('💻 ROOT', 50, 26);
        triggerAura(300, 'Companion executed exploit chain!', '💻');
      },
      brainrot: () => {
        setMood('dance');
        setSpeech('Launching ADHD Arcade OS... 🧠');
        window.dispatchEvent(new CustomEvent('toggle-brainrot'));
      },
      help: () => {
        setSpeech(
          'Try: hi, coffee, hack, defend, laser, dance, sleep, cat flag, fortune, sudo, kill -9'
        );
      },
      clear: () => {
        setMood('chill');
        setSpeech('Terminal cleared. Ready for next interaction.');
      },
    };

    if (map[cmd]) {
      map[cmd]();
    } else {
      setMood('dizzy');
      setSpeech(`Unknown command "${cmd}". Type 'help' or click the toy buttons above!`);
    }
  };

  const accent =
    activeMood === 'happy' || activeMood === 'eat'
      ? '#10B981'
      : activeMood === 'hack'
      ? '#A855F7'
      : activeMood === 'angry' || activeMood === 'dead'
      ? '#EF4444'
      : activeMood === 'shield'
      ? '#06B6D4'
      : activeMood === 'dance' || activeMood === 'dizzy'
      ? '#F59E0B'
      : activeMood === 'sleep'
      ? '#64748B'
      : '#3B82F6';

  const renderFaceExpressions = () => (
    <g ref={eyeGroupRef}>
      {activeMood === 'chill' && (
        <>
          <rect x="89" y="64" width="12" height="14" rx="4" fill={accent} />
          <rect x="119" y="64" width="12" height="14" rx="4" fill={accent} />
          <circle cx="93" cy="68" r="2.2" fill="#FFFFFF" />
          <circle cx="123" cy="68" r="2.2" fill="#FFFFFF" />
          {model !== 'tux' && (
            <path
              d="M104 83 Q110 88 116 83"
              stroke={accent}
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </>
      )}

      {activeMood === 'happy' && (
        <>
          <path
            d="M87 73 Q95 62 103 73"
            stroke="#10B981"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M117 73 Q125 62 133 73"
            stroke="#10B981"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="84" cy="79" r="3.5" fill="#EC4899" fillOpacity="0.65" />
          <circle cx="136" cy="79" r="3.5" fill="#EC4899" fillOpacity="0.65" />
          {model !== 'tux' && (
            <path
              d="M102 82 Q106 88 110 83 Q114 88 118 82"
              stroke="#10B981"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </>
      )}

      {activeMood === 'eat' && (
        <>
          <circle cx="95" cy="68" r="6" fill="#10B981" />
          <circle cx="125" cy="68" r="6" fill="#10B981" />
          <circle cx="93" cy="66" r="2" fill="#FFFFFF" />
          <circle cx="123" cy="66" r="2" fill="#FFFFFF" />
          <ellipse cx="110" cy="84" rx="8" ry="9" fill="#EF4444" stroke="#FCA5A5" strokeWidth="1.5" />
        </>
      )}

      {activeMood === 'hack' && (
        <>
          <rect x="85" y="65" width="19" height="9" rx="2" fill="#A855F7" />
          <rect x="116" y="65" width="19" height="9" rx="2" fill="#A855F7" />
          <text
            x="110"
            y="86"
            fill="#4ADE80"
            fontSize="8.5"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            0x1337
          </text>
        </>
      )}

      {activeMood === 'angry' && (
        <>
          <polygon points="86,63 103,69 103,75 86,73" fill="#EF4444" />
          <polygon points="134,63 117,69 117,75 134,73" fill="#EF4444" />
          <polyline
            points="100,85 105,80 110,86 115,80 120,85"
            stroke="#EF4444"
            strokeWidth="2.4"
            fill="none"
          />
        </>
      )}

      {activeMood === 'shield' && (
        <>
          <circle cx="95" cy="70" r="7" stroke="#06B6D4" strokeWidth="2.2" />
          <circle cx="95" cy="70" r="2.2" fill="#06B6D4" />
          <circle cx="125" cy="70" r="7" stroke="#06B6D4" strokeWidth="2.2" />
          <circle cx="125" cy="70" r="2.2" fill="#06B6D4" />
          <line x1="102" y1="84" x2="118" y2="84" stroke="#06B6D4" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}

      {activeMood === 'sleep' && (
        <>
          <path d="M88 71 Q95 76 102 71" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M118 71 Q125 76 132 71" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <text x="142" y="54" fill="#60A5FA" fontSize="11" fontWeight="bold">
            Zzz
          </text>
        </>
      )}

      {activeMood === 'dizzy' && (
        <>
          <text x="95" y="75" fill="#F59E0B" fontSize="15" fontWeight="bold" textAnchor="middle">
            @
          </text>
          <text x="125" y="75" fill="#F59E0B" fontSize="15" fontWeight="bold" textAnchor="middle">
            @
          </text>
          <path d="M102 84 Q106 80 110 84 Q114 88 118 84" stroke="#F59E0B" strokeWidth="2.2" fill="none" />
        </>
      )}

      {activeMood === 'dance' && (
        <>
          <text x="95" y="75" fill="#F59E0B" fontSize="15" textAnchor="middle">
            ★
          </text>
          <text x="125" y="75" fill="#F59E0B" fontSize="15" textAnchor="middle">
            ★
          </text>
          <path d="M103 82 Q110 90 117 82" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </>
      )}

      {activeMood === 'dead' && (
        <>
          <path d="M89 65 L101 77 M101 65 L89 77" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M119 65 L131 77 M131 65 L119 77" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="100" y1="85" x2="120" y2="85" stroke="#EF4444" strokeWidth="2.4" strokeDasharray="3 3" />
        </>
      )}

      {model === 'tux' && activeMood !== 'eat' && (
        <polygon points="103,77 117,77 110,86" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1" />
      )}
    </g>
  );

  const renderEquippedGear = () => {
    if (gear === 'shades') {
      return (
        <g pointerEvents="none">
          <rect x="80" y="61" width="26" height="13" fill="#09090B" stroke="#F4F4F5" strokeWidth="1.5" />
          <rect x="114" y="61" width="26" height="13" fill="#09090B" stroke="#F4F4F5" strokeWidth="1.5" />
          <rect x="106" y="63" width="8" height="4" fill="#09090B" />
          <rect x="84" y="64" width="6" height="3" fill="#FFFFFF" />
          <rect x="118" y="64" width="6" height="3" fill="#FFFFFF" />
        </g>
      );
    }
    if (gear === 'crown') {
      return (
        <g pointerEvents="none">
          <polygon
            points="90,41 90,23 100,32 110,19 120,32 130,23 130,41"
            fill="#FACC15"
            stroke="#FEF08A"
            strokeWidth="1.5"
          />
          <circle cx="110" cy="34" r="2.5" fill="#EF4444" />
        </g>
      );
    }
    if (gear === 'headset') {
      return (
        <g pointerEvents="none">
          <path d="M66 76 C66 30, 154 30, 154 76" stroke="#06B6D4" strokeWidth="4.5" fill="none" />
          <rect x="59" y="64" width="11" height="24" rx="5" fill="#EC4899" stroke="#F4F4F5" strokeWidth="1.2" />
          <rect x="150" y="64" width="11" height="24" rx="5" fill="#EC4899" stroke="#F4F4F5" strokeWidth="1.2" />
        </g>
      );
    }
    if (gear === 'blackhat') {
      return (
        <g pointerEvents="none">
          <ellipse cx="110" cy="41" rx="34" ry="6" fill="#18181B" stroke="#52525B" strokeWidth="1.5" />
          <path d="M88 41 L93 20 L127 20 L132 41 Z" fill="#18181B" stroke="#52525B" strokeWidth="1.5" />
          <rect x="89" y="34" width="42" height="4.5" fill="#EF4444" />
        </g>
      );
    }
    return null;
  };

  return (
    <div className="w-full font-mono select-none">
      {/* 1. ENLARGED MODEL SWITCHER HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2 border border-b-0 border-[#333330] bg-[#111111] px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: accent }}
            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
          />
          <span className="text-[#F5F5F0] font-bold tracking-wider">
            LV.{level} {levelTitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setModel(m.id);
                setMood('happy');
                setSpeech(`Morphed chassis into ${m.badge}!`);
              }}
              className={`px-2.5 py-1 border text-[11px] font-bold cursor-pointer transition-colors ${
                model === m.id
                  ? 'border-[#3B82F6] bg-[#3B82F6] text-black'
                  : 'border-[#333330] text-[#A9A9A2] hover:text-[#F5F5F0]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ENLARGED INTERACTIVE PET ARENA (Zero-Lag GPU Laser Dot) */}
      <div
        ref={arenaRef}
        onMouseEnter={handleArenaMouseEnter}
        onMouseMove={handleArenaMouseMove}
        onMouseLeave={handleArenaMouseLeave}
        onClick={handleArenaClick}
        className={`relative w-full h-72 sm:h-80 border bg-[#080A10] flex flex-col items-center justify-between p-4 overflow-hidden transition-colors ${
          laserMode
            ? 'border-red-500/80'
            : defendActive
            ? 'border-cyan-400'
            : 'border-[#333330] hover:border-[#3B82F6]'
        }`}
      >
        {/* Hardware-Composited Zero-Lag Laser Dot */}
        {laserMode && (
          <div
            ref={laserDotDomRef}
            style={{
              opacity: 0,
              willChange: 'transform',
              transform: 'translate3d(0px, 0px, 0)',
            }}
            className="absolute top-0 left-0 w-[18px] h-[18px] rounded-full bg-red-500/35 flex items-center justify-center pointer-events-none z-30"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-200 shadow-[0_0_12px_#EF4444]" />
          </div>
        )}

        {/* Full-Arena Defense Laser Beam */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
          <line
            ref={zapLineRef}
            x1="50%"
            y1="50%"
            x2="50%"
            y2="50%"
            stroke="#38BDF8"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{ opacity: 0, transition: 'opacity 0.12s linear' }}
          />
        </svg>

        {/* Top Status Strip */}
        <div className="w-full flex items-center justify-between text-[11px] text-[#A9A9A2] z-10 pointer-events-none">
          <span>
            ENERGY <span className="text-[#3B82F6]">{makeBar(energy)}</span> {energy}%
          </span>
          {defendActive ? (
            <span className="px-2.5 py-0.5 bg-red-500 text-black font-bold">
              ⚔️ WAVE: {defendTimeLeft}s (CLICK BUGS!)
            </span>
          ) : (
            <span>
              XP <span className="text-emerald-400">{makeBar(xpInLevel)}</span> {xpInLevel}/100
            </span>
          )}
        </div>

        {/* Falling Snack Animation */}
        {fallingSnack?.active && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-3xl z-20 pointer-events-none animate-bounce">
            {fallingSnack.icon}
          </div>
        )}

        {/* Center Character SVG (Scaled up crisply!) */}
        <svg
          viewBox="0 0 220 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[260px] h-[178px] sm:w-[292px] sm:h-[200px] z-10 overflow-visible pointer-events-none"
        >
          <ellipse cx="110" cy="134" rx="40" ry="6" fill={accent} fillOpacity="0.18" />

          <g
            ref={petGroupRef}
            style={{
              transformOrigin: '110px 80px',
              willChange: 'transform',
            }}
          >
            {/* ── MODEL 1: NEKO STEALTH DRONE ── */}
            {model === 'neko' && (
              <>
                <path
                  d="M148 102 Q176 96 172 72"
                  stroke={accent}
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
                <polygon points="72,54 66,24 94,42" fill="#18181B" stroke={accent} strokeWidth="2.2" />
                <polygon points="74,48 71,31 88,42" fill={accent} fillOpacity="0.45" />
                <polygon points="148,54 154,24 126,42" fill="#18181B" stroke={accent} strokeWidth="2.2" />
                <polygon points="146,48 149,31 132,42" fill={accent} fillOpacity="0.45" />

                <rect
                  x="66"
                  y="40"
                  width="88"
                  height="70"
                  rx="28"
                  fill="#141418"
                  stroke={accent}
                  strokeWidth="2.4"
                />
                <rect
                  x="76"
                  y="51"
                  width="68"
                  height="44"
                  rx="18"
                  fill="#060912"
                  stroke="#27272A"
                  strokeWidth="1.5"
                />
                <line x1="54" y1="70" x2="68" y2="72" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                <line x1="54" y1="79" x2="68" y2="78" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                <line x1="166" y1="70" x2="152" y2="72" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                <line x1="166" y1="79" x2="152" y2="78" stroke={accent} strokeWidth="2" strokeLinecap="round" />

                <ellipse cx="88" cy="115" rx="9" ry="6" fill="#1F1F25" stroke={accent} strokeWidth="1.5" />
                <ellipse cx="132" cy="115" rx="9" ry="6" fill="#1F1F25" stroke={accent} strokeWidth="1.5" />
              </>
            )}

            {/* ── MODEL 2: TUX KERNEL PENGUIN ── */}
            {model === 'tux' && (
              <>
                <ellipse
                  cx="65"
                  cy="86"
                  rx="9"
                  ry="22"
                  transform={
                    activeMood === 'happy' || activeMood === 'dance'
                      ? 'rotate(32 65 86)'
                      : 'rotate(14 65 86)'
                  }
                  fill="#18181B"
                  stroke={accent}
                  strokeWidth="2"
                />
                <ellipse
                  cx="155"
                  cy="86"
                  rx="9"
                  ry="22"
                  transform={
                    activeMood === 'happy' || activeMood === 'dance'
                      ? 'rotate(-32 155 86)'
                      : 'rotate(-14 155 86)'
                  }
                  fill="#18181B"
                  stroke={accent}
                  strokeWidth="2"
                />
                <ellipse cx="93" cy="124" rx="12" ry="5.5" fill="#F59E0B" />
                <ellipse cx="127" cy="124" rx="12" ry="5.5" fill="#F59E0B" />
                <ellipse cx="110" cy="82" rx="42" ry="44" fill="#14161F" stroke={accent} strokeWidth="2.4" />
                <ellipse cx="110" cy="96" rx="27" ry="26" fill="#E2E8F0" />
                <rect x="78" y="54" width="64" height="32" rx="14" fill="#070B14" stroke="#334155" strokeWidth="1.2" />
              </>
            )}

            {/* ── MODEL 3: PHANTOM DAEMON GHOST ── */}
            {model === 'ghost' && (
              <>
                <circle cx="56" cy="64" r="4.5" fill="#A855F7" fillOpacity="0.8" />
                <circle cx="164" cy="74" r="3.5" fill="#06B6D4" fillOpacity="0.8" />
                <path
                  d="M70 76 C70 36, 150 36, 150 76 L150 118 L137 108 L124 118 L110 108 L96 118 L83 108 L70 118 Z"
                  fill="#13172B"
                  stroke={accent}
                  strokeWidth="2.4"
                />
                <rect x="80" y="54" width="60" height="38" rx="16" fill="#070A14" />
              </>
            )}

            {/* ── MODEL 4: FLIPPER CYBER FOX ── */}
            {model === 'fox' && (
              <>
                <path
                  d="M145 106 Q178 98 168 74 Q156 80 144 94 Z"
                  fill="#EA580C"
                  stroke="#FDBA74"
                  strokeWidth="1.5"
                />
                <polygon points="74,50 56,16 96,40" fill="#EA580C" stroke={accent} strokeWidth="2" />
                <polygon points="74,46 63,24 89,40" fill="#090D16" />
                <polygon points="146,50 164,16 124,40" fill="#EA580C" stroke={accent} strokeWidth="2" />
                <polygon points="146,46 157,24 131,40" fill="#090D16" />

                <polygon
                  points="66,58 84,40 136,40 154,58 142,102 110,114 78,102"
                  fill="#EA580C"
                  stroke={accent}
                  strokeWidth="2.2"
                />
                <polygon points="69,76 96,90 110,113 78,102" fill="#F8FAFC" />
                <polygon points="151,76 124,90 110,113 142,102" fill="#F8FAFC" />
                <rect x="78" y="55" width="64" height="33" rx="12" fill="#070B14" stroke="#1E293B" strokeWidth="1.5" />
                <polygon points="105,94 115,94 110,101" fill="#09090B" />
              </>
            )}

            {renderFaceExpressions()}
            {renderEquippedGear()}
          </g>
        </svg>

        {/* Malware Bugs Pool */}
        {defendActive &&
          Array.from({ length: BUG_POOL }).map((_, i) => (
            <button
              key={i}
              ref={(el) => {
                bugDomRefs.current[i] = el;
              }}
              type="button"
              onClick={(e) => handleZapBug(e, i)}
              style={{
                opacity: 0,
                pointerEvents: 'none',
                left: '50%',
                top: '50%',
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl p-3 z-30 cursor-crosshair select-none transition-transform hover:scale-125 active:scale-90 focus:outline-none drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]"
              title="Click to neutralize threat!"
            />
          ))}

        {/* Interactive Toy Dock inside Arena Bottom */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full flex flex-wrap items-center justify-between gap-2 text-[11px] z-20"
        >
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setDefendActive(false);
                const next = !laserMode;
                setLaserMode(next);
                setMood(next ? 'happy' : 'chill');
                setSpeech(
                  next
                    ? '🔴 LASER LOCKED! Glide your cursor around the arena!'
                    : 'Laser pointer holstered.'
                );
              }}
              className={`px-3 py-1.5 border font-bold cursor-pointer transition-colors ${
                laserMode
                  ? 'bg-red-500 border-red-400 text-black'
                  : 'bg-[#111111] border-[#333330] text-[#D8D8D1] hover:border-red-400'
              }`}
            >
              🔴 {laserMode ? 'LASER: ON' : 'LASER'}
            </button>

            <button
              type="button"
              onClick={handleTossSnack}
              className="px-3 py-1.5 bg-[#111111] border border-[#333330] text-[#D8D8D1] hover:border-emerald-400 hover:text-emerald-300 font-bold cursor-pointer transition-colors"
            >
              🐟 SNACK
            </button>

            <button
              type="button"
              onClick={() => {
                const next = (gearIdx + 1) % GEARS.length;
                setGearIdx(next);
                setMood('happy');
                setSpeech(`Equipped cosmetic: ${GEARS[next].label}! Looking sharp.`);
              }}
              className="px-3 py-1.5 bg-[#111111] border border-[#333330] text-[#D8D8D1] hover:border-amber-400 hover:text-amber-300 font-bold cursor-pointer transition-colors"
            >
              {GEARS[gearIdx].label}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={defendActive}
              onClick={() => runCommand('defend')}
              className="px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-400 hover:text-black font-bold cursor-pointer disabled:opacity-40 transition-colors"
            >
              ⚔️ DEFEND
            </button>

            <button
              type="button"
              onClick={() => (activeMood === 'sleep' ? wakeUpPet() : runCommand('sleep'))}
              className="px-2.5 py-1.5 bg-[#111111] border border-[#333330] text-[#A9A9A2] hover:text-white cursor-pointer"
              title="Sleep / Wake"
            >
              💤
            </button>
          </div>
        </div>

        {/* Floating Feedback Particles */}
        {floatingFx.map((fx) => (
          <span
            key={fx.id}
            style={{ left: `${fx.x}%`, top: `${fx.y}%` }}
            className="absolute text-xs font-bold text-[#3B82F6] pointer-events-none z-30 animate-[fadeUp_0.8s_ease-out_forwards]"
          >
            {fx.text}
          </span>
        ))}
      </div>

      {/* 3. ENLARGED DIALOGUE & TERMINAL SHELL */}
      <div className="w-full pt-4">
        <p className="text-[#D8D8D1] text-xs font-light mb-3 font-mono min-h-[2.4rem] leading-relaxed">
          &gt; {speech}
        </p>

        <div className="flex items-center gap-2.5 border-b border-[#333330] pb-2.5">
          <span className="font-mono text-xs text-[#3B82F6] font-semibold shrink-0">
            root@{model}:~$
          </span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runCommand(command);
            }}
            placeholder="Type 'cat flag', 'fortune', 'sudo', 'dance'..."
            className="flex-1 bg-transparent border-none outline-none text-white text-xs placeholder:text-[#A9A9A2]/50 font-mono tracking-wide"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {['cat flag', 'fortune', 'dance', 'hack', 'sudo rm -rf', 'kill -9', 'help'].map(
            (cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => runCommand(cmd)}
                className="font-mono text-[10px] text-[#A9A9A2] border border-[#333330] px-2.5 py-1 uppercase tracking-wider hover:border-[#3B82F6] hover:text-[#F5F5F0] transition-colors cursor-pointer"
              >
                {cmd}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
