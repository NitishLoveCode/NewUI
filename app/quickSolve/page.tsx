'use client';

/**
 * QuickSolve — pair-programming DSA practice page.
 *
 * Layout (matches the Miro wireframe):
 *   ┌──────────┬──────────────────────────────────────────┐
 *   │  You     │  Topic columns (Array, Recursion, …)      │
 *   │  Partner │  each with a grid of question chips        │
 *   │ Skip Stop├──────────────────────────────────────────┤
 *   │  chat    │  Selected-problem workspace                │
 *   └──────────┴──────────────────────────────────────────┘
 *
 * Video + chat + skip/stop are powered by the WebRTC matching hook at
 * hooks/testSocketHook/useWebRTC.ts (Omegle-style 1:1 pairing).
 */

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import useWebRTC from '@/hooks/testSocketHook/useWebRTC';
import { useRunCodeMutation } from '@/stores/api';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  SkipForward,
  Square,
  Play,
  Send,
  CheckCircle2,
  Circle,
  Sparkles,
  Terminal,
  RefreshCw,
  X,
  MessageCircle,
} from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// Languages supported by the nodeServer / Piston backend. The `id` doubles as
// the Piston language name, so no extra mapping is needed at call time.
const LANGUAGES = [
  { id: 'javascript', monaco: 'javascript', label: 'JavaScript', icon: '⚙️', color: '#f7df1e', file: 'solution.js', sample: 'console.log("Hello, partner!");' },
  { id: 'python', monaco: 'python', label: 'Python', icon: '🐍', color: '#3776ab', file: 'solution.py', sample: 'print("Hello, partner!")' },
  { id: 'java', monaco: 'java', label: 'Java', icon: '☕', color: '#007396', file: 'Main.java', sample: 'class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, partner!");\n  }\n}' },
  { id: 'cpp', monaco: 'cpp', label: 'C++', icon: '⬚', color: '#00599c', file: 'solution.cpp', sample: '#include <iostream>\nint main() {\n  std::cout << "Hello, partner!";\n  return 0;\n}' },
] as const;

type LangId = (typeof LANGUAGES)[number]['id'];

type TerminalLine = { text: string; color: string };

// ---------------------------------------------------------------------------
// Sample DSA content. Swap with API/store data when wired to the backend.
// ---------------------------------------------------------------------------

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Question {
  id: string;
  title: string;
  difficulty: Difficulty;
  prompt: string;
}

interface Topic {
  name: string;
  accent: string; // tailwind gradient stops
  ring: string;
  questions: Question[];
}

const DIFF_COLOR: Record<Difficulty, string> = {
  Easy: 'text-emerald-400',
  Medium: 'text-amber-400',
  Hard: 'text-rose-400',
};

function makeQuestions(prefix: string, names: string[]): Question[] {
  const diffs: Difficulty[] = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard'];
  return names.map((title, i) => ({
    id: `${prefix}-${i + 1}`,
    title,
    difficulty: diffs[i % diffs.length],
    prompt: `Solve "${title}". Discuss the approach with your partner, code it together, then test against edge cases.`,
  }));
}

const TOPICS: Topic[] = [
  {
    name: 'Array',
    accent: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-400',
    questions: makeQuestions('arr', [
      'Two Sum',
      'Max Subarray',
      'Rotate Array',
      'Merge Intervals',
      'Product Except Self',
      'Move Zeroes',
      'Find Duplicate',
      'Container With Most Water',
      'Three Sum',
      'Maximum Product Subarray',
      'Subarray Sum K',
      'Trapping Rain Water',
      'Recursive Bubble',
      'Sort Even-Odd',
      'Bubble on Strings',
      'Detect Sorted',
      'Bubble K Passes',
      'Sort by Parity',
    ]),
  },
  {
    name: 'Star Printing',
    accent: 'from-fuchsia-500 to-purple-600',
    ring: 'ring-fuchsia-400',
    questions: makeQuestions('star', [
      'Right Triangle',
      'Pyramid',
      'Inverted Pyramid',
      'Diamond',
      'Hollow Square',
      'Number Triangle',
      'Pascal Triangle',
      'Butterfly Pattern',
      'Hourglass',
      'Zig-Zag',
      'Hollow Diamond',
      'Floyd Triangle',
      'Recursive Bubble',
      'Sort Even-Odd',
      'Bubble on Strings',
      'Detect Sorted',
      'Bubble K Passes',
      'Sort by Parity',
    ]),
  },
  {
    name: 'Recursion',
    accent: 'from-sky-500 to-blue-600',
    ring: 'ring-sky-400',
    questions: makeQuestions('rec', [
      'Factorial',
      'Fibonacci',
      'Power of N',
      'Tower of Hanoi',
      'Subsets',
      'Permutations',
      'N-Queens',
      'Generate Parentheses',
      'Sudoku Solver',
      'Word Search',
      'Combination Sum',
      'Palindrome Partition',
      'Recursive Bubble',
      'Sort Even-Odd',
      'Bubble on Strings',
      'Detect Sorted',
      'Bubble K Passes',
      'Sort by Parity',
    ]),
  },
  {
    name: 'Selection Sort',
    accent: 'from-orange-500 to-amber-600',
    ring: 'ring-orange-400',
    questions: makeQuestions('sel', [
      'Basic Selection Sort',
      'Sort Colors',
      'Kth Smallest',
      'Sort by Frequency',
      'Min Swaps to Sort',
      'Stable Selection',
      'Sort Linked List',
      'Sort Strings',
      'Sort Nearly Sorted',
      'Wiggle Sort',
      'Custom Comparator',
      'Sort Matrix',
      'Recursive Bubble',
      'Sort Even-Odd',
      'Bubble on Strings',
      'Detect Sorted',
      'Bubble K Passes',
      'Sort by Parity',
    ]),
  },
  {
    name: 'Bubble Sort',
    accent: 'from-rose-500 to-pink-600',
    ring: 'ring-rose-400',
    questions: makeQuestions('bub', [
      'Basic Bubble Sort',
      'Optimized Bubble',
      'Cocktail Sort',
      'Count Swaps',
      'Sort Booleans',
      'Bubble Descending',
      'Recursive Bubble',
      'Sort Even-Odd',
      'Bubble on Strings',
      'Detect Sorted',
      'Bubble K Passes',
      'Sort by Parity',
      'Recursive Bubble',
      'Sort Even-Odd',
      'Bubble on Strings',
      'Detect Sorted',
      'Bubble K Passes',
      'Sort by Parity',
    ]),
  },
];

const STATUS_META: Record<string, { text: string; dot: string }> = {
  idle: { text: 'Not connected', dot: 'bg-zinc-500' },
  queued: { text: 'Finding a partner…', dot: 'bg-amber-400 animate-pulse' },
  matched: { text: 'Connected with partner', dot: 'bg-emerald-500' },
  partner_left: { text: 'Partner left — rematching…', dot: 'bg-rose-500 animate-pulse' },
};

// ---------------------------------------------------------------------------

export default function QuickSolvePage() {
  const {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    status,
    isMuted,
    isCameraOff,
    hasVideo,
    mediaError,
    messages,
    sendChat,
    joinQueue,
    skip,
    leave,
    toggleMic,
    toggleCamera,
    collabReady,
    sendCollab,
    onCollab,
  } = useWebRTC();

  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Question | null>(null);
  const [draft, setDraft] = useState('');
  const [showChat, setShowChat] = useState(false);

  // ---- Code editor state ----
  const [language, setLanguage] = useState<LangId>('javascript');
  const [code, setCode] = useState<string>(LANGUAGES[0].sample);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [runCodeRequest] = useRunCodeMutation();
  // Guards against echoing a remote update straight back to the partner.
  const applyingRemoteRef = useRef(false);

  const langOption = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];

  const inSession = status === 'matched' || status === 'queued' || status === 'partner_left';
  const statusMeta = STATUS_META[status] ?? STATUS_META.idle;

  // Push local edits to the partner over the WebRTC data channel.
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      const next = value ?? '';
      setCode(next);
      if (!applyingRemoteRef.current) {
        sendCollab({ type: 'code', code: next, language });
      }
    },
    [sendCollab, language]
  );

  const handleLanguageChange = useCallback(
    (id: LangId) => {
      const lang = LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
      setLanguage(id);
      setCode(lang.sample);
      setShowLangMenu(false);
      sendCollab({ type: 'code', code: lang.sample, language: id });
    },
    [sendCollab]
  );

  // Apply incoming collaboration updates from the partner.
  useEffect(() => {
    const off = onCollab((msg) => {
      if (msg.type === 'code') {
        applyingRemoteRef.current = true;
        if (typeof msg.language === 'string') setLanguage(msg.language as LangId);
        if (typeof msg.code === 'string') setCode(msg.code);
        // release on next tick so Monaco's onChange (if any) is skipped
        setTimeout(() => {
          applyingRemoteRef.current = false;
        }, 0);
      }
    });
    return off;
  }, [onCollab]);

  const runCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setShowTerminal(true);
    setTerminalLines([{ text: `> Running ${langOption.label}…`, color: '#94a3b8' }]);
    try {
      // nodeServer / Piston backend. Our LangId values are the names Piston
      // expects directly, so no mapping is needed here.
      const data = await runCodeRequest({ language, code }).unwrap();

      const lines: TerminalLine[] = [];
      if (data.status === 'compile_error') {
        lines.push({ text: '── Compile errors ──', color: '#334155' });
        (data.error ?? '').split('\n').forEach((l) => l && lines.push({ text: l, color: '#f87171' }));
      } else if (data.status === 'error') {
        if (data.output?.trim()) {
          lines.push({ text: '── Output ──', color: '#334155' });
          data.output.split('\n').forEach((l) => lines.push({ text: l, color: '#e2e8f0' }));
        }
        lines.push({ text: '── Stderr ──', color: '#334155' });
        (data.error ?? '').split('\n').forEach((l) => l && lines.push({ text: l, color: '#f87171' }));
      } else {
        if (data.output?.trim()) {
          lines.push({ text: '── Output ──', color: '#334155' });
          data.output.split('\n').forEach((l) => lines.push({ text: l, color: '#e2e8f0' }));
        } else {
          lines.push({ text: '(no output)', color: '#64748b' });
        }
      }

      lines.push({ text: '──────────────────────────────────', color: '#334155' });
      lines.push({ text: `time: ${data.time}  ·  memory: ${data.memory}`, color: '#64748b' });
      const passed = data.status === 'success';
      lines.push({
        text: passed ? '✓ Process exited successfully' : `✗ Execution failed (${data.status})`,
        color: passed ? '#00e676' : '#f87171',
      });
      setTerminalLines((prev) => [...prev, ...lines]);
    } catch (e) {
      const message =
        (e as { data?: { error?: string } })?.data?.error ??
        (e instanceof Error ? e.message : 'Network error.');
      setTerminalLines((prev) => [...prev, { text: `✗ ${message}`, color: '#f87171' }]);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, language, code, langOption.label, runCodeRequest]);

  const totalQuestions = useMemo(
    () => TOPICS.reduce((n, t) => n + t.questions.length, 0),
    []
  );

  const toggleSolved = (id: string) =>
    setSolved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSend = () => {
    if (sendChat(draft)) setDraft('');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-linear-to-br from-[#0b1622] via-casino-navy to-[#0b1622] text-zinc-100">
      {/* ============ LEFT SIDEBAR ============ */}
      <aside className="flex w-75 shrink-0 flex-col gap-3 overflow-hidden border-r border-white/5 bg-casino-navy/70 p-3">
        {/* Partner (top) + You (bottom) — square tiles, stacked */}
        <div className="mx-auto flex w-[97%] overflow-hidden shrink-0 flex-col gap-2">
          {/* Partner */}
          <VideoTile
            label="Partner"
            square
            accent="from-fuchsia-500/20 to-purple-500/10"
            ring="ring-fuchsia-500/40"
            videoRef={remoteVideoRef}
            placeholder={
              status === 'matched'
                ? 'Connecting…'
                : status === 'queued'
                ? 'Waiting…'
                : status === 'partner_left'
                ? 'Rematching…'
                : 'Press Start to find a partner'
            }
            bottomSlot={
              inSession ? (
                <button
                  onClick={skip}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <SkipForward size={14} /> Skip
                </button>
              ) : undefined
            }
          />

          {/* You */}
          <VideoTile
            label="You"
            square
            accent="from-emerald-500/20 to-teal-500/10"
            ring="ring-emerald-500/40"
            videoRef={localVideoRef}
            muted
            mirrored
            badge={
              <div className="flex gap-1.5">
                <IconToggle active={!isMuted} onClick={toggleMic} on={<Mic size={14} />} off={<MicOff size={14} />} />
                <IconToggle
                  active={!isCameraOff}
                  onClick={toggleCamera}
                  on={<VideoIcon size={14} />}
                  off={<VideoOff size={14} />}
                />
              </div>
            }
            placeholder={!hasVideo ? 'Camera off' : 'Starting…'}
            bottomSlot={
              !inSession ? (
                <button
                  onClick={joinQueue}
                  disabled={!isConnected}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-1.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play size={14} /> {isConnected ? 'Start' : 'Connecting…'}
                </button>
              ) : (
                <button
                  onClick={leave}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-500/80 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-rose-500"
                >
                  <Square size={14} /> Stop
                </button>
              )
            }
          />
        </div>

        {/* Connection status */}
        <span className="flex items-center justify-center gap-1.5 rounded-full bg-black/30 px-2 py-1 text-[11px]">
          <span className={`size-1.5 rounded-full ${statusMeta.dot}`} />
          {statusMeta.text}
        </span>

        {/* Chat button */}
        {/* <button
          onClick={() => setShowChat(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-sky-500/15 py-2.5 text-sm font-semibold text-sky-300 ring-1 ring-sky-400/30 transition hover:bg-sky-500/25"
        >
          <MessageCircle size={16} /> Chat
          {messages.length > 0 && (
            <span className="ml-1 rounded-full bg-sky-400 px-1.5 text-[10px] font-bold text-black">
              {messages.length}
            </span>
          )}
        </button> */}

        {mediaError && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-300">
            {mediaError}
          </div>
        )}
      </aside>

    

      {/* ============ RIGHT MAIN ============ */}
      <main className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            <h1 className="text-lg font-bold">QuickSolve · Pair Practice</h1>
          </div>
          <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
            {solved.size} / {totalQuestions} solved
          </div>
        </div>

        {/* Topic columns (compact) */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TOPICS.map((topic) => (
            <div
              key={topic.name}
              className="flex w-36 shrink-0 flex-col rounded-lg border border-white/5 bg-white/3 p-2"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className={`bg-linear-to-r ${topic.accent} bg-clip-text text-[11px] font-bold text-transparent`}>
                  {topic.name}
                </span>
                <span className="text-[9px] text-zinc-500">
                  {topic.questions.filter((q) => solved.has(q.id)).length}/{topic.questions.length}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {topic.questions.map((q, i) => {
                  const isSolved = solved.has(q.id);
                  const isActive = selected?.id === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelected(q)}
                      title={`${q.title} · ${q.difficulty}`}
                      className={`flex aspect-square items-center justify-center rounded text-[9px] font-semibold transition
                        ${
                          isSolved
                            ? `bg-linear-to-br ${topic.accent} text-black shadow`
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                        }
                        ${isActive ? `ring-2 ${topic.ring}` : ''}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Code editor workspace — VS Code style */}
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0d1117' }}
        >
          {/* Top bar */}
          <div
            className="flex flex-wrap items-center gap-2 px-3 py-2 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#161b22' }}
          >
            {/* Traffic lights */}
            <div className="flex gap-1.5 items-center">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>

            <span className="ml-1 font-mono text-xs text-white/35">{langOption.file}</span>

            {selected && (
              <span className={`text-[11px] font-semibold ${DIFF_COLOR[selected.difficulty]}`}>
                · {selected.title}
              </span>
            )}

            {/* Language selector */}
            <div className="relative">
              <motion.button
                onClick={() => setShowLangMenu((v) => !v)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ background: `${langOption.color}18`, border: `1px solid ${langOption.color}40`, color: langOption.color }}
              >
                <span>{langOption.icon}</span>
                <span>{langOption.label}</span>
                <motion.span animate={{ rotate: showLangMenu ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[10px]">
                  ▼
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.14 }}
                    className="absolute top-full mt-1 left-0 z-20 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', minWidth: 140 }}
                  >
                    {LANGUAGES.map((lang) => (
                      <motion.button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang.id)}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-left"
                        style={{ color: lang.id === language ? lang.color : 'rgba(255,255,255,0.55)' }}
                      >
                        <span>{lang.icon}</span>
                        <span>{lang.label}</span>
                        {lang.id === language && <CheckCircle2 size={11} className="ml-auto" />}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Font size */}
            <div
              className="flex items-center gap-1 px-1.5 py-1 rounded-lg"
              style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.18)' }}
            >
              <motion.button
                onClick={() => setFontSize((s) => Math.max(10, s - 1))}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold"
                style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}
              >
                −
              </motion.button>
              <span className="text-xs font-bold w-5 text-center" style={{ color: '#818cf8' }}>
                {fontSize}
              </span>
              <motion.button
                onClick={() => setFontSize((s) => Math.min(22, s + 1))}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold"
                style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}
              >
                +
              </motion.button>
            </div>

            <div className="flex-1" />

            {/* Live sync pill */}
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold"
              style={{
                background: collabReady ? 'rgba(74,222,128,0.12)' : 'rgba(148,163,184,0.08)',
                border: `1px solid ${collabReady ? 'rgba(74,222,128,0.35)' : 'rgba(148,163,184,0.2)'}`,
                color: collabReady ? '#4ade80' : 'rgba(148,163,184,0.7)',
              }}
              title={collabReady ? 'Live sync with partner is on' : 'Connect with a partner to start live sync'}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: collabReady ? '#4ade80' : '#94a3b8', boxShadow: collabReady ? '0 0 6px #4ade80' : 'none' }}
              />
              {collabReady ? 'Live sync' : 'Solo'}
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden" style={{ background: '#0d1117' }}>
            <MonacoEditor
              height="100%"
              language={langOption.monaco}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: fontSize,
                lineHeight: fontSize + 10,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'gutter',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                  useShadows: false,
                },
              }}
            />
          </div>

          {/* Bottom bar */}
          <div
            className="flex items-center gap-2 px-3 py-2 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#161b22' }}
          >
            <motion.button
              onClick={() => setShowTerminal((v) => !v)}
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

            {selected && (
              <motion.button
                onClick={() => toggleSolved(selected.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  background: solved.has(selected.id) ? 'rgba(0,230,118,0.18)' : 'rgba(255,255,255,0.05)',
                  color: solved.has(selected.id) ? '#00e676' : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${solved.has(selected.id) ? '#00e67640' : 'rgba(255,255,255,0.12)'}`,
                }}
              >
                {solved.has(selected.id) ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                {solved.has(selected.id) ? 'Solved' : 'Mark Solved'}
              </motion.button>
            )}

            <motion.button
              onClick={runCode}
              disabled={isRunning}
              whileHover={{ scale: 1.04, boxShadow: '0 0 18px rgba(74,222,128,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background: isRunning ? 'rgba(74,222,128,0.18)' : 'linear-gradient(135deg, #166534, #15803d)',
                color: '#4ade80',
                border: '1px solid #22c55e30',
              }}
            >
              {isRunning ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw size={11} />
                </motion.div>
              ) : (
                <Play size={11} />
              )}
              Run
            </motion.button>
          </div>

          {/* Console */}
          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 180 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t flex flex-col"
                style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0a0f1a' }}
              >
                <div
                  className="flex items-center justify-between px-3 py-1.5 border-b flex-shrink-0"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Terminal size={11} style={{ color: '#4ade80' }} />
                    <span className="text-[11px] font-semibold text-white/50">Console</span>
                  </div>
                  <button onClick={() => setShowTerminal(false)} className="text-white/30 hover:text-white/70" title="Close console">
                    <X size={12} />
                  </button>
                </div>
                <div className="flex-1 p-3 font-mono text-xs space-y-0.5 overflow-auto">
                  {terminalLines.length === 0 ? (
                    <span className="text-white/20">Click Run to execute…</span>
                  ) : (
                    terminalLines.map((line, i) => (
                      <div key={i} style={{ color: line.color }} className="whitespace-pre-wrap">
                        {line.text}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface VideoTileProps {
  label: string;
  accent: string;
  ring: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  muted?: boolean;
  mirrored?: boolean;
  square?: boolean;
  placeholder?: string;
  overlay?: React.ReactNode;
  badge?: React.ReactNode;
  bottomSlot?: React.ReactNode;
}

function VideoTile({ label, accent, ring, videoRef, muted, mirrored, square, placeholder, overlay, badge, bottomSlot }: VideoTileProps) {
  return (
    <div className={`relative ${square ? 'aspect-square' : 'aspect-video'} w-full overflow-hidden bg-linear-to-br ${accent} ring-1 ${ring}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full object-cover ${mirrored ? '-scale-x-100' : ''}`}
      />
      {placeholder && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-[11px] text-zinc-300/80">
          {placeholder}
        </div>
      )}
      <span className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
        {label}
      </span>
      {badge && <div className="absolute right-2 top-2 z-10">{badge}</div>}
      {overlay && <div className="absolute bottom-2 right-2 z-10">{overlay}</div>}
      {bottomSlot && <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center px-2">{bottomSlot}</div>}
    </div>
  );
}

function IconToggle({
  active,
  onClick,
  on,
  off,
}: {
  active: boolean;
  onClick: () => void;
  on: React.ReactNode;
  off: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex size-7 items-center justify-center rounded-md backdrop-blur transition ${
        active ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-rose-500/80 text-white hover:bg-rose-500'
      }`}
    >
      {active ? on : off}
    </button>
  );
}

interface ChatMsg {
  id: string;
  from: 'me' | 'partner';
  text: string;
  timestamp: number;
}

function ChatPanel({
  messages,
  draft,
  setDraft,
  onSend,
  disabled,
}: {
  messages: ChatMsg[];
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white/3">
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2.5">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-[11px] text-zinc-600">
            {disabled ? 'Connect with a partner to chat' : 'Say hi 👋'}
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs ${
                m.from === 'me'
                  ? 'self-end bg-emerald-500/20 text-emerald-100'
                  : 'self-start bg-white/10 text-zinc-200'
              }`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>
      <div className="flex items-center gap-1.5 border-t border-white/5 p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          disabled={disabled}
          placeholder={disabled ? 'Not connected' : 'Message…'}
          className="min-w-0 flex-1 rounded-lg bg-[#0b1622] px-2.5 py-1.5 text-xs text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-600 focus:ring-emerald-500/40 disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={disabled || !draft.trim()}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
