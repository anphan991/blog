'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  dataCursor?: 'inspect' | 'decrypt' | 'zoom' | 'square';
  maxTilt?: number;
}

export default function TiltCard({
  children,
  className = '',
  dataCursor,
  maxTilt = 4.2,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const stateRef = useRef({
    hovered: false,
    targetRx: 0,
    targetRy: 0,
    currRx: 0,
    currRy: 0,
    rafId: 0,
    running: false,
  });

  const startLoop = useCallback(() => {
    const st = stateRef.current;
    if (st.running) return;
    st.running = true;

    const step = () => {
      const el = cardRef.current;
      if (!el) {
        st.running = false;
        return;
      }

      st.currRx += (st.targetRx - st.currRx) * 0.16;
      st.currRy += (st.targetRy - st.currRy) * 0.16;

      el.style.transform = `perspective(1100px) rotateX(${st.currRx.toFixed(2)}deg) rotateY(${st.currRy.toFixed(2)}deg) translateZ(0)`;

      const settled =
        !st.hovered &&
        Math.abs(st.currRx) < 0.03 &&
        Math.abs(st.currRy) < 0.03;

      if (settled) {
        el.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)';
        st.running = false;
        return;
      }

      st.rafId = requestAnimationFrame(step);
    };

    st.rafId = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const st = stateRef.current;
    return () => {
      cancelAnimationFrame(st.rafId);
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    rectRef.current = el.getBoundingClientRect();
    stateRef.current.hovered = true;
    el.style.setProperty('--spot-opacity', '1');
    startLoop();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = rectRef.current || el.getBoundingClientRect();
    rectRef.current = rect;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const nx = (px / (rect.width || 1)) * 2 - 1; // -1 .. 1
    const ny = (py / (rect.height || 1)) * 2 - 1; // -1 .. 1

    stateRef.current.targetRy = nx * maxTilt;
    stateRef.current.targetRx = -ny * maxTilt;

    el.style.setProperty('--spot-x', `${px.toFixed(1)}px`);
    el.style.setProperty('--spot-y', `${py.toFixed(1)}px`);
    startLoop();
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    stateRef.current.hovered = false;
    stateRef.current.targetRx = 0;
    stateRef.current.targetRy = 0;
    rectRef.current = null;
    if (el) {
      el.style.setProperty('--spot-opacity', '0');
    }
    startLoop();
  };

  return (
    <div
      ref={cardRef}
      data-cursor={dataCursor}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--spot-x': '50%',
          '--spot-y': '50%',
          '--spot-opacity': '0',
          willChange: 'transform',
        } as React.CSSProperties
      }
      className={`tilt-spotlight-card relative w-full ${className}`}
    >
      <div className="w-full h-full relative z-10">{children}</div>

      {/* Proximity Spotlight Border (Only illuminates border near cursor) */}
      <div className="tilt-spotlight-border" aria-hidden="true" />

      {/* Subtle Chromatic / Holographic Surface Glare */}
      <div className="tilt-chromatic-glare" aria-hidden="true" />
    </div>
  );
}
