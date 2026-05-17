'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Code2, Play, Video, VideoOff, Mic, MicOff, MessageSquare,
  Send, Trophy, Zap, UserX, Wifi, Terminal, ScreenShare,
  Clock, CheckCircle2, Flame, Star, MonitorStop, PhoneOff,
  RefreshCw, ChevronRight, Cpu, Eye, Globe, Shield, X,
  ChevronDown, BookOpen,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

// ─── Data ───────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Two Sum',          color: '#f97316', glow: 'rgba(249,115,22,0.5)',  solved: true  },
  { num: 2, label: 'Valid Parens',      color: '#eab308', glow: 'rgba(234,179,8,0.5)',   solved: true  },
  { num: 3, label: 'Merge Lists',       color: '#4ade80', glow: 'rgba(74,222,128,0.5)',  solved: true  },
  { num: 4, label: 'Binary Search',     color: '#22d3ee', glow: 'rgba(34,211,238,0.6)',  solved: false },
  { num: 5, label: 'LRU Cache',         color: '#818cf8', glow: 'rgba(129,140,248,0.5)', solved: false },
  { num: 6, label: 'Graph DFS',         color: '#c084fc', glow: 'rgba(192,132,252,0.5)', solved: false },
  { num: 7, label: 'DP Coins',          color: '#f472b6', glow: 'rgba(244,114,182,0.5)', solved: false },
  { num: 8, label: 'Trie Build',        color: '#fb7185', glow: 'rgba(251,113,133,0.5)', solved: false },
  { num: 9, label: 'Two Sum',          color: '#f97316', glow: 'rgba(249,115,22,0.5)',  solved: false  },
  { num: 10, label: 'Valid Parens',      color: '#eab308', glow: 'rgba(234,179,8,0.5)',   solved: false  },
  { num: 11, label: 'Merge Lists',       color: '#4ade80', glow: 'rgba(74,222,128,0.5)',  solved: false  },
  { num: 12, label: 'Binary Search',     color: '#22d3ee', glow: 'rgba(34,211,238,0.6)',  solved: false },
  { num: 13, label: 'LRU Cache',         color: '#818cf8', glow: 'rgba(129,140,248,0.5)', solved: false },
  { num: 14, label: 'Graph DFS',         color: '#c084fc', glow: 'rgba(192,132,252,0.5)', solved: false },
  { num: 15, label: 'DP Coins',          color: '#f472b6', glow: 'rgba(244,114,182,0.5)', solved: false },
  { num: 16, label: 'Trie Build',        color: '#fb7185', glow: 'rgba(251,113,133,0.5)', solved: false },
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
  { id: 'js', name: 'JavaScript', icon: '⚙️', color: '#f7df1e' },
  { id: 'python', name: 'Python', icon: '🐍', color: '#3776ab' },
  { id: 'java', name: 'Java', icon: '☕', color: '#007396' },
  { id: 'cpp', name: 'C++', icon: '⬚', color: '#00599c' },
];

const TERMINAL_LINES = [
  { text: '> Running 4 test cases…',                               color: '#94a3b8' },
  { text: '  ✓  [1,3,5,7,9], target=5  →  idx 2',                color: '#4ade80' },
  { text: '  ✓  [-1,0,3,5,9,12], target=9  →  idx 4',            color: '#4ade80' },
  { text: '  ✓  [5], target=5  →  idx 0',                         color: '#4ade80' },
  { text: '  ✓  [], target=0  →  -1',                             color: '#4ade80' },
  { text: '────────────────────────────────────',                  color: '#334155' },
  { text: '  All 4/4 tests passed! 🎉',                           color: '#00e676' },
  { text: '  Time Complexity : O(log n)',                          color: '#fbbf24' },
  { text: '  Space Complexity: O(1)',                              color: '#fbbf24' },
];

const PROBLEM = {
  title: 'Binary Search',
  difficulty: 'Easy',
  acceptance: '52%',
  likes: '1.2K',
  description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
  examples: [
    { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explain: 'Target found at index 4' },
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

function highlightCode(code: string, language: string): string {
  const keywords = {
    js: ['function', 'const', 'let', 'var', 'if', 'else', 'return', 'while', 'for'],
    python: ['def', 'return', 'if', 'else', 'while', 'for', 'import', 'from'],
    java: ['public', 'private', 'static', 'return', 'if', 'else', 'while', 'for'],
    cpp: ['int', 'void', 'return', 'if', 'else', 'while', 'for', 'vector'],
  };

  let highlighted = code;
  keywords[language as keyof typeof keywords]?.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    highlighted = highlighted.replace(regex, `<span style="color: #fbbf24">${kw}</span>`);
  });

  return highlighted;
}

// ─── Steps Progress Bar ───────────────────────────────────────────────────────

function StepsBar({ current, onStep }: { current: number; onStep: (n: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative overflow-y-auto"
      ref={scrollRef}
      style={{ scrollBehavior: 'smooth', maxHeight: '100%' }}
    >
      <div
        className="px-2 py-2 rounded-2xl flex-shrink-0"
        style={{
          background: 'rgba(15,21,46,0.7)',
          border: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Grid: 5 steps per row */}
        <div className="grid grid-cols-5 gap-1 mb-2">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="relative"
              onMouseEnter={() => setHoveredStep(step.num)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <motion.button
                onClick={() => onStep(step.num)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.85 }}
                className="relative flex flex-col items-center justify-center cursor-pointer rounded-lg p-1 w-full h-full"
                style={{
                  background: step.solved
                    ? `${step.color}15`
                    : step.num === current
                      ? `${step.color}25`
                      : 'rgba(255,255,255,0.02)',
                  border: step.num === current ? `1.5px solid ${step.color}` : `0.5px solid ${step.solved ? step.color + '40' : 'transparent'}`,
                  boxShadow: step.num === current ? `0 0 8px ${step.glow}` : 'none',
                }}
              >
                {/* Pulse ring for current */}
                {step.num === current && (
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: 22, height: 22,
                      border: `1.5px solid ${step.color}`,
                    }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                )}

                {/* Step circle */}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black relative z-10"
                  style={{
                    background: step.solved
                      ? `linear-gradient(135deg, ${step.color}, ${step.color}99)`
                      : step.num === current
                        ? `linear-gradient(135deg, ${step.color}, ${step.color}bb)`
                        : 'rgba(255,255,255,0.04)',
                    color: step.num <= current ? '#000' : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {step.solved ? <CheckCircle2 size={9} /> : step.num}
                </div>

                {/* Label */}
                <span
                  className="text-[6px] font-bold text-center leading-tight mt-0.5 whitespace-nowrap"
                  style={{ color: step.num === current ? step.color : step.solved ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' }}
                >
                  Q{step.num}
                </span>
              </motion.button>

              {/* Tooltip on hover */}
              <AnimatePresence>
                {hoveredStep === step.num && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 pointer-events-none"
                  >
                    <div
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-white whitespace-nowrap"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                        boxShadow: `0 4px 12px ${step.glow}`,
                      }}
                    >
                      {step.label}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Progress stats */}
        <div className="pt-2 border-t border-white/10 flex flex-col items-center gap-0">
          <span className="text-[10px] font-black text-white">{current - 1}<span className="text-[8px] text-white/30">/16</span></span>
          <span className="text-[7px] text-white/30">Solved</span>
        </div>
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
      className="relative flex flex-col items-center justify-center py-12 px-4 overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, #0d0621 0%, #0f0c29 30%, #0a1628 60%, #0d1f1a 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        minHeight: 320,
      }}
    >
      {/* Floating orbs */}
      {[
        { x: '10%',  y: '20%', color: 'rgba(124,58,237,0.15)', size: 180 },
        { x: '75%',  y: '15%', color: 'rgba(6,182,212,0.1)',  size: 140 },
        { x: '60%',  y: '65%', color: 'rgba(244,114,182,0.1)',size: 160 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y, background: orb.color, filter: 'blur(50px)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Icon */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-4 z-10"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            boxShadow: '0 0 40px rgba(124,58,237,0.5)',
          }}
        >
          <Code2 size={32} className="text-white" />
        </div>
      </motion.div>

      <h1 className="text-2xl font-black text-center mb-1 relative z-10"
        style={{ background: 'linear-gradient(135deg, #c084fc, #22d3ee, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Ready to Code?
      </h1>
      <p className="text-white/50 text-center mb-6 max-w-sm text-xs leading-relaxed z-10">
        Find a partner or go anonymous to solve DSA problems together in real-time.
      </p>

      {/* Connect buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs z-10">
        <motion.button
          onClick={() => onConnect(false)}
          whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(124,58,237,0.6)' }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          <Video size={16} />
          Find Partner
        </motion.button>

        <motion.button
          onClick={() => onConnect(true)}
          whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(244,114,182,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(244,114,182,0.35)',
            color: '#f472b6',
          }}
        >
          <UserX size={16} />
          Anonymous
        </motion.button>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mt-6 z-10 text-xs">
        {[
          { n: '2,847', label: 'Online' },
          { n: '12s',   label: 'Avg match' },
          { n: '98%',   label: 'Satisfaction' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center">
            <span className="font-black text-white">{s.n}</span>
            <span className="text-white/30">{s.label}</span>
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
      className="relative flex flex-col items-center justify-center py-16 rounded-3xl overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0f0622 0%, #050510 100%)',
        border: '1px solid rgba(124,58,237,0.2)',
        minHeight: 320,
      }}
    >
      {/* Radar rings */}
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 60 + i * 70,
            height: 60 + i * 70,
            border: `1.5px solid ${['#7c3aed','#22d3ee','#4ade80','#f472b6'][i]}30`,
          }}
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 0.08, 0.5] }}
          transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
        />
      ))}

      {/* Center avatar */}
      <div
        className="relative w-16 h-16 rounded-full flex items-center justify-center text-2xl z-10"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 30px rgba(124,58,237,0.6)' }}
      >
        {isAnonymous ? '👤' : '👨‍💻'}
      </div>

      <div className="mt-6 flex flex-col items-center z-10">
        <p className="text-lg font-black text-white mb-1">
          Searching{dots}
        </p>
        <p className="text-xs text-white/40 mb-4">
          {isAnonymous ? 'Anonymous mode' : 'Finding your perfect match'}
        </p>

        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-2 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
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
        border: '1px solid rgba(34,211,238,0.12)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-start justify-between gap-2"
        style={{ background: 'rgba(34,211,238,0.05)', borderBottom: '1px solid rgba(34,211,238,0.1)' }}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={14} style={{ color: '#22d3ee' }} />
            <span className="text-xs font-black text-white">{PROBLEM.title}</span>
            <span className="px-2 py-0.5 rounded text-[8px] font-bold" style={{ background: '#4ade8020', color: '#4ade80' }}>
              {PROBLEM.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>❤️ {PROBLEM.likes}</span>
            <span>·</span>
            <span>AC: {PROBLEM.acceptance}</span>
          </div>
        </div>
        <motion.button
          onClick={() => setExpanded(!expanded)}
          whileHover={{ scale: 1.1 }}
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'all 0.2s' }} />
        </motion.button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              <p>{PROBLEM.description}</p>

              <div>
                <span className="font-bold text-white">Examples:</span>
                {PROBLEM.examples.map((ex, i) => (
                  <div key={i} className="mt-1 text-[10px]" style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px' }}>
                    <div>Input: {ex.input}</div>
                    <div>Output: {ex.output}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)' }}>Explain: {ex.explain}</div>
                  </div>
                ))}
              </div>

              <div>
                <span className="font-bold text-white">Constraints:</span>
                <ul className="mt-1 space-y-0.5 text-[10px]">
                  {PROBLEM.constraints.map((c, i) => <li key={i}>• {c}</li>)}
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
  codeRunState,
  terminalLines,
  onRun,
  onSubmit,
  showTerminal,
  onToggleTerminal,
  elapsed,
  isRecording,
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
  const [fontSize, setFontSize] = useState(10);
  const currentCode = CODE_BY_LANGUAGE[language] || CODE_LINES;
  const langOption = LANGUAGE_OPTIONS.find(l => l.id === language)!;

  const getMonacoLanguage = (lang: string) => {
    const map: Record<string, string> = {
      js: 'javascript',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
    };
    return map[lang] || 'javascript';
  };

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
      style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', minWidth: 0 }}
    >
      {/* Editor toolbar */}
      <div
        className="flex items-center gap-2 px-2 py-1.5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#161b22' }}
      >
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/70" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
          <div className="w-2 h-2 rounded-full bg-green-500/70" />
        </div>
        <span className="text-[8px] text-white/40 ml-1 font-mono">solution.js</span>

        {/* Timer */}
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-semibold flex-shrink-0"
          style={{ background: 'rgba(34,211,238,0.08)', border: '0.5px solid rgba(34,211,238,0.2)' }}
        >
          <Clock size={9} style={{ color: '#22d3ee' }} />
          <span className="font-mono" style={{ color: '#22d3ee' }}>{fmt(elapsed)}</span>
        </div>

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.3)' }}>
              <motion.div className="w-1 h-1 rounded-full bg-red-500" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
              <span style={{ color: '#ef4444' }}>REC</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Language selector */}
        <div className="relative">
          <motion.button
            onClick={() => setShowLangMenu(!showLangMenu)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-2 py-1 rounded text-[8px] font-semibold flex-shrink-0"
            style={{ background: `${langOption.color}15`, border: `0.5px solid ${langOption.color}40`, color: langOption.color }}
          >
            <span>{langOption.icon}</span>
            <span>{langOption.name}</span>
            <motion.span animate={{ rotate: showLangMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
              ▼
            </motion.span>
          </motion.button>

          {/* Language menu dropdown */}
          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 left-0 z-20 rounded-lg overflow-hidden"
                style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', minWidth: '120px' }}
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <motion.button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id as 'js' | 'python' | 'java' | 'cpp')}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[8px] font-semibold text-left"
                    style={{ color: lang.id === language ? lang.color : 'rgba(255,255,255,0.6)' }}
                  >
                    <span>{lang.icon}</span>
                    <span>{lang.name}</span>
                    {lang.id === language && <span className="ml-auto">✓</span>}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Font size controls */}
        <div className="flex items-center gap-1 px-1.5 py-1 rounded" style={{ background: 'rgba(129,140,248,0.1)', border: '0.5px solid rgba(129,140,248,0.2)' }}>
          <motion.button
            onClick={() => setFontSize(Math.max(8, fontSize - 1))}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center text-[8px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}
            title="Decrease font size"
          >
            −
          </motion.button>

          <motion.span
            className="text-[7px] font-bold w-6 text-center"
            style={{ color: '#818cf8' }}
            key={fontSize}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {fontSize}
          </motion.span>

          <motion.button
            onClick={() => setFontSize(Math.min(20, fontSize + 1))}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center text-[8px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}
            title="Increase font size"
          >
            +
          </motion.button>
        </div>

        <div className="flex-1" />
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-semibold" style={{ background: 'rgba(192,132,252,0.12)', color: '#c084fc' }}>
          <Eye size={8} /> Syncing
        </div>
      </div>

      {/* Code area - Monaco Editor */}
      <div className="flex-1 overflow-hidden rounded-lg" style={{ background: '#0d1117' }}>
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
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>

      {/* Terminal toggle + actions */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-t flex-wrap"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#161b22' }}
      >
        <motion.button
          onClick={onToggleTerminal}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-semibold"
          style={{
            background: showTerminal ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
            border: showTerminal ? '1px solid rgba(74,222,128,0.3)' : '1px solid transparent',
            color: showTerminal ? '#4ade80' : 'rgba(255,255,255,0.4)',
          }}
        >
          <Terminal size={9} />
          Console
        </motion.button>

        <div className="flex-1" />

        <motion.button
          onClick={onRun}
          disabled={codeRunState === 'running'}
          whileHover={{ scale: 1.04, boxShadow: '0 0 15px rgba(74,222,128,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold"
          style={{
            background: codeRunState === 'running'
              ? 'rgba(74,222,128,0.2)'
              : 'linear-gradient(135deg, #166534, #15803d)',
            color: '#4ade80',
            border: '1px solid #22c55e30',
          }}
        >
          {codeRunState === 'running' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw size={9} />
            </motion.div>
          ) : (
            <Play size={9} />
          )}
          Run
        </motion.button>

        <motion.button
          onClick={onSubmit}
          whileHover={{ scale: 1.04, boxShadow: '0 0 15px rgba(251,191,36,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold"
          style={{
            background: 'linear-gradient(135deg, #92400e, #b45309)',
            color: '#fbbf24',
            border: '1px solid #fbbf2430',
          }}
        >
          <Trophy size={9} />
          Submit
        </motion.button>

        <span className="text-[7px] text-white/25 font-mono">JS</span>
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
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0a0f1a', maxHeight: '100px' }}
          >
            <div className="p-1.5 font-mono text-[8px] space-y-0 overflow-hidden">
              <AnimatePresence>
                {terminalLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: line.color }}
                  >
                    {line.text}
                  </motion.div>
                ))}
              </AnimatePresence>
              {codeRunState === 'idle' && terminalLines.length === 0 && (
                <span className="text-white/15">Click Run…</span>
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
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-6xl"
              >
                {langOption.icon}
              </motion.div>
            </motion.div>

            {/* Floating particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 6, height: 6,
                  background: LANGUAGE_OPTIONS[i % LANGUAGE_OPTIONS.length].color,
                  left: '50%', top: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 12) * Math.PI * 2) * 100,
                  y: Math.sin((i / 12) * Math.PI * 2) * 100,
                  opacity: 0,
                }}
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
  isOpen,
  onClose,
  messages,
  input,
  onInput,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  messages: typeof INITIAL_CHAT;
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 'min(100%, 320px)',
              background: 'linear-gradient(135deg, #0a0d1a 0%, #0f1520 100%)',
              border: '1px solid rgba(244,114,182,0.15)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'rgba(244,114,182,0.12)' }}
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={14} style={{ color: '#f472b6' }} />
                <span className="text-xs font-bold text-white">Live Chat</span>
                <span className="relative flex w-1.5 h-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#4ade80' }} />
                  <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ background: '#4ade80' }} />
                </span>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <X size={14} />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 flex flex-col justify-end">
              <AnimatePresence initial={false}>
                {messages.map(m => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-1.5 ${m.me ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs" style={{ background: `${m.color}15` }}>
                      {m.avatar}
                    </div>
                    <div className={`flex flex-col gap-0.5 max-w-[200px] ${m.me ? 'items-end' : ''}`}>
                      <span className="text-[8px] font-semibold" style={{ color: m.color }}>{m.user}</span>
                      <div
                        className="px-2.5 py-1.5 rounded-lg text-[10px] text-white leading-relaxed"
                        style={{
                          background: m.me ? `${m.color}20` : 'rgba(255,255,255,0.05)',
                          border: `0.5px solid ${m.color}25`,
                        }}
                      >
                        {m.msg}
                      </div>
                      <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{m.time}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t" style={{ borderColor: 'rgba(244,114,182,0.12)' }}>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}
              >
                <input
                  value={input}
                  onChange={e => onInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onSend()}
                  placeholder="Message…"
                  className="flex-1 bg-transparent text-[10px] text-white outline-none placeholder-white/20"
                />
                <motion.button
                  onClick={onSend}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  style={{ color: '#f472b6' }}
                >
                  <Send size={12} />
                </motion.button>
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
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const VideoBox = ({ isYou, color }: { isYou: boolean; color: string }) => (
    <div
      className="relative rounded-lg overflow-hidden flex items-center justify-center flex-1"
      style={{
        height: 100,
        background: isCameraOff ? 'rgba(0,0,0,0.5)' : `linear-gradient(135deg, ${color}20, rgba(0,0,0,0.7))`,
        border: `1px solid ${color}35`,
      }}
    >
      {isCameraOff ? (
        <div className="text-4xl">{isYou ? '👨‍💻' : (isAnonymous ? '👤' : '🧑‍💻')}</div>
      ) : (
        <div className="text-5xl">{isYou ? '👨‍💻' : (isAnonymous ? '👤' : '🧑‍💻')}</div>
      )}
      <div
        className="absolute bottom-0 left-0 right-0 px-1 py-1 text-center text-[9px] font-bold"
        style={{ background: 'rgba(0,0,0,0.7)', color }}
      >
        {isYou ? 'You' : 'Partner'}
      </div>
      {!isYou && (
        <motion.div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#4ade80' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 0.8, repeat: Infinity }} />
      )}
    </div>
  );

  const CtrlBtn = ({ onClick, active, color, icon, label }: any) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[8px] font-semibold flex-1"
      style={{ background: `${color}12`, border: `0.5px solid ${color}35`, color }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 mb-3 w-full">
      {/* Video boxes - Full width */}
      <div className="flex gap-2 w-full">
        <VideoBox isYou color="#7c3aed" />
        <VideoBox isYou={false} color="#22d3ee" />
      </div>

      {/* Action buttons - Bottom Row */}
      <div className="flex items-center gap-1 w-full justify-end">
        <CtrlBtn onClick={onMute} active={isMuted} color={isMuted ? '#f87171' : '#4ade80'} icon={isMuted ? <MicOff size={11} /> : <Mic size={11} />} label="Mute" />
        <CtrlBtn onClick={onCamera} active={isCameraOff} color={isCameraOff ? '#f87171' : '#22d3ee'} icon={isCameraOff ? <VideoOff size={11} /> : <Video size={11} />} label="Cam" />
        <CtrlBtn onClick={onRecording} active={isRecording} color={isRecording ? '#f97316' : '#c084fc'} icon={isRecording ? <MonitorStop size={11} /> : <ScreenShare size={11} />} label="Rec" />

        <motion.button
          onClick={onDisconnect}
          whileHover={{ scale: 1.06, boxShadow: '0 0 12px rgba(248,113,113,0.4)' }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[8px] font-bold"
          style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', color: '#fca5a5', border: '0.5px solid #f8717130' }}
        >
          <PhoneOff size={10} />
          <span className="hidden sm:inline">End</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Code Summit Celebration ──────────────────────────────────────────────────

function CodeSummitAnimation({ onClose }: { onClose: () => void }) {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: rand(5, 95),
    y: rand(5, 95),
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
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
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
        className="relative flex flex-col items-center gap-3 px-8 py-6 rounded-2xl text-center z-10"
        style={{
          background: 'linear-gradient(135deg, #0d0621 0%, #0f0c29 50%, #0a1628 100%)',
          border: '1.5px solid rgba(251,191,36,0.4)',
          boxShadow: '0 0 60px rgba(251,191,36,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <motion.div animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }} transition={{ duration: 1.4, repeat: Infinity }}
          className="relative">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 0 40px rgba(251,191,36,0.6)' }}>
            <Trophy size={40} className="text-white" />
          </div>
        </motion.div>

        <div>
          <motion.h2 className="text-3xl font-black"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
            CODE SUMMIT!
          </motion.h2>
          <p className="text-white/60 mt-1 text-xs">Problem solved! 🚀</p>
        </div>

        <div className="flex gap-6 text-xs">
          {[
            { icon: '⚡', val: 'Fast',  color: '#fbbf24' },
            { icon: '⭐', val: '100/100', color: '#c084fc' },
            { icon: '🔥', val: 'x4 Streak', color: '#f97316' },
          ].map(s => (
            <div key={s.val} className="flex flex-col items-center">
              <span className="text-lg">{s.icon}</span>
              <span className="font-black text-white">{s.val}</span>
            </div>
          ))}
        </div>

        <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="px-6 py-2 rounded-lg font-bold text-xs text-black mt-2"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
          Continue <ChevronRight size={12} className="inline" />
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

  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 h-full overflow-hidden">
      {/* Left sidebar: Problem Statement */}
      <div className="w-56 flex-shrink-0 overflow-y-auto">
        <ProblemStatement />
      </div>

      {/* Center: Code Editor */}
      <div className="flex-1 overflow-hidden">
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

      {/* Right column: Steps Bar + Video Call Bar + Chat (flex column) */}
      <div className="flex flex-col gap-3 flex-shrink-0 w-60 overflow-y-auto">
        {/* Steps bar */}
        <div className="flex-shrink-0">
          <StepsBar current={currentStep} onStep={() => {}} />
        </div>

        {/* Video call bar */}
        <div className="flex-shrink-0">
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
        </div>

        {/* Chat button */}
        <motion.button
          onClick={() => setChatOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #f47bb620, #f47bb610)',
            border: '1px solid rgba(244,114,182,0.25)',
          }}
        >
          <MessageSquare size={16} style={{ color: '#f472b6' }} />
          <span style={{ color: '#f472b6' }}>Open Chat</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
        </motion.button>
      </div>

      {/* Chat drawer */}
      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        input={chatInput}
        onInput={onChatInput}
        onSend={onSendChat}
      />
    </motion.div>
  );
}

// ─── Page Root ────────────────────────────────────────────────────────────────

function CodingPracticeContent() {
  const [connectionState, setConnectionState] = useState<'idle' | 'searching' | 'connected'>('idle');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [currentStep, setCurrentStep] = useState(4);
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

  const handleSubmit = useCallback(() => {
    setShowSummit(true);
  }, []);

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

  return (
    <div
      className="flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #050510 0%, #0a0d1a 50%, #050e0a 100%)',
        height: 'calc(100vh - 3.5rem)',
        paddingLeft: '0.75rem',
        paddingRight: '0.75rem',
        paddingTop: '0.75rem',
        paddingBottom: '0.75rem',
      }}
    >
      {/* Steps bar - only show when not connected */}
      {connectionState !== 'connected' && (
        <StepsBar current={currentStep} onStep={setCurrentStep} />
      )}

      {/* Connection states */}
      <div className="flex-1 overflow-auto">
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
            <motion.div key="connected" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="h-full overflow-hidden">
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

      {/* Code Summit overlay */}
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
