'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function MatchAnimation() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenAnimation = localStorage.getItem('seenMatchAnimation');
    if (!hasSeenAnimation) {
      setShow(true);
      localStorage.setItem('seenMatchAnimation', 'true');
      setTimeout(() => setShow(false), 3200);
    }
  }, []);

  const FloatingHeart = ({ delay }: { delay: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
      animate={{ opacity: [1, 1, 0], y: -300, x: Math.random() * 200 - 100, scale: [1, 1.2, 0.8] }}
      transition={{ duration: 2.5, delay, ease: 'easeOut' }}
      className="absolute text-4xl pointer-events-none"
    >
      ❤️
    </motion.div>
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(15, 33, 46, 0.95)' }}
        >
          {/* Center pulsing hearts */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`center-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: 'easeOut',
                }}
                className="absolute text-7xl"
              >
                ❤️
              </motion.div>
            ))}
          </div>

          {/* Main message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 text-center"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-black mb-4"
              style={{ color: '#ff4b7d' }}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 2, delay: 0.4 }}
            >
              IT'S A MATCH!
            </motion.h1>
            <motion.p
              className="text-lg md:text-2xl font-semibold"
              style={{ color: '#a8f5e6' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Welcome to your perfect coding love story
            </motion.p>
          </motion.div>

          {/* Falling/Floating hearts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <FloatingHeart key={i} delay={0.1 + i * 0.1} />
            ))}
          </div>

          {/* Side explosions */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: Math.random() * 0.8 + 0.5,
              }}
              animate={{
                opacity: 0,
                x: (Math.random() - 0.5) * 600,
                y: (Math.random() - 0.5) * 600,
              }}
              transition={{
                duration: 2,
                delay: 0.3 + Math.random() * 0.5,
                ease: 'easeOut',
              }}
              className="absolute top-1/2 left-1/2 text-2xl pointer-events-none"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
