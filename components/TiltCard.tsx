'use client';

import React, { useRef, useState, MouseEvent } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function TiltCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const x = useSpring(0, { stiffness: 400, damping: 40, mass: 0.5 });
  const y = useSpring(0, { stiffness: 400, damping: 40, mass: 0.5 });

  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(((mouseX - centerX) / centerX) * 100);
    y.set(((mouseY - centerY) / centerY) * 100);

    setMousePosition({
      x: (mouseX / rect.width) * 100,
      y: (mouseY / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative w-full cursor-pointer perspective-[1000px] ${className || ''}`}
    >
      <div 
        style={{ transform: 'translateZ(20px)' }} 
        className="w-full h-full relative z-10"
      >
        {children}
      </div>

      {/* Glare effect */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 rounded-[inherit]"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
    </motion.div>
  );
}
