import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Zap, Shield, Plus, Stethoscope, Thermometer } from 'lucide-react';

export const MedicalBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-500">
      {/* Clean Grid Pattern */}
      <motion.div 
           initial={{ backgroundPosition: '0px 0px' }}
           animate={{ backgroundPosition: ['0px 0px', '60px 60px'] }}
           transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
           className="absolute inset-0 opacity-[0.12] dark:opacity-[0.08] transition-opacity will-change-[background-position]" 
           style={{ 
             backgroundImage: 'linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)', 
             backgroundSize: '60px 60px' 
           } as any} 
      />
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --grid-color: #0ea5e9; }
        .dark { --grid-color: rgba(0, 0, 0, 0.4); }
      `}} />
      
      {/* Subtle Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 dark:via-medical-900/5 to-white/30 dark:to-slate-950/80 pointer-events-none" />

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { Icon: Activity, top: '10%', left: '5%', delay: 0, size: 40 },
          { Icon: Heart, top: '25%', left: '85%', delay: 2, size: 30 },
          { Icon: Zap, top: '60%', left: '10%', delay: 4, size: 35 },
          { Icon: Shield, top: '80%', left: '80%', delay: 1, size: 45 },
          { Icon: Plus, top: '15%', left: '40%', delay: 3, size: 25 },
          { Icon: Stethoscope, top: '70%', left: '30%', delay: 5, size: 50 },
          { Icon: Thermometer, top: '40%', left: '70%', delay: 0.5, size: 30 },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: [0.05, 0.12, 0.05],
              y: [0, -30, 0],
              rotate: [0, 15, 0]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              delay: item.delay,
              ease: "easeInOut"
            }}
            className="absolute text-medical-500 will-change-transform"
            style={{ top: item.top, left: item.left }}
          >
            <item.Icon size={item.size} strokeWidth={1} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
