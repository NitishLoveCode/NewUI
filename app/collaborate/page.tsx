'use client';

import { useState } from 'react';
import {
  Plus,
  LayoutGrid,
  Compass,
  Users,
  History as HistoryIcon,
  FileText,
  Heart,
  Flame,
  Trophy,
  Bell,
  ChevronDown,
  ChevronRight,
  Crown,
  Lock,
  Copy,
  Settings,
  UserPlus,
  Mic,
  Video,
  Share2,
  MessageSquare,
  PhoneOff,
  Send,
  Plus as PlusIcon,
  Eye,
  Play,
  MoreVertical,
  Code2,
  Circle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const navItems = ['Problems', 'Collaborate', 'Contests', 'Discuss', 'Leaderboard'];

const sidebarMenu = [
  { label: 'My Rooms', icon: LayoutGrid, active: true },
  { label: 'Discover', icon: Compass, active: false },
  { label: 'Friends', icon: Users, active: false },
  { label: 'History', icon: HistoryIcon, active: false },
  { label: 'Templates', icon: FileText, active: false },
];

const recentRooms = [
  { name: 'Binary Buddies', members: 2, active: true },
  { name: 'DP Ninjas', members: 4, active: false },
  { name: 'Graph Gurus', members: 3, active: false },
  { name: 'Weekend Warriors', members: 5, active: false },
];

const chatMessages = [
  { name: 'Arjun', time: '10:32 AM', text: 'Shall we try the optimal solution?' },
  { name: 'You', time: '10:33 AM', text: "Yes! I'll handle the edge cases." },
  { name: 'Arjun', time: '10:34 AM', text: 'Nice catch! 🎉' },
];

const codeLines: { n: number; code: React.ReactNode }[] = [
  { n: 1, code: '' },
  { n: 2, code: <><span className="text-[#c586c0]">#include</span> <span className="text-[#ce9178]">&lt;bits/stdc++.h&gt;</span></> },
  { n: 3, code: <><span className="text-[#569cd6]">using namespace</span> <span className="text-[#4ec9b0]">std</span>;</> },
  { n: 4, code: '' },
  { n: 5, code: <><span className="text-[#4ec9b0]">vector</span>&lt;<span className="text-[#569cd6]">int</span>&gt; <span className="text-[#dcdcaa]">twoSum</span>(<span className="text-[#4ec9b0]">vector</span>&lt;<span className="text-[#569cd6]">int</span>&gt;&amp; nums, <span className="text-[#569cd6]">int</span> target) {'{'}</> },
  { n: 6, code: <>{'  '}<span className="text-[#4ec9b0]">unordered_map</span>&lt;<span className="text-[#569cd6]">int</span>, <span className="text-[#569cd6]">int</span>&gt; mp;</> },
  { n: 7, code: <>{'  '}<span className="text-[#c586c0]">for</span> (<span className="text-[#569cd6]">int</span> i = <span className="text-[#b5cea8]">0</span>; i &lt; nums.<span className="text-[#dcdcaa]">size</span>(); ++i) {'{'}</> },
  { n: 8, code: <>{'    '}<span className="text-[#569cd6]">int</span> rem = target - nums[i];</>, },
  { n: 9, code: <>{'    '}<span className="text-[#c586c0]">if</span> (mp.<span className="text-[#dcdcaa]">find</span>(rem) != mp.<span className="text-[#dcdcaa]">end</span>()) {'{'}</> },
  { n: 10, code: <>{'      '}<span className="text-[#c586c0]">return</span> {'{'}mp[rem], i{'}'};</> },
  { n: 11, code: <>{'    '}{'}'}</> },
  { n: 12, code: <>{'    '}mp[nums[i]] = i;</> },
  { n: 13, code: <>{'  '}{'}'}</> },
  { n: 14, code: <>{'  '}<span className="text-[#c586c0]">return</span> {'{}'};</> },
  { n: 15, code: '' },
  { n: 16, code: <>{'}'}</> },
  { n: 17, code: '' },
  { n: 18, code: '' },
  { n: 19, code: '' },
  { n: 20, code: '' },
];

const roomInfo = [
  { label: 'Room ID', value: '#BINBUD123', copy: true },
  { label: 'Created by', value: 'Arjun' },
  { label: 'Created on', value: 'May 29, 2024' },
  { label: 'Language', value: 'C++' },
  { label: 'Room Type', value: 'Private' },
];

const participants = [
  { name: 'Arjun', role: 'Owner', owner: true },
  { name: 'You', role: 'Editor', owner: false },
];

const liveCollab = [
  { name: 'Arjun', line: 8, color: '#a855f7' },
  { name: 'You', line: 14, color: '#22c55e' },
];

const sharedFiles = [
  { name: 'Two Sum.cpp', active: true },
  { name: 'README.md', active: false },
  { name: 'Notes.txt', active: false },
];

const roomActivity = [
  { name: 'Arjun', action: 'joined the room', time: '10:30 AM' },
  { name: 'You', action: 'joined the room', time: '10:31 AM' },
];

const testcases = ['Testcase 1', 'Testcase 2', 'Testcase 3'];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CollaboratePage() {
  const [activeNav, setActiveNav] = useState('Collaborate');
  const [activeTestcase, setActiveTestcase] = useState('Testcase 1');
  const [bottomTab, setBottomTab] = useState('Testcase');

  return (
    <div className="min-h-screen bg-[#08120d] text-white font-sans">
      {/* ===================== TOP NAVBAR ===================== */}
      <header className="h-16 flex items-center justify-between px-6 bg-[#0b1812] border-b border-[#16271d]">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <div className="flex items-center text-2xl font-black tracking-tight">
            <span className="text-white">i</span>
            <Heart size={20} className="mx-0.5 fill-red-500 text-red-500" />
            <span className="text-white">dsa</span>
            <span className="text-[#22c55e]">.com</span>
          </div>
          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`relative py-5 font-medium transition-colors ${
                  activeNav === item ? 'text-white' : 'text-[#8aa39a] hover:text-white'
                }`}
              >
                {item}
                {activeNav === item && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22c55e] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2a1a0e] border border-[#553311]">
            <Flame size={15} className="text-orange-500" />
            <span className="text-xs font-semibold text-orange-300">14 day streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2a2410] border border-[#5c5117]">
            <Trophy size={15} className="text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-300">Gold</span>
          </div>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#13241b] border border-[#1f3528] hover:bg-[#1a2e22]">
            <Bell size={17} className="text-[#8aa39a]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#22c55e]" />
          </button>
          <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-[#13241b] border border-[#1f3528] hover:bg-[#1a2e22]">
            <img
              src="https://i.pravatar.cc/64?img=12"
              alt="Arjun"
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="text-sm font-medium">Arjun</span>
            <ChevronDown size={15} className="text-[#8aa39a]" />
          </button>
        </div>
      </header>

      {/* ===================== BODY ===================== */}
      <div className="flex">
        {/* ============ LEFT SIDEBAR ============ */}
        <aside className="w-52 shrink-0 p-4 border-r border-[#16271d] flex flex-col gap-5 min-h-[calc(100vh-4rem)]">
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#062611] font-bold text-sm shadow-[0_4px_16px_rgba(34,197,94,0.35)] transition-colors">
            <Plus size={18} strokeWidth={3} />
            New Room
          </button>

          {/* Menu */}
          <nav className="flex flex-col gap-1">
            {sidebarMenu.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#16331f] text-[#4ade80]'
                    : 'text-[#8aa39a] hover:bg-[#11201a] hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          {/* Recent rooms */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-[#5d7268]">RECENT ROOMS</p>
            <div className="flex flex-col gap-1">
              {recentRooms.map((room) => (
                <button
                  key={room.name}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    room.active ? 'bg-[#11201a]' : 'hover:bg-[#11201a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{room.name}</p>
                      <p className="text-[11px] text-[#5d7268]">{room.members} members</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1 px-3 mt-2 text-xs font-medium text-[#4ade80] hover:underline">
              View all rooms <ChevronRight size={13} />
            </button>
          </div>

          {/* Promo card */}
          <div className="mt-auto relative overflow-hidden rounded-2xl p-4 bg-linear-to-br from-[#0f2c1c] to-[#0a1d13] border border-[#1d3a29]">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-[#22c55e]/10 blur-2xl" />
            <p className="text-base font-extrabold text-white leading-tight">Code Together.</p>
            <p className="text-base font-extrabold text-[#4ade80] leading-tight mb-2">Grow Together.</p>
            <p className="text-[11px] text-[#8aa39a] mb-3">Real-time collaboration that feels magical ✨</p>
            <div className="flex items-center mb-3">
              {[14, 22, 33, 44].map((img, i) => (
                <img
                  key={img}
                  src={`https://i.pravatar.cc/48?img=${img}`}
                  alt=""
                  className="w-7 h-7 rounded-full border-2 border-[#0a1d13] object-cover"
                  style={{ marginLeft: i === 0 ? 0 : -8 }}
                />
              ))}
              <span className="ml-1 text-xs font-semibold text-[#4ade80]">+12K</span>
            </div>
            <button className="w-full py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-[#062611] text-sm font-bold transition-colors">
              Explore Rooms
            </button>
          </div>
        </aside>

        {/* ============ CENTER ============ */}
        <main className="flex-1 min-w-0 p-4 flex flex-col gap-4">
          {/* Room header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#16331f] flex items-center justify-center text-2xl">🧩</div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white">Binary Buddies</h1>
                  <Lock size={14} className="text-[#8aa39a]" />
                  <span className="px-2 py-0.5 rounded-md bg-[#13241b] border border-[#1f3528] text-[10px] font-semibold text-[#8aa39a]">
                    Private
                  </span>
                </div>
                <p className="text-xs text-[#8aa39a]">Let&apos;s solve some hard problems!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#13241b] border border-[#1f3528] hover:bg-[#1a2e22]">
                <Copy size={16} className="text-[#8aa39a]" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#13241b] border border-[#1f3528] hover:bg-[#1a2e22]">
                <Settings size={16} className="text-[#8aa39a]" />
              </button>
              <button className="flex items-center gap-2 px-4 h-9 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-[#062611] text-sm font-bold transition-colors">
                <UserPlus size={16} />
                Invite
              </button>
              <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-[#13241b] border border-[#1f3528]">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-xs font-semibold text-[#4ade80]">Live</span>
                <span className="text-xs font-mono text-[#8aa39a]">2:24:18</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[230px_1fr] gap-4 items-start">
            {/* ---- Left column: video + chat ---- */}
            <div className="flex flex-col gap-3">
              {/* Video tiles */}
              {[
                { name: 'Arjun', crown: true, img: 12 },
                { name: 'You', crown: false, img: 47 },
              ].map((v) => (
                <div
                  key={v.name}
                  className="relative aspect-video rounded-xl overflow-hidden border border-[#1f3528]"
                >
                  <img
                    src={`https://i.pravatar.cc/300?img=${v.img}`}
                    alt={v.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                  {v.crown && (
                    <Crown size={18} className="absolute top-2 right-2 fill-yellow-400 text-yellow-400" />
                  )}
                  {!v.crown && (
                    <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                      <MoreVertical size={15} className="text-white" />
                    </button>
                  )}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/50">
                    <Mic size={12} className="text-[#22c55e]" />
                    <span className="text-xs font-medium text-white">{v.name}</span>
                  </div>
                </div>
              ))}

              {/* Call controls */}
              <div className="flex items-center justify-between px-1">
                {[
                  { icon: Mic, label: 'Mic' },
                  { icon: Video, label: 'Camera' },
                  { icon: Share2, label: 'Share' },
                  { icon: MessageSquare, label: 'Chat' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <button className="w-11 h-11 rounded-full bg-[#13241b] border border-[#1f3528] flex items-center justify-center hover:bg-[#1a2e22]">
                      <Icon size={17} className="text-white" />
                    </button>
                    <span className="text-[10px] text-[#8aa39a]">{label}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1">
                  <button className="w-11 h-11 rounded-full bg-[#ef4444] hover:bg-[#dc2626] flex items-center justify-center">
                    <PhoneOff size={17} className="text-white" />
                  </button>
                  <span className="text-[10px] text-[#ef4444]">Leave</span>
                </div>
              </div>

              {/* Room chat */}
              <div className="rounded-xl bg-[#0b1812] border border-[#16271d] flex flex-col">
                <p className="px-4 py-3 text-sm font-semibold text-white border-b border-[#16271d]">Room Chat</p>
                <div className="flex flex-col gap-3 p-4">
                  {chatMessages.map((m, i) => (
                    <div key={i} className="flex gap-2">
                      <img
                        src={`https://i.pravatar.cc/32?img=${m.name === 'Arjun' ? 12 : 47}`}
                        alt={m.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{m.name}</span>
                          <span className="text-[10px] text-[#5d7268]">{m.time}</span>
                        </div>
                        <p className="text-xs text-[#b9c8c0]">{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-[#16271d]">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#11201a] border border-[#1f3528]">
                    <input
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-xs text-white placeholder:text-[#5d7268] outline-none"
                    />
                    <button className="text-[#22c55e]">
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ---- Right column: editor + console ---- */}
            <div className="flex flex-col gap-4">
              {/* Editor */}
              <div className="rounded-xl bg-[#0b1812] border border-[#16271d] overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center gap-1 px-2 pt-2 bg-[#0d1a13] justify-between border-b border-[#16271d] bg-[#0d1a13]">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-t-lg bg-[#10211a] text-sm">
                    <FileText size={14} className="text-[#4ade80]" />
                    <span className="text-white">Two Sum.cpp</span>
                    <button className="text-[#5d7268] hover:text-white text-base leading-none">×</button>
                  </div>
                  {/* <button className="w-7 h-7 flex items-center justify-center text-[#5d7268] hover:text-white">
                    <PlusIcon size={15} />
                  </button> */}
                {/* </div> */}
                {/* Toolbar */}
                {/* <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-[#16271d] bg-[#0d1a13]"> */}
                <div className='flex items-center justify-center gap-2'>
                  <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#11201a] border border-[#1f3528] text-xs text-white">
                    C++ <ChevronDown size={12} className="text-[#8aa39a]" />
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-md bg-[#11201a] border border-[#1f3528] text-[#8aa39a]">
                    <Code2 size={13} />
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-md bg-[#11201a] border border-[#1f3528] text-[#8aa39a]">
                    <PlusIcon size={13} />
                  </button>
                  {/* <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#11201a] border border-[#1f3528] text-xs text-white">
                    Auto <ChevronDown size={12} className="text-[#8aa39a]" />
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-md bg-[#11201a] border border-[#1f3528] text-[#8aa39a]">
                    <Circle size={13} />
                  </button> */}
                  </div>
                </div>
                {/* Code */}
                <div className="relative font-mono text-[13px] leading-6 p-3 overflow-x-auto">
                  {codeLines.map((line) => (
                    <div
                      key={line.n}
                      className={`flex ${line.n === 8 ? 'bg-[#16331f]/50 -mx-3 px-3' : ''}`}
                    >
                      <span className="w-8 shrink-0 text-right pr-3 select-none text-[#41584c]">{line.n}</span>
                      <pre className="text-[#d4d4d4] whitespace-pre">{line.code}</pre>
                    </div>
                  ))}
                  {/* Cursor labels */}
                  <span className="absolute left-82.5 top-16 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#a855f7] text-white">
                    Arjun
                  </span>
                  <span className="absolute left-37.5 top-40 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#facc15] text-black">
                    You
                  </span>
                </div>
                {/* Status bar */}
                <div className="flex items-center gap-4 px-3 py-1.5 border-t border-[#16271d] bg-[#0d1a13] text-[11px] text-[#8aa39a]">
                  <span>Ln 8, Col 30</span>
                  <span>Spaces: 4</span>
                  <span>UTF-8</span>
                  <span>C++</span>
                  <span className="ml-auto flex items-center gap-1 text-[#4ade80]">
                    <Users size={12} /> 2 collaborators
                  </span>
                </div>
              </div>

              {/* Console */}
              <div className="rounded-xl bg-[#0b1812] border border-[#16271d] overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center gap-5 px-4 pt-3 border-b border-[#16271d]">
                  {['Console', 'Testcase', 'Output'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setBottomTab(tab)}
                      className={`pb-2.5 text-sm font-medium relative ${
                        bottomTab === tab ? 'text-white' : 'text-[#8aa39a] hover:text-white'
                      }`}
                    >
                      {tab}
                      {bottomTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22c55e] rounded-full" />
                      )}
                    </button>
                  ))}
                  <button className="ml-auto pb-2.5 text-[#8aa39a] hover:text-white">
                    <PlusIcon size={15} />
                  </button>
                </div>

                <div className="p-4">
                  {/* Testcase pills */}
                  <div className="flex items-center gap-2 mb-4">
                    {testcases.map((tc) => (
                      <button
                        key={tc}
                        onClick={() => setActiveTestcase(tc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activeTestcase === tc
                            ? 'bg-[#16331f] text-[#4ade80] border border-[#22c55e]/40'
                            : 'bg-[#11201a] text-[#8aa39a] border border-[#1f3528] hover:text-white'
                        }`}
                      >
                        {tc}
                      </button>
                    ))}
                    <button className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#11201a] border border-[#1f3528] text-xs text-[#8aa39a] hover:text-white">
                      <PlusIcon size={13} /> Add Testcase
                    </button>
                  </div>

                  {/* Input / Output */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="w-28 shrink-0 text-xs text-[#8aa39a]">Input</span>
                      <div className="flex-1 px-3 py-2 rounded-lg bg-[#11201a] border border-[#1f3528] font-mono text-xs text-[#d4d4d4]">
                        nums = [2,7,11,15], target = 9
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-28 shrink-0 text-xs text-[#8aa39a]">Expected Output</span>
                      <div className="flex-1 px-3 py-2 rounded-lg bg-[#11201a] border border-[#1f3528] font-mono text-xs text-[#d4d4d4]">
                        [0,1]
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-3 mt-5">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#11201a] border border-[#1f3528] text-sm font-semibold text-white hover:bg-[#1a2e22]">
                      <Play size={15} className="text-[#4ade80]" /> Run Code
                    </button>
                    <button className="px-5 py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-[#062611] text-sm font-bold transition-colors">
                      Submit Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ============ RIGHT SIDEBAR ============ */}
        <aside className="w-60 shrink-0 p-4 border-l border-[#16271d] flex flex-col gap-5">
          {/* Room Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Room Info</h3>
            <div className="flex flex-col gap-2.5">
              {roomInfo.map((info) => (
                <div key={info.label} className="flex items-center justify-between text-xs">
                  <span className="text-[#8aa39a]">{info.label}</span>
                  <span className="flex items-center gap-1.5 font-medium text-white">
                    {info.value}
                    {info.copy && <Copy size={12} className="text-[#8aa39a] cursor-pointer hover:text-white" />}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Participants (2)</h3>
            <div className="flex flex-col gap-3">
              {participants.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={`https://i.pravatar.cc/40?img=${p.name === 'Arjun' ? 12 : 47}`}
                        alt={p.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#22c55e] border-2 border-[#08120d]" />
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-sm font-medium text-white">
                        {p.name}
                        {p.owner && <Crown size={12} className="fill-yellow-400 text-yellow-400" />}
                      </p>
                      <p className="text-[11px] text-[#4ade80]">Online</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      p.owner
                        ? 'bg-[#2a2410] text-yellow-300 border border-[#5c5117]'
                        : 'bg-[#13241b] text-[#8aa39a] border border-[#1f3528]'
                    }`}
                  >
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Collaboration */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Live Collaboration</h3>
            <div className="flex flex-col gap-2">
              {liveCollab.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#11201a] border border-[#1f3528]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <div>
                      <p className="text-xs font-medium text-white">{c.name}</p>
                      <p className="text-[10px] text-[#8aa39a]">Editing Line {c.line}</p>
                    </div>
                  </div>
                  <Eye size={14} className="text-[#8aa39a]" />
                </div>
              ))}
            </div>
          </div>

          {/* Shared Files */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Shared Files</h3>
              <button className="text-[#8aa39a] hover:text-white">
                <PlusIcon size={15} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {sharedFiles.map((f) => (
                <button
                  key={f.name}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    f.active
                      ? 'bg-[#16331f] text-[#4ade80] border border-[#22c55e]/30'
                      : 'text-[#b9c8c0] hover:bg-[#11201a]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText size={13} />
                    {f.name}
                  </span>
                  {f.active && <ChevronDown size={13} />}
                </button>
              ))}
            </div>
          </div>

          {/* Room Activity */}
          
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Room Activity</h3>
            <div className="flex flex-col gap-3">
              {roomActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <img
                    src={`https://i.pravatar.cc/32?img=${a.name === 'Arjun' ? 12 : 47}`}
                    alt={a.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-[#b9c8c0]">
                      <span className="font-medium text-white">{a.name}</span> {a.action}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#5d7268]">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
