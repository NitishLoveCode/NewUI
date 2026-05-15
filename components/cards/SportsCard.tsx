'use client';

import { motion } from 'framer-motion';
import type { SportsCard } from '@/types';

export default function SportsCardComponent({ sport }: { sport: SportsCard }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="relative rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
      style={{ aspectRatio: '3/4', width: 130, background: sport.gradient }}
    >
      {/* Dark overlay bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
        }}
      />

      {/* Sport emoji art */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-5xl opacity-40 select-none">
          {sport.name === 'Soccer' && '⚽'}
          {sport.name === 'Tennis' && '🎾'}
          {sport.name === 'Basketball' && '🏀'}
          {sport.name === 'Baseball' && '⚾'}
          {sport.name === 'MMA' && '🥊'}
          {sport.name === 'Hockey' && '🏒'}
        </span>
      </div>

      {/* Sport name */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-sm font-black text-white uppercase tracking-wide"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
          {sport.name}
        </p>
      </div>
    </motion.div>
  );
}
