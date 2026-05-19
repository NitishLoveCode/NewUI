'use client';

import { Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ChevronRight, Trophy, Zap } from 'lucide-react';

interface PromoData {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  glowColor: string;
  badgeColor: string;
  badge: string;
  category: string;
  amount: string;
  value: string;
  cta: string;
}

const STEP_LABELS = [
  'START', 'SPIN', '2×', 'WILD',
  '3×', 'BONUS', 'JACKPOT', 'RE-SPIN',
  'HOLD', 'CASCADE', 'GAMBLE', 'MAX WIN',
];

const ROWS: number[][] = [
  [1, 2, 3, 4],
  [8, 7, 6, 5],
  [9, 10, 11, 12],
  [13,14,15,16]
];

const NODE_START = 0.28;
const NODE_GAP = 0.11;
const nodeDelay = (step: number) => NODE_START + (step - 1) * NODE_GAP;

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
      className="relative w-10 h-10 flex items-center justify-center"
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
        style={{ width: 24, height: 24, background: '#15803d' }}
      >
        <span className="text-[10px] font-black text-white select-none leading-none">{step}</span>
      </div>
    </motion.div>
  );
}

function WinJourney({ accent, completedSteps, onToggle }: {
  accent: string;
  completedSteps: Set<number>;
  onToggle: (step: number) => void;
}) {
  return (
    <div>
      {ROWS.map((row, rowIndex) => {
        const isReverse = rowIndex % 2 === 1;
        return (
          <Fragment key={rowIndex}>
            <div className="flex items-start">
              {row.map((step, colIndex) => {
                const isLastInRow = colIndex === row.length - 1;
                const adjacentStep = isReverse ? step - 1 : step + 1;
                const bDelay = nodeDelay(Math.max(step, adjacentStep)) + 0.08;
                const isDone = completedSteps.has(step);

                return (
                  <Fragment key={step}>
                    <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                      <div className="cursor-pointer" onClick={() => onToggle(step)}>
                        <AnimatePresence mode="wait">
                          {isDone ? (
                            <CompletedBadge key="done" step={step} />
                          ) : (
                            <motion.div
                              key="normal"
                              className="relative w-10 h-10 rounded-full flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(145deg, #1c3350 0%, #0d1f30 100%)',
                                border: `2.5px solid ${accent}`,
                                boxShadow: `0 0 16px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.14)`,
                              }}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0, transition: { duration: 0.12 } }}
                              transition={{ delay: nodeDelay(step), type: 'spring', stiffness: 440, damping: 16 }}
                            >
                              <span className="text-sm font-black select-none" style={{ color: accent }}>
                                {step}
                              </span>
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
                        className="text-[8px] font-bold uppercase mt-1 leading-none text-center"
                        style={{
                          color: isDone ? '#4ade80' : `${accent}70`,
                          width: 40,
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

                    {!isLastInRow && (() => {
                      const barIsComplete = completedSteps.has(step) && completedSteps.has(adjacentStep);
                      return (
                        <div className="flex-1 relative" style={{ paddingTop: 15 }}>
                          <div
                            className="h-[10px] w-full rounded-sm"
                            style={{ background: barIsComplete ? '#4ade8020' : `${accent}12` }}
                          />
                          <motion.div
                            className="absolute left-0 right-0 h-[10px] rounded-sm"
                            style={{
                              top: 15,
                              background: barIsComplete
                                ? `linear-gradient(90deg, #4ade80, #4ade8099)`
                                : `linear-gradient(90deg, ${accent}, ${accent}bb)`,
                              boxShadow: barIsComplete
                                ? `0 0 10px #4ade8066`
                                : `0 0 10px ${accent}55`,
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

            {rowIndex < ROWS.length - 1 && (() => {
              const isRight = rowIndex % 2 === 0;
              const connDelay = nodeDelay(isRight ? 5 : 9) + 0.08;
              const currentRow = ROWS[rowIndex];
              const nextRow = ROWS[rowIndex + 1];
              const currentStep = isRight ? currentRow[currentRow.length - 1] : currentRow[0];
              const nextStep = isRight ? nextRow[nextRow.length - 1] : nextRow[0];
              const vertIsComplete = completedSteps.has(currentStep) && completedSteps.has(nextStep);

              return (
                <div
                  className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}
                  style={{ height: 22 }}
                >
                  <div className="relative" style={{ width: 40 }}>
                    <div
                      className="absolute rounded-sm"
                      style={{
                        left: '50%', transform: 'translateX(-50%)',
                        width: 10, top: 0, bottom: 0,
                        background: vertIsComplete ? '#4ade8020' : `${accent}12`,
                      }}
                    />
                    <motion.div
                      className="absolute rounded-sm origin-top"
                      style={{
                        left: '50%', transform: 'translateX(-50%)',
                        width: 10, top: 0, bottom: 0,
                        background: vertIsComplete
                          ? `linear-gradient(180deg, #4ade80, #4ade8099)`
                          : `linear-gradient(180deg, ${accent}, ${accent}bb)`,
                        boxShadow: vertIsComplete ? `0 0 10px #4ade8066` : `0 0 10px ${accent}55`,
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
  );
}

export default function GameDetailFullscreen({ promo, onClose }: { promo: PromoData; onClose: () => void }) {
  const accent = promo.badgeColor;
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const completedCount = completedSteps.size;

  const toggleStep = (step: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step); else next.add(step);
      return next;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="gdf-root"
        className="fixed inset-0 z-[70] flex"
        style={{ background: '#040c16' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Left: Game canvas */}
        <motion.div
          className="flex-1 flex flex-col p-4 gap-3"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.4 }}
        >
          {/* Canvas area */}
          <div
            className="flex-1 rounded-2xl relative overflow-hidden flex items-center justify-center"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'linear-gradient(160deg, #0a1628 0%, #040c16 100%)',
            }}
          >
            {/* Corner accents */}
            {(['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'] as const).map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-5 h-5`}
                style={{
                  borderTop: i < 2 ? `2px solid ${accent}50` : 'none',
                  borderBottom: i >= 2 ? `2px solid ${accent}50` : 'none',
                  borderLeft: i % 2 === 0 ? `2px solid ${accent}50` : 'none',
                  borderRight: i % 2 === 1 ? `2px solid ${accent}50` : 'none',
                }}
              />
            ))}

            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at center, ${accent}08 0%, transparent 65%)` }}
            />

            {/* Canvas placeholder content */}
            <div className="flex flex-col items-center gap-5 text-center relative z-10">
              <motion.div
                className="text-[80px] leading-none select-none"
                animate={{ scale: [1, 1.04, 1], y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >
                {promo.icon}
              </motion.div>

              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">{promo.title}</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{promo.subtitle}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.06, boxShadow: `0 0 32px ${accent}80` }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
                style={{ background: accent, color: '#000' }}
              >
                <Play size={16} fill="currentColor" />
                {promo.cta}
              </motion.button>
            </div>

            {/* Scanning line effect */}
            <motion.div
              className="absolute left-0 right-0 h-[1px] pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}30, transparent)` }}
              animate={{ top: ['10%', '90%', '10%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Bottom bar */}
          <div
            className="rounded-xl px-4 py-2.5 flex items-center gap-4"
            style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <Zap size={13} style={{ color: accent }} />
              <span className="text-xs font-bold" style={{ color: accent }}>{promo.amount}</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{promo.value}</span>
            </div>
            <div
              className="w-[1px] self-stretch"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
            <div className="flex items-center gap-2">
              <Trophy size={13} style={{ color: '#fbbf24' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {completedCount}/12 steps
              </span>
            </div>
            <div className="flex-1" />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              View Rules
              <ChevronRight size={12} />
            </motion.button>
          </div>
        </motion.div>

        {/* Right: Info panel */}
        <motion.div
          className="w-[300px] flex flex-col overflow-y-auto"
          style={{ background: '#081220', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div>
              <motion.h3
                className="text-sm font-black text-white uppercase tracking-wide leading-tight"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {promo.title}
              </motion.h3>
              <motion.p
                className="text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5"
                style={{ color: accent }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.26 }}
              >
                {promo.category}
              </motion.p>
            </div>
            <motion.button
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 340 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
            >
              <X size={13} color="white" />
            </motion.button>
          </div>

          {/* Promo preview card */}
          <div className="px-4 pb-4">
            <motion.div
              className="rounded-xl overflow-hidden relative"
              style={{
                background: promo.gradient,
                boxShadow: `0 6px 20px ${promo.glowColor}`,
                border: '1px solid rgba(255,255,255,0.1)',
                height: 130,
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.22 }}
            >
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 55%)' }}
              />
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }}
              />
              <div className="p-4 h-full flex flex-col justify-between relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{promo.icon}</span>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: promo.badgeColor, color: '#000' }}
                  >
                    {promo.badge}
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white leading-none">{promo.amount}</div>
                  <div className="text-[11px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {promo.value}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent }}>
                Win Journey · 12 Steps
              </span>
              <span className="text-[10px] font-bold" style={{ color: completedCount === 12 ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                {completedCount}/12
              </span>
            </div>
            <div
              className="h-[3px] w-full rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: completedCount === 12
                    ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                    : `linear-gradient(90deg, ${accent}, ${accent}bb)`,
                  boxShadow: `0 0 8px ${accent}66`,
                }}
                animate={{ width: `${(completedCount / 12) * 100}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              />
            </div>
          </div>

          {/* Zig-zag path */}
          <div className="px-4 pb-4 flex-1">
            <WinJourney accent={accent} completedSteps={completedSteps} onToggle={toggleStep} />
          </div>

          {/* Footer hint */}
          <motion.p
            className="text-center text-[9px] font-medium tracking-widest uppercase pb-5"
            style={{ color: 'rgba(255,255,255,0.15)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: nodeDelay(12) + 0.45 }}
          >
            Tap a step to complete
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
