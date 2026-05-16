'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Zap, Gift, Clock, ChevronRight, Target } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

const challenges = {
  daily: [
    { id: 1, icon: '🎰', title: 'Slot Master', desc: 'Play 50 slot spins', progress: 32, total: 50, reward: '5 USDT + 50 XP', tag: 'SLOTS', color: '#00e676', timeLeft: '14h 22m' },
    { id: 2, icon: '⚽', title: 'Sports Punter', desc: 'Place 5 sports bets', progress: 3, total: 5, reward: '3 USDT + 30 XP', tag: 'SPORTS', color: '#1475e1', timeLeft: '14h 22m' },
    { id: 3, icon: '🃏', title: 'Card Shark', desc: 'Win 3 blackjack hands', progress: 1, total: 3, reward: '4 USDT + 40 XP', tag: 'TABLE', color: '#9b59b6', timeLeft: '14h 22m' },
    { id: 4, icon: '💎', title: 'Big Winner', desc: 'Land a 10x multiplier', progress: 0, total: 1, reward: '10 USDT + 100 XP', tag: 'SPECIAL', color: '#e74c3c', timeLeft: '14h 22m' },
  ],
  weekly: [
    { id: 5, icon: '🔥', title: 'Hot Streak', desc: 'Win 5 games in a row', progress: 2, total: 5, reward: '25 USDT + 250 XP', tag: 'STREAK', color: '#ff6b35', timeLeft: '5d 2h' },
    { id: 6, icon: '💰', title: 'High Roller', desc: 'Wager $1,000 total', progress: 647, total: 1000, reward: '50 USDT + 500 XP', tag: 'WAGER', color: '#ffd700', timeLeft: '5d 2h' },
    { id: 7, icon: '🏆', title: 'Tournament Hero', desc: 'Finish top 20 in tournament', progress: 0, total: 1, reward: '100 USDT + 1000 XP', tag: 'TOURNAMENT', color: '#00e676', timeLeft: '5d 2h' },
    { id: 8, icon: '🎯', title: 'Marksman', desc: 'Place 30 sports bets', progress: 12, total: 30, reward: '20 USDT + 200 XP', tag: 'SPORTS', color: '#1475e1', timeLeft: '5d 2h' },
  ],
  monthly: [
    { id: 9, icon: '👑', title: 'VIP Journey', desc: 'Reach Gold tier this month', progress: 72, total: 100, reward: '500 USDT + 5000 XP', tag: 'VIP', color: '#ffd700', timeLeft: '14d 8h' },
    { id: 10, icon: '🌊', title: 'Tidal Wave', desc: 'Wager $10,000 total', progress: 4280, total: 10000, reward: '250 USDT + 2500 XP', tag: 'WAGER', color: '#00e676', timeLeft: '14d 8h' },
  ],
};

const leaderboard = [
  { rank: 1, name: 'CryptoKing_99', xp: 48200, tier: 'Diamond', avatar: '👑' },
  { rank: 2, name: 'LuckyAce777', xp: 41500, tier: 'Platinum', avatar: '🌟' },
  { rank: 3, name: 'SlotWizard', xp: 37800, tier: 'Gold', avatar: '🔥' },
  { rank: 4, name: 'PokerFace88', xp: 29400, tier: 'Gold', avatar: '♠️' },
  { rank: 5, name: 'You', xp: 8450, tier: 'Silver', avatar: '🎮', isUser: true },
];

const tierColors: Record<string, string> = {
  Diamond: '#00e5ff',
  Platinum: '#e5e7eb',
  Gold: '#ffd700',
  Silver: '#c0c0c0',
  Bronze: '#cd7f32',
};

function ChallengeCard({ c, i }: { c: typeof challenges.daily[0]; i: number }) {
  const pct = Math.round((c.progress / c.total) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
      whileHover={{ scale: 1.02, y: -3 }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        backgroundColor: '#213743',
        border: `1px solid rgba(255,255,255,0.07)`,
        boxShadow: pct === 100 ? `0 0 20px ${c.color}33` : 'none',
      }}
    >
      {pct === 100 && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ border: `1px solid ${c.color}66` }}
        />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${c.color}18` }}
          >
            {c.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{c.title}</span>
              <span
                className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${c.color}22`, color: c.color }}
              >
                {c.tag}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#b1bad3' }}>{c.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: '#b1bad3' }}>
          <Clock size={10} />
          <span>{c.timeLeft}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: '#b1bad3' }}>{c.progress.toLocaleString()} / {c.total.toLocaleString()}</span>
          <span style={{ color: c.color, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: i * 0.08 + 0.3, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${c.color}88, ${c.color})`,
              boxShadow: `0 0 8px ${c.color}66`,
            }}
          />
        </div>
      </div>

      {/* Reward + CTA */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <Gift size={13} style={{ color: '#ffd700' }} />
          <span className="text-xs font-semibold" style={{ color: '#ffd700' }}>{c.reward}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
          style={{
            backgroundColor: pct === 100 ? c.color : '#2f4553',
            color: pct === 100 ? '#000' : '#fff',
          }}
        >
          {pct === 100 ? 'Claim!' : 'Go'}
          <ChevronRight size={12} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function ChallengesContent() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const currentChallenges = challenges[activeTab];
  const userXP = 8450;
  const nextLevelXP = 10000;
  const level = 42;

  return (
    <div className="px-6 py-8 max-w-[1400px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)', boxShadow: '0 4px 16px rgba(255,215,0,0.4)' }}
          >
            <Trophy size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Challenges</h1>
            <p style={{ color: '#b1bad3' }} className="text-sm">Complete missions to earn XP, USDT & exclusive rewards</p>
          </div>
        </div>

        {/* User XP bar */}
        <div
          className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4"
          style={{ backgroundColor: '#213743', border: '1px solid rgba(255,215,0,0.15)' }}
        >
          <div className="flex items-center gap-4 flex-1">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black shrink-0"
              style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)', color: '#000' }}
            >
              {level}
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-bold text-white">Level {level}</span>
                <span className="text-sm font-bold" style={{ color: '#ffd700' }}>{userXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(userXP / nextLevelXP) * 100}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #ff8c00, #ffd700)',
                    boxShadow: '0 0 12px rgba(255,215,0,0.5)',
                  }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: '#b1bad3' }}>
                {(nextLevelXP - userXP).toLocaleString()} XP until Level {level + 1}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            {[
              { label: 'Streak', value: '7🔥', color: '#ff6b35' },
              { label: 'Completed', value: '124', color: '#00e676' },
              { label: 'This Week', value: '8', color: '#1475e1' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: '#b1bad3' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left - challenges */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['daily', 'weekly', 'monthly'] as const).map(tab => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2 rounded-full text-sm font-bold capitalize"
                style={{
                  backgroundColor: activeTab === tab ? '#ffd700' : '#213743',
                  color: activeTab === tab ? '#000' : '#b1bad3',
                  boxShadow: activeTab === tab ? '0 0 16px rgba(255,215,0,0.4)' : 'none',
                }}
              >
                {tab === 'daily' ? '⚡ Daily' : tab === 'weekly' ? '🔥 Weekly' : '👑 Monthly'}
              </motion.button>
            ))}
          </div>

          {/* Featured challenge */}
          <motion.div
            key={activeTab + '-featured'}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 mb-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a0a00, #3d2200, #5a3500)',
              border: '1px solid rgba(255,215,0,0.25)',
              boxShadow: '0 0 30px rgba(255,215,0,0.1)',
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} style={{ color: '#ffd700' }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#ffd700' }}>Featured Challenge</span>
            </div>
            <h3 className="text-xl font-black text-white mb-1">
              {activeTab === 'daily' ? 'Daily Grind Special — 500 XP Bonus' :
               activeTab === 'weekly' ? 'Champion of the Week — 2,500 XP Bonus' :
               'Monthly Legend — 10,000 XP Mega Reward'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Complete all {activeTab} challenges to unlock this exclusive reward.
            </p>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full w-2/3" style={{ background: 'linear-gradient(90deg, #ff8c00, #ffd700)', boxShadow: '0 0 10px rgba(255,215,0,0.5)' }} />
              </div>
              <span className="text-sm font-bold" style={{ color: '#ffd700' }}>2/3 Done</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentChallenges.map((c, i) => <ChallengeCard key={c.id} c={c} i={i} />)}
          </div>
        </div>

        {/* Right - leaderboard */}
        <div className="w-full lg:w-72 shrink-0">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} style={{ color: '#ffd700' }} />
              <span className="font-bold text-white text-sm">XP Leaderboard</span>
            </div>
            <div className="flex flex-col gap-2">
              {leaderboard.map((p, i) => (
                <motion.div
                  key={p.rank}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{
                    backgroundColor: p.isUser ? 'rgba(0,230,118,0.08)' : 'rgba(255,255,255,0.03)',
                    border: p.isUser ? '1px solid rgba(0,230,118,0.2)' : '1px solid transparent',
                  }}
                >
                  <span
                    className="w-6 text-center text-xs font-black"
                    style={{ color: p.rank <= 3 ? '#ffd700' : '#b1bad3' }}
                  >
                    {p.rank <= 3 ? ['🥇', '🥈', '🥉'][p.rank - 1] : `#${p.rank}`}
                  </span>
                  <span className="text-xl">{p.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                    <div className="text-[10px]" style={{ color: tierColors[p.tier] }}>{p.tier}</div>
                  </div>
                  <div className="text-xs font-bold" style={{ color: p.isUser ? '#00e676' : '#b1bad3' }}>
                    {p.xp.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Streak card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-5 mt-4"
            style={{
              background: 'linear-gradient(135deg, #1f0a0a, #3d1515, #5a2020)',
              border: '1px solid rgba(231,76,60,0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Flame size={16} style={{ color: '#ff6b35' }} />
              <span className="font-bold text-white text-sm">7-Day Streak 🔥</span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>Keep it going for a bonus!</p>
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: i < 7 ? '#ff6b35' : 'rgba(255,255,255,0.08)',
                    boxShadow: i < 7 ? '0 0 8px rgba(255,107,53,0.5)' : 'none',
                  }}
                >
                  {i < 7 ? '🔥' : ''}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <PageShell>
      <ChallengesContent />
    </PageShell>
  );
}
