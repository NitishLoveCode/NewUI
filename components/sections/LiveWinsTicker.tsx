'use client';

import { motion } from 'framer-motion';

const wins = [
  { id: 1, user: 'M***kel', game: 'Gates of Olympus', amount: '$4,212.50', multiplier: '841x', tier: 'gold' },
  { id: 2, user: 'Cr***o',  game: 'Sweet Bonanza',    amount: '$1,875.20', multiplier: '375x', tier: 'silver' },
  { id: 3, user: 'J***n',   game: 'Crazy Time',       amount: '$9,450.00', multiplier: '945x', tier: 'gold' },
  { id: 4, user: 'Al***a',  game: 'Book of Dead',     amount: '$2,100.00', multiplier: '420x', tier: 'gold' },
  { id: 5, user: 'Ro***t',  game: 'Lightning Roulette', amount: '$5,580.00', multiplier: '558x', tier: 'gold' },
  { id: 6, user: 'S***h',   game: 'Sugar Rush',       amount: '$3,200.00', multiplier: '640x', tier: 'silver' },
  { id: 7, user: 'Ni***s',  game: 'Mega Moolah',      amount: '$22,500.00', multiplier: '900x', tier: 'diamond' },
  { id: 8, user: 'K***y',   game: 'Starburst',        amount: '$870.40',  multiplier: '174x', tier: 'silver' },
  { id: 9, user: 'Da***l',  game: 'Wolf Gold',        amount: '$6,300.00', multiplier: '700x', tier: 'gold' },
  { id: 10, user: 'Em***y', game: 'Reactoonz',        amount: '$1,540.00', multiplier: '308x', tier: 'silver' },
];

const tierColor: Record<string, string> = {
  diamond: '#00e5ff',
  gold:    '#ffd700',
  silver:  '#c0c0c0',
};

const doubled = [...wins, ...wins];

export default function LiveWinsTicker() {
  return (
    <div className="w-full">
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: '#00e676', boxShadow: '0 0 8px #00e676', animation: 'pulse 2s infinite' }}
        />
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: '#b1bad3' }}
        >
          Live Wins
        </span>
      </div>

      {/* Ticker rail */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          backgroundColor: 'rgba(33,55,67,0.5)',
          border: '1px solid rgba(0,230,118,0.1)',
        }}
      >
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(33,55,67,0.9), transparent)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(33,55,67,0.9), transparent)' }}
        />

        <motion.div
          className="flex gap-2 py-2 px-2"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 38, ease: 'linear', repeat: Infinity }}
          style={{ width: 'max-content' }}
        >
          {doubled.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg flex-shrink-0 cursor-default"
              style={{
                backgroundColor: 'rgba(13,29,43,0.85)',
                border: '1px solid rgba(255,255,255,0.05)',
                minWidth: 210,
              }}
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,230,118,0.2), rgba(0,200,83,0.1))',
                  color: '#00e676',
                  border: '1px solid rgba(0,230,118,0.2)',
                }}
              >
                {w.user[0]}
              </div>

              {/* User + game */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white leading-tight truncate">{w.user}</p>
                <p className="text-[10px] leading-tight truncate" style={{ color: '#b1bad3' }}>
                  {w.game}
                </p>
              </div>

              {/* Amount + multiplier */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold" style={{ color: '#00e676' }}>
                  {w.amount}
                </p>
                <p className="text-[10px] font-semibold" style={{ color: tierColor[w.tier] }}>
                  {w.multiplier}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
