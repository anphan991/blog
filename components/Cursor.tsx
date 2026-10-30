'use client';

import { useEffect, useRef } from 'react';

type CursorMode = 'default' | 'snap' | 'square';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -120;
    let mouseY = -120;
    let ringX = -120;
    let ringY = -120;
    let ringW = 36;
    let ringH = 36;
    let targetW = 36;
    let targetH = 36;

    let mode: CursorMode = 'default';
    let snappedEl: HTMLElement | null = null;
    let snapRect: DOMRect | null = null;
    let rafId = 0;
    let isRunning = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const applyModeStyles = (nextMode: CursorMode) => {
      ring.setAttribute('data-mode', nextMode);
      dot.setAttribute('data-mode', nextMode);

      if (nextMode === 'square') {
        targetW = 52;
        targetH = 52;
      } else if (nextMode === 'snap' && snapRect) {
        targetW = Math.min(280, snapRect.width + 10);
        targetH = Math.min(72, snapRect.height + 8);
      } else {
        targetW = 36;
        targetH = 36;
      }
    };

    const wakeLoop = () => {
      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      wakeLoop();
    };

    const detectContext = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return;

      const interactive = target.closest<HTMLElement>('button, a, code, [role="button"]');
      const cursorHost = target.closest<HTMLElement>('[data-cursor]');

      // Compact button / link / nested button -> Magnetic Rectangle Snap
      if (
        interactive &&
        (!cursorHost || (cursorHost.contains(interactive) && interactive !== cursorHost)) &&
        !interactive.hasAttribute('data-cursor')
      ) {
        const iRect = interactive.getBoundingClientRect();
        if (iRect.width > 12 && iRect.width <= 280 && iRect.height > 12 && iRect.height <= 64) {
          mode = 'snap';
          snappedEl = interactive;
          snapRect = iRect;
          applyModeStyles('snap');
          wakeLoop();
          return;
        }
      }

      // Project card / image with data-cursor -> Minimalist Square Frame
      if (cursorHost) {
        snappedEl = null;
        snapRect = null;
        mode = 'square';
        applyModeStyles('square');
        wakeLoop();
        return;
      }

      // Fallback interactive element
      if (interactive) {
        const rect = interactive.getBoundingClientRect();
        if (rect.width > 12 && rect.width <= 280 && rect.height > 12 && rect.height <= 64) {
          mode = 'snap';
          snappedEl = interactive;
          snapRect = rect;
          applyModeStyles('snap');
          wakeLoop();
          return;
        }
        mode = 'square';
        snappedEl = null;
        snapRect = null;
        applyModeStyles('square');
        wakeLoop();
        return;
      }

      if (mode !== 'default') {
        mode = 'default';
        snappedEl = null;
        snapRect = null;
        applyModeStyles('default');
        wakeLoop();
      }
    };

    const onMouseOver = (e: MouseEvent) => detectContext(e.target);

    const onScroll = () => {
      if (snappedEl && mode === 'snap') {
        snapRect = snappedEl.getBoundingClientRect();
        wakeLoop();
      }
    };

    const onMouseDown = () => ring.classList.add('is-pressed');
    const onMouseUp = () => ring.classList.remove('is-pressed');

    const tick = () => {
      let goalX = mouseX;
      let goalY = mouseY;

      if (mode === 'snap' && snapRect) {
        const cx = snapRect.left + snapRect.width / 2;
        const cy = snapRect.top + snapRect.height / 2;
        goalX = cx + (mouseX - cx) * 0.14;
        goalY = cy + (mouseY - cy) * 0.14;
      }

      ringX = lerp(ringX, goalX, mode === 'snap' ? 0.24 : 0.2);
      ringY = lerp(ringY, goalY, mode === 'snap' ? 0.24 : 0.2);
      ringW = lerp(ringW, targetW, 0.22);
      ringH = lerp(ringH, targetH, 0.22);

      ring.style.width = `${ringW.toFixed(1)}px`;
      ring.style.height = `${ringH.toFixed(1)}px`;
      ring.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0) translate(-50%, -50%)`;

      const settled =
        Math.abs(goalX - ringX) < 0.2 &&
        Math.abs(goalY - ringY) < 0.2 &&
        Math.abs(targetW - ringW) < 0.2 &&
        Math.abs(targetH - ringH) < 0.2;

      if (settled) {
        isRunning = false;
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor" aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true">
        <span className="custom-cursor-ring__corner custom-cursor-ring__corner--tl" />
        <span className="custom-cursor-ring__corner custom-cursor-ring__corner--tr" />
        <span className="custom-cursor-ring__corner custom-cursor-ring__corner--bl" />
        <span className="custom-cursor-ring__corner custom-cursor-ring__corner--br" />
      </div>
    </>
  );
}
