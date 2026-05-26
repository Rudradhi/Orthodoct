import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Drop {
  id: number;
  x: number;
  y: number;
}

export const WaterdropBackground: React.FC = () => {
  const [drops, setDrops] = useState<Drop[]>([]);
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const interval = setInterval(() => {
      const newDrop = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
      setDrops((prev) => [...prev.slice(-15), newDrop]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${isDarkMode ? 'bg-slate-950' : 'bg-[#f8fafc]'} transition-colors duration-500`}>
      <AnimatePresence>
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: "easeOut" }}
            className={`absolute border rounded-full will-change-[transform,opacity] ${isDarkMode ? 'border-medical-500/10' : 'border-medical-200'}`}
            style={{
              left: `${drop.x}%`,
              top: `${drop.y}%`,
              width: '100px',
              height: '100px',
              marginLeft: '-50px',
              marginTop: '-50px',
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Clean Grid Pattern - Matched with main page */}
      <motion.div 
           initial={{ backgroundPosition: '0px 0px' }}
           animate={{ backgroundPosition: ['0px 0px', '60px 60px'] }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className={`absolute inset-0 ${isDarkMode ? 'opacity-[0.05]' : 'opacity-[0.12]'}`} 
           style={{ 
             backgroundImage: isDarkMode 
               ? 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)'
               : 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', 
             backgroundSize: '60px 60px' 
           }} 
      />
    </div>
  );
};
