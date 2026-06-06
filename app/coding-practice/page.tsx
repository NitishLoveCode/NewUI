'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Play, Video, VideoOff, Mic, MicOff, MessageSquare,
  Send, Trophy, Zap, UserX, Wifi, Terminal, ScreenShare,
  Clock, CheckCircle2, Flame, Star, MonitorStop, PhoneOff,
  RefreshCw, ChevronRight, Cpu, Eye, Globe, Shield, X,
  ChevronDown, BookOpen, Music2, Users, AlignLeft, SkipBack, SkipForward, Volume2,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
  setActiveProblemNumber,
  type GameQuestionStep,
} from '@/stores/codingPractice/activeStepSlice';
import { useGetDsaQuestionsQuery } from '@/stores/api';

type SupportedLanguage = 'js' | 'python' | 'java' | 'cpp';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

// ─── Data ───────────────────────────────────────────────────────────────────



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
] as const;

const FALLBACK_LANGUAGE_OPTIONS = [...LANGUAGE_OPTIONS];

const normalizeLanguage = (language: string | null | undefined): SupportedLanguage | null => {
  const value = language?.toLowerCase();
  if (value === 'js' || value === 'javascript') return 'js';
  if (value === 'python' || value === 'py') return 'python';
  if (value === 'java') return 'java';
  if (value === 'cpp' || value === 'c++') return 'cpp';
  return null;
};

const getMonacoLanguage = (language: SupportedLanguage) =>
  ({ js: 'javascript', python: 'python', java: 'java', cpp: 'cpp' }[language]);

const getEditorFileName = (language: SupportedLanguage) =>
  ({ js: 'solution.js', python: 'solution.py', java: 'Main.java', cpp: 'solution.cpp' }[language]);

const toTitleCase = (value: string | null | undefined) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

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

// Cycling color palette used when steps come from the API
const STEP_PALETTE: { color: string; glow: string }[] = [
  { color: '#f97316', glow: 'rgba(249,115,22,0.5)'  },
  { color: '#eab308', glow: 'rgba(234,179,8,0.5)'   },
  { color: '#4ade80', glow: 'rgba(74,222,128,0.5)'  },
  { color: '#22d3ee', glow: 'rgba(34,211,238,0.6)'  },
  { color: '#818cf8', glow: 'rgba(129,140,248,0.5)' },
  { color: '#c084fc', glow: 'rgba(192,132,252,0.5)' },
  { color: '#f472b6', glow: 'rgba(244,114,182,0.5)' },
  { color: '#fb7185', glow: 'rgba(251,113,133,0.5)' },
];
const getStepStyle = (stepNum: number) => STEP_PALETTE[(stepNum - 1) % STEP_PALETTE.length];

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

function StepsBar() {
  const dispatch = useAppDispatch();
  const steps = useAppSelector(s => s.activeStep.gameSteps);
  const currentQuestionId = useAppSelector(s => s.activeStep.activeProblemNumber);
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
  const ROWS = useMemo<GameQuestionStep[][]>(() => {
    const result: GameQuestionStep[][] = [];
    for (let i = 0; i < sortedSteps.length; i += cols) {
      const chunk = sortedSteps.slice(i, i + cols);
      const rowIndex = result.length;
      result.push(rowIndex % 2 === 1 ? [...chunk].reverse() : chunk);
    }
    return result;
  }, [sortedSteps, cols]);

  // Current step number (1..N) derived from the active question id
  const currentStepNum = useMemo(() => {
    const match = sortedSteps.find(s => s.question_id === currentQuestionId);
    return match?.question_step_number ?? null;
  }, [sortedSteps, currentQuestionId]);

  const handleStepClick = (item: GameQuestionStep) => {

    console.log("hello ia m itsm", item)
    
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(item.question_step_number)) next.delete(item.question_step_number);
      else next.add(item.question_step_number);
      return next;
    });
    dispatch(setActiveProblemNumber({ activeProblemNumber: item.question_id }));
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
            {completedSteps.size}<span className="text-white/30 font-normal">/{total}</span>
          </span>
        </motion.div>

        {/* Zig-zag animation path */}
        <div>
          {ROWS.map((row, rowIndex) => {
            const isReverse = rowIndex % 2 === 1;

            return (
              <Fragment key={rowIndex}>
                {/* Row of nodes */}
                <div className="flex items-start">
                  {row.map((item, colIndex) => {
                    const stepNum = item.question_step_number;
                    const qId = item.question_id;
                    const style = getStepStyle(stepNum);
                    const isLastInRow = colIndex === row.length - 1;
                    const adjacentStep = isReverse ? stepNum - 1 : stepNum + 1;
                    const bDelay = nodeDelayFunc(Math.max(stepNum, adjacentStep)) + 0.08;
                    const isDone = completedSteps.has(stepNum);
                    const isCurrent = stepNum === currentStepNum;

                    return (
                      <Fragment key={qId}>
                        <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                          <div
                            className="cursor-pointer"
                            onClick={() => handleStepClick(item)}
                          >
                            <AnimatePresence mode="wait">
                              {isDone ? (
                                <CompletedStepBadge key="done" step={stepNum} />
                              ) : (
                                <motion.div
                                  key="normal"
                                  className="relative w-11 h-11 rounded-full flex items-center justify-center"
                                  style={{
                                    background: isCurrent
                                      ? `linear-gradient(135deg, ${style.color}bb, ${style.color}77)`
                                      : 'linear-gradient(145deg, #1c3350 0%, #0d1f30 100%)',
                                    border: `2.5px solid ${style.color}`,
                                    boxShadow: isCurrent
                                      ? `0 0 18px ${style.glow}, inset 0 1px 0 rgba(255,255,255,0.14)`
                                      : `0 0 18px ${style.glow}44, inset 0 1px 0 rgba(255,255,255,0.14)`,
                                  }}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.12 } }}
                                  transition={{ delay: nodeDelayFunc(stepNum), type: 'spring', stiffness: 440, damping: 16 }}
                                  whileHover={{ scale: 1.12 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <span className="text-sm font-black select-none" style={{ color: style.color }}>
                                    {stepNum}
                                  </span>
                                  {isCurrent && (
                                    <motion.div
                                      className="absolute rounded-full pointer-events-none"
                                      style={{ inset: -6, border: `2px solid ${style.color}` }}
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
                              color: isDone ? '#4ade80' : isCurrent ? style.color : `${style.color}70`,
                              width: 44,
                              display: 'block',
                              letterSpacing: '0.06em',
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: nodeDelayFunc(stepNum) + 0.22 }}
                          >
                            Q{stepNum}
                          </motion.span>
                        </div>

                        {/* Connecting bar */}
                        {!isLastInRow && (() => {
                          const barIsComplete = completedSteps.has(stepNum) && completedSteps.has(adjacentStep);
                          return (
                            <div className="flex-1 relative" style={{ paddingTop: 16 }}>
                              <div
                                className="h-[11px] w-full rounded-sm"
                                style={{ background: barIsComplete ? '#4ade8020' : `${style.color}12` }}
                              />
                              <motion.div
                                className="absolute left-0 right-0 h-[11px] rounded-sm"
                                style={{
                                  top: 16,
                                  background: barIsComplete
                                    ? `linear-gradient(90deg, #4ade80, #4ade8099)`
                                    : `linear-gradient(90deg, ${style.color}, ${style.color}bb)`,
                                  boxShadow: barIsComplete
                                    ? `0 0 12px #4ade8066, 0 2px 6px rgba(0,0,0,0.45)`
                                    : `0 0 12px ${style.color}66, 0 2px 6px rgba(0,0,0,0.45)`,
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
                {rowIndex < ROWS.length - 1 && (() => {
                  const isRight = rowIndex % 2 === 0;
                  const currentRow = ROWS[rowIndex];
                  const nextRow = ROWS[rowIndex + 1];
                  const currentStepNumber = isRight
                    ? currentRow[currentRow.length - 1].question_step_number
                    : currentRow[0].question_step_number;
                  const nextStepNumber = isRight
                    ? nextRow[nextRow.length - 1].question_step_number
                    : nextRow[0].question_step_number;
                  const connDelay = nodeDelayFunc(Math.max(currentStepNumber, nextStepNumber)) + 0.08;
                  const verticalIsComplete =
                    completedSteps.has(currentStepNumber) && completedSteps.has(nextStepNumber);
                  const cStyle = getStepStyle(currentStepNumber);

                  return (
                    <div
                      className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}
                      style={{ height: 26 }}
                    >
                      <div className="relative" style={{ width: 44 }}>
                        <div
                          className="absolute rounded-sm"
                          style={{ left: '50%', transform: 'translateX(-50%)', width: 11, top: 0, bottom: 0, background: verticalIsComplete ? '#4ade8020' : `${cStyle.color}12` }}
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
                              : `linear-gradient(180deg, ${cStyle.color}, ${cStyle.color}bb)`,
                            boxShadow: verticalIsComplete
                              ? `0 0 12px #4ade8066`
                              : `0 0 12px ${cStyle.color}66`,
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

        {total === 0 && (
          <p className="text-center text-[11px] py-6 text-white/40">
            No steps available
          </p>
        )}

        {/* Footer info */}
        <motion.p
          className="text-center text-[10px] mt-6 font-medium tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.18)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: nodeDelayFunc(Math.max(total, 1)) + 0.45 }}
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
  const activeProblemNumber = useAppSelector(s => s.activeStep.activeProblemNumber);
  const questionId = activeProblemNumber?.toString() ?? null;
  const { data: questionData } = useGetDsaQuestionsQuery(questionId!, {
    skip: !questionId,
  });
  const problem = questionData?.question?.[0];
  const solutions = questionData?.solutions ?? [];
  const problemTitle = problem?.title ?? PROBLEM.title;
  const difficulty = toTitleCase(problem?.difficulty) || PROBLEM.difficulty;
  const statementHtml = problem?.statement?.trim();
  const metaPrimary = problem ? `Question #${problem.id}` : `❤️ ${PROBLEM.likes}`;
  const metaSecondary = problem
    ? problem.is_premium
      ? 'Premium'
      : 'Free'
    : `AC: ${PROBLEM.acceptance}`;

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
            <span className="text-sm font-bold text-white">{problemTitle}</span>
            <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: '#4ade8022', color: '#4ade80', border: '1px solid #4ade8030' }}>
              {difficulty}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>{metaPrimary}</span>
            <span>{metaSecondary}</span>
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
            <div className="px-4 py-4 space-y-3 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)'}}>
              {statementHtml ? (
                <div
                  className="prose prose-invert prose-sm max-w-none [&_pre]:whitespace-pre-wrap [&_pre]:rounded-lg [&_pre]:bg-white/5 [&_pre]:p-3 [&_.text-black]:text-white [&_.text-gray-300]:text-white/80 [&_.text-gray-400]:text-white/65 [&_.border-gray-200]:border-white/10 [&_.border-gray-400]:border-white/10"
                  dangerouslySetInnerHTML={{ __html: statementHtml }}
                />
              ) : (
                <>
                  <p>{problem?.description ?? PROBLEM.description}</p>

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
                </>
              )}

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Code2 size={14} style={{ color: '#22d3ee' }} />
                  <span className="font-bold text-white text-sm">Solutions</span>
                </div>

                {solutions.length > 0 ? (
                  <div className="space-y-3">
                    {solutions.map((solution) => (
                      <div
                        key={solution.id}
                        className="rounded-xl p-3"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{solution.language_label}</span>
                          {solution.is_default && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
                              style={{
                                background: 'rgba(34,211,238,0.12)',
                                border: '1px solid rgba(34,211,238,0.25)',
                                color: '#22d3ee',
                              }}
                            >
                              Default
                            </span>
                          )}
                        </div>

                        <pre
                          className="overflow-x-auto rounded-lg p-3 text-[11px] leading-relaxed text-white/85"
                          style={{
                            background: 'rgba(10,15,26,0.85)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <code>{solution.solution_code}</code>
                        </pre>

                        {(solution.explanation || solution.time_complexity || solution.space_complexity) && (
                          <div className="mt-3 space-y-1 text-[11px] text-white/60">
                            {solution.explanation && <p>{solution.explanation}</p>}
                            {solution.time_complexity && <p>Time: {solution.time_complexity}</p>}
                            {solution.space_complexity && <p>Space: {solution.space_complexity}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40">No solutions available for this question yet.</p>
                )}
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
  onRun: (payload: { code: string; language: SupportedLanguage }) => void;
  onSubmit: () => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
  elapsed: number;
  isRecording: boolean;
}) {
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const activeProblemNumber = useAppSelector(s => s.activeStep.activeProblemNumber);
  const questionId = activeProblemNumber?.toString() ?? null;
  const { data: questionData } = useGetDsaQuestionsQuery(questionId!, {
    skip: !questionId,
  });
  const [language, setLanguage] = useState<SupportedLanguage>('js');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [editableCode, setEditableCode] = useState('');
  const [fontSize, setFontSize] = useState(13);
  const starterCodes = questionData?.starterCode ?? [];
  const solutions = questionData?.solutions ?? [];
  const availableLanguages = useMemo(() => {
    const seen = new Set<SupportedLanguage>();
    const fromApi = [...starterCodes, ...solutions]
      .map((item) => normalizeLanguage(item.language))
      .filter((item): item is SupportedLanguage => Boolean(item))
      .filter((item) => {
        if (seen.has(item)) return false;
        seen.add(item);
        return true;
      })
      .map((id) => FALLBACK_LANGUAGE_OPTIONS.find((option) => option.id === id))
      .filter((option): option is (typeof FALLBACK_LANGUAGE_OPTIONS)[number] => Boolean(option));

    return fromApi.length ? fromApi : FALLBACK_LANGUAGE_OPTIONS;
  }, [starterCodes, solutions]);
  const langOption = availableLanguages.find((item) => item.id === language) ?? availableLanguages[0];
  const starterCodeEntry = starterCodes.find((item) => normalizeLanguage(item.language) === language)
    ?? starterCodes.find((item) => item.is_default)
    ?? starterCodes[0];
  const solutionEntry = solutions.find((item) => normalizeLanguage(item.language) === language)
    ?? solutions.find((item) => item.is_default)
    ?? solutions[0];
  const codeTemplate = starterCodeEntry?.starter_code
    ?? solutionEntry?.solution_code
    ?? (CODE_BY_LANGUAGE[language] || CODE_LINES).map(line => line.text).join('\n');

  const defaultLanguage = useMemo(
    () =>
      normalizeLanguage(
        starterCodes.find((item) => item.is_default)?.language
        ?? solutions.find((item) => item.is_default)?.language
        ?? availableLanguages[0]?.id
      ) ?? 'js',
    [availableLanguages, solutions, starterCodes]
  );

  useEffect(() => {
    setLanguage(defaultLanguage);
  }, [defaultLanguage, questionId]);

  useEffect(() => {
    if (!availableLanguages.some((item) => item.id === language)) {
      setLanguage(defaultLanguage);
    }
  }, [availableLanguages, defaultLanguage, language]);

  useEffect(() => {
    setEditableCode(codeTemplate);
  }, [codeTemplate, language, questionId]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
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

  <span className="text-xs text-white/35 font-mono ml-1">{getEditorFileName(langOption.id)}</span>

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
                {availableLanguages.map((lang) => (
                  <motion.button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
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
          onClick={() => onRun({ code: editableCode, language })}
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
  onRun: (payload: { code: string; language: SupportedLanguage }) => void;
  onSubmit: () => void;
  currentStep: number;
}) {
  const [showFiles, setShowFiles] = useState(false);
  const [keyboardShareEnabled, setKeyboardShareEnabled] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const questionId = currentStep ? currentStep.toString() : null;
  const { data: questionData } = useGetDsaQuestionsQuery(questionId!, {
    skip: !questionId,
  });
  const [language, setLanguage] = useState<SupportedLanguage>('js');
  const bottomRef = useRef<HTMLDivElement>(null);
  const starterCodes = questionData?.starterCode ?? [];
  const solutions = questionData?.solutions ?? [];
  const availableLanguages = useMemo(() => {
    const seen = new Set<SupportedLanguage>();
    const fromApi = [...starterCodes, ...solutions]
      .map((item) => normalizeLanguage(item.language))
      .filter((item): item is SupportedLanguage => Boolean(item))
      .filter((item) => {
        if (seen.has(item)) return false;
        seen.add(item);
        return true;
      })
      .map((id) => FALLBACK_LANGUAGE_OPTIONS.find((option) => option.id === id))
      .filter((option): option is (typeof FALLBACK_LANGUAGE_OPTIONS)[number] => Boolean(option));

    return fromApi.length ? fromApi : FALLBACK_LANGUAGE_OPTIONS;
  }, [starterCodes, solutions]);
  const currentDrawerCode = (
    starterCodes.find((item) => normalizeLanguage(item.language) === language)?.starter_code
    ?? starterCodes.find((item) => item.is_default)?.starter_code
    ?? solutions.find((item) => normalizeLanguage(item.language) === language)?.solution_code
    ?? solutions.find((item) => item.is_default)?.solution_code
    ?? CODE_BY_LANGUAGE[language]?.map(l => l.text).join('\n')
  );

  const defaultLanguage = useMemo(
    () =>
      normalizeLanguage(
        starterCodes.find((item) => item.is_default)?.language
        ?? solutions.find((item) => item.is_default)?.language
        ?? availableLanguages[0]?.id
      ) ?? 'js',
    [availableLanguages, solutions, starterCodes]
  );

  useEffect(() => {
    setLanguage(defaultLanguage);
  }, [defaultLanguage, questionId]);

  useEffect(() => {
    if (!availableLanguages.some((item) => item.id === language)) {
      setLanguage(defaultLanguage);
    }
  }, [availableLanguages, defaultLanguage, language]);

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
                overflow: 'hidden',
              }}
            >
              <div className="flex flex-col gap-2">
                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="self-start flex items-center justify-center rounded-full"
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
                  className="flex flex-col gap-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
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
                    <span className="text-3xl">{isCameraOff ? '📹' : '👨‍💻'}</span>

                    {/* Label - Top */}
                    <div className="absolute top-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-b from-black/60 to-transparent">
                      <div className="text-xs font-bold text-white/80 uppercase tracking-wider">You</div>
                    </div>

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
                  className="flex flex-col gap-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="rounded-xl overflow-hidden flex items-center justify-center aspect-square relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,211,238,0.4), rgba(6,182,212,0.2))',
                      border: '2px solid rgba(34,211,238,0.5)',
                      boxShadow: '0 0 20px rgba(34,211,238,0.2)',
                    }}
                  >
                    <span className="text-3xl">🧑‍💻</span>

                    {/* Label - Top */}
                    <div className="absolute top-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-b from-black/60 to-transparent">
                      <div className="text-xs font-bold text-white/80 uppercase tracking-wider">Partner</div>
                    </div>
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
                  className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                />
              </div>
            </div>

            {/* Center: Code Editor (Top) + Output (Bottom) */}
            <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
              {/* Code Editor Section */}
              <motion.div
                className="flex-1 flex flex-col rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
                  border: '1px solid rgba(88,166,255,0.2)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Editor Header */}
                <div
                  className="px-4 py-3 border-b flex items-center justify-between flex-wrap gap-3"
                  style={{
                    borderColor: 'rgba(88,166,255,0.15)',
                    background: 'rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Traffic Lights */}
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                      <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    </div>
                    <span className="text-xs text-blue-300 font-mono">{getEditorFileName(language)}</span>
                  </div>
                  <div className="text-xs text-blue-300 font-semibold">Syncing...</div>
                </div>

                {/* Language Selector */}
                <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'rgba(88,166,255,0.15)' }}>
                  <span className="text-xs text-blue-300 font-semibold">Language:</span>
                  <select
                    value={language}
                    onChange={(e) => {
                      const nextLanguage = normalizeLanguage(e.target.value) ?? 'js';
                      setLanguage(nextLanguage);
                    }}
                    className="text-xs font-semibold py-1 px-2 rounded border transition-all"
                    style={{
                      background: 'rgba(30,41,59,0.8)',
                      borderColor: 'rgba(88,166,255,0.3)',
                      color: '#93c5fd',
                    }}
                  >
                    {availableLanguages.map(l => (
                      <option key={l.id} value={l.id} style={{ background: '#0d1117', color: 'white' }}>
                        {l.icon} {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    language={getMonacoLanguage(language)}
                    theme="vs-dark"
                    value={currentDrawerCode}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      fontFamily: "'Fira Code', 'Monaco', monospace",
                      scrollBeyondLastLine: false,
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                </div>
              </motion.div>

              {/* Output Section */}
              <motion.div
                className="h-40 flex flex-col rounded-xl overflow-hidden font-mono"
                style={{
                  background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
                  border: '1px solid rgba(74,222,128,0.2)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Output Header */}
                <div
                  className="px-4 py-3 border-b flex items-center justify-between flex-wrap gap-2"
                  style={{
                    borderColor: 'rgba(74,222,128,0.15)',
                    background: 'rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-xs font-semibold text-green-300">Output</span>
                  </div>
                  <div className="flex gap-1.5">
                    <motion.button
                      onClick={() => onRun({ code: currentDrawerCode, language })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs px-3 py-1.5 rounded font-semibold border transition-all"
                      style={{
                        background: 'rgba(74,222,128,0.15)',
                        borderColor: 'rgba(74,222,128,0.4)',
                        color: '#86efac',
                      }}
                    >
                      Run
                    </motion.button>
                    <motion.button
                      onClick={onSubmit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs px-3 py-1.5 rounded font-semibold border transition-all"
                      style={{
                        background: 'rgba(251,191,36,0.15)',
                        borderColor: 'rgba(251,191,36,0.4)',
                        color: '#fbbf24',
                      }}
                    >
                      Submit
                    </motion.button>
                  </div>
                </div>

                {/* Output Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-0.5 text-xs">
                  <AnimatePresence initial={false}>
                    {terminalLines.length === 0 ? (
                      <div className="text-white/40 py-2">$ Ready to run code...</div>
                    ) : (
                      terminalLines.map((line, i) => (
                        <motion.div
                          key={`${i}-${line.text}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ color: line.color || '#e2e8f0' }}
                        >
                          {line.text}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Right Sidebar: Chat */}
            <motion.div
              className="w-80 flex-shrink-0 flex flex-col border-l overflow-hidden"
              style={{
                borderColor: 'rgba(88,166,255,0.15)',
                background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
                height: '100%',
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <style>{`
                .chat-scrollable {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .chat-scrollable::-webkit-scrollbar {
                  display: none;
                  width: 0;
                  height: 0;
                }
              `}</style>

              {/* Header with Profile */}
              <div
                className="px-4 py-4 border-b flex-shrink-0"
                style={{
                  borderColor: 'rgba(88,166,255,0.15)',
                  background: 'linear-gradient(180deg, rgba(88,166,255,0.08), transparent)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)' }}>
                      <MessageSquare size={16} color="white" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Live Chat</span>
                      <span className="text-[10px] text-white/50">2 online</span>
                    </div>
                  </div>
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#4ade80' }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>

                {/* Partner Profile Card */}
                <motion.div
                  className="p-3 rounded-lg border"
                  style={{
                    background: 'rgba(30,58,138,0.2)',
                    borderColor: 'rgba(59,130,246,0.3)',
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(29,78,216,0.2))',
                        border: '1.5px solid rgba(59,130,246,0.4)',
                      }}
                    >
                      🧑‍💻
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white">Alex Chen</div>
                      <div className="text-[9px] text-blue-300 flex items-center gap-1">
                        <span>⭐ 4.8 • Level 12</span>
                      </div>
                      <div className="text-[8px] text-green-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Active now
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Chat Messages - Scrollable */}
              <div className="flex-1 overflow-y-scroll min-h-0 p-3 space-y-3 flex flex-col justify-end chat-scrollable" style={{ scrollBehavior: 'smooth' }}>
                <AnimatePresence initial={false}>
                  {messages.map((m, idx) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex gap-2 flex-shrink-0 ${m.me ? 'flex-row-reverse' : ''}`}
                    >
                      <motion.div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{
                          background: `${m.color}20`,
                          border: `1.5px solid ${m.color}60`,
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {m.avatar}
                      </motion.div>
                      <div className={`flex flex-col gap-1 max-w-[200px] flex-shrink-0 ${m.me ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 px-2">
                          <span className="text-[10px] font-bold" style={{ color: m.color }}>
                            {m.user}
                          </span>
                          <span className="text-[7px] text-white/40">{m.time}</span>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="px-3 py-2 rounded-lg text-xs leading-relaxed break-words"
                          style={{
                            background: m.me
                              ? `${m.color}20`
                              : 'rgba(255,255,255,0.08)',
                            border: `1px solid ${m.me ? m.color + '30' : 'rgba(255,255,255,0.1)'}`,
                            color: m.me ? m.color : '#e2e8f0',
                          }}
                        >
                          {m.msg}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={bottomRef} className="flex-shrink-0" />
              </div>

              {/* AI Suggestions (Optional) */}
              <motion.div
                className="px-3 py-2 border-t text-[9px] text-white/50 flex-shrink-0"
                style={{ borderColor: 'rgba(88,166,255,0.1)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px]">✨ AI Typing...</span>
                  <motion.div
                    className="flex gap-1"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Chat Input */}
              <div className="px-3 py-3 border-t flex-shrink-0" style={{ borderColor: 'rgba(88,166,255,0.15)' }}>
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all focus-within:border-blue-400/60"
                  style={{
                    background: 'rgba(30,41,59,0.5)',
                    borderColor: 'rgba(88,166,255,0.2)',
                  }}
                >
                  <input
                    value={input}
                    onChange={e => onInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSend()}
                    placeholder="Type message..."
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder-white/40 font-medium"
                  />
                  <motion.button
                    onClick={onSend}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg flex-shrink-0 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                      boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                    }}
                  >
                    <Send size={12} color="white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
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
  onRunCode: (payload: { code: string; language: SupportedLanguage }) => void; onSubmit: () => void; onSendChat: () => void;
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
      <div className="w-80 flex-shrink-0 overflow-y-auto">
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
        <StepsBar />

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
  const dispatch = useAppDispatch();
  const activeProblemNumber = useAppSelector(s => s.activeStep.activeProblemNumber);

  const [stepParam, setStepParam] = useState<string | null>(null);

  // Read ?step= on mount (backward-compat with old URLs) and push into redux
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sp = params.get('step');
    setStepParam(sp);
    if (sp && !activeProblemNumber) {
      const parsed = parseInt(sp, 10);
      if (!Number.isNaN(parsed)) {
        dispatch(setActiveProblemNumber({ activeProblemNumber: parsed }));
      }
    }
  }, [dispatch, activeProblemNumber]);

  const currentStep = activeProblemNumber ?? 0;
  const [connectionState, setConnectionState] = useState<'idle' | 'searching' | 'connected'>('connected');
  const [isAnonymous, setIsAnonymous] = useState(false);
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

  const handleRunCode = useCallback(async (payload: { code: string; language: SupportedLanguage }) => {
    if (codeRunState === 'running') return;
    setCodeRunState('running');
    setTerminalLines([{ text: `> Running ${payload.language}…`, color: '#94a3b8' }]);

    try {
      const response = await fetch('/api/v1/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: payload.language, code: payload.code }),
      });

      const data = await response.json();

      const lines: { text: string; color: string }[] = [];

      if (!response.ok) {
        lines.push({ text: `✗ ${data?.error ?? 'Failed to run code.'}`, color: '#f87171' });
        setTerminalLines(prev => [...prev, ...lines]);
        setCodeRunState('idle');
        return;
      }

      const compileStderr: string = data?.compile?.stderr ?? '';
      const runStdout: string = data?.run?.stdout ?? '';
      const runStderr: string = data?.run?.stderr ?? '';
      const exitCode: number | null = data?.run?.code ?? null;

      if (compileStderr.trim()) {
        lines.push({ text: '── Compile errors ──', color: '#334155' });
        compileStderr.split('\n').forEach(l => l && lines.push({ text: l, color: '#f87171' }));
      }

      if (runStdout.trim()) {
        lines.push({ text: '── Output ──', color: '#334155' });
        runStdout.split('\n').forEach(l => lines.push({ text: l, color: '#e2e8f0' }));
      }

      if (runStderr.trim()) {
        lines.push({ text: '── Stderr ──', color: '#334155' });
        runStderr.split('\n').forEach(l => l && lines.push({ text: l, color: '#f87171' }));
      }

      if (lines.length === 0) {
        lines.push({ text: '(no output)', color: '#64748b' });
      }

      lines.push({ text: '──────────────────────────────────', color: '#334155' });
      const passed = exitCode === 0 && !runStderr.trim() && !compileStderr.trim();
      lines.push({
        text: passed
          ? `✓ Process exited with code ${exitCode ?? 0}`
          : `✗ Process exited with code ${exitCode ?? 'unknown'}`,
        color: passed ? '#00e676' : '#f87171',
      });

      setTerminalLines(prev => [...prev, ...lines]);
      setCodeRunState(passed ? 'success' : 'idle');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error.';
      setTerminalLines(prev => [...prev, { text: `✗ ${message}`, color: '#f87171' }]);
      setCodeRunState('idle');
    }
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
      className="flex flex-row"
      style={{
        background: 'linear-gradient(135deg, #050510 0%, #0a0d1a 50%, #050e0a 100%)',
        height: 'calc(100vh - 3.5rem)',
        padding: '0.75rem',
      }}
    >
      {connectionState !== 'connected' && (
        <div className="mb-3">
          <StepsBar />
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
