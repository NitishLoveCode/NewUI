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
import useWebRTC from '@/hooks/testSocketHook/useWebRTC';
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
  Play as PlayIcon,
  Terminal,
  Loader2,
} from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// Languages supported by /api/v1/run-code (Judge0).
const LANGUAGES = [
  { id: 'javascript', monaco: 'javascript', label: 'JavaScript', sample: 'console.log("Hello, partner!");' },
  { id: 'python', monaco: 'python', label: 'Python', sample: 'print("Hello, partner!")' },
  { id: 'java', monaco: 'java', label: 'Java', sample: 'class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, partner!");\n  }\n}' },
  { id: 'cpp', monaco: 'cpp', label: 'C++', sample: '#include <iostream>\nint main() {\n  std::cout << "Hello, partner!";\n  return 0;\n}' },
] as const;

type LangId = (typeof LANGUAGES)[number]['id'];

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

  // ---- Code editor state ----
  const [language, setLanguage] = useState<LangId>('javascript');
  const [code, setCode] = useState<string>(LANGUAGES[0].sample);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  // Guards against echoing a remote update straight back to the partner.
  const applyingRemoteRef = useRef(false);

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
    setIsRunning(true);
    setOutput('Running…');
    try {
      const res = await fetch('/api/v1/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOutput(data.error ?? `Error ${res.status}`);
        return;
      }
      const compileErr = data.compile?.stderr?.trim();
      const stdout = data.run?.stdout ?? '';
      const stderr = data.run?.stderr ?? '';
      const parts = [
        compileErr ? `⚠️ Compile:\n${compileErr}` : '',
        stdout,
        stderr ? `stderr:\n${stderr}` : '',
        data.status ? `\n— ${data.status}${data.time ? ` · ${data.time}s` : ''}` : '',
      ].filter(Boolean);
      setOutput(parts.join('\n').trim() || 'No output');
    } catch (e) {
      setOutput(e instanceof Error ? e.message : 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  }, [language, code]);

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
      <aside className="flex w-75 shrink-0 flex-col gap-3 border-r border-white/5 bg-casino-navy/70 p-3">
        {/* You + Partner (square tiles) */}
        <div className="grid grid-cols-2 gap-2">
          {/* You */}
          <VideoTile
            label="You"
            square
            accent="from-emerald-500/20 to-teal-500/10"
            ring="ring-emerald-500/40"
            videoRef={localVideoRef}
            muted
            mirrored
            placeholder={!hasVideo ? 'Camera off' : 'Starting…'}
            overlay={
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
          />

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
                : 'Press Start'
            }
          />
        </div>

        {/* Connection status */}
        <span className="flex items-center justify-center gap-1.5 rounded-full bg-black/30 px-2 py-1 text-[11px]">
          <span className={`size-1.5 rounded-full ${statusMeta.dot}`} />
          {statusMeta.text}
        </span>

        {/* Skip / Stop */}
        <div className="grid grid-cols-2 gap-2">
          {!inSession ? (
            <button
              onClick={joinQueue}
              disabled={!isConnected}
              className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={16} /> {isConnected ? 'Start' : 'Connecting…'}
            </button>
          ) : (
            <>
              <button
                onClick={skip}
                className="flex items-center justify-center gap-2 rounded-lg bg-white/5 py-2.5 text-sm font-semibold text-amber-300 ring-1 ring-amber-400/30 transition hover:bg-amber-400/10"
              >
                <SkipForward size={16} /> Skip
              </button>
              <button
                onClick={leave}
                className="flex items-center justify-center gap-2 rounded-lg bg-rose-500/15 py-2.5 text-sm font-semibold text-rose-300 ring-1 ring-rose-400/30 transition hover:bg-rose-500/25"
              >
                <Square size={16} /> Stop
              </button>
            </>
          )}
        </div>

        {mediaError && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-300">
            {mediaError}
          </div>
        )}

        {/* Chat */}
        <ChatPanel messages={messages} draft={draft} setDraft={setDraft} onSend={handleSend} disabled={status !== 'matched'} />
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

        {/* Code editor workspace */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/5 bg-white/2">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/5 px-3 py-2">
            {selected ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{selected.title}</span>
                <span className={`text-[11px] font-semibold ${DIFF_COLOR[selected.difficulty]}`}>
                  {selected.difficulty}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-zinc-400">Code Editor</span>
            )}

            {collabReady && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400" /> live sync
              </span>
            )}

            <div className="ml-auto flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as LangId)}
                className="rounded-md border border-white/10 bg-[#0b1622] px-2 py-1 text-xs text-zinc-200 outline-none focus:border-emerald-500/40"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>

              {selected && (
                <button
                  onClick={() => toggleSolved(selected.id)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition
                    ${
                      solved.has(selected.id)
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/5 text-zinc-300 ring-1 ring-white/10 hover:bg-white/10'
                    }`}
                >
                  {solved.has(selected.id) ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  {solved.has(selected.id) ? 'Solved' : 'Mark Solved'}
                </button>
              )}

              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded-md bg-linear-to-r from-emerald-500 to-teal-600 px-3 py-1.5 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
              >
                {isRunning ? <Loader2 size={14} className="animate-spin" /> : <PlayIcon size={14} />}
                {isRunning ? 'Running…' : 'Run'}
              </button>
            </div>
          </div>

          {/* Editor + output */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-hidden">
              <MonacoEditor
                language={LANGUAGES.find((l) => l.id === language)?.monaco ?? 'javascript'}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  tabSize: 2,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  fontFamily: "'Fira Code', 'Monaco', monospace",
                }}
              />
            </div>

            {/* Output console */}
            <div className="h-36 shrink-0 overflow-auto border-t border-white/5 bg-[#0b1622] p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
                <Terminal size={12} /> Output
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs text-zinc-300">
                {output || 'Run your code to see the output here.'}
              </pre>
            </div>
          </div>
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
}

function VideoTile({ label, accent, ring, videoRef, muted, mirrored, square, placeholder, overlay, badge }: VideoTileProps) {
  return (
    <div className={`relative ${square ? 'aspect-square' : 'aspect-video'} w-full overflow-hidden rounded-xl bg-linear-to-br ${accent} ring-1 ${ring}`}>
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
      {badge && <div className="absolute right-2 top-2">{badge}</div>}
      {overlay && <div className="absolute bottom-2 right-2">{overlay}</div>}
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
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/5 bg-white/3">
      <div className="border-b border-white/5 px-3 py-2 text-xs font-semibold text-zinc-400">Chat area</div>
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
