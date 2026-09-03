'use client';
import { useEffect } from 'react';

export default function KhzCursor() {
  useEffect(() => {
    const dot = document.querySelector<HTMLElement>('.khz-cursor');
    const ring = document.querySelector<HTMLElement>('.khz-cursor-ring');
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let rafId: number;

    let isRunning = true;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      
      // Wake up the animation loop if it was asleep
      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // If we are close enough, stop the loop to save CPU and unblock scrolling
      if (Math.abs(ringX - mouseX) < 0.1 && Math.abs(ringY - mouseY) < 0.1) {
        isRunning = false;
        return;
      }
      
      ringX = lerp(ringX, mouseX, 0.11);
      ringY = lerp(ringY, mouseY, 0.11);
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      
      if (isRunning) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button')) {
        dot.classList.add('is-hover');
        ring.classList.add('is-hover');
      }
    };
    
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button')) {
        dot.classList.remove('is-hover');
        ring.classList.remove('is-hover');
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="khz-cursor" aria-hidden="true" />
      <div className="khz-cursor-ring" aria-hidden="true" />
    </>
  );
}
