'use client';

import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { GameCard } from '@/types';

const STEP_LABELS = [
  'START', 'SPIN', '2×', 'WILD',
  '3×', 'BONUS', 'JACKPOT', 'RE-SPIN',
  'HOLD', 'CASCADE', 'GAMBLE', 'MAX WIN',
];

// Visual rows: row 2 is reversed so path snakes 1→4, 4↓5, 8←5, 8↓9, 9→12
const ROWS: number[][] = [
  [1, 2, 3, 4],
  [8, 7, 6, 5],
  [9, 10, 11, 12],
];

const NODE_START = 0.28;
const NODE_GAP = 0.11;

const nodeDelay = (step: number) => NODE_START + (step - 1) * NODE_GAP;

export default function GameDetailOverlay({ game, onClose }: { game: GameCard; onClose: () => void }) {
  const accent = game.accentColor;

  return (
    <AnimatePresence>
      <motion.div
        key="gdo-backdrop"
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(4,12,22,0.92)', backdropFilter: 'blur(14px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      />

      <motion.div
        key="gdo-panel"
        className="fixed z-[61] inset-0 flex items-center justify-center pointer-events-none px-4"
      >
        <motion.div
          className="pointer-events-auto w-full max-w-[480px] rounded-3xl p-6"
          style={{
            background: 'linear-gradient(160deg, #0e1f2e 0%, #081420 100%)',
            boxShadow: `0 0 70px ${accent}22, 0 28px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)`,
            border: `1px solid rgba(255,255,255,0.07)`,
          }}
          initial={{ scale: 0.88, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300, delay: 0.06 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <motion.h2
                className="text-base font-black text-white uppercase tracking-wide leading-tight"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 }}
              >
                {game.title.replace(/\n/g, ' ')}
              </motion.h2>
              <motion.p
                className="text-[10px] mt-1 font-bold uppercase tracking-[0.2em]"
                style={{ color: accent }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.24 }}
              >
                Win Journey · 12 Steps
              </motion.p>
            </div>
            <motion.button
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-3"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.16, type: 'spring', stiffness: 340 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
            >
              <X size={13} color="white" />
            </motion.button>
          </div>

          {/* Zig-zag snake path */}
          <div>
            {ROWS.map((row, rowIndex) => {
              const isReverse = rowIndex % 2 === 1;

              return (
                <Fragment key={rowIndex}>
                  {/* Row of nodes + bars */}
                  <div className="flex items-start">
                    {row.map((step, colIndex) => {
                      const isLastInRow = colIndex === row.length - 1;
                      const adjacentStep = isReverse ? step - 1 : step + 1;
                      const bDelay = nodeDelay(Math.max(step, adjacentStep)) + 0.08;

                      return (
                        <Fragment key={step}>
                          {/* Node + label */}
                          <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                            <motion.div
                              className="relative w-11 h-11 rounded-full flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(145deg, #1c3350 0%, #0d1f30 100%)',
                                border: `2.5px solid ${accent}`,
                                boxShadow: `0 0 18px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.14)`,
                              }}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: nodeDelay(step), type: 'spring', stiffness: 440, damping: 16 }}
                            >
                              <span className="text-sm font-black select-none" style={{ color: accent }}>
                                {step}
                              </span>
                              {/* Pop ring burst */}
                              <motion.div
                                className="absolute rounded-full pointer-events-none"
                                style={{ inset: -4, border: `2px solid ${accent}` }}
                                initial={{ scale: 1, opacity: 0.7 }}
                                animate={{ scale: 1.8, opacity: 0 }}
                                transition={{ delay: nodeDelay(step) + 0.08, duration: 0.6, ease: 'easeOut' }}
                              />
                            </motion.div>

                            <motion.span
                              className="text-[8px] font-bold uppercase mt-1.5 leading-none text-center"
                              style={{ color: `${accent}70`, width: 44, display: 'block', letterSpacing: '0.06em' }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: nodeDelay(step) + 0.22 }}
                            >
                              {STEP_LABELS[step - 1]}
                            </motion.span>
                          </div>

                          {/* Connecting bar */}
                          {!isLastInRow && (
                            <div className="flex-1 relative" style={{ paddingTop: 16 }}>
                              {/* Track (dim background) */}
                              <div
                                className="h-[11px] w-full rounded-sm"
                                style={{ background: `${accent}12` }}
                              />
                              {/* Animated fill */}
                              <motion.div
                                className="absolute left-0 right-0 h-[11px] rounded-sm"
                                style={{
                                  top: 16,
                                  background: `linear-gradient(90deg, ${accent}, ${accent}bb)`,
                                  boxShadow: `0 0 12px ${accent}66, 0 2px 6px rgba(0,0,0,0.45)`,
                                  transformOrigin: isReverse ? 'right center' : 'left center',
                                }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: bDelay, duration: 0.2, ease: 'easeOut' }}
                              />
                            </div>
                          )}
                        </Fragment>
                      );
                    })}
                  </div>

                  {/* Vertical connector between rows */}
                  {rowIndex < ROWS.length - 1 && (() => {
                    const isRight = rowIndex % 2 === 0;
                    const connDelay = nodeDelay(isRight ? 5 : 9) + 0.08;

                    return (
                      <div
                        className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}
                        style={{ height: 26 }}
                      >
                        <div className="relative" style={{ width: 44 }}>
                          {/* Track */}
                          <div
                            className="absolute rounded-sm"
                            style={{ left: '50%', transform: 'translateX(-50%)', width: 11, top: 0, bottom: 0, background: `${accent}12` }}
                          />
                          {/* Fill */}
                          <motion.div
                            className="absolute rounded-sm origin-top"
                            style={{
                              left: '50%', transform: 'translateX(-50%)',
                              width: 11, top: 0, bottom: 0,
                              background: `linear-gradient(180deg, ${accent}, ${accent}bb)`,
                              boxShadow: `0 0 12px ${accent}66`,
                            }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: connDelay, duration: 0.18, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </Fragment>
              );
            })}
          </div>

          {/* Footer */}
          <motion.p
            className="text-center text-[10px] mt-6 font-medium tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.18)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: nodeDelay(12) + 0.45 }}
          >
            Tap anywhere to close
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
