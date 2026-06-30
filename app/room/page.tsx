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

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import useWebRTC from '@/hooks/testSocketHook/useWebRTC';
import { useRunCodeMutation } from '@/stores/api';
import SiteLogo from '@/components/SiteLogo';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  SkipForward,
  Play,
  Send,
  CheckCircle2,
  RefreshCw,
  X,
  Monitor,
  PhoneOff,
  Plus,
  Heart,
  Radio,
} from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// Languages supported by the nodeServer / Piston backend. The `id` doubles as
// the Piston language name, so no extra mapping is needed at call time.
const LANGUAGES = [
  { id: 'javascript', monaco: 'javascript', label: 'JavaScript', icon: '⚙️', color: '#f7df1e', file: 'solution.js', sample: 'console.log("Hello, partner!");' },
  { id: 'python', monaco: 'python', label: 'Python', icon: '🐍', color: '#3776ab', file: 'solution.py', sample: 'print("Hello, partner!")' },
  { id: 'java', monaco: 'java', label: 'Java', icon: '☕', color: '#007396', file: 'Main.java', sample: 'class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, partner!");\n  }\n}' },
  { id: 'cpp', monaco: 'cpp', label: 'C++', icon: '⬚', color: '#00599c', file: 'main.cpp', sample: '#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n  unordered_map<int,int> mp;\n  for(int i=0; i<nums.size(); i++){\n    int rem = target - nums[i];\n    if(mp.find(rem) != mp.end()){\n      return {mp[rem], i};\n    }\n    mp[nums[i]] = i;\n  }\n  return {-1, -1};\n}' },
] as const;

type LangId = (typeof LANGUAGES)[number]['id'];

type TerminalLine = { text: string; color: string };

// ---------------------------------------------------------------------------
// DSA problem catalog shown in the right-hand "Problems" panel.
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
  text: string; // solid text color for the heading
  ring: string;
  questions: Question[];
}

const DIFF_BADGE: Record<Difficulty, string> = {
  Easy: 'bg-emerald-500/15 text-emerald-400 ring-emerald-400/30',
  Medium: 'bg-amber-500/15 text-amber-400 ring-amber-400/30',
  Hard: 'bg-rose-500/15 text-rose-400 ring-rose-400/30',
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
    text: 'text-emerald-400',
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
    text: 'text-fuchsia-400',
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
    text: 'text-sky-400',
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
    text: 'text-orange-400',
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
    text: 'text-rose-400',
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

  const [draft, setDraft] = useState('');

  // ---- Problems panel state ----
  const [selected, setSelected] = useState<Question | null>(TOPICS[0].questions[0]);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // ---- Code editor state ----
  const cppLang = LANGUAGES.find((l) => l.id === 'cpp') ?? LANGUAGES[0];
  const [language, setLanguage] = useState<LangId>('cpp');
  const [code, setCode] = useState<string>(cppLang.sample);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const fontSize = 14;
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [bottomTab, setBottomTab] = useState<'testcase' | 'output' | 'console'>('output');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [lastRun, setLastRun] = useState<'idle' | 'pass' | 'fail'>('idle');
  const [runOutput, setRunOutput] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);
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
      if (id === language) {
        setShowLangMenu(false);
        return;
      }
      const lang = LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
      setLanguage(id);
      setCode(lang.sample);
      setShowLangMenu(false);
      setShowCelebration(true);
      sendCollab({ type: 'code', code: lang.sample, language: id });
    },
    [sendCollab, language]
  );

  // Auto-dismiss the language-switch celebration.
  useEffect(() => {
    if (!showCelebration) return;
    const timer = setTimeout(() => setShowCelebration(false), 1200);
    return () => clearTimeout(timer);
  }, [showCelebration]);

  // Apply incoming collaboration updates from the partner.
  useEffect(() => {
    const off = onCollab((msg) => {
      if (msg.type === 'code') {
        applyingRemoteRef.current = true;
        if (typeof msg.language === 'string') {
          setLanguage((prev) => {
            if (prev !== msg.language) setShowCelebration(true);
            return msg.language as LangId;
          });
        }
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
    setBottomTab('console');
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
      setRunOutput((data.output ?? '').trim() || (data.error ?? '').trim());
      setLastRun(passed ? 'pass' : 'fail');
    } catch (e) {
      const message =
        (e as { data?: { error?: string } })?.data?.error ??
        (e instanceof Error ? e.message : 'Network error.');
      setTerminalLines((prev) => [...prev, { text: `✗ ${message}`, color: '#f87171' }]);
      setLastRun('fail');
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, language, code, langOption.label, runCodeRequest]);

  const handleSend = () => {
    if (sendChat(draft)) setDraft('');
  };

  const totalQuestions = TOPICS.reduce((n, t) => n + t.questions.length, 0);

  const toggleSolved = (id: string) =>
    setSolved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleTopic = (name: string) =>
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-[#0b1020] via-[#0d1424] to-[#0b1020] text-zinc-100">
      {/* ============ BODY ============ */}
      <div className="flex min-h-0 flex-1">
        {/* ---------- LEFT SIDEBAR ---------- */}
        <aside className="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto border-r border-white/5 bg-[#0d1424]/50 p-3">
          {/* Partner */}
          <VideoTile
            label="Arjun"
            grow
            icon={<Mic size={12} className="text-emerald-400" />}
            mirrored
            videoRef={remoteVideoRef}
            placeholder={
              status === 'matched'
                ? 'Connecting…'
                : status === 'queued'
                ? 'Waiting for partner…'
                : status === 'partner_left'
                ? 'Rematching…'
                : 'Start a call to find a partner'
            }
          />

          {/* You */}
          <VideoTile
            label="You"
            grow
            icon={<Heart size={12} className="fill-rose-400 text-rose-400" />}
            videoRef={localVideoRef}
            muted
            mirrored
            placeholder={!hasVideo ? 'Camera off' : 'Starting…'}
          />

          {/* Call controls */}
          <div className="flex items-center justify-center gap-3 py-1">
            <ControlBtn active={!isMuted} onClick={toggleMic} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </ControlBtn>
            <ControlBtn
              active={!isCameraOff}
              onClick={toggleCamera}
              title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            >
              {isCameraOff ? <VideoOff size={18} /> : <VideoIcon size={18} />}
            </ControlBtn>
            <ControlBtn
              active={isScreenSharing}
              onClick={() => setIsScreenSharing((v) => !v)}
              title="Share screen"
            >
              <Monitor size={18} />
            </ControlBtn>
            {inSession && (
              <ControlBtn onClick={skip} title="Skip partner">
                <SkipForward size={18} />
              </ControlBtn>
            )}
            <ControlBtn
              danger
              onClick={inSession ? leave : joinQueue}
              disabled={!isConnected && !inSession}
              title={inSession ? 'End call' : 'Find a partner'}
            >
              {inSession ? <PhoneOff size={18} /> : <Play size={18} />}
            </ControlBtn>
          </div>

          {mediaError && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-300">
              {mediaError}
            </div>
          )}

          {/* Live chat */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/5 bg-[#0d1424]/60">
            <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
              <span className="text-sm font-semibold text-white">Live Chat</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                <span className={`size-1.5 rounded-full ${statusMeta.dot}`} /> {statusMeta.text}
              </span>
            </div>
            <ChatPanel
              messages={messages}
              draft={draft}
              setDraft={setDraft}
              onSend={handleSend}
              disabled={status !== 'matched'}
            />
          </div>
        </aside>

        {/* ---------- RIGHT MAIN ---------- */}
        <main className="flex min-w-0 flex-1 flex-col bg-[#0d1117]">
          {/* Tab bar */}
          <div
            className="flex items-center gap-2 border-b px-3 py-2"
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#161b22' }}
          >
            {/* File tab */}
            <div className="flex items-center gap-2 rounded-t-md border-b-2 border-emerald-400 bg-white/5 px-3 py-1.5">
              <span className="font-mono text-xs text-white/80">{langOption.file}</span>
              <button className="text-white/30 transition hover:text-white/70" title="Close tab">
                <X size={13} />
              </button>
            </div>
            <button
              className="flex size-6 items-center justify-center rounded text-white/40 transition hover:bg-white/5 hover:text-white/80"
              title="New tab"
            >
              <Plus size={15} />
            </button>

            <div className="flex-1" />

            {/* Brand logo (centered) */}
            <div
            //   href="/"
              className="flex shrink-0 items-center opacity-40 transition hover:opacity-100"
            //   title="Go to home"
            >
              <SiteLogo size="sm" />
            </div>

            <div className="flex-1" />

            {/* Language selector */}
            <div className="relative">
              <motion.button
                onClick={() => setShowLangMenu((v) => !v)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
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
                    className="absolute right-0 top-full z-20 mt-1 overflow-hidden rounded-xl shadow-2xl"
                    style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', minWidth: 150 }}
                  >
                    {LANGUAGES.map((lang) => (
                      <motion.button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang.id)}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold"
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

            {/* Run */}
            <motion.button
              onClick={runCode}
              disabled={isRunning}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:bg-white/10 disabled:opacity-60"
            >
              {isRunning ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw size={12} />
                </motion.div>
              ) : (
                <Play size={12} />
              )}
              Run
            </motion.button>

            {/* Submit */}
            <motion.button
              onClick={runCode}
              disabled={isRunning}
              whileHover={{ scale: 1.04, boxShadow: '0 0 18px rgba(16,185,129,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              Submit
            </motion.button>

            {/* Live sync pill */}
            <div
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold"
              style={{
                background: collabReady ? 'rgba(74,222,128,0.12)' : 'rgba(148,163,184,0.08)',
                border: `1px solid ${collabReady ? 'rgba(74,222,128,0.35)' : 'rgba(148,163,184,0.2)'}`,
                color: collabReady ? '#4ade80' : 'rgba(148,163,184,0.7)',
              }}
              title={collabReady ? 'Live sync with partner is on' : 'Connect with a partner to start live sync'}
            >
              <Radio size={12} />
              {collabReady ? 'Live' : 'Solo'}
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

          {/* Bottom panel: Testcase / Output / Console */}
          <div
            className="flex h-56 flex-col border-t"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0d1117' }}
          >
            <div
              className="flex items-center gap-1 border-b px-3"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              {(['testcase', 'output', 'console'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBottomTab(tab)}
                  className="relative px-3 py-2.5 text-xs font-semibold capitalize transition"
                  style={{ color: bottomTab === tab ? '#fff' : 'rgba(255,255,255,0.4)' }}
                >
                  {tab}
                  {bottomTab === tab && (
                    <motion.span
                      layoutId="bottomTabUnderline"
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-emerald-400"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
              {bottomTab === 'testcase' && (
                <div className="space-y-1.5 text-white/80">
                  <div>
                    <span className="text-white/40">Input:</span> nums = [2,7,11,15], target = 9
                  </div>
                  <div>
                    <span className="text-white/40">Expected:</span> [0,1]
                  </div>
                </div>
              )}

              {bottomTab === 'output' && (
                <div className="space-y-1.5 text-white/80">
                  <div>
                    <span className="text-white/40">Input:</span> nums = [2,7,11,15], target = 9
                  </div>
                  <div>
                    <span className="text-white/40">Output:</span> {runOutput || '[0,1]'}
                  </div>
                  <div>
                    <span className="text-white/40">Expected:</span> [0,1]
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/40">Status:</span>
                    {lastRun === 'fail' ? (
                      <span className="font-semibold text-rose-400">✗ Wrong Answer</span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 size={14} /> Accepted
                      </span>
                    )}
                  </div>
                </div>
              )}

              {bottomTab === 'console' && (
                <div className="space-y-0.5">
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
              )}
            </div>
          </div>
        </main>

        {/* ---------- RIGHT PROBLEMS PANEL ---------- */}
        <aside className="flex w-80 shrink-0 flex-col border-l border-white/5 bg-[#0d1424]/50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <span className="text-sm font-semibold text-white">Problems</span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              {solved.size} / {totalQuestions} solved
            </span>
          </div>

          {/* Topic / question list (scrollable) */}
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {TOPICS.map((topic) => {
              const solvedCount = topic.questions.filter((q) => solved.has(q.id)).length;
              const isExpanded = expandedTopics.has(topic.name);
              const visibleQuestions = isExpanded ? topic.questions : topic.questions.slice(0, 6);
              const hiddenCount = topic.questions.length - visibleQuestions.length;
              return (
                <div key={topic.name} className="rounded-xl border border-white/5 bg-white/[0.03] p-2">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className={`text-sm font-bold ${topic.text}`}>{topic.name}</span>
                    <span className="text-[11px] text-zinc-500">
                      {solvedCount}/{topic.questions.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {visibleQuestions.map((q, i) => {
                      const isSolved = solved.has(q.id);
                      const isActive = selected?.id === q.id;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setSelected(q)}
                          title={`${q.title} · ${q.difficulty}`}
                          className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-semibold transition
                            ${
                              isSolved
                                ? `bg-gradient-to-br ${topic.accent} text-white shadow`
                                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                            }
                            ${isActive ? `ring-2 ring-offset-1 ring-offset-[#0d1424] ${topic.ring}` : ''}`}
                        >
                          <span className={`shrink-0 ${isSolved ? 'text-white/80' : 'text-zinc-500'}`}>
                            {i + 1}.
                          </span>
                          <span className="truncate">{q.title}</span>
                        </button>
                      );
                    })}
                  </div>
                  {topic.questions.length > 5 && (
                    <button
                      onClick={() => toggleTopic(topic.name)}
                      className={`mt-2 w-full rounded-md py-1.5 text-[11px] font-semibold transition ${topic.text} hover:bg-white/5`}
                    >
                      {isExpanded ? 'Show less' : `Load more (${hiddenCount})`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected question info (bottom) */}
          <div className="flex h-72 flex-col border-t border-white/5 bg-[#0b1020]/60 p-4">
            {selected ? (
              <div className="flex min-h-0 flex-1 flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold leading-tight text-white">{selected.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${DIFF_BADGE[selected.difficulty]}`}
                  >
                    {selected.difficulty}
                  </span>
                </div>
                <p className="min-h-0 flex-1 overflow-y-auto text-xs leading-relaxed text-zinc-400">
                  {selected.prompt}
                </p>
                <button
                  onClick={() => toggleSolved(selected.id)}
                  className={`flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                    solved.has(selected.id)
                      ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30 hover:bg-emerald-500/25'
                      : 'bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  {solved.has(selected.id) ? 'Solved' : 'Mark as solved'}
                </button>
              </div>
            ) : (
              <p className="m-auto text-center text-xs text-zinc-600">Select a problem to see details</p>
            )}
          </div>
        </aside>
      </div>

      {/* Language change celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
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
                className="pointer-events-none absolute rounded-full"
                style={{
                  width: 7,
                  height: 7,
                  background: LANGUAGES[i % LANGUAGES.length].color,
                  left: '50%',
                  top: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 12) * Math.PI * 2) * 120,
                  y: Math.sin((i / 12) * Math.PI * 2) * 120,
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface VideoTileProps {
  label: string;
  icon?: React.ReactNode;
  videoRef: RefObject<HTMLVideoElement | null>;
  muted?: boolean;
  mirrored?: boolean;
  placeholder?: string;
  grow?: boolean;
}

function VideoTile({ label, icon, videoRef, muted, mirrored, placeholder, grow }: VideoTileProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 ${
        grow ? 'min-h-[140px] flex-1' : 'aspect-video'
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full object-cover ${mirrored ? '-scale-x-100' : ''}`}
      />
      {placeholder && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a2438] to-[#0d1424] px-3 text-center text-[11px] text-zinc-400">
          {placeholder}
        </div>
      )}
      <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold backdrop-blur">
        {icon}
        {label}
      </span>
    </div>
  );
}

function ControlBtn({
  children,
  onClick,
  active,
  danger,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const base = danger
    ? 'bg-rose-500 text-white hover:bg-rose-600'
    : active
    ? 'bg-white/15 text-white hover:bg-white/25'
    : 'bg-emerald-500/80 text-white hover:bg-emerald-500';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex size-10 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${base}`}
    >
      {children}
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-[11px] text-zinc-600">
            {disabled ? 'Connect with a partner to chat' : 'Say hi 👋'}
          </p>
        ) : (
          messages.map((m) => {
            const name = m.from === 'me' ? 'You' : 'Arjun';
            const time = new Date(m.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div key={m.id} className="flex items-start gap-2">
                <div
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white ${
                    m.from === 'me' ? 'from-fuchsia-500 to-rose-500' : 'from-sky-500 to-indigo-500'
                  }`}
                >
                  {name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold ${
                        m.from === 'me' ? 'text-fuchsia-300' : 'text-sky-300'
                      }`}
                    >
                      {name}
                    </span>
                    <span className="text-[10px] text-zinc-500">{time}</span>
                  </div>
                  <p className="text-xs text-zinc-200">{m.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="flex items-center gap-1.5 border-t border-white/5 p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          disabled={disabled}
          placeholder={disabled ? 'Not connected' : 'Type a message…'}
          className="min-w-0 flex-1 rounded-full bg-[#0b1622] px-3.5 py-2 text-xs text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-600 focus:ring-emerald-500/40 disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={disabled || !draft.trim()}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
