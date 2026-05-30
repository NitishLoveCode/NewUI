'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function SiteLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [floatKey, setFloatKey] = useState(0);

  const config = {
    sm: { fontSize: '1.3rem', heartSize: 14, gap: 0 },
    md: { fontSize: '2rem', heartSize: 20, gap: 1 },
    lg: { fontSize: '2.8rem', heartSize: 28, gap: 2 },
  };

  const { fontSize, heartSize, gap } = config[size];

  useEffect(() => {
    const interval = setInterval(() => {
      setFloatKey((k) => k + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const heartPulse = {
    animate: { scale: [1, 1.35, 1] },
    transition: { duration: 0.8, repeat: Infinity, repeatDelay: 0.5, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] }, // cubic-bezier for easeInOut
  };

  return (
    <div className="flex items-center select-none" style={{ gap: `${gap}px`, lineHeight: 1 }}>
      {/* "i" */}
      <span
        style={{
          fontFamily: 'var(--font-dancing)',
          fontSize,
          fontWeight: 700,
          color: '#a8f5e6',
          letterSpacing: '-0.02em',
        }}
      >
        i
      </span>

      {/* Animated Heart */}
      <div className="relative flex items-center justify-center" style={{ width: heartSize + 6, height: heartSize + 6 }}>
        {/* Main beating heart */}
        <motion.svg
          width={heartSize}
          height={heartSize}
          viewBox="0 0 24 24"
          fill="#ff4b7d"
          {...heartPulse}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(255,75,125,0.8))',
          }}
        >
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
        </motion.svg>

        {/* Floating heart particles */}
        <AnimatePresence>
          {floatKey > 0 && (
            <>
              <motion.svg
                key={`float-${floatKey}-1`}
                width={heartSize * 0.5}
                height={heartSize * 0.5}
                viewBox="0 0 24 24"
                fill="#ff80ab"
                initial={{ opacity: 0.8, y: 0, x: -6, scale: 0.5 }}
                animate={{ opacity: 0, y: -32, x: -14, scale: 0.8 }}
                transition={{ duration: 1.2, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] }}
                className="absolute"
                style={{ pointerEvents: 'none' }}
              >
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
              </motion.svg>
              <motion.svg
                key={`float-${floatKey}-2`}
                width={heartSize * 0.5}
                height={heartSize * 0.5}
                viewBox="0 0 24 24"
                fill="#ff80ab"
                initial={{ opacity: 0.8, y: 0, x: 6, scale: 0.5 }}
                animate={{ opacity: 0, y: -32, x: 14, scale: 0.8 }}
                transition={{ duration: 1.2, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] }}
                className="absolute"
                style={{ pointerEvents: 'none' }}
              >
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
              </motion.svg>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* "dsa.com" */}
      <span
        style={{
          fontFamily: 'var(--font-dancing)',
          fontSize,
          fontWeight: 700,
          color: '#a8f5e6',
          letterSpacing: '-0.02em',
        }}
      >
        dsa.com
      </span>
    </div>
  );
}
