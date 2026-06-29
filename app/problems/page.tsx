'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, List, LayoutGrid,
  ThumbsUp, MessageSquare, Star, Share2, CheckCircle2, Circle, Bookmark,
  Maximize2, Settings2, RotateCcw, Play, Send, SquareTerminal, Flame, Sun, Lock,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// ─── Types & Data ─────────────────────────────────────────────────────────────

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Status = 'solved' | 'unsolved';

interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  acceptance: string;
  topics: string[];
  status: Status;
  bookmarked?: boolean;
}

const PROBLEMS: Problem[] = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy', acceptance: '53.02%', topics: ['Array', 'Hash Table'], status: 'solved', bookmarked: true },
  { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', acceptance: '40.76%', topics: ['Linked List', 'Math'], status: 'unsolved', bookmarked: true },
  { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', acceptance: '32.45%', topics: ['Hash Table'], status: 'unsolved', bookmarked: true },
  { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', acceptance: '31.84%', topics: ['Array', 'Binary Search'], status: 'unsolved' },
  { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium', acceptance: '36.15%', topics: ['String'], status: 'solved' },
  { id: 6, title: 'Zigzag Conversion', difficulty: 'Easy', acceptance: '48.66%', topics: ['String'], status: 'unsolved', bookmarked: true },
  { id: 7, title: 'Reverse Integer', difficulty: 'Easy', acceptance: '41.01%', topics: ['Math'], status: 'solved', bookmarked: true },
  { id: 8, title: 'String to Integer (atoi)', difficulty: 'Medium', acceptance: '27.31%', topics: ['Math'], status: 'unsolved', bookmarked: true },
  { id: 9, title: 'Palindrome Number', difficulty: 'Easy', acceptance: '53.47%', topics: ['Math'], status: 'solved', bookmarked: true },
  { id: 10, title: 'Regular Expression Matching', difficulty: 'Hard', acceptance: '28.21%', topics: ['Dynamic Programming'], status: 'unsolved', bookmarked: true },
];

const TOPICS = ['Array', 'String', 'Dynamic Programming', 'Hash Table', 'Two Pointers', 'Binary Search'];
const FEATURES = ['Has Editorial', 'Has Video Solution', 'Premium Problems', 'Contest Problems'];
const WEEK = [
  { day: 'M', done: true },
  { day: 'T', done: true },
  { day: 'W', done: true },
  { day: 'T', done: true },
  { day: 'F', done: true },
  { day: 'S', done: true },
  { day: 'S', done: false },
];

const LANGUAGES = ['C++', 'Java', 'Python', 'JavaScript'] as const;
const LANG_MONACO: Record<string, string> = { 'C++': 'cpp', Java: 'java', Python: 'python', JavaScript: 'javascript' };

const STARTER_CODE = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for(int i = 0; i < nums.size(); i++){
            int rem = target - nums[i];
            if(mp.find(rem) != mp.end()){
                return {mp[rem], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};`;

// ─── Style helpers ───────────────────────────────────────────────────────────

const DIFF_COLOR: Record<Difficulty, string> = {
  Easy: '#00e676',
  Medium: '#fbbf24',
  Hard: '#f87171',
};

const CARD = '#172b38';
const BORDER = 'rgba(255,255,255,0.07)';
const MUTED = '#7e93a8';

// ─── Subcomponents ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[13px] font-semibold text-white mb-3 tracking-wide">{children}</h3>;
}

function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
      style={{
        background: active ? 'rgba(0,230,118,0.14)' : 'rgba(255,255,255,0.04)',
        color: active ? '#00e676' : '#b1bad3',
        border: `1px solid ${active ? 'rgba(0,230,118,0.4)' : BORDER}`,
      }}
    >
      {label}
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProblemsPage() {
  const [difficulty, setDifficulty] = useState<'All' | Difficulty>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Attempted' | 'Unsolved'>('All');
  const [activeTopics, setActiveTopics] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [listTab, setListTab] = useState<'All Problems' | 'Solved' | 'Bookmarked'>('All Problems');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedId, setSelectedId] = useState(1);
  const [detailTab, setDetailTab] = useState<'Description' | 'Editorial' | 'Solutions' | 'Submissions'>('Description');
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>('C++');
  const [code, setCode] = useState(STARTER_CODE);

  const toggleTopic = (t: string) =>
    setActiveTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const toggleFeature = (f: string) =>
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const filtered = useMemo(() => {
    return PROBLEMS.filter((p) => {
      if (difficulty !== 'All' && p.difficulty !== difficulty) return false;
      if (statusFilter === 'Solved' && p.status !== 'solved') return false;
      if (statusFilter === 'Unsolved' && p.status !== 'unsolved') return false;
      if (activeTopics.length && !activeTopics.some((t) => p.topics.includes(t))) return false;
      if (listTab === 'Solved' && p.status !== 'solved') return false;
      if (listTab === 'Bookmarked' && !p.bookmarked) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [difficulty, statusFilter, activeTopics, listTab, search]);

  const selected = PROBLEMS.find((p) => p.id === selectedId) ?? PROBLEMS[0];

  const clearAll = () => {
    setDifficulty('All');
    setStatusFilter('All');
    setActiveTopics([]);
    setFeatures([]);
    setSearch('');
  };

  return (
    <PageShell>
      <div className="px-4 py-5 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1.1fr)_minmax(0,1.25fr)] gap-4">

          {/* ─── Filters Sidebar ─── */}
          <aside
            className="rounded-2xl p-5 h-fit"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[13px] font-bold tracking-[0.2em] text-white">FILTERS</h2>
              <button onClick={clearAll} className="text-[12px] font-medium" style={{ color: '#00e676' }}>
                Clear All
              </button>
            </div>

            {/* Search */}
            <SectionTitle>Search Problems</SectionTitle>
            <div className="relative mb-6">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, topic or company..."
                className="w-full rounded-lg pl-9 pr-3 py-2.5 text-[12px] text-white outline-none placeholder:text-[#5f7387]"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}
              />
            </div>

            {/* Difficulty */}
            <SectionTitle>Difficulty</SectionTitle>
            <div className="flex flex-wrap gap-2 mb-6">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => {
                const active = difficulty === d;
                const dot = d !== 'All' ? DIFF_COLOR[d] : undefined;
                return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className="px-3 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                    style={{
                      background: active ? 'rgba(0,230,118,0.14)' : 'rgba(255,255,255,0.04)',
                      color: active ? '#00e676' : '#b1bad3',
                      border: `1px solid ${active ? 'rgba(0,230,118,0.4)' : BORDER}`,
                    }}
                  >
                    {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />}
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Topics */}
            <SectionTitle>Topics</SectionTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              {TOPICS.map((t) => (
                <Chip key={t} label={t} active={activeTopics.includes(t)} onClick={() => toggleTopic(t)} />
              ))}
            </div>
            <button className="text-[12px] font-medium mb-6" style={{ color: '#00e676' }}>
              + More
            </button>

            {/* Companies */}
            <SectionTitle>Companies</SectionTitle>
            <button
              className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-[12px] mb-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: MUTED }}
            >
              Select company
              <ChevronDown size={15} />
            </button>

            {/* Status */}
            <SectionTitle>Status</SectionTitle>
            <div className="flex flex-wrap gap-2 mb-6">
              {(['All', 'Solved', 'Attempted', 'Unsolved'] as const).map((s) => (
                <Chip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
              ))}
            </div>

            {/* Features */}
            <SectionTitle>Features</SectionTitle>
            <div className="flex flex-col gap-3 mb-6">
              {FEATURES.map((f) => {
                const on = features.includes(f);
                return (
                  <label key={f} className="flex items-center gap-2.5 cursor-pointer">
                    <span
                      onClick={() => toggleFeature(f)}
                      className="w-4 h-4 rounded flex items-center justify-center transition-colors"
                      style={{
                        background: on ? '#00e676' : 'transparent',
                        border: `1.5px solid ${on ? '#00e676' : 'rgba(255,255,255,0.25)'}`,
                      }}
                    >
                      {on && <CheckCircle2 size={12} color="#0f212e" />}
                    </span>
                    <span className="text-[12px]" style={{ color: '#b1bad3' }}>{f}</span>
                  </label>
                );
              })}
            </div>

            {/* Day Streak */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame size={18} color="#fb923c" />
                  <span className="text-lg font-bold text-white">14</span>
                  <span className="text-[11px]" style={{ color: MUTED }}>Day Streak</span>
                </div>
                <span className="text-[11px] font-medium" style={{ color: MUTED }}>248 / 500 XP</span>
              </div>
              <div className="h-1.5 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: '49%', background: '#00e676' }} />
              </div>
              <div className="flex justify-between">
                {WEEK.map((w, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px]" style={{ color: MUTED }}>{w.day}</span>
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: w.done ? 'rgba(0,230,118,0.16)' : 'rgba(251,146,60,0.16)',
                      }}
                    >
                      {w.done ? <CheckCircle2 size={13} color="#00e676" /> : <Flame size={12} color="#fb923c" />}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ─── Problems List ─── */}
          <section
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}
          >
            {/* Tabs + sort */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-wrap gap-3">
              <div className="flex items-center gap-5">
                {(['All Problems', 'Solved', 'Bookmarked'] as const).map((tab) => {
                  const active = listTab === tab;
                  const count = tab === 'All Problems' ? 4860 : tab === 'Solved' ? 1240 : 156;
                  return (
                    <button
                      key={tab}
                      onClick={() => setListTab(tab)}
                      className="text-[13px] font-semibold pb-1.5 transition-colors flex items-center gap-1.5"
                      style={{
                        color: active ? '#fff' : MUTED,
                        borderBottom: `2px solid ${active ? '#00e676' : 'transparent'}`,
                      }}
                    >
                      {tab}
                      <span className="text-[11px] font-medium" style={{ color: active ? '#00e676' : MUTED }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: '#b1bad3' }}
                >
                  Sort by: <span className="text-white">Newest</span>
                  <ChevronDown size={14} />
                </button>
                <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                  <button
                    onClick={() => setViewMode('list')}
                    className="p-2"
                    style={{ background: viewMode === 'list' ? 'rgba(0,230,118,0.14)' : 'transparent', color: viewMode === 'list' ? '#00e676' : MUTED }}
                  >
                    <List size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className="p-2"
                    style={{ background: viewMode === 'grid' ? 'rgba(0,230,118,0.14)' : 'transparent', color: viewMode === 'grid' ? '#00e676' : MUTED }}
                  >
                    <LayoutGrid size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Column header */}
            <div
              className="grid grid-cols-[40px_1fr_90px_100px_40px] gap-2 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: MUTED, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}
            >
              <span>#</span>
              <span>Title</span>
              <span>Difficulty</span>
              <span>Acceptance</span>
              <span />
            </div>

            {/* Rows */}
            <div className="flex-1">
              {filtered.map((p) => {
                const active = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className="w-full grid grid-cols-[40px_1fr_90px_100px_40px] gap-2 px-5 py-3.5 items-center text-left transition-colors"
                    style={{
                      background: active ? 'rgba(0,230,118,0.07)' : 'transparent',
                      borderBottom: `1px solid ${BORDER}`,
                      borderLeft: `2px solid ${active ? '#00e676' : 'transparent'}`,
                    }}
                  >
                    <span className="text-[13px]" style={{ color: MUTED }}>{p.id}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-medium text-white truncate">{p.title}</span>
                        {p.bookmarked && <Bookmark size={13} style={{ color: MUTED }} />}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {p.topics.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded text-[10.5px]"
                            style={{ background: 'rgba(255,255,255,0.05)', color: MUTED }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[12.5px] font-semibold" style={{ color: DIFF_COLOR[p.difficulty] }}>
                      {p.difficulty}
                    </span>
                    <span className="text-[12.5px]" style={{ color: '#b1bad3' }}>{p.acceptance}</span>
                    {p.status === 'solved' ? (
                      <CheckCircle2 size={18} color="#00e676" />
                    ) : (
                      <Circle size={18} style={{ color: 'rgba(255,255,255,0.18)' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-1.5">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>
                  <ChevronLeft size={15} />
                </button>
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[12.5px] font-medium"
                    style={{
                      background: n === 1 ? 'rgba(0,230,118,0.14)' : 'transparent',
                      color: n === 1 ? '#00e676' : '#b1bad3',
                      border: `1px solid ${n === 1 ? 'rgba(0,230,118,0.4)' : BORDER}`,
                    }}
                  >
                    {n}
                  </button>
                ))}
                <span className="px-1 text-[12.5px]" style={{ color: MUTED }}>…</span>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[12.5px]" style={{ border: `1px solid ${BORDER}`, color: '#b1bad3' }}>
                  243
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>
                  <ChevronRight size={15} />
                </button>
              </div>
              <button
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: '#b1bad3' }}
              >
                20 / page <ChevronDown size={14} />
              </button>
            </div>
          </section>

          {/* ─── Problem Detail ─── */}
          <section
            className="rounded-2xl overflow-hidden flex flex-col xl:col-span-1 lg:col-span-2"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}
          >
            {/* Banner */}
            <div
              className="relative px-5 pt-4 pb-3"
              style={{ background: 'linear-gradient(135deg, rgba(0,230,118,0.10), rgba(0,230,118,0.02))' }}
            >
              <span
                className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold mb-3"
                style={{ background: 'rgba(0,230,118,0.16)', color: '#00e676' }}
              >
                {selected.difficulty}
              </span>
              <h1 className="text-[22px] font-bold text-white mb-3">
                {selected.id}. {selected.title}
              </h1>
              <div className="flex items-center gap-5 flex-wrap text-[12.5px]" style={{ color: '#b1bad3' }}>
                <span className="flex items-center gap-1.5"><ThumbsUp size={14} /> 12.4K</span>
                <span className="flex items-center gap-1.5"><MessageSquare size={14} /> 345</span>
                <span className="flex items-center gap-1.5"><Star size={14} /> Add to List</span>
                <span className="flex items-center gap-1.5"><Share2 size={14} /> Share</span>
              </div>
            </div>

            {/* Detail tabs */}
            <div className="flex items-center gap-5 px-5 pt-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
              {(['Description', 'Editorial', 'Solutions', 'Submissions'] as const).map((tab) => {
                const active = detailTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className="text-[12.5px] font-semibold pb-2.5 pt-1 transition-colors flex items-center gap-1.5"
                    style={{ color: active ? '#fff' : MUTED, borderBottom: `2px solid ${active ? '#00e676' : 'transparent'}` }}
                  >
                    {tab}
                    {tab === 'Solutions' && <span className="text-[11px]" style={{ color: active ? '#00e676' : MUTED }}>12.4K</span>}
                  </button>
                );
              })}
            </div>

            {/* Description body */}
            <div className="px-5 py-4 text-[13.5px] leading-relaxed" style={{ color: '#c6d0dc' }}>
              <p className="mb-3">
                Given an array of integers <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: 'rgba(255,255,255,0.07)', color: '#00e676' }}>nums</code> and an integer <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: 'rgba(255,255,255,0.07)', color: '#00e676' }}>target</code>, return indices of the two numbers such that they add up to <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: 'rgba(255,255,255,0.07)', color: '#00e676' }}>target</code>.
              </p>
              <p className="mb-4">
                You may assume that each input would have exactly one solution, and you may not use the same element twice.
              </p>
              <p className="font-semibold text-white mb-2">Example 1:</p>
              <pre
                className="rounded-lg p-3.5 text-[12.5px] font-mono overflow-x-auto"
                style={{ background: '#0d1d2b', border: `1px solid ${BORDER}`, color: '#c6d0dc' }}
              >
                <span className="text-white font-semibold">Input:</span> nums = [2,7,11,15], target = 9{'\n'}
                <span className="text-white font-semibold">Output:</span> [0,1]{'\n'}
                <span className="text-white font-semibold">Explanation:</span> Because nums[0] + nums[1] == 9,{'\n'}we return [0, 1].
              </pre>
            </div>

            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: `1px solid ${BORDER}`, background: '#0d1d2b' }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as (typeof LANGUAGES)[number])}
                    className="appearance-none rounded-md pl-3 pr-8 py-1.5 text-[12px] text-white outline-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}` }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l} style={{ background: '#172b38' }}>{l}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
                </div>
                <span className="flex items-center gap-1.5 text-[12px]" style={{ color: MUTED }}>
                  <Lock size={12} /> Auto
                </span>
              </div>
              <div className="flex items-center gap-3" style={{ color: MUTED }}>
                <button title="Reset"><RotateCcw size={15} /></button>
                <button title="Fullscreen"><Maximize2 size={15} /></button>
                <button title="Settings"><Settings2 size={15} /></button>
              </div>
            </div>

            {/* Monaco editor */}
            <div className="flex-1 min-h-70" style={{ background: '#0d1117' }}>
              <MonacoEditor
                height="100%"
                language={LANG_MONACO[language]}
                value={code}
                onChange={(v) => setCode(v ?? '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineHeight: 22,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  padding: { top: 12, bottom: 12 },
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8, useShadows: false },
                }}
              />
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: `1px solid ${BORDER}`, background: '#0d1d2b' }}>
              <button
                className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold transition-colors"
                style={{ background: 'rgba(0,230,118,0.16)', color: '#00e676', border: '1px solid rgba(0,230,118,0.4)' }}
              >
                <Play size={15} /> Run
              </button>
              <button
                className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-[13px] font-bold transition-colors"
                style={{ background: '#00e676', color: '#0f212e' }}
              >
                <Send size={15} /> Submit
              </button>
              <button
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#b1bad3', border: `1px solid ${BORDER}` }}
              >
                <SquareTerminal size={15} /> Testcase
              </button>
              <button className="ml-auto p-2.5 rounded-lg" style={{ color: MUTED, border: `1px solid ${BORDER}` }}>
                <Sun size={15} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
