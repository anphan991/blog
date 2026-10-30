'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { triggerAura } from '@/lib/aura';

type PetMood =
  | 'chill'
  | 'happy'
  | 'dance'
  | 'hack'
  | 'angry'
  | 'shield'
  | 'sleep'
  | 'dizzy'
  | 'dead'
  | 'overclock';

type ChassisModel = 'tux' | 'kitsune' | 'kuro';
type ArmorMod = 'std' | 'halo' | 'drones' | 'overdrive';

interface VectorPacket {
  alive: boolean;
  x: number; // % of arena width (0..100)
  y: number; // % of arena height (0..100)
  vx: number;
  vy: number;
  angleDeg: number; // direction from center or heading
  code: string;
}

interface ShatterShard {
  id: number;
  x: number;
  y: number;
  color: string;
  label: string;
}

const PACKET_POOL = 8;
const THREAT_CODES = ['SYN_FLOOD', '0xDEADBEEF', 'SQLi_PKT', 'RCE_PAYLOAD', 'XSS_VECT', 'ROOTKIT'];

const CHASSIS_LIST: { id: ChassisModel; code: string; name: string; spec: string }[] = [
  { id: 'tux', code: '01', name: 'TUX_MK4', spec: 'CRYO KERNEL UNIT' },
  { id: 'kitsune', code: '02', name: 'KITSUNE', spec: 'ZERO-DAY MECHA' },
  { id: 'kuro', code: '03', name: 'KURO_RONIN', spec: 'STEALTH PANTHER' },
];

const ARMOR_MODS: { id: ArmorMod; label: string }[] = [
  { id: 'std', label: 'MOD: STD' },
  { id: 'halo', label: 'MOD: HALO' },
  { id: 'drones', label: 'MOD: BITS' },
  { id: 'overdrive', label: 'MOD: AURA' },
];

const HIRE_TAUNTS = [
  'Target evaded cursor! That [Hire Me?] button runs custom 60fps evasion firmware.',
  'Missed again! Want me to lock onto that runaway button with my railgun?',
  'Telemetry report: Admin made that button faster than a caffeinated SOC analyst.',
  'Pro tip: Corner the [Hire Me?] button or bribe me with [OVERCLOCK] cycles.',
];

const FORTUNES = [
  'Prophecy: Never git push --force after 5 PM on a Friday.',
  'Tarot [THE SEGFAULT]: Check your null pointers before deploying.',
  'Oracle: Works on localhost, explodes in production Docker.',
  'Fortune: One missing semicolon will cost 3 hours of sleep.',
  'Tarot [CHMOD 777]: Convenience today, Wazuh Level-15 alert tomorrow.',
];

const RANK_TITLES = [
  'Noob',
  'Noob',
  'Noob',
  'Noob',
  'Max',
];

function makeSegmentBar(val: number): string {
  const clamped = Math.max(0, Math.min(100, val));
  const filled = Math.round(clamped / 12.5);
  return '▰'.repeat(filled) + '▱'.repeat(8 - filled);
}

function normalizeAngleDelta(a: number, b: number): number {
  let diff = ((a - b + 540) % 360) - 180;
  if (diff < -180) diff += 360;
  return Math.abs(diff);
}

export default function CyberCompanion({ chaosMode = false }: { chaosMode?: boolean }) {
  const [chassis, setChassis] = useState<ChassisModel>('tux');
  const [modIdx, setModIdx] = useState<number>(0);
  const [mood, setMood] = useState<PetMood>('chill');
  const [speech, setSpeech] = useState<string>(
    'SYS.ONLINE // Move cursor to track, rub chassis to calibrate, or engage [FIREWALL_SIM].'
  );
  const [command, setCommand] = useState<string>('');

  // Core Telemetry
  const [energy, setEnergy] = useState<number>(88);
  const [xp, setXp] = useState<number>(40);
  const [scrollSpike, setScrollSpike] = useState<number>(0);

  // Interactive Modes
  const [laserMode, setLaserMode] = useState<boolean>(false);
  const [firewallActive, setFirewallActive] = useState<boolean>(false);
  const [firewallTimeLeft, setFirewallTimeLeft] = useState<number>(0);
  const [shards, setShards] = useState<ShatterShard[]>([]);

  // Zero-Rerender Refs for 60fps Procedural Animation & Physics
  const rootRef = useRef<HTMLDivElement | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const arenaRectRef = useRef<DOMRect | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  const unitGroupRef = useRef<SVGGElement | null>(null);
  const headGroupRef = useRef<SVGGElement | null>(null);
  const eyeGroupRef = useRef<SVGGElement | null>(null);
  const blinkLidRef = useRef<SVGRectElement | null>(null);
  const leftLimbRef = useRef<SVGGElement | null>(null);
  const rightLimbRef = useRef<SVGGElement | null>(null);
  const tailOrCloakRef = useRef<SVGGElement | null>(null);
  const coreGlowRef = useRef<SVGCircleElement | null>(null);
  const shieldOrbitRef = useRef<SVGGElement | null>(null);
  const railgunLineRef = useRef<SVGLineElement | null>(null);
  const wavePathRef = useRef<SVGPathElement | null>(null);
  const laserDotDomRef = useRef<HTMLDivElement | null>(null);

  // Physics State Refs (0 React re-renders!)
  const pointerRef = useRef({
    rx: 0.5, // normalized 0..1 inside arena
    ry: 0.5,
    px: 0,
    py: 0,
    inside: false,
    shieldDeg: -90, // degrees around center (110, 82)
  });

  const motionRef = useRef({
    posX: 0,
    posY: 0,
    rot: 0,
    eyeX: 0,
    eyeY: 0,
    recoilX: 0,
    recoilY: 0,
    scrollVelY: 0,
    lookOverrideX: 0,
    lookOverrideUntil: 0,
    nextBlinkAt: 2500,
    blinkEndAt: 0,
  });

  // Firewall Threat Packet Pool
  const packetsRef = useRef<VectorPacket[]>(
    Array.from({ length: PACKET_POOL }, () => ({
      alive: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angleDeg: 0,
      code: '0x00',
    }))
  );
  const packetDomRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const interceptCountRef = useRef<number>(0);

  // Gesture & Timer Refs
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const rubDistRef = useRef<number>(0);
  const spinAccumRef = useRef<number>(0);
  const lastAngleRef = useRef<number | null>(null);
  const lastGestureAtRef = useRef<number>(0);
  const pokeCountRef = useRef<number>(0);
  const pokeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const railgunTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeMod = ARMOR_MODS[modIdx]?.id || 'std';
  const level = Math.min(5, Math.floor(xp / 100) + 1);
  const xpInLevel = xp % 100;
  const rankTitle = RANK_TITLES[level - 1] || RANK_TITLES[0];
  const activeMood: PetMood = chaosMode ? 'dead' : mood;

  // Dynamic Phosphor Accent Color
  const accent =
    activeMood === 'dead' || activeMood === 'angry'
      ? '#EF4444'
      : activeMood === 'overclock'
      ? '#F59E0B'
      : activeMood === 'hack'
      ? '#10B981'
      : activeMood === 'shield' || firewallActive
      ? '#38BDF8'
      : activeMood === 'dizzy'
      ? '#A855F7'
      : '#3B82F6';

  const spawnShard = useCallback((label: string, x = 50, y = 40, color = '#38BDF8') => {
    const id = Date.now() + Math.random();
    setShards((prev) => [...prev.slice(-5), { id, x, y, color, label }]);
    setTimeout(() => {
      setShards((prev) => prev.filter((s) => s.id !== id));
    }, 780);
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (pokeTimerRef.current) clearTimeout(pokeTimerRef.current);
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
      if (railgunTimerRef.current) clearTimeout(railgunTimerRef.current);
    };
  }, []);

  // Pause rAF when scrolled completely out of viewport
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.02 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── PAGE-AWARE AI: Listen to Hire-Me Button, Chaos Mode & Scroll Velocity ──
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();
    let spikeResetTimer: ReturnType<typeof setTimeout> | null = null;
    let lastSpikeReact = 0;

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(12, now - lastScrollT);
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      lastScrollT = now;

      const velPxPerSec = Math.round((Math.abs(dy) / dt) * 1000);
      // Apply physical G-force inertia to unit
      motionRef.current.scrollVelY = Math.max(-24, Math.min(24, -dy * 0.32));

      if (velPxPerSec > 2600 && isVisibleRef.current && now - lastSpikeReact > 3500) {
        lastSpikeReact = now;
        setScrollSpike(velPxPerSec);
        if (!firewallActive && activeMood !== 'sleep' && activeMood !== 'dead') {
          setSpeech(`G-FORCE TELEMETRY // High scroll velocity detected (${velPxPerSec} px/s). Stabilizers engaged.`);
        }
        if (spikeResetTimer) clearTimeout(spikeResetTimer);
        spikeResetTimer = setTimeout(() => setScrollSpike(0), 2200);
      }
    };

    const onCompanionSignal = (e: Event) => {
      const custom = e as CustomEvent<{ type: string }>;
      const sig = custom.detail?.type;
      if (sig === 'hire-evade') {
        // Snap gaze to the left toward the Hire Me button
        motionRef.current.lookOverrideX = -9;
        motionRef.current.lookOverrideUntil = performance.now() + 2200;
        const msg = HIRE_TAUNTS[Math.floor(Math.random() * HIRE_TAUNTS.length)];
        setMood('happy');
        setSpeech(msg);
      } else if (sig === 'wipe-init') {
        setMood('dead');
        setSpeech('CRITICAL ALERT // wipe_data.sh invoked! Engaging emergency core lockdown!');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('companion-signal', onCompanionSignal as EventListener);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('companion-signal', onCompanionSignal as EventListener);
      if (spikeResetTimer) clearTimeout(spikeResetTimer);
    };
  }, [firewallActive, activeMood]);

  const displayedSpeech = chaosMode
    ? 'KERNEL PANIC! Everything is melting!! Why did you press that button?!'
    : speech;

  // ── UNIFIED 60FPS PROCEDURAL IDLE, EYE TRACKING, LASER CHASE & OSCILLOSCOPE LOOP ──
  useEffect(() => {
    let rafId = 0;
    let lastPounceAt = 0;

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (document.hidden || !isVisibleRef.current) return;

      const m = motionRef.current;
      const p = pointerRef.current;
      const isSleeping = activeMood === 'sleep';
      const isDancing = activeMood === 'dance';
      const isOverclocked = activeMood === 'overclock' || chaosMode;
      const freq = isSleeping ? 0.0014 : isDancing ? 0.0085 : isOverclocked ? 0.0065 : 0.0028;

      // 1. Procedural Sine Breathing & Hover Float
      const breatheY = Math.sin(now * freq) * (isSleeping ? 2.2 : isDancing ? 8.5 : 4.5);
      const secondaryWave = Math.cos(now * freq * 1.35);

      // Decay physical recoil & scroll inertia
      m.recoilX *= 0.84;
      m.recoilY *= 0.84;
      m.scrollVelY *= 0.88;

      // 2. Target Unit Position (Laser Chase vs Centered Hover)
      let targetX = 0;
      let targetY = breatheY + m.scrollVelY + m.recoilY;
      let targetRot = 0;

      if (laserMode && p.inside && !isSleeping) {
        targetX = (p.rx - 0.5) * 145;
        targetY = (p.ry - 0.5) * 68 + breatheY * 0.5;
        targetRot = (targetX - m.posX) * 0.22;

        const dist = Math.hypot(targetX - m.posX, targetY - m.posY);
        if (dist < 11 && now - lastPounceAt > 1800) {
          lastPounceAt = now;
          setXp((v) => v + 12);
          spawnShard('TARGET_LOCKED +12XP', p.rx * 100, p.ry * 100, '#EF4444');
          triggerAura(45, 'Target lock acquired on tactical laser!', '🎯');
        }
      } else if (isDancing) {
        targetX = Math.sin(now * 0.0055) * 14 + m.recoilX;
        targetRot = Math.sin(now * 0.0055) * 8.5;
      } else {
        targetX = m.recoilX + (p.inside && !isSleeping ? (p.rx - 0.5) * 10 : 0);
        targetRot = p.inside && !isSleeping ? (p.rx - 0.5) * 4.5 : Math.sin(now * 0.0015) * 1.2;
      }

      m.posX += (targetX - m.posX) * 0.14;
      m.posY += (targetY - m.posY) * 0.14;
      m.rot += (targetRot - m.rot) * 0.15;

      if (chaosMode) {
        m.posX += (Math.random() - 0.5) * 2.4;
      }

      if (unitGroupRef.current) {
        unitGroupRef.current.style.transform = `translate3d(${m.posX.toFixed(2)}px, ${m.posY.toFixed(2)}px, 0) rotate(${m.rot.toFixed(2)}deg)`;
      }

      // 3. Articulated Floating Limbs / Cloak / Thrusters
      if (leftLimbRef.current) {
        const ly = secondaryWave * (isOverclocked ? 5.5 : 3.2);
        const lr = Math.sin(now * freq * 1.2) * 6;
        leftLimbRef.current.style.transform = `translate3d(0px, ${ly.toFixed(2)}px, 0) rotate(${lr.toFixed(1)}deg)`;
      }
      if (rightLimbRef.current) {
        const ry = -secondaryWave * (isOverclocked ? 5.5 : 3.2);
        const rr = -Math.sin(now * freq * 1.2) * 6;
        rightLimbRef.current.style.transform = `translate3d(0px, ${ry.toFixed(2)}px, 0) rotate(${rr.toFixed(1)}deg)`;
      }
      if (tailOrCloakRef.current) {
        const tr = Math.sin(now * freq * 1.6) * (isOverclocked ? 9 : 5);
        tailOrCloakRef.current.style.transform = `rotate(${tr.toFixed(2)}deg)`;
      }
      if (coreGlowRef.current) {
        const pulse = 0.55 + (Math.sin(now * (isOverclocked ? 0.012 : 0.004)) + 1) * 0.22;
        coreGlowRef.current.style.opacity = pulse.toFixed(2);
      }

      // 4. Smooth Eye & Head Tracking + Natural Random Blink
      let desiredEyeX = 0;
      let desiredEyeY = 0;
      if (now < m.lookOverrideUntil) {
        desiredEyeX = m.lookOverrideX;
        desiredEyeY = -1.5;
      } else if (p.inside && !isSleeping) {
        desiredEyeX = (p.rx - 0.5) * 14;
        desiredEyeY = (p.ry - 0.5) * 9;
      }

      m.eyeX += (desiredEyeX - m.eyeX) * 0.22;
      m.eyeY += (desiredEyeY - m.eyeY) * 0.22;

      if (eyeGroupRef.current) {
        eyeGroupRef.current.style.transform = `translate3d(${m.eyeX.toFixed(2)}px, ${m.eyeY.toFixed(2)}px, 0)`;
      }
      if (headGroupRef.current) {
        headGroupRef.current.style.transform = `translate3d(${(m.eyeX * 0.28).toFixed(2)}px, ${(m.eyeY * 0.22).toFixed(2)}px, 0)`;
      }

      // Blink eyelid
      if (blinkLidRef.current) {
        if (isSleeping) {
          blinkLidRef.current.style.transform = 'scaleY(1)';
        } else {
          if (now > m.nextBlinkAt) {
            m.blinkEndAt = now + 130;
            m.nextBlinkAt = now + 2600 + Math.random() * 3200;
          }
          blinkLidRef.current.style.transform = now < m.blinkEndAt ? 'scaleY(1)' : 'scaleY(0)';
        }
      }

      // 5. 360° Orbital Firewall Shield Tracking
      if (firewallActive && shieldOrbitRef.current) {
        shieldOrbitRef.current.style.transform = `rotate(${p.shieldDeg.toFixed(1)}deg)`;
      }

      // 6. Background Live Telemetry Oscilloscope Waveform
      if (wavePathRef.current) {
        const amp = isSleeping ? 2 : firewallActive || isOverclocked ? 9 : 4.2;
        const phase = now * (isOverclocked ? 0.012 : 0.0045);
        let d = 'M 0 75';
        for (let x = 0; x <= 220; x += 10) {
          const y = 75 + Math.sin(x * 0.08 + phase) * amp * Math.sin((x / 220) * Math.PI);
          d += ` L ${x} ${y.toFixed(1)}`;
        }
        wavePathRef.current.setAttribute('d', d);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [activeMood, chaosMode, laserMode, firewallActive, spawnShard]);

  // ── 360° ORBITAL FIREWALL & VECTOR MALWARE SIMULATION LOOP ──
  useEffect(() => {
    if (!firewallActive) return;

    const packets = packetsRef.current;
    interceptCountRef.current = 0;

    const hidePacket = (i: number) => {
      packets[i].alive = false;
      const el = packetDomRefs.current[i];
      if (el) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }
    };

    const spawnPacket = (i: number) => {
      const edge = Math.floor(Math.random() * 4);
      let sx = 0;
      let sy = 0;
      if (edge === 0) {
        sx = 12 + Math.random() * 76;
        sy = 5;
      } else if (edge === 1) {
        sx = 95;
        sy = 14 + Math.random() * 72;
      } else if (edge === 2) {
        sx = 12 + Math.random() * 76;
        sy = 93;
      } else {
        sx = 5;
        sy = 14 + Math.random() * 72;
      }

      const dx = 50 - sx;
      const dy = 50 - sy;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = 0.36 + Math.random() * 0.16;
      const headingDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

      const pkt = packets[i];
      pkt.alive = true;
      pkt.x = sx;
      pkt.y = sy;
      pkt.vx = (dx / dist) * speed;
      pkt.vy = (dy / dist) * speed;
      pkt.angleDeg = headingDeg;
      pkt.code = THREAT_CODES[Math.floor(Math.random() * THREAT_CODES.length)];

      const el = packetDomRefs.current[i];
      if (el) {
        el.style.left = `${pkt.x.toFixed(2)}%`;
        el.style.top = `${pkt.y.toFixed(2)}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${headingDeg.toFixed(1)}deg)`;
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      }
    };

    for (let i = 0; i < PACKET_POOL; i++) hidePacket(i);
    spawnPacket(0);
    spawnPacket(1);
    spawnPacket(2);

    let raf = 0;
    let last = performance.now();
    let spawnClock = 0;
    let lastBreachAt = 0;

    const tickFirewall = (now: number) => {
      raf = requestAnimationFrame(tickFirewall);
      if (document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(2.4, (now - last) / 16.67);
      last = now;

      spawnClock += dt;
      if (spawnClock > 22) {
        spawnClock = 0;
        const free = packets.findIndex((p) => !p.alive);
        const aliveCount = packets.filter((p) => p.alive).length;
        if (free !== -1 && aliveCount < 5) {
          spawnPacket(free);
        }
      }

      const shieldDeg = pointerRef.current.shieldDeg;

      for (let i = 0; i < PACKET_POOL; i++) {
        const pkt = packets[i];
        if (!pkt.alive) continue;

        pkt.x += pkt.vx * dt;
        pkt.y += pkt.vy * dt;

        const relX = pkt.x - 50;
        const relY = pkt.y - 50;
        const distFromCenter = Math.hypot(relX, relY);

        // 1. Check 360° Orbital Shield Arc Parry (Radius ~ 16% .. 24%)
        if (distFromCenter >= 15 && distFromCenter <= 24) {
          const pktAngleFromCenter = (Math.atan2(relY, relX) * 180) / Math.PI;
          if (normalizeAngleDelta(pktAngleFromCenter, shieldDeg) <= 42) {
            hidePacket(i);
            interceptCountRef.current += 1;
            motionRef.current.recoilX = -Math.cos((pktAngleFromCenter * Math.PI) / 180) * 4;
            motionRef.current.recoilY = -Math.sin((pktAngleFromCenter * Math.PI) / 180) * 4;
            spawnShard(`PARRY // ${pkt.code}`, pkt.x, pkt.y, '#38BDF8');
            triggerAura(60, `Orbital Shield deflected ${pkt.code}!`, '🛡️');
            continue;
          }
        }

        // 2. Check Core Breach (< 11%)
        if (distFromCenter < 11) {
          hidePacket(i);
          if (now - lastBreachAt > 600) {
            lastBreachAt = now;
            setMood('angry');
            setEnergy((e) => Math.max(5, e - 10));
            motionRef.current.recoilX = (Math.random() - 0.5) * 14;
            motionRef.current.recoilY = 6;
            setSpeech(`BREACH_DETECTED // ${pkt.code} bypassed perimeter! Rotate shield or click to fire railgun!`);
          }
          continue;
        }

        // 3. Out-of-bounds failsafe
        if (pkt.x < -10 || pkt.x > 110 || pkt.y < -10 || pkt.y > 110) {
          hidePacket(i);
          continue;
        }

        const el = packetDomRefs.current[i];
        if (el) {
          el.style.left = `${pkt.x.toFixed(2)}%`;
          el.style.top = `${pkt.y.toFixed(2)}%`;
        }
      }
    };

    raf = requestAnimationFrame(tickFirewall);

    const countdown = setInterval(() => {
      setFirewallTimeLeft((t) => {
        if (t <= 1) {
          setFirewallActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(countdown);
      for (let i = 0; i < PACKET_POOL; i++) hidePacket(i);
    };
  }, [firewallActive, spawnShard]);

  // Wave Cleared Completion Reward
  const prevFirewallRef = useRef<boolean>(false);
  useEffect(() => {
    if (prevFirewallRef.current && !firewallActive && firewallTimeLeft === 0) {
      const intercepts = interceptCountRef.current;
      setMood('happy');
      setXp((v) => v + 65 + intercepts * 10);
      setSpeech(
        `FIREWALL_SIM COMPLETE // ${intercepts} threat packets neutralized. (+450 Aura, +${65 + intercepts * 10} XP)`
      );
      triggerAura(450, `Firewall simulation cleared (${intercepts} intercepts)`, '🛡️');
    }
    prevFirewallRef.current = firewallActive;
  }, [firewallActive, firewallTimeLeft]);

  const fireRailgunAtPacket = (i: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const pkt = packetsRef.current[i];
    if (!pkt?.alive) return;

    pkt.alive = false;
    const el = packetDomRefs.current[i];
    if (el) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    }
    interceptCountRef.current += 1;

    // Physical recoil opposite to shot vector
    const shotRad = Math.atan2(pkt.y - 50, pkt.x - 50);
    motionRef.current.recoilX = -Math.cos(shotRad) * 9;
    motionRef.current.recoilY = -Math.sin(shotRad) * 7;

    // Render high-energy Railgun Beam
    const beam = railgunLineRef.current;
    if (beam) {
      beam.setAttribute('x2', `${pkt.x.toFixed(1)}%`);
      beam.setAttribute('y2', `${pkt.y.toFixed(1)}%`);
      beam.style.opacity = '1';
      if (railgunTimerRef.current) clearTimeout(railgunTimerRef.current);
      railgunTimerRef.current = setTimeout(() => {
        if (railgunLineRef.current) railgunLineRef.current.style.opacity = '0';
      }, 150);
    }

    setMood('hack');
    spawnShard(`RAILGUN // +75`, pkt.x, pkt.y, '#38BDF8');
    triggerAura(75, `Railgun vaporized ${pkt.code}`, '⚡');
  };

  // Trigger Overclock Core Surge
  const handleOverclock = () => {
    if (activeMood === 'dead') return;
    setMood('overclock');
    const nextEnergy = Math.min(100, energy + 25);
    setEnergy(nextEnergy);
    setXp((v) => v + 30);
    motionRef.current.recoilY = -8;
    setSpeech(`CORE_OVERCLOCK // Voltage surged to 1.45V! Energy at ${nextEnergy}%, clock multiplier unlocked.`);
    spawnShard('⚡ OVERCLOCK +30XP', 50, 28, '#F59E0B');
    triggerAura(140, `Overclocked ${chassis.toUpperCase()} core!`, '⚡');

    if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    actionTimerRef.current = setTimeout(() => {
      setMood('chill');
    }, 2400);
  };

  // Arena Pointer Tracking
  const handleArenaMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    arenaRectRef.current = e.currentTarget.getBoundingClientRect();
    pointerRef.current.inside = true;
    if (laserMode && laserDotDomRef.current) {
      laserDotDomRef.current.style.opacity = '1';
    }
  };

  const handleArenaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = arenaRef.current;
    if (!el) return;
    const rect = arenaRectRef.current || el.getBoundingClientRect();
    arenaRectRef.current = rect;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const rx = Math.max(0, Math.min(1, px / (rect.width || 1)));
    const ry = Math.max(0, Math.min(1, py / (rect.height || 1)));

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const angleDeg = (Math.atan2(py - cy, px - cx) * 180) / Math.PI;

    pointerRef.current.px = px;
    pointerRef.current.py = py;
    pointerRef.current.rx = rx;
    pointerRef.current.ry = ry;
    pointerRef.current.inside = true;
    pointerRef.current.shieldDeg = angleDeg;

    if (laserMode && laserDotDomRef.current) {
      laserDotDomRef.current.style.opacity = '1';
      laserDotDomRef.current.style.transform = `translate3d(${px - 9}px, ${py - 9}px, 0)`;
    }

    if (firewallActive || laserMode || activeMood === 'sleep' || activeMood === 'dead') return;

    const now = Date.now();
    // Gesture 1: Rubbing / Petting Head Armor
    if (ry > 0.16 && ry < 0.62 && rx > 0.26 && rx < 0.74) {
      if (lastPosRef.current) {
        const dist = Math.hypot(px - lastPosRef.current.x, py - lastPosRef.current.y);
        rubDistRef.current += dist;
        if (rubDistRef.current > 280 && now - lastGestureAtRef.current > 2400) {
          rubDistRef.current = 0;
          lastGestureAtRef.current = now;
          setMood('happy');
          setXp((v) => v + 15);
          setEnergy((en) => Math.min(100, en + 5));
          setSpeech('*purrrrr* // Headpats accepted! Happiness buffer at 100% <3');
          spawnShard('<3 +50', 50, 26, '#3B82F6');
          triggerAura(80, 'Gave Companion gentle headpats!', '💙');
        }
      }
      lastPosRef.current = { x: px, y: py };
    } else {
      lastPosRef.current = null;
    }

    // Gesture 2: Spinning Cursor 360° -> Gyro Overload
    const rad = Math.atan2(py - cy, px - cx);
    if (lastAngleRef.current !== null) {
      let delta = rad - lastAngleRef.current;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      spinAccumRef.current += delta;

      if (Math.abs(spinAccumRef.current) > Math.PI * 5 && now - lastGestureAtRef.current > 3200) {
        spinAccumRef.current = 0;
        lastGestureAtRef.current = now;
        setMood('dizzy');
        setXp((v) => v + 20);
        setSpeech('@_@ Whoaaa stop spinning the cursor, my gyroscope is dizzy!!');
        spawnShard('🌀 DIZZY', 50, 24, '#A855F7');
        triggerAura(150, 'Made Companion dizzy with 360° cursor spin!', '🌀');
      }
    }
    lastAngleRef.current = rad;
  };

  const handleArenaMouseLeave = () => {
    arenaRectRef.current = null;
    pointerRef.current.inside = false;
    lastPosRef.current = null;
    lastAngleRef.current = null;
    rubDistRef.current = 0;
    spinAccumRef.current = 0;
    if (laserDotDomRef.current) {
      laserDotDomRef.current.style.opacity = '0';
    }
  };

  const wakeUnit = () => {
    setMood('chill');
    setSpeech('Yawn... Waking up from hibernation mode!');
    spawnShard('ONLINE', 50, 26, '#3B82F6');
  };

  // Arena Click: During Firewall -> Aim-assist Railgun nearest packet to click! Otherwise -> Poke / Counter-shock
  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (firewallActive) {
      const rect = arenaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clickX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickY = ((e.clientY - rect.top) / rect.height) * 100;

      // Find nearest alive threat packet within generous 18% magnetic lock radius
      let bestIdx = -1;
      let bestDist = 18;
      packetsRef.current.forEach((p, idx) => {
        if (!p.alive) return;
        const d = Math.hypot(p.x - clickX, p.y - clickY);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = idx;
        }
      });

      if (bestIdx !== -1) {
        fireRailgunAtPacket(bestIdx);
      } else {
        // Blank warning shot toward cursor
        const beam = railgunLineRef.current;
        if (beam) {
          beam.setAttribute('x2', `${clickX.toFixed(1)}%`);
          beam.setAttribute('y2', `${clickY.toFixed(1)}%`);
          beam.style.opacity = '0.55';
          if (railgunTimerRef.current) clearTimeout(railgunTimerRef.current);
          railgunTimerRef.current = setTimeout(() => {
            if (railgunLineRef.current) railgunLineRef.current.style.opacity = '0';
          }, 110);
        }
      }
      return;
    }

    if (laserMode || activeMood === 'dead') return;
    if (activeMood === 'sleep') {
      wakeUnit();
      return;
    }

    pokeCountRef.current += 1;
    if (pokeTimerRef.current) clearTimeout(pokeTimerRef.current);
    pokeTimerRef.current = setTimeout(() => {
      pokeCountRef.current = 0;
    }, 2000);

    if (pokeCountRef.current >= 4) {
      pokeCountRef.current = 0;
      setMood('angry');
      motionRef.current.recoilY = -10;
      setSpeech('⚡ TAZER COUNTERMEASURE! Stop poking my visor! (-100 Aura)');
      spawnShard('⚡ -100 AURA', 50, 25, '#EF4444');
      triggerAura(-100, 'Shocked by Companion anti-poke tazer!', '⚡');
    } else {
      motionRef.current.recoilY = -4;
      setMood('happy');
      setXp((v) => v + 5);
      setSpeech('Boop! Rub my head to pet, toggle LASER_TRACK, OVERCLOCK, or test FIREWALL_SIM!');
      spawnShard('BOOP! +5XP', 50, 30, '#3B82F6');
      triggerAura(25, 'Poked Cyber Companion!', '👉');
    }
  };

  // Terminal CLI Command Execution
  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'sudo' || cmd.startsWith('sudo ')) {
      setMood('angry');
      setSpeech('sudo: Permission denied. Incident logged and forwarded to your mom 🐧');
      spawnShard('🚨 403_MOM', 50, 26, '#EF4444');
      triggerAura(-50, 'Unauthorized sudo attempt!', '🚨');
      return;
    }

    if (cmd === 'cat flag' || cmd === 'cat flag.txt' || cmd === 'ctf') {
      setMood('hack');
      setXp((v) => v + 60);
      setSpeech('FLAG{guguUUUUUUUuu_GggagaAAA} // +500 Aura unlocked!');
      spawnShard('🚩 +500 AURA', 50, 24, '#10B981');
      triggerAura(500, 'Captured Companion CTF Flag!', '🚩');
      return;
    }

    if (cmd === 'kill -9' || cmd === 'rm -rf' || cmd === 'rm -rf /') {
      setLaserMode(false);
      setFirewallActive(false);
      setMood('dead');
      setEnergy(0);
      setSpeech('[SIGKILL] Companion flatlined... restoring from snapshot in 3s...');
      spawnShard('💀 SIGKILL', 50, 24, '#EF4444');
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
      setXp((v) => v + 15);
      const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      setSpeech(f);
      spawnShard('🔮 ORACLE', 50, 26, '#38BDF8');
      triggerAura(100, 'Consulted the Cyber Oracle!', '🔮');
      return;
    }

    const actions: Record<string, () => void> = {
      hi: () => {
        const spec = CHASSIS_LIST.find((c) => c.id === chassis);
        setMood('happy');
        setSpeech(`Hey Admin! ${spec?.name} (${spec?.spec}) standing by.`);
      },
      help: () => {
        setMood('chill');
        setSpeech('Try: hi, overclock, hack, firewall, laser, dance, sleep, cat flag, fortune, sudo, kill -9');
      },
      overclock: () => handleOverclock(),
      coffee: () => handleOverclock(),
      feed: () => handleOverclock(),
      firewall: () => {
        setLaserMode(false);
        setFirewallActive(true);
        setFirewallTimeLeft(16);
        setMood('shield');
        setSpeech('FIREWALL_SIM // Move cursor to aim 360° Orbital Shield, or click packets to fire Railgun!');
      },
      defend: () => actions.firewall(),
      laser: () => {
        setFirewallActive(false);
        setLaserMode((prev) => {
          const next = !prev;
          setMood(next ? 'happy' : 'chill');
          setSpeech(
            next
              ? 'LASER_TRACK // Optical target acquisition active. Sweep cursor across OLED viewport.'
              : 'LASER_TRACK // Optical emitter stowed.'
          );
          return next;
        });
      },
      hack: () => {
        setMood('hack');
        setXp((v) => v + 25);
        setSpeech('Injecting payload on port 4444... Try `cat flag` next!');
        spawnShard('💻 +300 AURA', 50, 24, '#10B981');
        triggerAura(300, 'Companion executed exploit chain!', '💻');
      },
      scan: () => {
        setMood('hack');
        setXp((v) => v + 25);
        setSpeech('NMAP_SCAN // 0 open ports exposed, SoftHSM2 sealed, Wazuh ruleset active (+250 Aura).');
        spawnShard('SCAN_CLEAN +250', 50, 24, '#10B981');
        triggerAura(250, 'Completed deep security telemetry scan!', '🛰️');
      },
      dance: () => {
        setMood('dance');
        setXp((v) => v + 20);
        setSpeech('♪ Vibing to 3 AM synthwave while packets fly by ♫');
        spawnShard('🎵 SYNTHWAVE', 50, 24, '#38BDF8');
        triggerAura(150, 'Dance party with Companion!', '🎵');
      },
      brainrot: () => {
        setMood('happy');
        setSpeech('Launching ADHD Arcade OS... 🧠');
        window.dispatchEvent(new CustomEvent('toggle-brainrot'));
      },
      whoami: () => {
        const spec = CHASSIS_LIST.find((c) => c.id === chassis);
        setMood('happy');
        setSpeech(`ID // ${spec?.name} (${spec?.spec}) — LV.${level} ${rankTitle}.`);
      },
      sleep: () => {
        setLaserMode(false);
        setFirewallActive(false);
        setMood('sleep');
        setEnergy(100);
        setSpeech('Zzz... Dreaming of 0 warnings, 0 vulnerabilities...');
        spawnShard('Zzz...', 54, 26, '#60A5FA');
      },
    };

    if (actions[cmd]) {
      actions[cmd]();
    } else {
      setMood('chill');
      setSpeech(`zsh: command not found: ${cmd}. Try "help"!`);
    }
  };

  const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const val = command;
    setCommand('');
    runCommand(val);
  };

  // Render Dot-Matrix Phosphor Eyes
  const renderPhosphorOptics = () => {
    const eyeColor =
      activeMood === 'dead' || activeMood === 'angry'
        ? '#EF4444'
        : activeMood === 'overclock'
        ? '#FBBF24'
        : activeMood === 'hack'
        ? '#34D399'
        : '#60A5FA';

    return (
      <g ref={eyeGroupRef}>
        {activeMood === 'dead' ? (
          <>
            <path d="M88 64 L98 74 M98 64 L88 74" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M122 64 L132 74 M132 64 L122 74" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
          </>
        ) : activeMood === 'sleep' ? (
          <>
            <line x1="86" y1="70" x2="100" y2="70" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="120" y1="70" x2="134" y2="70" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" />
          </>
        ) : activeMood === 'angry' ? (
          <>
            <polygon points="85,63 101,68 100,73 85,71" fill="#EF4444" filter="url(#phosphorGlow)" />
            <polygon points="135,63 119,68 120,73 135,71" fill="#EF4444" filter="url(#phosphorGlow)" />
          </>
        ) : activeMood === 'happy' || activeMood === 'dance' ? (
          <>
            <path d="M86 72 L93 65 L100 72" stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#phosphorGlow)" />
            <path d="M120 72 L127 65 L134 72" stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#phosphorGlow)" />
          </>
        ) : activeMood === 'dizzy' ? (
          <>
            <circle cx="93" cy="69" r="5.5" stroke="#A855F7" strokeWidth="2" strokeDasharray="4 2" fill="none" />
            <circle cx="127" cy="69" r="5.5" stroke="#A855F7" strokeWidth="2" strokeDasharray="4 2" fill="none" />
          </>
        ) : (
          <>
            {/* Segmented Phosphor LED Optics */}
            <rect x="86" y="65" width="13" height="7.5" rx="1.5" fill={eyeColor} filter="url(#phosphorGlow)" />
            <rect x="88" y="66.5" width="4" height="2.2" fill="#FFFFFF" fillOpacity="0.85" />
            <rect x="121" y="65" width="13" height="7.5" rx="1.5" fill={eyeColor} filter="url(#phosphorGlow)" />
            <rect x="123" y="66.5" width="4" height="2.2" fill="#FFFFFF" fillOpacity="0.85" />
          </>
        )}

        {/* Hardware Blink Shutter Lid */}
        <rect
          ref={blinkLidRef}
          x="82"
          y="61"
          width="56"
          height="16"
          fill="#06080F"
          style={{
            transformOrigin: '110px 61px',
            transform: 'scaleY(0)',
            transition: 'transform 0.06s linear',
          }}
        />
      </g>
    );
  };

  // Render Cybernetic Armor Attachments
  const renderArmorMod = () => {
    if (activeMod === 'std') return null;

    if (activeMod === 'halo') {
      return (
        <g>
          <ellipse
            cx="110"
            cy="20"
            rx="28"
            ry="5.5"
            stroke={accent}
            strokeWidth="1.6"
            strokeDasharray="8 4 2 4"
            fill="none"
            filter="url(#phosphorGlow)"
          />
          <polygon points="110,11 107,16 113,16" fill={accent} />
        </g>
      );
    }

    if (activeMod === 'drones') {
      return (
        <g>
          {/* Left Sentinel Bit */}
          <g transform="translate(38, 44)">
            <polygon points="0,-10 8,0 0,10 -8,0" fill="#0F172A" stroke={accent} strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" fill={accent} filter="url(#phosphorGlow)" />
          </g>
          {/* Right Sentinel Bit */}
          <g transform="translate(182, 44)">
            <polygon points="0,-10 8,0 0,10 -8,0" fill="#0F172A" stroke={accent} strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" fill={accent} filter="url(#phosphorGlow)" />
          </g>
        </g>
      );
    }

    if (activeMod === 'overdrive') {
      return (
        <g>
          {/* Tactical HUD Target Reticle + Plasma Arcs */}
          <path d="M52 36 L44 36 L44 46" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.8" />
          <path d="M168 36 L176 36 L176 46" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.8" />
          <path d="M52 126 L44 126 L44 116" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.8" />
          <path d="M168 126 L176 126 L176 116" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.8" />
          <path
            d="M60 92 L52 84 L58 76"
            stroke="#38BDF8"
            strokeWidth="1.4"
            fill="none"
            filter="url(#phosphorGlow)"
          />
          <path
            d="M160 92 L168 84 L162 76"
            stroke="#38BDF8"
            strokeWidth="1.4"
            fill="none"
            filter="url(#phosphorGlow)"
          />
        </g>
      );
    }

    return null;
  };

  return (
    <div
      ref={rootRef}
      className="cyber-companion-deck w-full max-w-[540px] border border-[#2A2A28] bg-[#0B0C10] p-3.5 sm:p-4 font-mono text-xs select-none shadow-[0_24px_60px_rgba(0,0,0,0.9)] flex flex-col gap-3 relative"
    >
      {/* Hardware Anodized Corner Hex Bolts */}
      <span className="absolute top-1.5 left-2 text-[9px] text-[#444440] pointer-events-none">⊕</span>
      <span className="absolute top-1.5 right-2 text-[9px] text-[#444440] pointer-events-none">⊕</span>
      <span className="absolute bottom-1.5 left-2 text-[9px] text-[#444440] pointer-events-none">⊕</span>
      <span className="absolute bottom-1.5 right-2 text-[9px] text-[#444440] pointer-events-none">⊕</span>

      {/* 1. TOP CHASSIS SELECTOR & SERIAL TELEMETRY PLATE */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1E2028] pt-1">
        <div className="flex items-center gap-1">
          {CHASSIS_LIST.map((c) => {
            const active = chassis === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setChassis(c.id);
                  setMood('chill');
                  setSpeech(`CHASSIS_SWAP // Deployed ${c.name} [${c.spec}]. All servos online.`);
                  spawnShard(c.name, 50, 28, '#3B82F6');
                }}
                className={`px-2.5 py-1 border text-[10px] tracking-[0.12em] uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#121826] border-[#3B82F6] text-[#F5F5F0] font-bold'
                    : 'bg-[#08090C] border-[#22242C] text-[#888882] hover:text-[#D8D8D1] hover:border-[#3A3D4A]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    active ? 'bg-[#3B82F6] shadow-[0_0_6px_#3B82F6]' : 'bg-[#333330]'
                  }`}
                />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase">
          <span className="px-2 py-0.5 bg-[#10131C] border border-[#252A38] text-[#60A5FA] font-bold">
            LV.{level} {'//'} {rankTitle}
          </span>
        </div>
      </div>

      {/* 2. RECESSED OLED PHOSPHOR VIEWPORT (MECHA ARENA) */}
      <div
        ref={arenaRef}
        onMouseEnter={handleArenaMouseEnter}
        onMouseMove={handleArenaMouseMove}
        onMouseLeave={handleArenaMouseLeave}
        onClick={handleArenaClick}
        className={`relative w-full h-72 sm:h-80 border bg-[#05070C] shadow-[inset_0_6px_28px_rgba(0,0,0,0.95)] flex flex-col items-center justify-between p-3.5 overflow-hidden transition-colors ${
          laserMode
            ? 'border-red-500/80'
            : firewallActive
            ? 'border-sky-400'
            : activeMood === 'overclock'
            ? 'border-amber-400/80'
            : 'border-[#222530] hover:border-[#3B82F6]/60'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 52%, rgba(59,130,246,0.09) 0%, transparent 65%), linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 22px 22px, 22px 22px',
        }}
      >
        {/* Subtle CRT OLED Scanline Texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-25 z-[5]"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.55) 2px, rgba(0,0,0,0.55) 4px)',
          }}
        />

        {/* Zero-Lag Tactical Laser Target Reticle */}
        {laserMode && (
          <div
            ref={laserDotDomRef}
            style={{
              opacity: 0,
              willChange: 'transform',
              transform: 'translate3d(0px, 0px, 0)',
            }}
            className="absolute top-0 left-0 w-[18px] h-[18px] rounded-full border border-red-400/80 bg-red-500/20 flex items-center justify-center pointer-events-none z-30"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_#EF4444]" />
          </div>
        )}

        {/* Full-Arena Railgun Beam Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
          <line
            ref={railgunLineRef}
            x1="50%"
            y1="50%"
            x2="50%"
            y2="50%"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              opacity: 0,
              filter: 'drop-shadow(0 0 8px #38BDF8)',
              transition: 'opacity 0.12s linear',
            }}
          />
        </svg>

        {/* Top OLED Telemetry HUD Strip */}
        <div className="w-full flex items-center justify-between text-[10px] tracking-[0.14em] text-[#94A3B8] z-10 pointer-events-none uppercase">
          <div className="flex items-center gap-2">
            <span className="text-[#64748B]">PWR</span>
            <span style={{ color: accent }}>{makeSegmentBar(energy)}</span>
            <span className="text-[#E2E8F0] tabular-nums">{energy}%</span>
          </div>

          {firewallActive ? (
            <span className="px-2 py-0.5 bg-sky-400 text-black font-bold tracking-wider">
              FIREWALL_SIM // {firewallTimeLeft}S
            </span>
          ) : scrollSpike > 0 ? (
            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold">
              G-SYNC // {scrollSpike} PX/S
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[#64748B]">SYNC</span>
              <span className="text-emerald-400">{makeSegmentBar(xpInLevel)}</span>
              <span className="text-[#E2E8F0] tabular-nums">{xpInLevel}%</span>
            </div>
          )}
        </div>

        {/* Center Multi-Layered Mecha SVG + Oscilloscope + 360° Orbital Shield */}
        <svg
          viewBox="0 0 220 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[270px] h-[188px] sm:w-[304px] sm:h-[212px] z-10 overflow-visible pointer-events-none"
        >
          <defs>
            {/* Carbon & Titanium Mecha Gradients */}
            <linearGradient id="carbonArmor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#23293A" />
              <stop offset="55%" stopColor="#121622" />
              <stop offset="100%" stopColor="#090B11" />
            </linearGradient>
            <linearGradient id="titaniumPlate" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="cryoAlloy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="65%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="obsidianVisor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B1120" />
              <stop offset="100%" stopColor="#030509" />
            </linearGradient>
            <radialGradient id="corePulseGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor={accent} />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            <filter id="phosphorGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Live Background Oscilloscope Waveform */}
          <path
            ref={wavePathRef}
            d="M 0 75 L 220 75"
            stroke={accent}
            strokeOpacity="0.18"
            strokeWidth="1.2"
            fill="none"
          />

          {/* Ground Magnetic Projection Ring */}
          <ellipse cx="110" cy="142" rx="46" ry="6" fill={accent} fillOpacity="0.14" />
          <ellipse
            cx="110"
            cy="142"
            rx="34"
            ry="3.5"
            stroke={accent}
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="6 4"
          />

          {/* 360° Orbital Firewall Shield Ring (Active in FIREWALL_SIM) */}
          {firewallActive && (
            <g
              ref={shieldOrbitRef}
              style={{
                transformOrigin: '110px 80px',
                willChange: 'transform',
              }}
            >
              {/* Faint full orbit guide */}
              <circle
                cx="110"
                cy="80"
                r="62"
                stroke="#38BDF8"
                strokeOpacity="0.16"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              {/* Active 80-degree Tactical Energy Barrier Arc centered at +X (0 deg) */}
              <path
                d="M 157.5 40.2 A 62 62 0 0 1 157.5 119.8"
                stroke="#38BDF8"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                filter="url(#phosphorGlow)"
              />
              <path
                d="M 161.5 46 A 66 66 0 0 1 161.5 114"
                stroke="#E0F2FE"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* ══ PROCEDURALLY ANIMATED MECHA UNIT ══ */}
          <g
            ref={unitGroupRef}
            style={{
              transformOrigin: '110px 82px',
              willChange: 'transform',
            }}
          >
            {/* ── CHASSIS 01: TUX_MK4 // ARMORED CRYO-KERNEL MECHA PENGUIN ── */}
            {chassis === 'tux' && (
              <>
                {/* Hydraulic Mecha Stabilizer Feet */}
                <polygon points="80,132 102,132 105,139 76,139" fill="#F59E0B" stroke="#78350F" strokeWidth="1.2" />
                <polygon points="118,132 140,132 144,139 115,139" fill="#F59E0B" stroke="#78350F" strokeWidth="1.2" />

                {/* Left & Right Articulated Jet-Thruster Flippers */}
                <g ref={leftLimbRef} style={{ transformOrigin: '68px 84px' }}>
                  <polygon
                    points="68,78 52,92 48,116 64,112 72,92"
                    fill="url(#titaniumPlate)"
                    stroke={accent}
                    strokeWidth="1.6"
                  />
                  {/* Ion Thruster Plume */}
                  <polygon points="51,116 58,114 54,126" fill="#38BDF8" fillOpacity="0.85" filter="url(#phosphorGlow)" />
                </g>
                <g ref={rightLimbRef} style={{ transformOrigin: '152px 84px' }}>
                  <polygon
                    points="152,78 168,92 172,116 156,112 148,92"
                    fill="url(#titaniumPlate)"
                    stroke={accent}
                    strokeWidth="1.6"
                  />
                  {/* Ion Thruster Plume */}
                  <polygon points="169,116 162,114 166,126" fill="#38BDF8" fillOpacity="0.85" filter="url(#phosphorGlow)" />
                </g>

                {/* Heavy Armored Cryo-Chassis Torso */}
                <polygon
                  points="74,78 146,78 148,118 134,133 86,133 72,118"
                  fill="url(#carbonArmor)"
                  stroke="#475569"
                  strokeWidth="1.8"
                />
                {/* Brushed Alloy Belly Shield Plate */}
                <polygon
                  points="86,86 134,86 136,116 124,129 96,129 84,116"
                  fill="url(#cryoAlloy)"
                  stroke="#334155"
                  strokeWidth="1.4"
                />
                {/* Cryo-Kernel Chest Turbine Core */}
                <circle cx="110" cy="106" r="10" fill="#090D16" stroke={accent} strokeWidth="1.6" />
                <circle
                  ref={coreGlowRef}
                  cx="110"
                  cy="106"
                  r="6.5"
                  fill="url(#corePulseGrad)"
                />
                <line x1="92" y1="118" x2="128" y2="118" stroke="#475569" strokeWidth="1.2" />

                {/* Tux Mk-IV Helmet, Tactical Goggles & Cyber Beak */}
                <g ref={headGroupRef}>
                  {/* Armored Dome + Head Antenna */}
                  <line x1="110" y1="24" x2="110" y2="35" stroke={accent} strokeWidth="2" />
                  <circle cx="110" cy="22" r="2.5" fill={accent} filter="url(#phosphorGlow)" />

                  <polygon
                    points="76,52 88,35 132,35 144,52 144,82 76,82"
                    fill="url(#carbonArmor)"
                    stroke="#475569"
                    strokeWidth="1.8"
                  />
                  {/* Forehead Tactical Goggles */}
                  <rect x="80" y="39" width="26" height="11" rx="3" fill="#0F172A" stroke={accent} strokeWidth="1.4" />
                  <rect x="114" y="39" width="26" height="11" rx="3" fill="#0F172A" stroke={accent} strokeWidth="1.4" />
                  <line x1="106" y1="44" x2="114" y2="44" stroke={accent} strokeWidth="1.6" />

                  {/* Recessed Optic Visor */}
                  <rect
                    x="81"
                    y="55"
                    width="58"
                    height="23"
                    rx="5"
                    fill="url(#obsidianVisor)"
                    stroke="#1E293B"
                    strokeWidth="1.4"
                  />

                  {renderPhosphorOptics()}

                  {/* Faceted Metallic Cyber-Beak */}
                  <polygon
                    points="100,77 120,77 115,86 110,89 105,86"
                    fill="#F59E0B"
                    stroke="#B45309"
                    strokeWidth="1.2"
                  />
                </g>
              </>
            )}

            {/* ── CHASSIS 02: KITSUNE // ZERO-DAY MULTI-JOINT MECHA ── */}
            {chassis === 'kitsune' && (
              <>
                {/* Segmented Energy Tail */}
                <g
                  ref={tailOrCloakRef}
                  style={{ transformOrigin: '132px 112px' }}
                >
                  <path
                    d="M134 114 Q166 108 176 80 Q180 64 166 56"
                    stroke={accent}
                    strokeWidth="2.2"
                    strokeDasharray="5 3"
                    fill="none"
                    filter="url(#phosphorGlow)"
                  />
                  <polygon points="154,104 166,96 160,111" fill="url(#titaniumPlate)" stroke={accent} strokeWidth="1.2" />
                  <polygon points="168,86 180,76 174,93" fill="url(#titaniumPlate)" stroke={accent} strokeWidth="1.2" />
                  <polygon points="166,54 180,60 168,69" fill={accent} fillOpacity="0.85" />
                </g>

                {/* Upper Mecha Torso & Segmented Collar */}
                <polygon
                  points="84,96 136,96 144,126 124,134 96,134 76,126"
                  fill="url(#carbonArmor)"
                  stroke="#334155"
                  strokeWidth="1.6"
                />
                {/* Shoulder Pauldrons */}
                <polygon points="72,98 88,94 82,114 68,110" fill="url(#titaniumPlate)" stroke={accent} strokeWidth="1.3" />
                <polygon points="148,98 132,94 138,114 152,110" fill="url(#titaniumPlate)" stroke={accent} strokeWidth="1.3" />

                {/* Hexagonal Chest Reactor Core */}
                <polygon
                  points="110,103 118,108 118,118 110,123 102,118 102,108"
                  fill="#060913"
                  stroke={accent}
                  strokeWidth="1.5"
                />
                <circle
                  ref={coreGlowRef}
                  cx="110"
                  cy="113"
                  r="6"
                  fill="url(#corePulseGrad)"
                />

                {/* Angular Origami Mecha Head */}
                <g ref={headGroupRef}>
                  {/* Swept Cyber Ears with Glowing Thermal Vents */}
                  <polygon points="74,52 54,14 96,38" fill="url(#carbonArmor)" stroke="#475569" strokeWidth="1.8" />
                  <polygon points="75,46 62,22 89,39" fill={accent} fillOpacity="0.55" />
                  <line x1="65" y1="28" x2="82" y2="39" stroke="#E0F2FE" strokeWidth="1" />

                  <polygon points="146,52 166,14 124,38" fill="url(#carbonArmor)" stroke="#475569" strokeWidth="1.8" />
                  <polygon points="145,46 158,22 131,39" fill={accent} fillOpacity="0.55" />
                  <line x1="155" y1="28" x2="138" y2="39" stroke="#E0F2FE" strokeWidth="1" />

                  {/* Faceted Stealth Helmet Shell */}
                  <polygon
                    points="66,58 84,38 136,38 154,58 144,90 110,100 76,90"
                    fill="url(#carbonArmor)"
                    stroke="#475569"
                    strokeWidth="1.8"
                  />
                  {/* Metallic Brow Rim-Light */}
                  <polyline
                    points="74,54 90,42 130,42 146,54"
                    stroke={accent}
                    strokeWidth="1.4"
                    fill="none"
                  />
                  {/* Cheek Armor Plates */}
                  <polygon points="68,62 80,68 78,88 68,80" fill="url(#titaniumPlate)" />
                  <polygon points="152,62 140,68 142,88 152,80" fill="url(#titaniumPlate)" />

                  {/* Recessed Smoked-Glass Optic Visor */}
                  <polygon
                    points="78,56 142,56 136,82 110,88 84,82"
                    fill="url(#obsidianVisor)"
                    stroke="#1E293B"
                    strokeWidth="1.4"
                  />

                  {renderPhosphorOptics()}
                </g>

                {/* Left & Right Floating Articulated Mecha Claws */}
                <g ref={leftLimbRef} style={{ transformOrigin: '52px 98px' }}>
                  <polygon points="44,92 60,88 62,104 46,108" fill="url(#titaniumPlate)" stroke={accent} strokeWidth="1.4" />
                  <line x1="46" y1="108" x2="43" y2="116" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                  <line x1="52" y1="107" x2="51" y2="116" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                  <line x1="58" y1="105" x2="58" y2="114" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                </g>
                <g ref={rightLimbRef} style={{ transformOrigin: '168px 98px' }}>
                  <polygon points="176,92 160,88 158,104 174,108" fill="url(#titaniumPlate)" stroke={accent} strokeWidth="1.4" />
                  <line x1="174" y1="108" x2="177" y2="116" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                  <line x1="168" y1="107" x2="169" y2="116" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                  <line x1="162" y1="105" x2="162" y2="114" stroke={accent} strokeWidth="2" strokeLinecap="round" />
                </g>
              </>
            )}

            {/* ── CHASSIS 03: KURO // CYBER-PANTHER STEALTH RONIN ── */}
            {chassis === 'kuro' && (
              <>
                {/* Diagonal High-Frequency RF Katana on Back */}
                <g>
                  <line x1="64" y1="128" x2="164" y2="22" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
                  <line x1="64" y1="128" x2="164" y2="22" stroke={accent} strokeWidth="1.4" strokeLinecap="round" filter="url(#phosphorGlow)" />
                  {/* Katana Tsuba & Hilt */}
                  <line x1="146" y1="32" x2="156" y2="42" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="165" cy="21" r="2.8" fill={accent} filter="url(#phosphorGlow)" />
                </g>

                {/* Flowing Digital Cloak & Tactical Scarf */}
                <g ref={tailOrCloakRef} style={{ transformOrigin: '110px 94px' }}>
                  <path
                    d="M76 92 L144 92 L156 132 L134 125 L118 135 L102 126 L84 134 L66 126 Z"
                    fill="url(#carbonArmor)"
                    stroke={accent}
                    strokeWidth="1.5"
                  />
                  {/* Glowing Digital Circuit Trim on Cloak */}
                  <path
                    d="M76 118 L96 118 L104 126 M144 116 L126 116 L118 126"
                    stroke={accent}
                    strokeOpacity="0.6"
                    strokeWidth="1.2"
                    fill="none"
                  />
                  <circle
                    ref={coreGlowRef}
                    cx="110"
                    cy="108"
                    r="5"
                    fill="url(#corePulseGrad)"
                  />
                </g>

                {/* Ronin Panther Head + Half-Visor Tactical Helmet */}
                <g ref={headGroupRef}>
                  {/* Sharp Stealth Panther Ears */}
                  <polygon points="73,50 64,20 94,40" fill="url(#carbonArmor)" stroke="#475569" strokeWidth="1.8" />
                  <polygon points="75,46 69,27 88,40" fill={accent} fillOpacity="0.4" />
                  <polygon points="147,50 156,20 126,40" fill="url(#carbonArmor)" stroke="#475569" strokeWidth="1.8" />
                  <polygon points="145,46 151,27 132,40" fill={accent} fillOpacity="0.4" />

                  {/* Lower Face & Jaw */}
                  <path
                    d="M72 54 L148 54 L142 86 L110 96 L78 86 Z"
                    fill="url(#obsidianVisor)"
                    stroke="#334155"
                    strokeWidth="1.6"
                  />

                  {renderPhosphorOptics()}

                  {/* Tactical Upper Half-Visor Helmet Plate */}
                  <polygon
                    points="68,58 78,36 142,36 152,58 128,63 110,59 92,63"
                    fill="url(#titaniumPlate)"
                    stroke={accent}
                    strokeWidth="1.5"
                  />
                  {/* Forehead Crest [0x991] */}
                  <line x1="100" y1="48" x2="120" y2="48" stroke={accent} strokeWidth="2" filter="url(#phosphorGlow)" />
                  <circle cx="110" cy="43" r="2" fill="#F8FAFC" />

                  {/* High-Collar Neck Guard */}
                  <polygon
                    points="74,84 110,94 146,84 142,98 110,104 78,98"
                    fill="url(#titaniumPlate)"
                    stroke="#475569"
                    strokeWidth="1.4"
                  />
                </g>

                {/* Left & Right Floating Kunai / Ronin Gauntlets */}
                <g ref={leftLimbRef} style={{ transformOrigin: '54px 96px' }}>
                  <polygon points="52,82 58,96 52,110 46,96" fill="url(#titaniumPlate)" stroke={accent} strokeWidth="1.3" />
                  <circle cx="52" cy="96" r="2" fill={accent} />
                </g>
                <g ref={rightLimbRef} style={{ transformOrigin: '166px 96px' }}>
                  <polygon points="168,82 174,96 168,110 162,96" fill="url(#titaniumPlate)" stroke={accent} strokeWidth="1.3" />
                  <circle cx="168" cy="96" r="2" fill={accent} />
                </g>
              </>
            )}

            

            {renderArmorMod()}
          </g>
        </svg>

        {/* Vector Malware Packets Pool (Geometric Red Laser Nodes, Zero Emojis!) */}
        {firewallActive &&
          Array.from({ length: PACKET_POOL }).map((_, i) => (
            <button
              key={i}
              ref={(el) => {
                packetDomRefs.current[i] = el;
              }}
              type="button"
              onClick={(e) => fireRailgunAtPacket(i, e)}
              style={{
                opacity: 0,
                pointerEvents: 'none',
                left: '50%',
                top: '50%',
              }}
              className="absolute w-10 h-10 flex items-center justify-center z-30 cursor-crosshair select-none focus:outline-none group"
              title="Click to vaporize with Railgun or block with 360° Shield"
            >
              <svg
                viewBox="0 0 36 24"
                className="w-9 h-6 overflow-visible drop-shadow-[0_0_8px_rgba(239,68,68,0.9)] group-hover:scale-125 transition-transform"
              >
                {/* Trailing Laser Wake */}
                <line
                  x1="0"
                  y1="12"
                  x2="16"
                  y2="12"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeOpacity="0.65"
                  strokeDasharray="3 2"
                />
                {/* Sharp Vector Malware Warhead pointing toward +X (rotated by headingDeg) */}
                <polygon
                  points="32,12 16,4 20,12 16,20"
                  fill="#EF4444"
                  stroke="#FCA5A5"
                  strokeWidth="1.2"
                />
                <circle cx="22" cy="12" r="2" fill="#FFFFFF" />
              </svg>
            </button>
          ))}

        {/* Tactical Hardware Switch Deck inside Bottom of OLED Frame */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full flex flex-wrap items-center justify-between gap-1.5 text-[10px] tracking-[0.12em] uppercase z-20"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => runCommand('laser')}
              className={`px-2.5 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
                laserMode
                  ? 'bg-red-950/60 border-red-500 text-red-300 font-bold'
                  : 'bg-[#0B0E16] border-[#252A38] text-[#94A3B8] hover:border-red-400/70 hover:text-white'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  laserMode ? 'bg-red-500 shadow-[0_0_6px_#EF4444]' : 'bg-[#475569]'
                }`}
              />
              <span>LASER_TRACK</span>
            </button>

            <button
              type="button"
              onClick={handleOverclock}
              className={`px-2.5 py-1.5 border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeMood === 'overclock'
                  ? 'bg-amber-950/60 border-amber-400 text-amber-300 font-bold'
                  : 'bg-[#0B0E16] border-[#252A38] text-[#94A3B8] hover:border-amber-400/70 hover:text-white'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeMood === 'overclock' ? 'bg-amber-400 shadow-[0_0_6px_#F59E0B]' : 'bg-amber-500/50'
                }`}
              />
              <span>OVERCLOCK</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = (modIdx + 1) % ARMOR_MODS.length;
                setModIdx(next);
                setMood('happy');
                setSpeech(`ARMOR_BUS // Mounted [${ARMOR_MODS[next].label}] tactical attachment.`);
                spawnShard(ARMOR_MODS[next].label, 50, 24, '#38BDF8');
                triggerAura(40, `Mounted ${ARMOR_MODS[next].label} on Cyber-Unit`, '💠');
              }}
              className="px-2.5 py-1.5 bg-[#0B0E16] border border-[#252A38] text-[#94A3B8] hover:border-[#3B82F6] hover:text-white transition-colors cursor-pointer"
            >
              {ARMOR_MODS[modIdx].label}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={firewallActive}
              onClick={() => runCommand('firewall')}
              className="px-2.5 py-1.5 bg-sky-500/10 border border-sky-400/50 text-sky-300 hover:bg-sky-400 hover:text-black font-bold cursor-pointer disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>FIREWALL_SIM</span>
            </button>

            <button
              type="button"
              onClick={() => (activeMood === 'sleep' ? wakeUnit() : runCommand('sleep'))}
              className={`px-2 py-1.5 border transition-colors cursor-pointer ${
                activeMood === 'sleep'
                  ? 'bg-blue-950/60 border-[#3B82F6] text-[#60A5FA]'
                  : 'bg-[#0B0E16] border-[#252A38] text-[#64748B] hover:text-white'
              }`}
              title="Toggle Cryo Standby"
            >
              {activeMood === 'sleep' ? 'WAKE' : 'STBY'}
            </button>
          </div>
        </div>

        {/* Floating Vector Telemetry Shards */}
        {shards.map((s) => (
          <span
            key={s.id}
            style={{ left: `${s.x}%`, top: `${s.y}%`, color: s.color }}
            className="absolute -translate-x-1/2 text-[10px] font-bold tracking-wider pointer-events-none z-30 animate-[fadeUp_0.75s_ease-out_forwards] drop-shadow-[0_0_8px_rgba(0,0,0,0.9)] whitespace-nowrap"
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* 3. TELEMETRY LOG CONSOLE & DIRECTIVE INPUT */}
      <div className="border border-[#1E2028] bg-[#07080C] px-3 py-2 flex items-start gap-2 min-h-[46px]">
        <span className="text-[#3B82F6] font-bold shrink-0 mt-0.5">&gt;_</span>
        <p className="text-[#CBD5E1] text-[11px] leading-relaxed break-words">{displayedSpeech}</p>
      </div>

      <div className="flex items-center gap-2 border border-[#222530] bg-[#07080C] px-3 py-2 focus-within:border-[#3B82F6] transition-colors">
        <span className="text-[#3B82F6] font-bold text-[11px]">root@unit:~$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleCommandKeyDown}
          placeholder="Type 'cat flag', 'fortune', 'sudo', 'dance', 'kill -9'..."
          className="bg-transparent border-none outline-none text-[#F5F5F0] w-full text-[11px] placeholder:text-[#525866]"
        />
      </div>

      {/* Quick Easter-Egg & Joke Commands */}
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        {['cat flag', 'fortune', 'dance', 'hack', 'sudo rm -rf', 'kill -9', 'help'].map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => {
              setCommand('');
              runCommand(cmd);
            }}
            className="px-2 py-0.5 bg-[#090B11] border border-[#1E2230] text-[#7D8597] hover:text-[#60A5FA] hover:border-[#3B82F6]/60 transition-colors cursor-pointer"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
