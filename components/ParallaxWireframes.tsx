'use client';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxWireframes() {
  const { scrollY } = useScroll();
  
  // Create different movement speeds for different elements (Parallax effect)
  const y1 = useTransform(scrollY, [0, 3000], [0, -400]);
  const y2 = useTransform(scrollY, [0, 3000], [0, -800]);
  const y3 = useTransform(scrollY, [0, 3000], [0, -250]);
  const y4 = useTransform(scrollY, [0, 3000], [0, -1000]);

  // Subtle rotation tied to scroll
  const rotate1 = useTransform(scrollY, [0, 3000], [0, 45]);
  const rotate2 = useTransform(scrollY, [0, 3000], [45, 180]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Huge subtle code brackets */}
      <motion.div style={{ y: y1 }} className="absolute top-[20%] left-[5%] text-[#4ade80] opacity-[0.02] font-mono text-[25rem] font-bold leading-none select-none mix-blend-screen">
        {'{'}
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute top-[60%] right-[2%] text-[#4ade80] opacity-[0.02] font-mono text-[35rem] font-bold leading-none select-none mix-blend-screen">
        {'}'}
      </motion.div>
      
      {/* Code tag */}
      <motion.div style={{ y: y3 }} className="absolute top-[75%] left-[15%] text-[#4ade80] opacity-[0.03] font-mono text-[12rem] font-bold leading-none select-none">
        {'< />'}
      </motion.div>
      
      {/* A wireframe geometric shape */}
      <motion.div style={{ y: y4, rotate: rotate1 }} className="absolute top-[40%] right-[20%] w-72 h-72 border-[1px] border-[#4ade80] opacity-[0.04] flex items-center justify-center">
         <motion.div style={{ rotate: rotate2 }} className="w-40 h-40 border-[1px] border-[#4ade80]"></motion.div>
      </motion.div>
    </div>
  );
}
