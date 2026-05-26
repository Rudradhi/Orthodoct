import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = [
  "'Painless'",
  "'Smooth'",
  "'As Easy As ABC'",
  "'Undemanding'",
  "'Child's play'",
  "'Apparent'",
  "'Unambiguous'",
  "'Perspicuous'"
];

export const WordCycler: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.span 
      layout
      className="inline-flex relative items-center justify-start text-medical-600 dark:text-medical-500 min-h-[1.2em] overflow-visible transition-colors"
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute left-0 whitespace-nowrap will-change-[transform,opacity]"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      {/* Invisible spacer to reserve space and drive the layout width animation */}
      <span className="invisible pointer-events-none select-none whitespace-nowrap">
        {words[index]}
      </span>
    </motion.span>
  );
};
