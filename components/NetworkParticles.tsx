'use client';
import { useEffect, useRef } from 'react';

export default function NetworkParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
    }

    let particlesArray: Particle[] = [];
    let animationFrameId: number;
    let lastTime = 0;
    const FPS_INTERVAL = 1000 / 30; // Smooth 30fps cap cuts idle CPU by >75%

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const init = () => {
      particlesArray = [];
      const count = Math.min(Math.floor((w * h) / 18000), 70);
      for (let i = 0; i < count; i++) {
        particlesArray.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.4 + 0.6,
          speedX: Math.random() * 0.8 - 0.4,
          speedY: Math.random() * 0.8 - 0.4,
        });
      }
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseout', handleMouseLeave, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    const MAX_DIST = 125;
    const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
    const MID_DIST_SQ = 70 * 70;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (document.hidden || now - lastTime < FPS_INTERVAL) return;
      lastTime = now;

      ctx.clearRect(0, 0, w, h);
      const isLight = document.documentElement.classList.contains('light-theme');

      // 1. Update & batch-draw all dots in a single draw call
      ctx.fillStyle = isLight ? 'rgba(37, 99, 235, 0.45)' : 'rgba(59, 130, 246, 0.55)';
      ctx.beginPath();
      const len = particlesArray.length;
      for (let i = 0; i < len; i++) {
        const p = particlesArray[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x > w || p.x < 0) p.speedX = -p.speedX;
        if (p.y > h || p.y < 0) p.speedY = -p.speedY;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < 14400 && dSq > 0.1) {
          const dist = Math.sqrt(dSq);
          const force = ((120 - dist) / 120) * 2;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();

      // 2. Batch-draw connection lines in 2 opacity buckets (2 stroke calls instead of 1000s!)
      ctx.lineWidth = 0.8;
      const nearPairs: number[] = [];
      const farPairs: number[] = [];

      for (let a = 0; a < len; a++) {
        const pa = particlesArray[a];
        for (let b = a + 1; b < len; b++) {
          const pb = particlesArray[b];
          const dx = pa.x - pb.x;
          const dy = pa.y - pb.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MAX_DIST_SQ) {
            if (distSq < MID_DIST_SQ) {
              nearPairs.push(a, b);
            } else {
              farPairs.push(a, b);
            }
          }
        }
      }

      if (nearPairs.length > 0) {
        ctx.strokeStyle = isLight ? 'rgba(37, 99, 235, 0.2)' : 'rgba(59, 130, 246, 0.26)';
        ctx.beginPath();
        for (let i = 0; i < nearPairs.length; i += 2) {
          const pa = particlesArray[nearPairs[i]];
          const pb = particlesArray[nearPairs[i + 1]];
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
        }
        ctx.stroke();
      }

      if (farPairs.length > 0) {
        ctx.strokeStyle = isLight ? 'rgba(37, 99, 235, 0.08)' : 'rgba(59, 130, 246, 0.11)';
        ctx.beginPath();
        for (let i = 0; i < farPairs.length; i += 2) {
          const pa = particlesArray[farPairs[i]];
          const pb = particlesArray[farPairs[i + 1]];
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
        }
        ctx.stroke();
      }
    };

    init();
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
