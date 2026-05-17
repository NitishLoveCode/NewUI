'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Zap, TrendingUp, Star, Trophy, Clock } from 'lucide-react';
import type { GameCard } from '@/types';

const gameExtras: Record<string, {
  rtp: string;
  volatility: string;
  minBet: string;
  maxWin: string;
  description: string;
  tags: string[];
}> = {
  '1': {
    rtp: '96.5%', volatility: 'High', minBet: '$0.20', maxWin: '20,000x',
    description: 'Journey to Mount Olympus and spin alongside Zeus himself. Epic multipliers cascade through divine reels in this legendary title.',
    tags: ['Megaways', 'Jackpot', 'Free Spins'],
  },
  '2': {
    rtp: '96.4%', volatility: 'High', minBet: '$0.20', maxWin: '20,000x',
    description: 'A sugary sweet adventure through a candy-coated world of cluster pays and explosive multipliers.',
    tags: ['Cluster Pays', 'Buy Feature', 'Cascading'],
  },
  '3': {
    rtp: '96.5%', volatility: 'High', minBet: '$0.20', maxWin: '21,175x',
    description: 'The classic made legendary. Sweet wins cascade in this fan-favorite filled with fruity fortune and divine multipliers.',
    tags: ['All-Ways', 'Tumbling', 'Multiplier'],
  },
  '4': {
    rtp: '96.5%', volatility: 'Very High', minBet: '$0.20', maxWin: '25,000x',
    description: 'The gods scatter their riches. Super Scatter mechanics deliver divine payouts across every spin.',
    tags: ['Scatter Pays', 'Free Spins', 'Multiplier'],
  },
  '5': {
    rtp: '96.4%', volatility: 'High', minBet: '$0.20', maxWin: '12,305x',
    description: 'Ride into the Wild West where outlaws and riches await. Sticky wilds and blazing free spins ignite at every turn.',
    tags: ['Wild West', 'Sticky Wilds', 'Free Spins'],
  },
  '6': {
    rtp: '96.5%', volatility: 'High', minBet: '$0.20', maxWin: '20,000x',
    description: 'A sweeter spin on the classic Bonanza formula with even bigger wins and more excitement inside.',
    tags: ['Cluster Pays', 'Buy Feature', 'Cascading'],
  },
  '7': {
    rtp: '96.5%', volatility: 'Medium', minBet: '$0.20', maxWin: '5,000x',
    description: "Step into Mr Null's peculiar shop of wonders where every item on the shelf hides a surprise jackpot.",
    tags: ['Mystery', 'Hold & Win', 'Bonus Buy'],
  },
  '8': {
    rtp: '96.2%', volatility: 'High', minBet: '$0.20', maxWin: '10,000x',
    description: 'Descend into the halls of Athena where ancient Greek riches lie hidden in divine megaways reels.',
    tags: ['Megaways', 'Mythical', 'Free Spins'],
  },
};

const defaultExtras = {
  rtp: '96.5%', volatility: 'High', minBet: '$0.20', maxWin: '15,000x',
  description: 'An epic slot experience with massive win potential and stunning visuals awaiting every spin.',
  tags: ['Slots', 'Bonus', 'Free Spins'],
};

// How far apart each step reveals (seconds)
const STEP_GAP = 0.11;
// When the first step starts appearing
const STEP_START = 0.42;

export default function GameDetailOverlay({ game, onClose }: { game: GameCard; onClose: () => void }) {
  const extras = gameExtras[game.id] ?? defaultExtras;

  const steps = [
    { label: 'Provider',         value: game.provider,                   Icon: Star        },
    { label: 'Return to Player', value: extras.rtp,                      Icon: TrendingUp  },
    { label: 'Volatility',       value: extras.volatility,               Icon: Zap         },
    { label: 'Min Bet',          value: extras.minBet,                   Icon: Clock       },
    { label: 'Max Win',          value: extras.maxWin,                   Icon: Trophy      },
    { label: 'Players Live',     value: `${game.playing.toLocaleString()} now`, Icon: Users },
  ];

  const afterSteps = STEP_START + steps.length * STEP_GAP;

  return (
    <AnimatePresence>
      {/* ── Backdrop ── */}
      <motion.div
        key="gdo-backdrop"
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(4,12,22,0.90)', backdropFilter: 'blur(12px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      />

      {/* ── Panel ── */}
      <motion.div
        key="gdo-panel"
        className="fixed z-[61] inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center pointer-events-none"
      >
        <motion.div
          className="pointer-events-auto w-full md:w-[460px] rounded-t-[30px] md:rounded-[30px] overflow-hidden flex flex-col"
          style={{
            background: '#0b1824',
            maxHeight: '92vh',
            boxShadow: `0 0 80px ${game.accentColor}26, 0 32px 90px rgba(0,0,0,0.65)`,
          }}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 27, stiffness: 280, delay: 0.04 }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Hero ── */}
          <motion.div
            className="relative flex-shrink-0 h-52 md:h-60"
            style={{ background: game.gradient }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.5 }}
          >
            {/* Bottom fade into body */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 30%, #0b1824 100%)' }}
            />

            {/* Glow orb */}
            <motion.div
              className="absolute -top-6 -right-6 w-36 h-36 rounded-full"
              style={{ background: game.accentColor, filter: 'blur(48px)', opacity: 0.22 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.18, duration: 0.75 }}
            />

            {/* LIVE badge */}
            <motion.div
              className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.48)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${game.accentColor}45`,
              }}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.32 }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                style={{ background: '#00e676', boxShadow: '0 0 6px #00e676' }}
              />
              <span className="text-[10px] font-bold tracking-widest" style={{ color: '#00e676' }}>
                LIVE
              </span>
            </motion.div>

            {/* Close button */}
            <motion.button
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.44)', backdropFilter: 'blur(6px)' }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.14, type: 'spring', stiffness: 320 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
            >
              <X size={15} color="white" />
            </motion.button>

            {/* Title */}
            <div className="absolute bottom-4 left-5 right-5">
              <motion.h2
                className="text-[22px] md:text-2xl font-black text-white uppercase leading-tight"
                style={{ textShadow: '0 2px 14px rgba(0,0,0,0.8)' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.42, ease: 'easeOut' }}
              >
                {game.title.replace(/\n/g, ' ')}
              </motion.h2>
            </div>
          </motion.div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1 px-5 pb-8 pt-3">

            {/* Tags */}
            <motion.div
              className="flex gap-2 flex-wrap mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.36 }}
            >
              {extras.tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{
                    background: `${game.accentColor}16`,
                    color: game.accentColor,
                    border: `1px solid ${game.accentColor}38`,
                  }}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.36 + i * 0.07, type: 'spring', stiffness: 350 }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            {/* ── Step timeline ── */}
            <div className="relative pl-1">

              {/* Vertical timeline line drawing down */}
              <motion.div
                className="absolute left-[14px] top-3 w-px origin-top"
                style={{
                  background: `linear-gradient(to bottom, ${game.accentColor}70, ${game.accentColor}08)`,
                  height: `calc(100% - 12px)`,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  delay: STEP_START,
                  duration: steps.length * STEP_GAP + 0.5,
                  ease: 'easeOut',
                }}
              />

              {steps.map((step, i) => {
                const delay = STEP_START + i * STEP_GAP;
                const { Icon } = step;
                return (
                  <motion.div
                    key={step.label}
                    className="flex items-center gap-3.5 py-[11px] relative"
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay, duration: 0.32, ease: 'easeOut' }}
                  >
                    {/* Step node */}
                    <motion.div
                      className="w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                      style={{
                        background: `${game.accentColor}1a`,
                        border: `1px solid ${game.accentColor}48`,
                        boxShadow: `0 0 10px ${game.accentColor}14`,
                      }}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: delay + 0.04, type: 'spring', stiffness: 420, damping: 18 }}
                    >
                      <Icon size={12} color={game.accentColor} />
                    </motion.div>

                    {/* Label + value row */}
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-[13px]" style={{ color: '#6b7f91' }}>
                        {step.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-white">
                          {step.value}
                        </span>
                        {/* Accent tick that draws in after the row */}
                        <motion.div
                          className="h-[2px] rounded-full"
                          style={{ background: game.accentColor, width: 18 }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: delay + 0.18, duration: 0.22 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Separator */}
            <motion.div
              className="h-px my-4 origin-left"
              style={{ background: 'rgba(255,255,255,0.07)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: afterSteps + 0.06, duration: 0.45 }}
            />

            {/* Description */}
            <motion.p
              className="text-[13px] leading-relaxed mb-6"
              style={{ color: '#6b7f91' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: afterSteps + 0.16 }}
            >
              {extras.description}
            </motion.p>

            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                className="py-3.5 rounded-2xl font-black text-sm uppercase tracking-wide"
                style={{ background: game.accentColor, color: '#071018' }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: afterSteps + 0.26, duration: 0.32 }}
                whileHover={{ scale: 1.03, boxShadow: `0 0 32px ${game.accentColor}55` }}
                whileTap={{ scale: 0.97 }}
              >
                Play Now
              </motion.button>
              <motion.button
                className="py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wide"
                style={{
                  background: 'transparent',
                  color: '#9aaab8',
                  border: '1px solid rgba(255,255,255,0.11)',
                }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: afterSteps + 0.36, duration: 0.32 }}
                whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.26)' }}
                whileTap={{ scale: 0.97 }}
              >
                Try Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
