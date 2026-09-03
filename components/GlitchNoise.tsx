'use client';
import { useEffect, useRef } from 'react';

export default function GlitchNoise() {
  const overlayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let timeoutId: ReturnType<typeof setTimeout>;

    const drawNoise = () => {
      const w = canvas.width;
      const h = canvas.height;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = Math.random() * 60 + 20; // semi-transparent
      }
      ctx.putImageData(imageData, 0, 0);
    };

    const clearNoise = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const scheduleGlitch = () => {
      // Wait a random time between 3-9 seconds
      const waitTime = 3000 + Math.random() * 6000;

      timeoutId = setTimeout(() => {
        // Flash noise for 300-700ms (visible long enough to notice)
        const flashDuration = 300 + Math.random() * 400;

        // Sometimes do a double-flash
        const doubleFlash = Math.random() > 0.6;

        drawNoise();
        setTimeout(() => {
          clearNoise();
          if (doubleFlash) {
            setTimeout(() => {
              drawNoise();
              setTimeout(() => {
                clearNoise();
                scheduleGlitch();
              }, 200 + Math.random() * 200);
            }, 100 + Math.random() * 100);
          } else {
            scheduleGlitch();
          }
        }, flashDuration);
      }, waitTime);
    };

    scheduleGlitch();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none z-[9991]"
      style={{ mixBlendMode: 'screen', opacity: 0.15 }}
    />
  );
}
