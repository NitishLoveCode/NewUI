'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { GameCard } from '@/types';

const STEP_LABELS = [
  'START', 'SPIN', '2×', 'WILD',
  '3×', 'BONUS', 'JACKPOT', 'RE-SPIN',
  'HOLD', 'CASCADE', 'GAMBLE', 'MAX WIN',
];

const ROWS: number[][] = [
  [1, 2, 3, 4],
  [8, 7, 6, 5],
  [9, 10, 11, 12],
];

const NODE_START = 0.28;
const NODE_GAP = 0.11;
const nodeDelay = (step: number) => NODE_START + (step - 1) * NODE_GAP;

// 12-point starburst (alternating outer r=50 / inner r=39, offset 15°)
const STARBURST = `polygon(
  50% 0%, 59.84% 13.29%, 75% 6.7%, 76.87% 23.13%,
  93.3% 25%, 86.71% 40.16%, 100% 50%, 86.71% 59.84%,
  93.3% 75%, 76.87% 76.87%, 75% 93.3%, 59.84% 86.71%,
  50% 100%, 40.16% 86.71%, 25% 93.3%, 23.13% 76.87%,
  6.7% 75%, 13.29% 59.84%, 0% 50%, 13.29% 40.16%,
  6.7% 25%, 23.13% 23.13%, 25% 6.7%, 40.16% 13.29%
)`;

function CompletedBadge({ step }: { step: number }) {
  return (
    <motion.div
      className="relative w-11 h-11 flex items-center justify-center"
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ scale: 0, rotate: 180, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: '#4ade80', clipPath: STARBURST }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      <div
        className="relative z-10 flex items-center justify-center rounded-full"
        style={{ width: 26, height: 26, background: '#15803d' }}
      >
        <span className="text-[11px] font-black text-white select-none leading-none">{step}</span>
      </div>
    </motion.div>
  );
}

export default function GameDetailOverlay({ game, onClose }: { game: GameCard; onClose: () => void }) {
  const router = useRouter();
  const accent = game.accentColor;
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepClick = (step: number) => {
    onClose();
    router.push(`/coding-practice?step=${step}`);
  };

  const toggleStep = (step: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

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
                Coding Journey · 12 Steps · Click to Start
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
                      const isDone = completedSteps.has(step);

                      return (
                        <Fragment key={step}>
                          {/* Node + label */}
                          <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                            <div
                              className="cursor-pointer"
                              onClick={() => handleStepClick(step)}
                            >
                              <AnimatePresence mode="wait">
                                {isDone ? (
                                  <CompletedBadge key="done" step={step} />
                                ) : (
                                  <motion.div
                                    key="normal"
                                    className="relative w-11 h-11 rounded-full flex items-center justify-center"
                                    style={{
                                      background: 'linear-gradient(145deg, #1c3350 0%, #0d1f30 100%)',
                                      border: `2.5px solid ${accent}`,
                                      boxShadow: `0 0 18px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.14)`,
                                    }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.12 } }}
                                    transition={{ delay: nodeDelay(step), type: 'spring', stiffness: 440, damping: 16 }}
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.9 }}
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
                                )}
                              </AnimatePresence>
                            </div>

                            <motion.span
                              className="text-[8px] font-bold uppercase mt-1.5 leading-none text-center"
                              style={{
                                color: isDone ? '#4ade80' : `${accent}70`,
                                width: 44,
                                display: 'block',
                                letterSpacing: '0.06em',
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: nodeDelay(step) + 0.22 }}
                            >
                              {STEP_LABELS[step - 1]}
                            </motion.span>
                          </div>

                          {/* Connecting bar */}
                          {!isLastInRow && (() => {
                            const barIsComplete = completedSteps.has(step) && completedSteps.has(adjacentStep);
                            return (
                              <div className="flex-1 relative" style={{ paddingTop: 16 }}>
                                <div
                                  className="h-[11px] w-full rounded-sm"
                                  style={{ background: barIsComplete ? '#4ade8020' : `${accent}12` }}
                                />
                                <motion.div
                                  className="absolute left-0 right-0 h-[11px] rounded-sm"
                                  style={{
                                    top: 16,
                                    background: barIsComplete
                                      ? `linear-gradient(90deg, #4ade80, #4ade8099)`
                                      : `linear-gradient(90deg, ${accent}, ${accent}bb)`,
                                    boxShadow: barIsComplete
                                      ? `0 0 12px #4ade8066, 0 2px 6px rgba(0,0,0,0.45)`
                                      : `0 0 12px ${accent}66, 0 2px 6px rgba(0,0,0,0.45)`,
                                    transformOrigin: isReverse ? 'right center' : 'left center',
                                  }}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ delay: bDelay, duration: 0.2, ease: 'easeOut' }}
                                />
                              </div>
                            );
                          })()}
                        </Fragment>
                      );
                    })}
                  </div>

                  {/* Vertical connector between rows */}
                  {rowIndex < ROWS.length - 1 && (() => {
                    const isRight = rowIndex % 2 === 0;
                    const connDelay = nodeDelay(isRight ? 5 : 9) + 0.08;
                    const currentRow = ROWS[rowIndex];
                    const nextRow = ROWS[rowIndex + 1];
                    const currentStep = isRight ? currentRow[currentRow.length - 1] : currentRow[0];
                    const nextStep = isRight ? nextRow[nextRow.length - 1] : nextRow[0];
                    const verticalIsComplete = completedSteps.has(currentStep) && completedSteps.has(nextStep);

                    return (
                      <div
                        className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}
                        style={{ height: 26 }}
                      >
                        <div className="relative" style={{ width: 44 }}>
                          <div
                            className="absolute rounded-sm"
                            style={{ left: '50%', transform: 'translateX(-50%)', width: 11, top: 0, bottom: 0, background: verticalIsComplete ? '#4ade8020' : `${accent}12` }}
                          />
                          <motion.div
                            className="absolute rounded-sm origin-top"
                            style={{
                              left: '50%', transform: 'translateX(-50%)',
                              width: 11, top: 0, bottom: 0,
                              background: verticalIsComplete
                                ? `linear-gradient(180deg, #4ade80, #4ade8099)`
                                : `linear-gradient(180deg, ${accent}, ${accent}bb)`,
                              boxShadow: verticalIsComplete
                                ? `0 0 12px #4ade8066`
                                : `0 0 12px ${accent}66`,
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
            Click a step to start coding · Tap anywhere to close
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
