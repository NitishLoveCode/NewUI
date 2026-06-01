'use client';

import { Fragment, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import type { GameCard } from '@/types';
import { useAppDispatch } from '@/stores/hooks';
import { setActiveProblemNumber, setGameSteps } from '@/stores/codingPractice/activeStepSlice';
import { useGetDsaQuestionQuery } from '@/stores/api';

// ─── types ────────────────────────────────────────────────────────────────────

export type QuestionStep = {
  question_id: number;
  question_step_number: number;
};

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

// ─── premium ambient animation constants ──────────────────────────────────────

const PETAL_COLORS = [
  '#FFB7C5', '#FFD700', '#FF9FB2', '#FFFACD',
  '#FFC0CB', '#FFE4B5', '#F7CACA', '#FFDAB9',
];

// Continuously falling flower petals – fully deterministic (no Math.random)
const FALLING_PETALS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  xPercent: 2 + (i / 22) * 96,
  size: 9 + (i % 5) * 4,
  heightRatio: 1.3 + (i % 4) * 0.2,   // petal elongation
  startDelay: (i * 0.42) % 4.5,
  duration: 5 + (i % 6) * 0.9,
  rotateStart: i * 17,
  rotateDelta: 210 + (i % 5) * 70,
  color: PETAL_COLORS[i % PETAL_COLORS.length],
  opacity: 0.55 + (i % 4) * 0.12,
  swayX: -18 + (i % 7) * 6,            // gentle horizontal sway
}));

// One-shot burst petals that explode outward when overlay first opens
const BURST_PETALS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const dist = 130 + (i % 4) * 48;
  return {
    id: i,
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    size: 10 + (i % 3) * 7,
    color: PETAL_COLORS[i % PETAL_COLORS.length],
    delay: 0.08 + i * 0.04,
    rotation: i * 26,
  };
});

// Orbiting sparkle dots around the card
const SPARKLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  const r = 260 + (i % 3) * 45;
  return {
    id: i,
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
    size: 3 + (i % 3),
    delay: i * 0.22,
    dur: 1.6 + (i % 5) * 0.45,
    color: i % 2 === 0 ? '#FFD700' : '#FFF9C4',
  };
});

// Four corner bracket positions: [top, right, rotate]
const CORNERS = [
  { top: -10, left: -10, rotate: 0 },
  { top: -10, right: -10, rotate: 90 },
  { bottom: -10, right: -10, rotate: 180 },
  { bottom: -10, left: -10, rotate: 270 },
] as const;

// Burst sparks that explode inside the success overlay
const SUCCESS_SPARKS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const dist  = 70 + (i % 3) * 35;
  return {
    id: i,
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    size: 4 + (i % 4) * 2,
    delay: 0.05 + i * 0.04,
    color: i % 2 === 0 ? '#FFD700' : '#FFF9C4',
    isDiamond: i % 3 === 0,
  };
});

// ─── sub-components ───────────────────────────────────────────────────────────

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

/** Golden L-bracket ornament for each corner */
function CornerOrnament({ corner, accent }: { corner: typeof CORNERS[number]; accent: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ ...corner, width: 28, height: 28 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 380, damping: 18 }}
    >
      <motion.div
        style={{ width: '100%', height: '100%', rotate: corner.rotate }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* horizontal arm */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 2, background: `linear-gradient(90deg, #FFD700, ${accent})`, borderRadius: 2, boxShadow: '0 0 6px rgba(255,215,0,0.8)' }} />
        {/* vertical arm */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: 18, background: `linear-gradient(180deg, #FFD700, ${accent})`, borderRadius: 2, boxShadow: '0 0 6px rgba(255,215,0,0.8)' }} />
        {/* corner diamond jewel */}
        <motion.div
          style={{ position: 'absolute', top: -3, left: -3, width: 7, height: 7, background: '#FFD700', borderRadius: 1, boxShadow: '0 0 10px rgba(255,215,0,1), 0 0 20px rgba(255,215,0,0.5)' }}
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

/** Animated "YOU ARE HERE" pointer that floats above the current step node */
function CurrentStepPointer({ accent }: { accent: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      style={{ bottom: 'calc(100% + 3px)', left: '50%', x: '-50%' }}
      initial={{ opacity: 0, scale: 0, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: 6, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
    >
      {/* Everything inside floats up/down */}
      <motion.div
        className="flex flex-col items-center"
        animate={{ y: [-3, 3] }}
        transition={{ duration: 1.35, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      >
        {/* Crown — gentle sway */}
        <motion.div
          style={{ fontSize: 15, lineHeight: 1, filter: 'drop-shadow(0 0 7px rgba(255,215,0,0.95))' }}
          animate={{ rotate: [-7, 7] }}
          transition={{ duration: 1.9, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        >
          👑
        </motion.div>

        {/* "YOU" badge — pulsing glow */}
        <motion.div
          className="mt-[3px] px-[7px] py-[2px] rounded-full flex items-center gap-1"
          style={{
            background: `linear-gradient(90deg, ${accent}22, ${accent}40)`,
            border: `1px solid ${accent}`,
          }}
          animate={{
            boxShadow: [
              `0 0 6px ${accent}55`,
              `0 0 14px ${accent}cc, 0 0 24px ${accent}44`,
              `0 0 6px ${accent}55`,
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-1 h-1 rounded-full"
            style={{ background: accent }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span
            className="text-[7px] font-black uppercase tracking-widest select-none"
            style={{ color: accent }}
          >
            YOU
          </span>
        </motion.div>

        {/* Chevron — bounces down */}
        <motion.svg
          width="10" height="7" viewBox="0 0 10 7" fill="none"
          className="mt-[2px]"
          animate={{ y: [0, 3, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M1 1L5 5.5L9 1" stroke={accent} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}

export default function GameDetailOverlay({
  game,
  onClose,
  steps = [],
}: {
  game: GameCard;
  onClose: () => void;
  steps?: QuestionStep[];
}) {
  const router = useRouter();
  const accent = game.accentColor;
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Responsive column count — 3 on mobile, 4 on desktop
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const update = () => setCols(window.innerWidth < 768 ? 3 : 4);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Sort steps by step number and chunk into snake-pattern rows
  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.question_step_number - b.question_step_number),
    [steps]
  );
  const total = sortedSteps.length;
  const ROWS = useMemo<QuestionStep[][]>(() => {
    const result: QuestionStep[][] = [];
    for (let i = 0; i < sortedSteps.length; i += cols) {
      const chunk = sortedSteps.slice(i, i + cols);
      const rowIndex = result.length;
      result.push(rowIndex % 2 === 1 ? [...chunk].reverse() : chunk);
    }
    return result;
  }, [sortedSteps, cols]);

  // Intro showcase: light up 1→N green then reset
  const [introActive, setIntroActive] = useState<Set<number>>(new Set());
  const [introDone, setIntroDone]     = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const { data, error } = useGetDsaQuestionQuery(selectedGameId!, {
      skip: !selectedGameId,
    });

  useEffect(() => {
    if (total === 0) return;
    const START   = 1600; // after node entry animations settle
    const FORWARD = 150;  // ms between each step turning green
    const HOLD    = 1600; // hold all-green (success message shown here)
    const RESET   = 70;   // ms between each step resetting

    const allGreenAt  = START + total * FORWARD;
    const resetStart  = allGreenAt + HOLD;
    const successHide = resetStart + total * RESET + 200;

    const ts: ReturnType<typeof setTimeout>[] = [];

    // Light up steps 1→N
    for (let s = 1; s <= total; s++) {
      ts.push(setTimeout(() =>
        setIntroActive(prev => new Set([...prev, s])),
        START + s * FORWARD
      ));
    }

    // Show success banner after all are green
    ts.push(setTimeout(() => setShowSuccess(true), allGreenAt + 180));

    // Reset steps 1→N
    for (let s = 1; s <= total; s++) {
      ts.push(setTimeout(() =>
        setIntroActive(prev => { const n = new Set(prev); n.delete(s); return n; }),
        resetStart + s * RESET
      ));
    }

    // Hide success banner + mark intro done
    ts.push(setTimeout(() => setShowSuccess(false), successHide));
    ts.push(setTimeout(() => setIntroDone(true), successHide + 350));

    return () => ts.forEach(clearTimeout);
  }, [total]);

  const handleStepClick = (questionId: number) => {
    onClose();
    console.log("question id in step click", questionId)
    setSelectedGameId(questionId.toString());
    dispatch(setGameSteps({ gameSteps: sortedSteps }));
    dispatch(setActiveProblemNumber({ activeProblemNumber: questionId }));
    router.push(`/coding-practice`);
  };

  // true when a step should appear green (user-completed OR intro showcase)
  const isGreen = (s: number) =>
    completedSteps.has(s) || (!introDone && introActive.has(s));

  // first incomplete step — this is where the pointer lives
  const nextStep = introDone
    ? (Array.from({ length: total }, (_, i) => i + 1).find(s => !completedSteps.has(s)) ?? null)
    : null;

  return (
    <AnimatePresence>

      {/* ── 1. Backdrop ──────────────────────────────────────────────────────── */}
      <motion.div
        key="gdo-backdrop"
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(4,12,22,0.92)', backdropFilter: 'blur(14px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      />

      {/* ── 2. Ambient petal & sparkle layer ─────────────────────────────────── */}
      <div className="fixed inset-0 z-[61] pointer-events-none overflow-hidden">

        {/* Continuously falling petals */}
        {FALLING_PETALS.map(p => (
          <motion.div
            key={`fp-${p.id}`}
            className="absolute"
            style={{
              left: `${p.xPercent}%`,
              width: p.size,
              height: p.size * p.heightRatio,
              background: p.color,
              borderRadius: '70% 30% 70% 30% / 60% 40% 60% 40%',
              boxShadow: `0 0 ${p.size / 2}px ${p.color}88`,
            }}
            initial={{ y: '-12vh', rotate: p.rotateStart, opacity: 0 }}
            animate={{
              y: '112vh',
              x: [0, p.swayX, 0, -p.swayX, 0],
              rotate: p.rotateStart + p.rotateDelta,
              opacity: [0, p.opacity, p.opacity, 0],
            }}
            transition={{
              y: { duration: p.duration, delay: p.startDelay, repeat: Infinity, ease: 'linear' },
              x: { duration: p.duration, delay: p.startDelay, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: p.duration, delay: p.startDelay, repeat: Infinity, ease: 'linear' },
              opacity: { duration: p.duration, delay: p.startDelay, repeat: Infinity, times: [0, 0.06, 0.88, 1] },
            }}
          />
        ))}

        {/* Entry burst petals – fire once on mount */}
        {BURST_PETALS.map(p => (
          <motion.div
            key={`bp-${p.id}`}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              width: p.size,
              height: p.size * 1.45,
              background: p.color,
              borderRadius: '70% 30% 70% 30% / 60% 40% 60% 40%',
              boxShadow: `0 0 ${p.size / 2}px ${p.color}88`,
              marginLeft: -p.size / 2,
              marginTop: -p.size * 0.725,
            }}
            initial={{ x: 0, y: 0, scale: 0, rotate: p.rotation, opacity: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: [0, 1.3, 0.9, 0],
              rotate: p.rotation + 360,
              opacity: [0, 1, 0.7, 0],
            }}
            transition={{ delay: p.delay, duration: 1.2, ease: [0.15, 0, 0.25, 1] }}
          />
        ))}

        {/* Orbiting sparkle dots – twinkle continuously */}
        {SPARKLES.map(s => (
          <motion.div
            key={`sp-${s.id}`}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: s.size,
              height: s.size,
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
              background: s.color,
              boxShadow: `0 0 ${s.size * 3}px ${s.size}px ${s.color}`,
              x: s.x,
              y: s.y,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4] }}
            transition={{ delay: s.delay, duration: s.dur, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── 3. Panel + card with corner ornaments & pulsing glow ─────────────── */}
      <motion.div
        key="gdo-panel"
        className="fixed z-[62] inset-0 flex items-center justify-center pointer-events-none px-4"
      >
        {/* Wrapper gives corner ornaments a relative anchor */}
        <div className="relative pointer-events-none" style={{ width: '100%', maxWidth: 760 }}>

          {/* Corner bracket ornaments */}
          {CORNERS.map((corner, i) => (
            <CornerOrnament key={i} corner={corner} accent={accent} />
          ))}

          {/* Card panel with pulsing royal glow */}
          <motion.div
            className="pointer-events-auto w-full rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #0e1f2e 0%, #081420 100%)',
              border: `1px solid ${accent}44`,
            }}
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              boxShadow: [
                `0 0 40px ${accent}33, 0 0 80px ${accent}11, 0 28px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)`,
                `0 0 70px ${accent}66, 0 0 120px ${accent}22, 0 28px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)`,
                `0 0 40px ${accent}33, 0 0 80px ${accent}11, 0 28px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)`,
              ],
            }}
            exit={{ scale: 0.88, opacity: 0, y: 24 }}
            transition={{
              scale: { type: 'spring', damping: 28, stiffness: 300, delay: 0.06 },
              opacity: { duration: 0.3, delay: 0.06 },
              y: { type: 'spring', damping: 28, stiffness: 300, delay: 0.06 },
              boxShadow: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex relative">

              {/* ── SUCCESS overlay — shown when all steps are green ──────── */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden"
                    style={{ background: 'rgba(4,10,20,0.88)', backdropFilter: 'blur(6px)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* Burst sparks */}
                    {SUCCESS_SPARKS.map(s => (
                      <motion.div
                        key={s.id}
                        className="absolute"
                        style={{
                          width: s.size, height: s.size,
                          background: s.color,
                          borderRadius: s.isDiamond ? 2 : '50%',
                          rotate: s.isDiamond ? 45 : 0,
                          boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
                        }}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                        animate={{ x: s.x, y: s.y, scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                        transition={{ delay: s.delay, duration: 0.9, ease: [0.15, 0, 0.3, 1] }}
                      />
                    ))}

                    {/* Expanding gold ring */}
                    <motion.div
                      className="absolute rounded-full pointer-events-none"
                      style={{ width: 60, height: 60, border: '2px solid rgba(255,215,0,0.8)', boxShadow: '0 0 20px rgba(255,215,0,0.4)' }}
                      initial={{ scale: 0, opacity: 0.9 }}
                      animate={{ scale: 7, opacity: 0 }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    />

                    {/* Trophy */}
                    <motion.div
                      style={{ fontSize: 58, lineHeight: 1, filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.9)) drop-shadow(0 0 40px rgba(255,215,0,0.4))' }}
                      initial={{ scale: 0, y: -20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{ delay: 0.15, type: 'spring', stiffness: 380, damping: 18 }}
                    >
                      🏆
                    </motion.div>

                    {/* ALL COMPLETE label */}
                    <motion.p
                      className="text-[10px] font-bold uppercase tracking-[0.5em] mt-3"
                      style={{ color: 'rgba(255,215,0,0.65)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.28, duration: 0.35 }}
                    >
                      All Steps Complete
                    </motion.p>

                    {/* SUCCESS text */}
                    <motion.div
                      className="relative overflow-hidden mt-1"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32, duration: 0.35 }}
                    >
                      <motion.div style={{ filter: 'drop-shadow(0 2px 16px rgba(255,215,0,0.7))' }}>
                        <span
                          className="block text-5xl font-black tracking-[0.3em] uppercase select-none"
                          style={{
                            background: 'linear-gradient(90deg, #7B5C00 0%, #FFD700 22%, #FFFDE7 50%, #FFD700 78%, #7B5C00 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          SUCCESS
                        </span>
                      </motion.div>
                      {/* Shimmer sweep */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.7) 50%, transparent 75%)', width: '55%' }}
                        initial={{ x: '-130%' }}
                        animate={{ x: '300%' }}
                        transition={{ delay: 0.55, duration: 0.6, ease: 'easeInOut' }}
                      />
                    </motion.div>

                    {/* Divider + game title */}
                    <motion.div
                      className="flex items-center gap-2 mt-3"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.48, duration: 0.4 }}
                    >
                      <div style={{ width: 36, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.6))' }} />
                      <div style={{ width: 5, height: 5, background: '#FFD700', transform: 'rotate(45deg)', boxShadow: '0 0 6px rgba(255,215,0,0.9)' }} />
                      <div style={{ width: 36, height: 1, background: 'linear-gradient(90deg, rgba(255,215,0,0.6), transparent)' }} />
                    </motion.div>

                    <motion.p
                      className="text-sm font-black uppercase tracking-widest mt-2"
                      style={{ color: accent }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.52, duration: 0.35 }}
                    >
                      {game.title.replace(/\n/g, ' ')}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Left: image panel ──────────────────────────────────────── */}
              <div className="relative w-[240px] flex-shrink-0 self-stretch">
                {game.image ? (
                  <Image
                    src={game.image}
                    alt={game.title.replace(/\n/g, ' ')}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: game.gradient }} />
                )}

                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(8,20,32,0.97) 0%, rgba(8,20,32,0.4) 45%, transparent 100%)' }}
                />

                {/* Accent glow edge with animated pulse */}
                <motion.div
                  className="absolute inset-y-0 right-0 w-[2px]"
                  style={{ background: `linear-gradient(180deg, transparent, ${accent}, transparent)` }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <motion.h3
                    className="text-sm font-black text-white uppercase tracking-wide leading-tight"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {game.title.replace(/\n/g, ' ')}
                  </motion.h3>
                  <motion.p
                    className="text-[10px] mt-1 font-semibold uppercase tracking-widest"
                    style={{ color: `${accent}cc` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.26 }}
                  >
                    {game.provider}
                  </motion.p>
                  <motion.div
                    className="flex items-center gap-1.5 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.32 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00e701' }} />
                    <span className="text-[11px] text-white/60">
                      <span className="font-bold text-white">{game.playing.toLocaleString()}</span> solving
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* ── Right: timeline ────────────────────────────────────────── */}
              <div className="flex-1 p-6 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <motion.h2
                      className="text-base font-black text-white uppercase tracking-wide leading-tight"
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 }}
                    >
                      Coding Journey
                    </motion.h2>
                    <motion.p
                      className="text-[10px] mt-1 font-bold uppercase tracking-[0.2em]"
                      style={{ color: accent }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.24 }}
                    >
                      {total} Steps · Click to Start
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
                <div className="flex-1">
                  {ROWS.map((row, rowIndex) => {
                    const isReverse = rowIndex % 2 === 1;

                    return (
                      <Fragment key={rowIndex}>
                        <div className="flex items-start">
                          {row.map((item, colIndex) => {
                            const stepNum = item.question_step_number;
                            const qId = item.question_id;
                            const isLastInRow = colIndex === row.length - 1;
                            const adjacentStep = isReverse ? stepNum - 1 : stepNum + 1;
                            const bDelay = nodeDelay(Math.max(stepNum, adjacentStep)) + 0.08;
                            const isDone = isGreen(stepNum);
                            const isCurrentStep = stepNum === nextStep;

                            return (
                              <Fragment key={qId}>
                                <div className="flex flex-col items-center relative" style={{ flexShrink: 0 }}>

                                  {/* ── YOU ARE HERE pointer ── */}
                                  <AnimatePresence>
                                    {isCurrentStep && (
                                      <CurrentStepPointer key="ptr" accent={accent} />
                                    )}
                                  </AnimatePresence>

                                  <div className="cursor-pointer" onClick={() => handleStepClick(qId)}>
                                    <AnimatePresence mode="wait">
                                      {isDone ? (
                                        <CompletedBadge key="done" step={stepNum} />
                                      ) : (
                                        <motion.div
                                          key="normal"
                                          className="relative w-11 h-11 rounded-full flex items-center justify-center"
                                          style={{
                                            background: 'linear-gradient(145deg, #1c3350 0%, #0d1f30 100%)',
                                            border: `2.5px solid ${accent}`,
                                            boxShadow: isCurrentStep
                                              ? `0 0 26px ${accent}aa, 0 0 52px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.22)`
                                              : `0 0 18px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.14)`,
                                          }}
                                          initial={{ scale: 0, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          exit={{ scale: 0, opacity: 0, transition: { duration: 0.12 } }}
                                          transition={{ delay: nodeDelay(stepNum), type: 'spring', stiffness: 440, damping: 16 }}
                                          whileHover={{ scale: 1.15 }}
                                          whileTap={{ scale: 0.9 }}
                                        >
                                          <span className="text-sm font-black select-none" style={{ color: accent }}>
                                            {stepNum}
                                          </span>

                                          {/* One-time pop ring on entry */}
                                          <motion.div
                                            className="absolute rounded-full pointer-events-none"
                                            style={{ inset: -4, border: `2px solid ${accent}` }}
                                            initial={{ scale: 1, opacity: 0.7 }}
                                            animate={{ scale: 1.8, opacity: 0 }}
                                            transition={{ delay: nodeDelay(stepNum) + 0.08, duration: 0.6, ease: 'easeOut' }}
                                          />

                                          {/* Sonar beacon rings — only on current step */}
                                          {isCurrentStep && [0, 1, 2].map(ri => (
                                            <motion.div
                                              key={`sonar-${ri}`}
                                              className="absolute rounded-full pointer-events-none"
                                              style={{
                                                inset: -(8 + ri * 9),
                                                border: `${1.8 - ri * 0.4}px solid ${accent}`,
                                              }}
                                              animate={{ scale: [1, 1.55 + ri * 0.18], opacity: [0.65, 0] }}
                                              transition={{
                                                duration: 1.6,
                                                repeat: Infinity,
                                                delay: ri * 0.52,
                                                ease: 'easeOut',
                                              }}
                                            />
                                          ))}
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
                                    transition={{ delay: nodeDelay(stepNum) + 0.22 }}
                                  >
                                    STEP {stepNum}
                                  </motion.span>
                                </div>

                                {!isLastInRow && (() => {
                                  const barIsComplete = isGreen(stepNum) && isGreen(adjacentStep);
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

                        {rowIndex < ROWS.length - 1 && (() => {
                          const isRight = rowIndex % 2 === 0;
                          const currentRow = ROWS[rowIndex];
                          const nextRow = ROWS[rowIndex + 1];
                          const currentStepNum = isRight
                            ? currentRow[currentRow.length - 1].question_step_number
                            : currentRow[0].question_step_number;
                          const nextStepNum = isRight
                            ? nextRow[nextRow.length - 1].question_step_number
                            : nextRow[0].question_step_number;
                          const connDelay = nodeDelay(Math.max(currentStepNum, nextStepNum)) + 0.08;
                          const verticalIsComplete = isGreen(currentStepNum) && isGreen(nextStepNum);

                          return (
                            <div className={`flex ${isRight ? 'justify-end' : 'justify-start'}`} style={{ height: 26 }}>
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
                                    boxShadow: verticalIsComplete ? `0 0 12px #4ade8066` : `0 0 12px ${accent}66`,
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
                  transition={{ delay: nodeDelay(Math.max(total, 1)) + 0.45 }}
                >
                  Click a step to start coding · Tap anywhere to close
                </motion.p>
              </div>

            </div>
          </motion.div>
        </div>
      </motion.div>

    </AnimatePresence>
  );
}
