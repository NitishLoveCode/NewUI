'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, TrendingUp, DollarSign, BarChart3, ChevronRight, CheckCircle, ExternalLink } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

const tiers = [
  { name: 'Bronze', min: 0, max: 10, commission: '25%', color: '#cd7f32', icon: '🥉' },
  { name: 'Silver', min: 11, max: 50, commission: '30%', color: '#c0c0c0', icon: '🥈' },
  { name: 'Gold', min: 51, max: 200, commission: '35%', color: '#ffd700', icon: '🥇' },
  { name: 'Diamond', min: 201, max: Infinity, commission: '40%', color: '#00e5ff', icon: '💎' },
];

const recentReferrals = [
  { name: 'Player_7K9X', joined: '2h ago', status: 'Active', earned: '$12.40', avatar: '🎰' },
  { name: 'SlotFan_88', joined: '5h ago', status: 'Deposited', earned: '$28.00', avatar: '💫' },
  { name: 'BetKing_2024', joined: '1d ago', status: 'Active', earned: '$45.20', avatar: '👑' },
  { name: 'LuckyAce_7', joined: '2d ago', status: 'Active', earned: '$8.80', avatar: '🃏' },
  { name: 'SpinMaster', joined: '3d ago', status: 'Active', earned: '$16.60', avatar: '🎡' },
];

const monthlyData = [65, 80, 55, 90, 75, 110, 95, 130, 85, 140, 120, 160];

function AffiliateContent() {
  const [copied, setCopied] = useState(false);
  const refLink = 'https://stake.com/r/YourCode2024';
  const currentReferrals = 47;
  const currentTierIdx = tiers.findIndex(t => currentReferrals >= t.min && currentReferrals <= t.max);
  const currentTier = tiers[currentTierIdx];
  const nextTier = tiers[currentTierIdx + 1];
  const progressToNext = nextTier
    ? ((currentReferrals - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  function handleCopy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="px-6 py-8 max-w-[1400px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1475e1, #0d5bbf)', boxShadow: '0 4px 16px rgba(20,117,225,0.4)' }}
          >
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Affiliate Program</h1>
            <p style={{ color: '#b1bad3' }} className="text-sm">Refer players & earn up to 40% commission for life</p>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { icon: DollarSign, label: 'Total Earnings', value: '$12,450', sub: '+$342 this week', color: '#00e676', bg: 'rgba(0,230,118,0.08)' },
          { icon: Users, label: 'Active Referrals', value: '47', sub: '3 joined today', color: '#1475e1', bg: 'rgba(20,117,225,0.08)' },
          { icon: TrendingUp, label: 'Conversion Rate', value: '18.5%', sub: '+2.1% vs last month', color: '#ffd700', bg: 'rgba(255,215,0,0.08)' },
          { icon: BarChart3, label: 'Avg. Player Value', value: '$53', sub: 'Per referred player', color: '#9b59b6', bg: 'rgba(155,89,182,0.08)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl p-4"
            style={{
              backgroundColor: '#213743',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: stat.bg }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: '#b1bad3' }}>{stat.label}</div>
            <div className="text-xs mt-1 font-semibold" style={{ color: stat.color }}>{stat.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Referral link */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5 mb-5"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="font-bold text-white mb-1">Your Referral Link</h3>
            <p className="text-xs mb-4" style={{ color: '#b1bad3' }}>Share this link to earn commission on every player you refer</p>
            <div className="flex gap-2">
              <div
                className="flex-1 rounded-xl px-4 py-3 text-sm font-mono truncate"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#b1bad3', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {refLink}
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleCopy}
                className="px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shrink-0"
                style={{
                  background: copied ? '#213743' : 'linear-gradient(135deg, #00e676, #00c853)',
                  color: copied ? '#00e676' : '#000',
                  border: copied ? '1px solid #00e676' : 'none',
                }}
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>

            {/* Social share */}
            <div className="flex gap-2 mt-3">
              {[
                { label: 'Twitter', color: '#1DA1F2' },
                { label: 'Telegram', color: '#0088cc' },
                { label: 'WhatsApp', color: '#25D366' },
              ].map(s => (
                <button
                  key={s.label}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ backgroundColor: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30` }}
                >
                  Share on {s.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Monthly chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Monthly Earnings</h3>
              <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(0,230,118,0.1)', color: '#00e676' }}>
                +23% vs last year
              </span>
            </div>
            <div className="flex items-end gap-1.5 h-28">
              {monthlyData.map((v, i) => {
                const max = Math.max(...monthlyData);
                const pct = (v / max) * 100;
                const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="w-full rounded-t-md"
                      style={{
                        background: i === 11 ? 'linear-gradient(180deg, #00ff88, #00e676)' : 'rgba(0,230,118,0.25)',
                        boxShadow: i === 11 ? '0 0 12px rgba(0,230,118,0.4)' : 'none',
                        minHeight: 4,
                      }}
                    />
                    <span className="text-[9px]" style={{ color: i === 11 ? '#00e676' : '#4a6478' }}>{months[i]}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Tier sidebar */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="font-bold text-white mb-4">Commission Tiers</h3>
            <div className="flex flex-col gap-2">
              {tiers.map((tier, i) => (
                <div
                  key={tier.name}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    backgroundColor: i === currentTierIdx ? `${tier.color}12` : 'rgba(255,255,255,0.03)',
                    border: i === currentTierIdx ? `1px solid ${tier.color}30` : '1px solid transparent',
                  }}
                >
                  <span className="text-xl">{tier.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold" style={{ color: i === currentTierIdx ? tier.color : '#fff' }}>{tier.name}</span>
                      {i === currentTierIdx && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full" style={{ backgroundColor: tier.color, color: '#000' }}>YOU</span>
                      )}
                    </div>
                    <span className="text-[10px]" style={{ color: '#b1bad3' }}>
                      {tier.max === Infinity ? `${tier.min}+ referrals` : `${tier.min}–${tier.max} referrals`}
                    </span>
                  </div>
                  <span className="text-sm font-black" style={{ color: tier.color }}>{tier.commission}</span>
                </div>
              ))}
            </div>

            {nextTier && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: '#b1bad3' }}>Progress to {nextTier.name}</span>
                  <span style={{ color: nextTier.color }}>{currentReferrals}/{nextTier.min}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})` }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent referrals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="font-bold text-white mb-3">Recent Referrals</h3>
            <div className="flex flex-col gap-2">
              {recentReferrals.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="flex items-center gap-2 py-1.5"
                >
                  <span className="text-lg">{r.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{r.name}</div>
                    <div className="text-[10px]" style={{ color: '#b1bad3' }}>{r.joined}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold" style={{ color: '#00e676' }}>{r.earned}</div>
                    <div
                      className="text-[9px] font-semibold"
                      style={{ color: r.status === 'Deposited' ? '#ffd700' : '#00e676' }}
                    >
                      {r.status}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#b1bad3' }}>
              View All Referrals <ExternalLink size={11} />
            </button>
          </motion.div>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
}

export default function AffiliatePage() {
  return (
    <PageShell>
      <AffiliateContent />
    </PageShell>
  );
}
