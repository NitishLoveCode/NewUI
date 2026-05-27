'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { GameCard } from '@/types';

// Radial burst — deterministic so no SSR/hydration mismatch
const BURST = Array.from({ length: 32 }, (_, i) => {
  const angle = (i / 32) * Math.PI * 2;
  const dist = 100 + (i % 7) * 28;
  return {
    id: i,
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    size: 3 + (i % 4) * 2.5,
    delay: 0.1 + (i % 6) * 0.018,
    isDiamond: i % 4 === 0,
    isBright: i % 3 === 0,
  };
});

// Floating ember sparks
const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: -240 + i * 22,
  size: 1.5 + (i % 4) * 1.5,
  delay: 0.2 + i * 0.05,
  dur: 1.0 + (i % 5) * 0.28,
  drift: -28 + (i % 7) * 9,
}));

// Sonar ripple rings
const SONAR = [0, 1, 2, 3];

// Light rays from center
const RAYS = Array.from({ length: 10 }, (_, i) => ({ id: i, angle: i * 36 }));

export default function PremiumReveal({
  game,
  onComplete,
}: {
  game: GameCard;
  onComplete: () => void;
}) {
  const calledRef = useRef(false);

  const safeComplete = () => {
    if (calledRef.current) return;
    calledRef.current = true;
    onComplete();
  };

  useEffect(() => {
    const t = setTimeout(safeComplete, 1450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeIn' }}
      onClick={safeComplete}
    >
      {/* ── Deep black background ── */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.97, 0.97, 0.97, 0.5] }}
        transition={{ duration: 1.55, times: [0, 0.07, 0.5, 0.68, 1] }}
      />

      {/* ── Gold radial flash ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,235,80,0.95) 0%, rgba(255,200,0,0.55) 28%, transparent 62%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.42, times: [0, 0.18, 1] }}
      />

      {/* ── Accent-color pulse (game's own color) ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${game.accentColor}55 0%, transparent 60%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ delay: 0.35, duration: 0.45, times: [0, 0.25, 1] }}
      />

      {/* ── Horizontal scan line #1 (wide/gold) ── */}
      <motion.div
        className="absolute inset-y-0 pointer-events-none"
        style={{
          width: 280,
          background:
            'linear-gradient(90deg, transparent, rgba(255,215,0,0.42) 50%, transparent)',
          boxShadow: '0 0 70px 35px rgba(255,215,0,0.07)',
        }}
        initial={{ x: '-100vw' }}
        animate={{ x: '110vw' }}
        transition={{ duration: 0.52, delay: 0.14, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* ── Horizontal scan line #2 (thin/white, faster) ── */}
      <motion.div
        className="absolute inset-y-0 pointer-events-none"
        style={{
          width: 90,
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.38) 50%, transparent)',
        }}
        initial={{ x: '-100vw' }}
        animate={{ x: '110vw' }}
        transition={{ duration: 0.32, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* ── Screen edge gold frame ── */}
      <motion.div
        className="absolute inset-3 rounded-2xl pointer-events-none"
        style={{
          border: '1px solid rgba(255,215,0,0.45)',
          boxShadow: '0 0 40px rgba(255,215,0,0.15), inset 0 0 40px rgba(255,215,0,0.04)',
        }}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: [0, 0.85, 0.85, 0], scale: [1.05, 1, 1, 1] }}
        transition={{ duration: 1.2, delay: 0.15, times: [0, 0.18, 0.6, 1] }}
      />

      {/* ── Expanding ring pulses ── */}
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 60,
            height: 60,
            border: `${2.5 - i * 0.4}px solid rgba(255,215,0,${0.85 - i * 0.15})`,
            boxShadow: '0 0 18px rgba(255,215,0,0.3)',
          }}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 9 + i * 3.5, opacity: 0 }}
          transition={{ delay: 0.12 + i * 0.13, duration: 0.9, ease: 'easeOut' }}
        />
      ))}

      {/* ── Sonar ripples ── */}
      {SONAR.map(i => (
        <motion.div
          key={`sonar-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 70,
            height: 70,
            border: '1px solid rgba(255,215,0,0.25)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 5.5 + i * 1.5], opacity: [0, 0.55, 0] }}
          transition={{
            delay: 0.42 + i * 0.22,
            duration: 1.3,
            times: [0, 0.35, 1],
            ease: 'easeOut',
          }}
        />
      ))}

      {/* ── Light rays from center ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative" style={{ width: 0, height: 0 }}>
          {RAYS.map(r => (
            <motion.div
              key={r.id}
              className="absolute"
              style={{
                width: 1.5,
                height: 280,
                left: -0.75,
                bottom: 0,
                background:
                  'linear-gradient(to top, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0.25) 45%, transparent 100%)',
                transformOrigin: 'center bottom',
                rotate: `${r.angle}deg`,
              }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 0.75, 0.5, 0] }}
              transition={{
                delay: 0.24 + r.id * 0.025,
                duration: 0.9,
                times: [0, 0.22, 0.65, 1],
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Radial burst particles ── */}
      {BURST.map(p => (
        <motion.div
          key={`burst-${p.id}`}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            background: p.isBright ? '#FFFDE7' : '#FFD700',
            borderRadius: p.isDiamond ? 2 : '50%',
            rotate: p.isDiamond ? 45 : 0,
            boxShadow: p.isBright
              ? `0 0 ${p.size * 4}px ${p.size}px rgba(255,253,231,0.85)`
              : `0 0 ${p.size * 2}px ${p.size * 0.5}px rgba(255,215,0,0.65)`,
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, 1.6, 1, 0],
            opacity: [0, 1, 0.7, 0],
          }}
          transition={{ delay: p.delay, duration: 0.78, ease: [0.15, 0, 0.25, 1] }}
        />
      ))}

      {/* ── Floating ember sparks ── */}
      {EMBERS.map(p => (
        <motion.div
          key={`ember-${p.id}`}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.id % 2 === 0 ? '#FFD700' : '#FFF9C4',
            boxShadow: `0 0 ${p.size * 3}px rgba(255,215,0,0.8)`,
          }}
          initial={{ x: p.x, y: 80, opacity: 0 }}
          animate={{ x: p.x + p.drift, y: -340, opacity: [0, 0.95, 0.6, 0] }}
          transition={{
            delay: p.delay,
            duration: p.dur,
            ease: 'easeOut',
            opacity: { times: [0, 0.1, 0.7, 1] },
          }}
        />
      ))}

      {/* ── Central: Crown + PREMIUM + Access Unlocked ── */}
      <motion.div
        className="relative flex flex-col items-center gap-2 z-10 pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ delay: 0.36, type: 'spring', stiffness: 360, damping: 16 }}
      >
        {/* Crown */}
        <motion.div
          style={{
            fontSize: 76,
            lineHeight: 1,
            filter:
              'drop-shadow(0 0 28px rgba(255,215,0,1)) drop-shadow(0 0 56px rgba(255,215,0,0.55))',
          }}
          animate={{ y: [0, -10, 0], rotate: [-5, 5, -3, 3, 0] }}
          transition={{ delay: 0.5, duration: 0.48, ease: 'easeOut' }}
        >
          👑
        </motion.div>

        {/* PREMIUM gradient text */}
        <motion.div
          className="relative overflow-hidden"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58, duration: 0.35 }}
        >
          <motion.div
            style={{
              filter: 'drop-shadow(0 2px 14px rgba(255,215,0,0.65))',
            }}
          >
            <span
              className="block text-4xl font-black tracking-[0.35em] uppercase select-none"
              style={{
                background:
                  'linear-gradient(90deg, #7B5C00 0%, #FFD700 22%, #FFFDE7 50%, #FFD700 78%, #7B5C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              PREMIUM
            </span>
          </motion.div>
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.75) 50%, transparent 75%)',
              width: '55%',
            }}
            initial={{ x: '-130%' }}
            animate={{ x: '300%' }}
            transition={{ delay: 0.72, duration: 0.58, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-[11px] font-bold uppercase"
          style={{ color: 'rgba(255,215,0,0.68)', letterSpacing: '0.42em' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.72, duration: 0.35 }}
        >
          Access Unlocked
        </motion.p>

        {/* Decorative divider */}
        <motion.div
          className="flex items-center gap-2 mt-1"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.82, duration: 0.38 }}
        >
          <div
            style={{
              width: 44,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.65))',
            }}
          />
          <div
            style={{
              width: 5,
              height: 5,
              background: '#FFD700',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 6px rgba(255,215,0,0.9)',
            }}
          />
          <div
            style={{
              width: 44,
              height: 1,
              background: 'linear-gradient(90deg, rgba(255,215,0,0.65), transparent)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* ── Final black cover — ensures seamless transition to overlay ── */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.38 }}
      />
    </motion.div>
  );
}
