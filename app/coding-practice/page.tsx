'use client';

import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Code2, Play, Video, VideoOff, Mic, MicOff, MessageSquare,
  Send, Trophy, Zap, UserX, Wifi, Terminal, ScreenShare,
  Clock, CheckCircle2, Flame, Star, MonitorStop, PhoneOff,
  RefreshCw, ChevronRight, Cpu, Eye, Globe, Shield, X,
  ChevronDown, BookOpen, Music2, Users, AlignLeft, SkipBack, SkipForward, Volume2,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

// ─── Data ───────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1,  label: 'Two Sum',       color: '#f97316', glow: 'rgba(249,115,22,0.5)',  solved: true  },
  { num: 2,  label: 'Valid Parens',  color: '#eab308', glow: 'rgba(234,179,8,0.5)',   solved: true  },
  { num: 3,  label: 'Merge Lists',   color: '#4ade80', glow: 'rgba(74,222,128,0.5)',  solved: true  },
  { num: 4,  label: 'Binary Search', color: '#22d3ee', glow: 'rgba(34,211,238,0.6)',  solved: false },
  { num: 5,  label: 'LRU Cache',     color: '#818cf8', glow: 'rgba(129,140,248,0.5)', solved: false },
  { num: 6,  label: 'Graph DFS',     color: '#c084fc', glow: 'rgba(192,132,252,0.5)', solved: false },
  { num: 7,  label: 'DP Coins',      color: '#f472b6', glow: 'rgba(244,114,182,0.5)', solved: false },
  { num: 8,  label: 'Trie Build',    color: '#fb7185', glow: 'rgba(251,113,133,0.5)', solved: false },
  { num: 9,  label: 'Two Sum',       color: '#f97316', glow: 'rgba(249,115,22,0.5)',  solved: false },
  { num: 10, label: 'Valid Parens',  color: '#eab308', glow: 'rgba(234,179,8,0.5)',   solved: false },
  { num: 11, label: 'Merge Lists',   color: '#4ade80', glow: 'rgba(74,222,128,0.5)',  solved: false },
  { num: 12, label: 'Binary Search', color: '#22d3ee', glow: 'rgba(34,211,238,0.6)',  solved: false },
  { num: 13, label: 'LRU Cache',     color: '#818cf8', glow: 'rgba(129,140,248,0.5)', solved: false },
  { num: 14, label: 'Graph DFS',     color: '#c084fc', glow: 'rgba(192,132,252,0.5)', solved: false },
  { num: 15, label: 'DP Coins',      color: '#f472b6', glow: 'rgba(244,114,182,0.5)', solved: false },
  { num: 16, label: 'Trie Build',    color: '#fb7185', glow: 'rgba(251,113,133,0.5)', solved: false },
];

const INITIAL_CHAT = [
  { id: 1, user: 'Alex', avatar: '🧑‍💻', msg: "Let's tackle edge cases first!", time: '10:42', me: false, color: '#22d3ee' },
  { id: 2, user: 'You',  avatar: '👨‍💻', msg: 'Binary search on sorted array works best here.', time: '10:43', me: true,  color: '#00e676' },
  { id: 3, user: 'Alex', avatar: '🧑‍💻', msg: 'Yes! Check mid element → adjust left/right', time: '10:43', me: false, color: '#22d3ee' },
];

const CODE_LINES = [
  { text: 'function binarySearch(nums, target) {', color: '#c084fc' },
  { text: '  let left = 0;',                        color: '#e2e8f0' },
  { text: '  let right = nums.length - 1;',         color: '#e2e8f0' },
  { text: '',                                        color: '' },
  { text: '  while (left <= right) {',              color: '#fbbf24' },
  { text: '    const mid = Math.floor(',            color: '#e2e8f0' },
  { text: '      (left + right) / 2',               color: '#4ade80' },
  { text: '    );',                                  color: '#e2e8f0' },
  { text: '',                                        color: '' },
  { text: '    if (nums[mid] === target) {',        color: '#fbbf24' },
  { text: '      return mid; // ✓ Found!',          color: '#64748b' },
  { text: '    } else if (nums[mid] < target) {',   color: '#fbbf24' },
  { text: '      left = mid + 1;',                  color: '#f87171' },
  { text: '    } else {',                           color: '#fbbf24' },
  { text: '      right = mid - 1;',                 color: '#60a5fa' },
  { text: '    }',                                  color: '#fbbf24' },
  { text: '  }',                                    color: '#fbbf24' },
  { text: '  return -1; // Not found',              color: '#64748b' },
  { text: '}',                                      color: '#c084fc' },
];

const CODE_BY_LANGUAGE: Record<string, typeof CODE_LINES> = {
  js: CODE_LINES,
  python: [
    { text: 'def binary_search(nums, target):', color: '#c084fc' },
    { text: '    left = 0', color: '#e2e8f0' },
    { text: '    right = len(nums) - 1', color: '#e2e8f0' },
    { text: '', color: '' },
    { text: '    while left <= right:', color: '#fbbf24' },
    { text: '        mid = (left + right) // 2', color: '#e2e8f0' },
    { text: '', color: '' },
    { text: '        if nums[mid] == target:', color: '#fbbf24' },
    { text: '            return mid  # Found!', color: '#64748b' },
    { text: '        elif nums[mid] < target:', color: '#fbbf24' },
    { text: '            left = mid + 1', color: '#f87171' },
    { text: '        else:', color: '#fbbf24' },
    { text: '            right = mid - 1', color: '#60a5fa' },
    { text: '', color: '' },
    { text: '    return -1  # Not found', color: '#64748b' },
  ],
  java: [
    { text: 'public static int binarySearch(', color: '#c084fc' },
    { text: '    int[] nums, int target) {', color: '#c084fc' },
    { text: '  int left = 0;', color: '#e2e8f0' },
    { text: '  int right = nums.length - 1;', color: '#e2e8f0' },
    { text: '', color: '' },
    { text: '  while (left <= right) {', color: '#fbbf24' },
    { text: '    int mid = left + (right - left) / 2;', color: '#e2e8f0' },
    { text: '', color: '' },
    { text: '    if (nums[mid] == target)', color: '#fbbf24' },
    { text: '      return mid;', color: '#60a5fa' },
    { text: '    else if (nums[mid] < target)', color: '#fbbf24' },
    { text: '      left = mid + 1;', color: '#f87171' },
    { text: '    else', color: '#fbbf24' },
    { text: '      right = mid - 1;', color: '#60a5fa' },
    { text: '  }', color: '#fbbf24' },
    { text: '  return -1;', color: '#64748b' },
    { text: '}', color: '#c084fc' },
  ],
  cpp: [
    { text: 'int binarySearch(vector<int>& nums,', color: '#c084fc' },
    { text: '    int target) {', color: '#c084fc' },
    { text: '  int left = 0, right = nums.size() - 1;', color: '#e2e8f0' },
    { text: '', color: '' },
    { text: '  while (left <= right) {', color: '#fbbf24' },
    { text: '    int mid = left + (right - left) / 2;', color: '#e2e8f0' },
    { text: '', color: '' },
    { text: '    if (nums[mid] == target)', color: '#fbbf24' },
    { text: '      return mid;', color: '#60a5fa' },
    { text: '    else if (nums[mid] < target)', color: '#fbbf24' },
    { text: '      left = mid + 1;', color: '#f87171' },
    { text: '    else right = mid - 1;', color: '#60a5fa' },
    { text: '  }', color: '#fbbf24' },
    { text: '  return -1;', color: '#64748b' },
    { text: '}', color: '#c084fc' },
  ],
};

const LANGUAGE_OPTIONS = [
  { id: 'js',     name: 'JavaScript', icon: '⚙️', color: '#f7df1e' },
  { id: 'python', name: 'Python',     icon: '🐍', color: '#3776ab' },
  { id: 'java',   name: 'Java',       icon: '☕', color: '#007396' },
  { id: 'cpp',    name: 'C++',        icon: '⬚', color: '#00599c' },
];

const TERMINAL_LINES = [
  { text: '> Running 4 test cases…',                    color: '#94a3b8' },
  { text: '  ✓  [1,3,5,7,9], target=5  →  idx 2',     color: '#4ade80' },
  { text: '  ✓  [-1,0,3,5,9,12], target=9  →  idx 4', color: '#4ade80' },
  { text: '  ✓  [5], target=5  →  idx 0',              color: '#4ade80' },
  { text: '  ✓  [], target=0  →  -1',                  color: '#4ade80' },
  { text: '──────────────────────────────────',         color: '#334155' },
  { text: '  All 4/4 tests passed! 🎉',                color: '#00e676' },
  { text: '  Time Complexity : O(log n)',               color: '#fbbf24' },
  { text: '  Space Complexity: O(1)',                   color: '#fbbf24' },
];

const PROBLEM = {
  title: 'Binary Search',
  difficulty: 'Easy',
  acceptance: '52%',
  likes: '1.2K',
  description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
  examples: [
    { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4',  explain: 'Target found at index 4' },
    { input: 'nums = [-1,0,3,5,9,12], target = 13', output: '-1', explain: 'Target not found' },
  ],
  constraints: [
    '1 <= nums.length <= 10^4',
    '-10^4 < nums[i], target < 10^4',
    'All integers in nums are unique',
    'nums is sorted in ascending order',
  ],
};

const CONFETTI_COLORS = [
  '#f97316','#eab308','#4ade80','#22d3ee','#818cf8',
  '#c084fc','#f472b6','#fb7185','#fbbf24','#00e676',
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// ─── Steps Progress Bar ───────────────────────────────────────────────────────

const ROWS_STEPS: number[][] = [
  [1, 2, 3, 4],
  [8, 7, 6, 5],
  [9, 10, 11, 12],
];

const NODE_START_VAL = 0.28;
const NODE_GAP_VAL = 0.11;
const nodeDelayFunc = (step: number) => NODE_START_VAL + (step - 1) * NODE_GAP_VAL;

const STARBURST_PATH = `polygon(
  50% 0%, 59.84% 13.29%, 75% 6.7%, 76.87% 23.13%,
  93.3% 25%, 86.71% 40.16%, 100% 50%, 86.71% 59.84%,
  93.3% 75%, 76.87% 76.87%, 75% 93.3%, 59.84% 86.71%,
  50% 100%, 40.16% 86.71%, 25% 93.3%, 23.13% 76.87%,
  6.7% 75%, 13.29% 59.84%, 0% 50%, 13.29% 40.16%,
  6.7% 25%, 23.13% 23.13%, 25% 6.7%, 40.16% 13.29%
)`;

function CompletedStepBadge({ step }: { step: number }) {
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
        style={{ background: '#4ade80', clipPath: STARBURST_PATH }}
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

function StepsBar({ current, onStep }: { current: number; onStep: (n: number) => void }) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const solvedCount = STEPS.filter(s => s.solved).length;

  const handleStepClick = (step: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
    onStep(step);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative overflow-y-auto"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div
        className="p-4 rounded-2xl"
        style={{
          background: 'rgba(15,21,46,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-xs font-bold text-white/70">Progress Journey</span>
          <span className="text-xs font-black" style={{ color: '#22d3ee' }}>
            {solvedCount}<span className="text-white/30 font-normal">/16</span>
          </span>
        </motion.div>

        {/* Zig-zag animation path */}
        <div>
          {ROWS_STEPS.map((row, rowIndex) => {
            const isReverse = rowIndex % 2 === 1;

            return (
              <Fragment key={rowIndex}>
                {/* Row of nodes */}
                <div className="flex items-start">
                  {row.map((step, colIndex) => {
                    const isLastInRow = colIndex === row.length - 1;
                    const adjacentStep = isReverse ? step - 1 : step + 1;
                    const bDelay = nodeDelayFunc(Math.max(step, adjacentStep)) + 0.08;
                    const isDone = completedSteps.has(step);
                    const isCurrent = step === current;

                    return (
                      <Fragment key={step}>
                        <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                          <div
                            className="cursor-pointer"
                            onClick={() => handleStepClick(step)}
                          >
                            <AnimatePresence mode="wait">
                              {isDone ? (
                                <CompletedStepBadge key="done" step={step} />
                              ) : (
                                <motion.div
                                  key="normal"
                                  className="relative w-11 h-11 rounded-full flex items-center justify-center"
                                  style={{
                                    background: isCurrent
                                      ? `linear-gradient(135deg, ${STEPS[step - 1].color}bb, ${STEPS[step - 1].color}77)`
                                      : 'linear-gradient(145deg, #1c3350 0%, #0d1f30 100%)',
                                    border: `2.5px solid ${STEPS[step - 1].color}`,
                                    boxShadow: isCurrent
                                      ? `0 0 18px ${STEPS[step - 1].glow}, inset 0 1px 0 rgba(255,255,255,0.14)`
                                      : `0 0 18px ${STEPS[step - 1].glow}44, inset 0 1px 0 rgba(255,255,255,0.14)`,
                                  }}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.12 } }}
                                  transition={{ delay: nodeDelayFunc(step), type: 'spring', stiffness: 440, damping: 16 }}
                                  whileHover={{ scale: 1.12 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <span className="text-sm font-black select-none" style={{ color: STEPS[step - 1].color }}>
                                    {step}
                                  </span>
                                  {isCurrent && (
                                    <motion.div
                                      className="absolute rounded-full pointer-events-none"
                                      style={{ inset: -6, border: `2px solid ${STEPS[step - 1].color}` }}
                                      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                                      transition={{ duration: 1.6, repeat: Infinity }}
                                    />
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <motion.span
                            className="text-[8px] font-bold uppercase mt-1.5 leading-none text-center"
                            style={{
                              color: isDone ? '#4ade80' : isCurrent ? STEPS[step - 1].color : `${STEPS[step - 1].color}70`,
                              width: 44,
                              display: 'block',
                              letterSpacing: '0.06em',
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: nodeDelayFunc(step) + 0.22 }}
                          >
                            Q{step}
                          </motion.span>
                        </div>

                        {/* Connecting bar */}
                        {!isLastInRow && (() => {
                          const barIsComplete = completedSteps.has(step) && completedSteps.has(adjacentStep);
                          return (
                            <div className="flex-1 relative" style={{ paddingTop: 16 }}>
                              <div
                                className="h-[11px] w-full rounded-sm"
                                style={{ background: barIsComplete ? '#4ade8020' : `${STEPS[step - 1].color}12` }}
                              />
                              <motion.div
                                className="absolute left-0 right-0 h-[11px] rounded-sm"
                                style={{
                                  top: 16,
                                  background: barIsComplete
                                    ? `linear-gradient(90deg, #4ade80, #4ade8099)`
                                    : `linear-gradient(90deg, ${STEPS[step - 1].color}, ${STEPS[step - 1].color}bb)`,
                                  boxShadow: barIsComplete
                                    ? `0 0 12px #4ade8066, 0 2px 6px rgba(0,0,0,0.45)`
                                    : `0 0 12px ${STEPS[step - 1].color}66, 0 2px 6px rgba(0,0,0,0.45)`,
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

                {/* Vertical connector */}
                {rowIndex < ROWS_STEPS.length - 1 && (() => {
                  const isRight = rowIndex % 2 === 0;
                  const connDelay = nodeDelayFunc(isRight ? 5 : 9) + 0.08;
                  const currentRow = ROWS_STEPS[rowIndex];
                  const nextRow = ROWS_STEPS[rowIndex + 1];
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
                          style={{ left: '50%', transform: 'translateX(-50%)', width: 11, top: 0, bottom: 0, background: verticalIsComplete ? '#4ade8020' : `${STEPS[currentStep - 1].color}12` }}
                        />
                        <motion.div
                          className="absolute rounded-sm origin-top"
                          style={{
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 11,
                            top: 0,
                            bottom: 0,
                            background: verticalIsComplete
                              ? `linear-gradient(180deg, #4ade80, #4ade8099)`
                              : `linear-gradient(180deg, ${STEPS[currentStep - 1].color}, ${STEPS[currentStep - 1].color}bb)`,
                            boxShadow: verticalIsComplete
                              ? `0 0 12px #4ade8066`
                              : `0 0 12px ${STEPS[currentStep - 1].color}66`,
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

        {/* Footer info */}
        <motion.p
          className="text-center text-[10px] mt-6 font-medium tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.18)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: nodeDelayFunc(12) + 0.45 }}
        >
          Click steps to mark progress
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─── Connection Idle Screen ───────────────────────────────────────────────────

function ConnectionIdle({ onConnect }: { onConnect: (anon: boolean) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="relative flex flex-col items-center justify-center py-16 px-6 overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, #0d0621 0%, #0f0c29 30%, #0a1628 60%, #0d1f1a 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        minHeight: 380,
      }}
    >
      {[
        { x: '8%',  y: '18%', color: 'rgba(124,58,237,0.18)', size: 220 },
        { x: '72%', y: '12%', color: 'rgba(6,182,212,0.12)',  size: 170 },
        { x: '55%', y: '60%', color: 'rgba(244,114,182,0.12)', size: 190 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y, background: orb.color, filter: 'blur(60px)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-5 z-10"
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            boxShadow: '0 0 50px rgba(124,58,237,0.5)',
          }}
        >
          <Code2 size={38} className="text-white" />
        </div>
      </motion.div>

      <h1
        className="text-3xl font-black text-center mb-2 relative z-10"
        style={{ background: 'linear-gradient(135deg, #c084fc, #22d3ee, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >
        Ready to Code?
      </h1>
      <p className="text-white/50 text-center mb-8 max-w-sm text-sm leading-relaxed z-10">
        Find a partner or go anonymous to solve DSA problems together in real-time.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs z-10">
        <motion.button
          onClick={() => onConnect(false)}
          whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(124,58,237,0.6)' }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          <Video size={16} />
          Find Partner
        </motion.button>

        <motion.button
          onClick={() => onConnect(true)}
          whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(244,114,182,0.35)' }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(244,114,182,0.35)',
            color: '#f472b6',
          }}
        >
          <UserX size={16} />
          Anonymous
        </motion.button>
      </div>

      <div className="flex gap-8 mt-8 z-10">
        {[
          { n: '2,847', label: 'Online',      color: '#4ade80' },
          { n: '12s',   label: 'Avg match',   color: '#22d3ee' },
          { n: '98%',   label: 'Satisfaction', color: '#818cf8' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center gap-0.5">
            <span className="text-base font-black" style={{ color: s.color }}>{s.n}</span>
            <span className="text-xs text-white/35">{s.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Connection Searching ────────────────────────────────────────────────────

function ConnectionSearching({ isAnonymous, onCancel }: { isAnonymous: boolean; onCancel: () => void }) {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center justify-center py-20 rounded-3xl overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0f0622 0%, #050510 100%)',
        border: '1px solid rgba(124,58,237,0.2)',
        minHeight: 380,
      }}
    >
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 80 + i * 80,
            height: 80 + i * 80,
            border: `1.5px solid ${['#7c3aed','#22d3ee','#4ade80','#f472b6'][i]}28`,
          }}
          animate={{ scale: [0.85, 1.12, 0.85], opacity: [0.5, 0.1, 0.5] }}
          transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
        />
      ))}

      <div
        className="relative w-20 h-20 rounded-full flex items-center justify-center text-3xl z-10"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 40px rgba(124,58,237,0.6)' }}
      >
        {isAnonymous ? '👤' : '👨‍💻'}
      </div>

      <div className="mt-7 flex flex-col items-center z-10">
        <p className="text-xl font-black text-white mb-1">
          Searching{dots}
        </p>
        <p className="text-sm text-white/40 mb-6">
          {isAnonymous ? 'Anonymous mode' : 'Finding your perfect match'}
        </p>

        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="px-7 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          Cancel
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Problem Statement Card ───────────────────────────────────────────────────

function ProblemStatement() {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(15,21,46,0.9)',
        border: '1px solid rgba(34,211,238,0.15)',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="px-4 py-3 flex items-start justify-between gap-3 text-left w-full"
        style={{ background: 'rgba(34,211,238,0.06)', borderBottom: expanded ? '1px solid rgba(34,211,238,0.1)' : 'none' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <BookOpen size={14} style={{ color: '#22d3ee' }} />
            <span className="text-sm font-bold text-white">{PROBLEM.title}</span>
            <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: '#4ade8022', color: '#4ade80', border: '1px solid #4ade8030' }}>
              {PROBLEM.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>❤️ {PROBLEM.likes}</span>
            <span>AC: {PROBLEM.acceptance}</span>
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              <p>{PROBLEM.description}</p>

              <div>
                <span className="font-bold text-white text-sm">Examples</span>
                {PROBLEM.examples.map((ex, i) => (
                  <div key={i} className="mt-2 text-xs rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-white/50 mb-0.5">Input: <span className="text-white/80 font-mono">{ex.input}</span></div>
                    <div className="text-white/50 mb-0.5">Output: <span className="text-white/80 font-mono">{ex.output}</span></div>
                    <div style={{ color: 'rgba(255,255,255,0.35)' }}>{ex.explain}</div>
                  </div>
                ))}
              </div>

              <div>
                <span className="font-bold text-white text-sm">Constraints</span>
                <ul className="mt-2 space-y-1">
                  {PROBLEM.constraints.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: '#22d3ee' }}>•</span>
                      <span className="font-mono">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Code Editor Panel ────────────────────────────────────────────────────────

function CodeEditorPanel({
  codeRunState, terminalLines, onRun, onSubmit, showTerminal, onToggleTerminal, elapsed, isRecording,
}: {
  codeRunState: 'idle' | 'running' | 'success';
  terminalLines: typeof TERMINAL_LINES;
  onRun: () => void;
  onSubmit: () => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
  elapsed: number;
  isRecording: boolean;
}) {
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const [language, setLanguage] = useState<'js' | 'python' | 'java' | 'cpp'>('js');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [editableCode, setEditableCode] = useState('');
  const [fontSize, setFontSize] = useState(13);
  const currentCode = CODE_BY_LANGUAGE[language] || CODE_LINES;
  const langOption = LANGUAGE_OPTIONS.find(l => l.id === language)!;

  const getMonacoLanguage = (lang: string) => ({ js: 'javascript', python: 'python', java: 'java', cpp: 'cpp' }[lang] || 'javascript');

  useEffect(() => {
    setEditableCode(currentCode.map(line => line.text).join('\n'));
  }, [currentCode, language]);

  const handleLanguageChange = (newLang: 'js' | 'python' | 'java' | 'cpp') => {
    if (newLang !== language) {
      setLanguage(newLang);
      setShowLangMenu(false);
      setShowCelebration(true);
    }
  };

  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden h-full"
      style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b flex-wrap"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#161b22' }}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5 items-center">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>

        <span className="text-xs text-white/35 font-mono ml-1">solution.js</span>

        {/* Timer */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(34,211,238,0.09)', border: '1px solid rgba(34,211,238,0.2)' }}
        >
          <Clock size={11} style={{ color: '#22d3ee' }} />
          <span className="font-mono" style={{ color: '#22d3ee' }}>{fmt(elapsed)}</span>
        </div>

        {/* Recording badge */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-red-500" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
              <span style={{ color: '#ef4444' }}>REC</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Language selector */}
        <div className="relative">
          <motion.button
            onClick={() => setShowLangMenu(!showLangMenu)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{ background: `${langOption.color}18`, border: `1px solid ${langOption.color}40`, color: langOption.color }}
          >
            <span>{langOption.icon}</span>
            <span>{langOption.name}</span>
            <motion.span animate={{ rotate: showLangMenu ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[10px]">▼</motion.span>
          </motion.button>

          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.14 }}
                className="absolute top-full mt-1 left-0 z-20 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', minWidth: 130 }}
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <motion.button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id as 'js' | 'python' | 'java' | 'cpp')}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-left"
                    style={{ color: lang.id === language ? lang.color : 'rgba(255,255,255,0.55)' }}
                  >
                    <span>{lang.icon}</span>
                    <span>{lang.name}</span>
                    {lang.id === language && <CheckCircle2 size={11} className="ml-auto" />}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Font size */}
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.18)' }}>
          <motion.button
            onClick={() => setFontSize(Math.max(10, fontSize - 1))}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold"
            style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}
          >−</motion.button>
          <motion.span className="text-xs font-bold w-5 text-center" style={{ color: '#818cf8' }} key={fontSize} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
            {fontSize}
          </motion.span>
          <motion.button
            onClick={() => setFontSize(Math.min(22, fontSize + 1))}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold"
            style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}
          >+</motion.button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(192,132,252,0.1)', color: '#c084fc' }}>
          <Eye size={10} />
          Syncing
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden" style={{ background: '#0d1117' }}>
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={editableCode}
          onChange={(value) => setEditableCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: fontSize,
            lineHeight: fontSize + 10,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'gutter',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        />
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#161b22' }}
      >
        <motion.button
          onClick={onToggleTerminal}
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            background: showTerminal ? 'rgba(74,222,128,0.14)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showTerminal ? 'rgba(74,222,128,0.3)' : 'transparent'}`,
            color: showTerminal ? '#4ade80' : 'rgba(255,255,255,0.4)',
          }}
        >
          <Terminal size={12} />
          Console
        </motion.button>

        <div className="flex-1" />

        <motion.button
          onClick={onRun}
          disabled={codeRunState === 'running'}
          whileHover={{ scale: 1.04, boxShadow: '0 0 18px rgba(74,222,128,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{
            background: codeRunState === 'running' ? 'rgba(74,222,128,0.18)' : 'linear-gradient(135deg, #166534, #15803d)',
            color: '#4ade80',
            border: '1px solid #22c55e30',
          }}
        >
          {codeRunState === 'running' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw size={11} />
            </motion.div>
          ) : (
            <Play size={11} />
          )}
          Run
        </motion.button>

        <motion.button
          onClick={onSubmit}
          whileHover={{ scale: 1.04, boxShadow: '0 0 18px rgba(251,191,36,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, #92400e, #b45309)',
            color: '#fbbf24',
            border: '1px solid #fbbf2428',
          }}
        >
          <Trophy size={11} />
          Submit
        </motion.button>
      </div>

      {/* Terminal */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t"
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0a0f1a', maxHeight: 130 }}
          >
            <div className="p-3 font-mono text-xs space-y-0.5 overflow-auto max-h-28">
              <AnimatePresence>
                {terminalLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: line.color }}
                  >
                    {line.text}
                  </motion.div>
                ))}
              </AnimatePresence>
              {codeRunState === 'idle' && terminalLines.length === 0 && (
                <span className="text-white/20">Click Run to execute…</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language change celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            >
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-7xl"
              >
                {langOption.icon}
              </motion.div>
            </motion.div>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{ width: 7, height: 7, background: LANGUAGE_OPTIONS[i % LANGUAGE_OPTIONS.length].color, left: '50%', top: '50%' }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: Math.cos((i / 12) * Math.PI * 2) * 120, y: Math.sin((i / 12) * Math.PI * 2) * 120, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Chat Drawer ──────────────────────────────────────────────────────────────

function ChatDrawer({
  isOpen, onClose, messages, input, onInput, onSend, isMuted, isCameraOff, isRecording, onMute, onCamera, onRecording, onDisconnect,
  codeRunState, terminalLines, onRun, onSubmit, currentStep,
}: {
  isOpen: boolean;
  onClose: () => void;
  messages: typeof INITIAL_CHAT;
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
  isMuted: boolean;
  isCameraOff: boolean;
  isRecording: boolean;
  onMute: () => void;
  onCamera: () => void;
  onRecording: () => void;
  onDisconnect: () => void;
  codeRunState: 'idle' | 'running' | 'success';
  terminalLines: typeof TERMINAL_LINES;
  onRun: () => void;
  onSubmit: () => void;
  currentStep: number;
}) {
  const [showFiles, setShowFiles] = useState(false);
  const [keyboardShareEnabled, setKeyboardShareEnabled] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [language, setLanguage] = useState('js');
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          />

          {/* Main Modal - Omegle Style */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-4 z-50 flex gap-3 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #050510 0%, #0a0d1a 50%, #050e0a 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Left Sidebar: Video Feeds */}
            <div
              className="w-64 flex-shrink-0 flex flex-col gap-3 p-4 border-r"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
                borderColor: 'rgba(255,255,255,0.08)',
                scrollBehavior: 'smooth',
                overflow: 'hidden',
              }}
            >
              <style>{`
                .no-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                  width: 0;
                  height: 0;
                }
              `}</style>
              <div className="overflow-y-auto flex-1 flex flex-col gap-3 no-scrollbar">
                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="self-end flex items-center justify-center rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    background: 'linear-gradient(135deg, rgba(248,113,113,0.3), rgba(239,68,68,0.2))',
                    border: '1px solid rgba(248,113,113,0.4)',
                    boxShadow: '0 4px 12px rgba(248,113,113,0.15)',
                  }}
                >
                  <X size={16} color="#fca5a5" />
                </motion.button>

                {/* You */}
                <motion.div
                  className="flex flex-col gap-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-xs font-bold text-white/60 uppercase tracking-wider">You</div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="rounded-xl overflow-hidden flex items-center justify-center aspect-square relative"
                    style={{
                      background: isCameraOff
                        ? 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))'
                        : 'linear-gradient(135deg, rgba(122,58,237,0.4), rgba(124,58,237,0.2))',
                      border: `2px solid ${isCameraOff ? 'rgba(248,113,113,0.3)' : 'rgba(124,58,237,0.5)'}`,
                      boxShadow: isCameraOff ? 'none' : '0 0 20px rgba(124,58,237,0.2)',
                    }}
                  >
                    <span className="text-5xl">{isCameraOff ? '📹' : '👨‍💻'}</span>

                    {/* Control Buttons Overlay */}
                    <div className="absolute inset-0 flex items-end justify-center p-2 bg-gradient-to-t from-black/80 to-transparent rounded-xl">
                      <div className="flex gap-1.5">
                        <motion.button
                          onClick={onMute}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          className="flex items-center justify-center rounded-lg text-xs font-bold"
                          style={{
                            width: 28,
                            height: 28,
                            background: isMuted
                              ? 'linear-gradient(135deg, rgba(248,113,113,0.6), rgba(239,68,68,0.4))'
                              : 'linear-gradient(135deg, rgba(74,222,128,0.6), rgba(34,197,94,0.4))',
                            border: `1px solid ${isMuted ? 'rgba(248,113,113,0.8)' : 'rgba(74,222,128,0.8)'}`,
                            color: isMuted ? '#fca5a5' : '#86efac',
                          }}
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
                        </motion.button>

                        <motion.button
                          onClick={onCamera}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          className="flex items-center justify-center rounded-lg text-xs font-bold"
                          style={{
                            width: 28,
                            height: 28,
                            background: isCameraOff
                              ? 'linear-gradient(135deg, rgba(248,113,113,0.6), rgba(239,68,68,0.4))'
                              : 'linear-gradient(135deg, rgba(34,211,238,0.6), rgba(6,182,212,0.4))',
                            border: `1px solid ${isCameraOff ? 'rgba(248,113,113,0.8)' : 'rgba(34,211,238,0.8)'}`,
                            color: isCameraOff ? '#fca5a5' : '#a5f3fc',
                          }}
                          title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                        >
                          {isCameraOff ? <VideoOff size={12} /> : <Video size={12} />}
                        </motion.button>

                        <motion.button
                          onClick={onRecording}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          className="flex items-center justify-center rounded-lg text-xs font-bold"
                          style={{
                            width: 28,
                            height: 28,
                            background: isRecording
                              ? 'linear-gradient(135deg, rgba(249,115,22,0.6), rgba(217,119,6,0.4))'
                              : 'linear-gradient(135deg, rgba(192,132,252,0.6), rgba(168,85,247,0.4))',
                            border: `1px solid ${isRecording ? 'rgba(249,115,22,0.8)' : 'rgba(192,132,252,0.8)'}`,
                            color: isRecording ? '#fdba74' : '#d8b4fe',
                          }}
                          title={isRecording ? 'Stop Recording' : 'Start Recording'}
                        >
                          {isRecording ? <MonitorStop size={12} /> : <ScreenShare size={12} />}
                        </motion.button>

                        <motion.button
                          onClick={onDisconnect}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          className="flex items-center justify-center rounded-lg text-xs font-bold"
                          style={{
                            width: 28,
                            height: 28,
                            background: 'linear-gradient(135deg, rgba(248,113,113,0.7), rgba(239,68,68,0.5))',
                            border: '1px solid rgba(248,113,113,0.8)',
                            color: '#fca5a5',
                          }}
                          title="End Call"
                        >
                          <PhoneOff size={12} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-xs text-white/50">Connected</span>
                  </motion.div>
                </motion.div>

                {/* Partner */}
                <motion.div
                  className="flex flex-col gap-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-xs font-bold text-white/60 uppercase tracking-wider">Partner</div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="rounded-xl overflow-hidden flex items-center justify-center aspect-square"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,211,238,0.4), rgba(6,182,212,0.2))',
                      border: '2px solid rgba(34,211,238,0.5)',
                      boxShadow: '0 0 20px rgba(34,211,238,0.2)',
                    }}
                  >
                    <span className="text-5xl">🧑‍💻</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    />
                    <span className="text-xs text-white/50">Active</span>
                  </motion.div>
                </motion.div>

                {/* Divider */}
                <motion.div
                  className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                />

                {/* File Sharing */}
                <motion.button
                  onClick={() => setShowFiles(!showFiles)}
                  whileHover={{ scale: 1.02 }}
                  className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: showFiles
                      ? 'linear-gradient(135deg, rgba(79,200,255,0.25), rgba(34,211,238,0.1))'
                      : 'linear-gradient(135deg, rgba(79,200,255,0.15), rgba(34,211,238,0.05))',
                    border: `1.5px solid ${showFiles ? 'rgba(79,200,255,0.4)' : 'rgba(79,200,255,0.25)'}`,
                    color: '#67e8f9',
                  }}
                >
                  <span>📁</span>
                  <span>Files</span>
                  <span className="ml-auto text-[10px] opacity-50">{showFiles ? '▼' : '▶'}</span>
                </motion.button>

                {/* Keyboard Share Toggle */}
                <motion.button
                  onClick={() => setKeyboardShareEnabled(!keyboardShareEnabled)}
                  whileHover={{ scale: 1.02 }}
                  className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: keyboardShareEnabled
                      ? 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(147,51,234,0.1))'
                      : 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(147,51,234,0.05))',
                    border: `1.5px solid ${keyboardShareEnabled ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.25)'}`,
                    color: '#d8b4fe',
                  }}
                >
                  <span>⌨️</span>
                  <span>Share Input</span>
                  <span className="ml-auto text-[10px] opacity-50">{keyboardShareEnabled ? '✓' : '○'}</span>
                </motion.button>

                {/* Shared Files List */}
                <AnimatePresence>
                  {showFiles && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1.5"
                    >
                      {[
                        { name: 'solution.js', size: '2.4 KB' },
                        { name: 'notes.md', size: '1.8 KB' },
                        { name: 'data.json', size: '4.2 KB' },
                      ].map((file, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ x: 2 }}
                          className="p-2.5 rounded-lg flex items-center gap-2 text-xs"
                          style={{
                            background: 'linear-gradient(135deg, rgba(79,200,255,0.12), rgba(34,211,238,0.05))',
                            border: '1px solid rgba(79,200,255,0.2)',
                          }}
                        >
                          <span>📄</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-white/90 truncate font-medium">{file.name}</div>
                            <div className="text-white/40 text-[8px]">{file.size}</div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            className="text-[10px] opacity-60 hover:opacity-100 transition-opacity"
                            style={{ color: '#67e8f9' }}
                          >
                            ⬇️
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Center: Code Editor (Top) + Output (Bottom) */}
            <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
              {/* Code Editor Section */}
              <div className="flex-1 flex flex-col bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Shared Code Editor</span>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="bg-black/50 text-xs text-white border border-white/10 rounded px-2 py-1"
                  >
                    {LANGUAGE_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    defaultValue={CODE_BY_LANGUAGE[language]?.map(l => l.text).join('\n')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      fontFamily: 'Monaco, monospace',
                    }}
                  />
                </div>
              </div>

              {/* Output Section (Below Code Editor) */}
              <div className="h-40 flex flex-col bg-black/60 rounded-xl border border-white/5 overflow-hidden font-mono">
                <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Output</span>
                  <div className="flex gap-1">
                    <motion.button onClick={onRun} whileHover={{ scale: 1.05 }} className="text-[10px] px-2 py-1 rounded bg-green-600/30 text-green-400">Run</motion.button>
                    <motion.button onClick={onSubmit} whileHover={{ scale: 1.05 }} className="text-[10px] px-2 py-1 rounded bg-cyan-600/30 text-cyan-400">Submit</motion.button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[9px]">
                  {terminalLines.map((line, i) => (
                    <div key={i} style={{ color: line.color || '#e2e8f0' }}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar: Chat */}
            <div className="w-80 flex-shrink-0 flex flex-col bg-gradient-to-b from-black/50 to-black/30 border-l border-white/10 overflow-hidden">
              {/* Header with Profile */}
              <div className="px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
                      <MessageSquare size={16} color="white" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Live Chat</span>
                      <span className="text-[10px] text-white/50">2 online</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>

                {/* Partner Profile Card */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(6,182,212,0.05))',
                    border: '1px solid rgba(34,211,238,0.2)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(6,182,212,0.2))',
                        border: '2px solid rgba(34,211,238,0.5)',
                      }}
                    >
                      🧑‍💻
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white">Alex Chen</div>
                      <div className="text-[10px] text-white/50 flex items-center gap-1">
                        <span>⭐ 4.8 • Level 12</span>
                      </div>
                      <div className="text-[9px] text-green-400 font-semibold">● Active now</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col justify-end">
                <AnimatePresence initial={false}>
                  {messages.map((m, idx) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex gap-2.5 ${m.me ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${m.color}40, ${m.color}20)`,
                          border: `2px solid ${m.color}60`
                        }}
                      >
                        {m.avatar}
                      </div>
                      <div className={`flex flex-col gap-1 max-w-[210px] ${m.me ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold" style={{ color: m.color }}>
                            {m.user}
                          </span>
                          <span className="text-[8px] text-white/40">{m.time}</span>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="px-3 py-2 rounded-xl text-xs text-white leading-relaxed shadow-md backdrop-blur-sm"
                          style={{
                            background: m.me
                              ? `linear-gradient(135deg, ${m.color}40, ${m.color}20)`
                              : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                            border: `1.5px solid ${m.me ? m.color + '50' : 'rgba(255,255,255,0.1)'}`,
                            boxShadow: m.me ? `0 8px 16px ${m.color}20` : '0 4px 12px rgba(0,0,0,0.2)',
                          }}
                        >
                          {m.msg}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Chat Input */}
              <div className="px-3 py-3 border-t border-white/10 bg-black/40 backdrop-blur-sm">
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all focus-within:ring-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(255,255,255,0.05))',
                    border: '1.5px solid rgba(34,211,238,0.3)',
                    boxShadow: '0 4px 12px rgba(34,211,238,0.1)',
                  }}
                >
                  <input
                    value={input}
                    onChange={e => onInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder-white/40 font-medium"
                  />
                  <motion.button
                    onClick={onSend}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg flex-shrink-0 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                      boxShadow: '0 4px 12px rgba(34,211,238,0.3)',
                    }}
                  >
                    <Send size={14} color="white" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Video Call Bar ───────────────────────────────────────────────────────────

function VideoCallBar({
  isAnonymous, isMuted, isCameraOff, isRecording, elapsed, onMute, onCamera, onRecording, onDisconnect,
}: {
  isAnonymous: boolean; isMuted: boolean; isCameraOff: boolean; isRecording: boolean; elapsed: number;
  onMute: () => void; onCamera: () => void; onRecording: () => void; onDisconnect: () => void;
}) {
  const VideoBox = ({ isYou, color }: { isYou: boolean; color: string }) => (
    <div
      className="relative rounded-xl overflow-hidden flex items-center justify-center flex-1"
      style={{
        height: 112,
        background: isCameraOff
          ? 'rgba(0,0,0,0.55)'
          : `linear-gradient(135deg, ${color}22, rgba(0,0,0,0.75))`,
        border: `1px solid ${color}40`,
      }}
    >
      <div className="text-4xl">{isYou ? '👨‍💻' : (isAnonymous ? '👤' : '🧑‍💻')}</div>
      <div
        className="absolute bottom-0 left-0 right-0 px-2 py-1 text-center text-xs font-semibold"
        style={{ background: 'rgba(0,0,0,0.75)', color }}
      >
        {isYou ? 'You' : 'Partner'}
      </div>
      {!isYou && (
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ background: '#4ade80' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      )}
    </div>
  );

  const CtrlBtn = ({ onClick, color, icon, label }: { onClick: () => void; color: string; icon: React.ReactNode; label: string }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg text-xs font-semibold text-xs flex-1"
      style={{ background: `${color}12`, border: `0.5px solid ${color}30`, color }}
    >
      {icon}
      <span className="hidden sm:inline text-[9px]">{label}</span>
    </motion.button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1.5 w-full">
      <div className="flex gap-1.5 w-full">
        <VideoBox isYou color="#7c3aed" />
        <VideoBox isYou={false} color="#22d3ee" />
      </div>

      <div className="flex items-center gap-1 w-full">
        <CtrlBtn onClick={onMute}      color={isMuted    ? '#f87171' : '#4ade80'} icon={isMuted    ? <MicOff size={13} />    : <Mic size={13} />}         label="Mute" />
        <CtrlBtn onClick={onCamera}    color={isCameraOff? '#f87171' : '#22d3ee'} icon={isCameraOff? <VideoOff size={13} />  : <Video size={13} />}       label="Cam"  />
        <CtrlBtn onClick={onRecording} color={isRecording? '#f97316' : '#c084fc'} icon={isRecording? <MonitorStop size={13} />: <ScreenShare size={13} />} label="Rec"  />

        <motion.button
          onClick={onDisconnect}
          whileHover={{ scale: 1.05, boxShadow: '0 0 12px rgba(248,113,113,0.35)' }}
          whileTap={{ scale: 0.92 }}
          className="flex items-center gap-1 px-1.5 py-1 rounded-lg text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', color: '#fca5a5', border: '0.5px solid #f8717128' }}
        >
          <PhoneOff size={10} />
          <span className="hidden sm:inline text-[9px]">End</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Code Summit Celebration ──────────────────────────────────────────────────

function CodeSummitAnimation({ onClose }: { onClose: () => void }) {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: rand(5, 95), y: rand(5, 95),
    size: rand(5, 15),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: rand(0, 360),
    delay: rand(0, 0.6),
    duration: rand(1.5, 3),
  }));

  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm pointer-events-none"
          style={{ width: p.size, height: p.size * 0.6, background: p.color, left: `${p.x}%`, top: `${p.y}%` }}
          initial={{ y: -100, rotate: 0, opacity: 1 }}
          animate={{ y: 200, rotate: p.rotate * 4, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.2, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
        className="relative flex flex-col items-center gap-4 px-10 py-8 rounded-3xl text-center z-10 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0d0621 0%, #0f0c29 50%, #0a1628 100%)',
          border: '1.5px solid rgba(251,191,36,0.4)',
          boxShadow: '0 0 80px rgba(251,191,36,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 0 50px rgba(251,191,36,0.6)' }}
          >
            <Trophy size={48} className="text-white" />
          </div>
        </motion.div>

        <div>
          <motion.h2
            className="text-4xl font-black tracking-wide"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            CODE SUMMIT!
          </motion.h2>
          <p className="text-white/55 mt-1.5 text-sm">Problem solved! 🚀</p>
        </div>

        <div className="flex gap-8">
          {[
            { icon: '⚡', val: 'Fast',      color: '#fbbf24' },
            { icon: '⭐', val: '100/100',   color: '#c084fc' },
            { icon: '🔥', val: 'x4 Streak', color: '#f97316' },
          ].map(s => (
            <div key={s.val} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-sm font-black" style={{ color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>

        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-2.5 rounded-xl font-bold text-sm text-black mt-1"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}
        >
          Continue <ChevronRight size={14} className="inline" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Collaboration Arena ──────────────────────────────────────────────────────

function CollaborationArena({
  isAnonymous, isMuted, isCameraOff, isRecording, codeRunState, terminalLines, chatMessages, chatInput,
  onMute, onCamera, onRecording, onRunCode, onSubmit, onSendChat, onChatInput, onDisconnect, currentStep,
}: {
  isAnonymous: boolean; isMuted: boolean; isCameraOff: boolean; isRecording: boolean;
  codeRunState: 'idle' | 'running' | 'success'; terminalLines: typeof TERMINAL_LINES;
  chatMessages: typeof INITIAL_CHAT; chatInput: string;
  onMute: () => void; onCamera: () => void; onRecording: () => void;
  onRunCode: () => void; onSubmit: () => void; onSendChat: () => void;
  onChatInput: (v: string) => void; onDisconnect: () => void; currentStep: number;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 h-full overflow-hidden">
      {/* Left: Problem statement */}
      <div className="w-60 flex-shrink-0 overflow-y-auto">
        <ProblemStatement />
      </div>

      {/* Center: Code Editor */}
      <div className="flex-1 overflow-hidden min-w-0">
        <CodeEditorPanel
          codeRunState={codeRunState}
          terminalLines={terminalLines}
          onRun={onRunCode}
          onSubmit={onSubmit}
          showTerminal={showTerminal}
          onToggleTerminal={() => setShowTerminal(!showTerminal)}
          elapsed={elapsed}
          isRecording={isRecording}
        />
      </div>

      {/* Right: Steps + Video + Chat */}
      <div className="flex flex-col gap-3 flex-shrink-0 w-64 overflow-y-auto">
        <StepsBar current={currentStep} onStep={() => {}} />

        <VideoCallBar
          isAnonymous={isAnonymous}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isRecording={isRecording}
          elapsed={elapsed}
          onMute={onMute}
          onCamera={onCamera}
          onRecording={onRecording}
          onDisconnect={onDisconnect}
        />

        <div className="flex gap-2 w-full relative">
          <motion.button
            onClick={() => setChatOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
            style={{
              background: 'rgba(244,114,182,0.08)',
              border: '1px solid rgba(244,114,182,0.25)',
            }}
          >
            <MessageSquare size={15} style={{ color: '#f472b6' }} />
            <span style={{ color: '#f472b6' }}>Chat</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
          </motion.button>

          <div className="relative">
            <motion.button
              onClick={() => setMusicOpen(!musicOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: 44,
                height: 44,
                background: musicOpen ? 'rgba(0,230,118,0.25)' : 'rgba(0,230,118,0.12)',
                border: `1px solid ${musicOpen ? 'rgba(0,230,118,0.5)' : 'rgba(0,230,118,0.3)'}`,
              }}
              title="Music Player"
            >
              <Music2 size={18} color="#00e676" />
            </motion.button>

            {/* Music Player Popup */}
            <AnimatePresence>
              {musicOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="fixed rounded-2xl overflow-hidden"
                  style={{
                    width: 300,
                    background: 'linear-gradient(160deg, #0e1f2e 0%, #081420 100%)',
                    border: '1px solid rgba(0,230,118,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(0,230,118,0.15)',
                    zIndex: 99999,
                    bottom: '65px',
                    right: '12px',
                  }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid rgba(0,230,118,0.1)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Music2 size={14} color="#00e676" />
                      <span className="text-xs font-bold text-white">MUSIC</span>
                    </div>
                    <motion.button
                      onClick={() => setMusicOpen(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ color: '#b1bad3' }}
                    >
                      <X size={12} />
                    </motion.button>
                  </div>

                  {/* Music List */}
                  <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                    {[
                      { id: 1, title: 'Casino Royale Vibes', artist: 'Lo-Fi Beats' },
                      { id: 2, title: 'Lucky Night Chill', artist: 'Ambient Sounds' },
                      { id: 3, title: 'High Roller Mix', artist: 'Deep House' },
                      { id: 4, title: 'Vegas Nights', artist: 'Electronic Beats' },
                      { id: 5, title: 'Neon Dreams', artist: 'Synthwave' },
                      { id: 6, title: 'Midnight Jazz', artist: 'Smooth Jazz' },
                    ].map((track, idx) => (
                      <motion.button
                        key={track.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors"
                        style={{
                          background: idx === 0 ? 'rgba(0,230,118,0.1)' : 'rgba(0,230,118,0.02)',
                          border: `0.5px solid ${idx === 0 ? 'rgba(0,230,118,0.3)' : 'rgba(0,230,118,0.1)'}`,
                        }}
                        whileHover={{ backgroundColor: 'rgba(0,230,118,0.15)' }}
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(0,230,118,0.1)' }}
                        >
                          <Play size={12} color="#00e676" fill="#00e676" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{track.title}</div>
                          <div className="text-[9px] text-white/50 truncate">{track.artist}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        input={chatInput}
        onInput={onChatInput}
        onSend={onSendChat}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        isRecording={isRecording}
        onMute={onMute}
        onCamera={onCamera}
        onRecording={onRecording}
        onDisconnect={onDisconnect}
        codeRunState={codeRunState}
        terminalLines={terminalLines}
        onRun={onRunCode}
        onSubmit={onSubmit}
        currentStep={currentStep}
      />
    </motion.div>
  );
}

// ─── Page Root ────────────────────────────────────────────────────────────────

function CodingPracticeContent() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const initialStep = stepParam ? parseInt(stepParam, 10) : 4;

  const [connectionState, setConnectionState] = useState<'idle' | 'searching' | 'connected'>('idle');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [codeRunState, setCodeRunState] = useState<'idle' | 'running' | 'success'>('idle');
  const [terminalLines, setTerminalLines] = useState<typeof TERMINAL_LINES>([]);
  const [showSummit, setShowSummit] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleConnect = useCallback((anon: boolean) => {
    setIsAnonymous(anon);
    setConnectionState('searching');
    searchTimer.current = setTimeout(() => setConnectionState('connected'), 3000);
  }, []);

  const handleRunCode = useCallback(() => {
    if (codeRunState === 'running') return;
    setCodeRunState('running');
    setTerminalLines([]);
    let i = 0;
    runInterval.current = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        setTerminalLines(prev => [...prev, TERMINAL_LINES[i]]);
        i++;
      } else {
        if (runInterval.current) clearInterval(runInterval.current);
        setCodeRunState('success');
      }
    }, 300);
  }, [codeRunState]);

  const handleSubmit = useCallback(() => { setShowSummit(true); }, []);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setChatMessages(prev => [...prev, { id: Date.now(), user: 'You', avatar: '👨‍💻', msg: chatInput.trim(), time, me: true, color: '#00e676' }]);
    setChatInput('');
  }, [chatInput]);

  const handleDisconnect = useCallback(() => {
    setConnectionState('idle');
    setTerminalLines([]);
    setCodeRunState('idle');
    if (runInterval.current) clearInterval(runInterval.current);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      if (runInterval.current) clearInterval(runInterval.current);
    };
  }, []);

  // Auto-connect when step parameter is provided - skip searching state
  useEffect(() => {
    if (stepParam && connectionState === 'idle') {
      setConnectionState('connected');
      setIsAnonymous(true);
    }
  }, [stepParam]);

  return (
    <div
      className="flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #050510 0%, #0a0d1a 50%, #050e0a 100%)',
        height: 'calc(100vh - 3.5rem)',
        padding: '0.75rem',
      }}
    >
      {connectionState !== 'connected' && (
        <div className="mb-3">
          <StepsBar current={currentStep} onStep={setCurrentStep} />
        </div>
      )}

      <div className="flex-1 overflow-auto min-h-0">
        <AnimatePresence mode="wait">
          {connectionState === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <ConnectionIdle onConnect={handleConnect} />
            </motion.div>
          )}

          {connectionState === 'searching' && (
            <motion.div key="searching" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}>
              <ConnectionSearching isAnonymous={isAnonymous} onCancel={() => { setConnectionState('idle'); if (searchTimer.current) clearTimeout(searchTimer.current); }} />
            </motion.div>
          )}

          {connectionState === 'connected' && (
            <motion.div key="connected" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="h-full overflow-hidden" style={{ height: 'calc(100vh - 3.5rem - 1.5rem)' }}>
              <CollaborationArena
                isAnonymous={isAnonymous}
                isMuted={isMuted}
                isCameraOff={isCameraOff}
                isRecording={isRecording}
                codeRunState={codeRunState}
                terminalLines={terminalLines}
                chatMessages={chatMessages}
                chatInput={chatInput}
                currentStep={currentStep}
                onMute={() => setIsMuted(m => !m)}
                onCamera={() => setIsCameraOff(c => !c)}
                onRecording={() => setIsRecording(r => !r)}
                onRunCode={handleRunCode}
                onSubmit={handleSubmit}
                onSendChat={handleSendChat}
                onChatInput={setChatInput}
                onDisconnect={handleDisconnect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSummit && <CodeSummitAnimation onClose={() => setShowSummit(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default function CodingPracticePage() {
  return (
    <PageShell>
      <CodingPracticeContent />
    </PageShell>
  );
}
