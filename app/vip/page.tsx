'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Zap, Shield, ChevronRight, Gift, TrendingUp, Clock } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

const tiers = [
  {
    name: 'Bronze',
    icon: '🥉',
    color: '#cd7f32',
    glow: 'rgba(205,127,50,0.35)',
    gradient: 'linear-gradient(135deg, #3d2200, #6b3a00, #cd7f32)',
    xpRequired: '0',
    cashback: '5%',
    withdrawalLimit: '$5,000/day',
    manager: false,
    birthdayBonus: '$25',
    freeSpins: '50',
    current: false,
  },
  {
    name: 'Silver',
    icon: '🥈',
    color: '#c0c0c0',
    glow: 'rgba(192,192,192,0.3)',
    gradient: 'linear-gradient(135deg, #2a2a2a, #4a4a4a, #c0c0c0)',
    xpRequired: '10,000',
    cashback: '8%',
    withdrawalLimit: '$10,000/day',
    manager: false,
    birthdayBonus: '$50',
    freeSpins: '100',
    current: true,
  },
  {
    name: 'Gold',
    icon: '🥇',
    color: '#ffd700',
    glow: 'rgba(255,215,0,0.35)',
    gradient: 'linear-gradient(135deg, #3d2c00, #7a5800, #ffd700)',
    xpRequired: '50,000',
    cashback: '12%',
    withdrawalLimit: '$25,000/day',
    manager: false,
    birthdayBonus: '$150',
    freeSpins: '250',
    current: false,
  },
  {
    name: 'Platinum',
    icon: '💠',
    color: '#e5e7eb',
    glow: 'rgba(229,231,235,0.3)',
    gradient: 'linear-gradient(135deg, #1a2a3a, #2a4a5a, #4a7a9b)',
    xpRequired: '200,000',
    cashback: '18%',
    withdrawalLimit: '$100,000/day',
    manager: true,
    birthdayBonus: '$500',
    freeSpins: '500',
    current: false,
  },
  {
    name: 'Diamond',
    icon: '💎',
    color: '#00e5ff',
    glow: 'rgba(0,229,255,0.4)',
    gradient: 'linear-gradient(135deg, #001a2a, #003a5a, #00e5ff)',
    xpRequired: '1,000,000',
    cashback: '25%',
    withdrawalLimit: 'Unlimited',
    manager: true,
    birthdayBonus: '$2,000',
    freeSpins: '1,000',
    current: false,
  },
];

const benefits = [
  { icon: '💰', title: 'Weekly Cashback', desc: 'Get a percentage of losses returned every week' },
  { icon: '👨‍💼', title: 'Personal VIP Manager', desc: 'Dedicated account manager for premium support' },
  { icon: '🎁', title: 'Birthday Bonus', desc: 'Exclusive bonus package on your special day' },
  { icon: '⚡', title: 'Priority Withdrawals', desc: 'Instant processing with 0 fees on withdrawals' },
  { icon: '🎡', title: 'Free Spins', desc: 'Weekly free spins on top-rated slot games' },
  { icon: '🏆', title: 'VIP Tournaments', desc: 'Exclusive access to high-stakes tournaments' },
  { icon: '📱', title: '24/7 VIP Support', desc: 'Round-the-clock priority customer support' },
  { icon: '🌍', title: 'Exclusive Events', desc: 'Invitations to live events and sporting fixtures' },
];

function VipContent() {
  const currentTierIdx = tiers.findIndex(t => t.current);
  const currentTier = tiers[currentTierIdx];
  const nextTier = tiers[currentTierIdx + 1];
  const userXP = 8450;
  const nextXP = 50000;

  return (
    <div className="px-6 py-8 max-w-[1400px]">
      {/* Cinematic hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden mb-10 p-8 md:p-14 text-center"
        style={{
          background: 'linear-gradient(135deg, #0d0a00 0%, #1a1400 20%, #2a2000 50%, #1a1000 80%, #0a0800 100%)',
          border: '1px solid rgba(255,215,0,0.2)',
          boxShadow: '0 0 60px rgba(255,215,0,0.1), inset 0 1px 0 rgba(255,215,0,0.1)',
        }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)' }} />
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 mx-auto"
          style={{
            background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
            boxShadow: '0 0 40px rgba(255,215,0,0.6)',
          }}
        >
          <Crown size={36} className="text-black" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-black tracking-tighter mb-3"
          style={{
            background: 'linear-gradient(135deg, #ffd700, #ffaa00, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
          }}
        >
          VIP CLUB
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-lg max-w-md mx-auto mb-6"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          The pinnacle of premium gaming. Exclusive rewards, personal service, and unparalleled privileges.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,215,0,0.6)' }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-3.5 rounded-xl font-bold text-base text-black inline-flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
        >
          <Zap size={18} />
          Upgrade My Status
        </motion.button>
      </motion.div>

      {/* Tier cards */}
      <div className="mb-10">
        <h2 className="text-xl font-black text-white mb-5">VIP Tiers</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="relative rounded-2xl p-4 text-center cursor-pointer"
              style={{
                background: tier.gradient,
                border: tier.current ? `2px solid ${tier.color}` : '1px solid rgba(255,255,255,0.1)',
                boxShadow: tier.current ? `0 0 30px ${tier.glow}` : '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {tier.current && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{ backgroundColor: tier.color, color: '#000' }}
                >
                  YOUR TIER
                </div>
              )}
              <div className="text-3xl mb-2">{tier.icon}</div>
              <div className="font-black text-white text-sm">{tier.name}</div>
              <div className="text-xs mt-1 font-bold" style={{ color: tier.color }}>{tier.cashback} Cashback</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {tier.xpRequired === '0' ? 'Starter' : `${tier.xpRequired} XP`}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl p-6 mb-8"
        style={{
          background: `linear-gradient(135deg, #0d1f0d, #1a3320)`,
          border: '1px solid rgba(0,230,118,0.15)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{currentTier.icon}</span>
              <span className="font-black text-white">Current: {currentTier.name}</span>
              {nextTier && <ChevronRight size={14} style={{ color: '#b1bad3' }} />}
              {nextTier && <span className="font-bold" style={{ color: nextTier.color }}>{nextTier.name}</span>}
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: '#b1bad3' }}>{userXP.toLocaleString()} XP earned</span>
              <span style={{ color: '#00e676' }}>{(nextXP - userXP).toLocaleString()} XP to {nextTier?.name}</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(userXP / nextXP) * 100}%` }}
                transition={{ duration: 1.2 }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier?.color || currentTier.color})`,
                  boxShadow: `0 0 12px ${currentTier.glow}`,
                }}
              />
            </div>
          </div>
          <div className="flex gap-5 md:flex-col md:gap-2 shrink-0">
            <div>
              <div className="text-xs" style={{ color: '#b1bad3' }}>This Month</div>
              <div className="font-black" style={{ color: '#00e676' }}>+2,340 XP</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: '#b1bad3' }}>Cashback Earned</div>
              <div className="font-black text-white">$184.20</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Benefits grid */}
      <div className="mb-10">
        <h2 className="text-xl font-black text-white mb-5">Exclusive Benefits</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              whileHover={{ scale: 1.03, y: -3 }}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: '#213743',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="text-3xl mb-3">{b.icon}</div>
              <div className="text-sm font-bold text-white mb-1">{b.title}</div>
              <div className="text-xs" style={{ color: '#b1bad3' }}>{b.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tier comparison */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl overflow-hidden mb-8"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="p-4" style={{ backgroundColor: '#213743' }}>
          <h2 className="text-lg font-black text-white">Tier Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1a2c38' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#b1bad3' }}>Feature</th>
                {tiers.map(t => (
                  <th key={t.name} className="px-4 py-3 text-center font-bold" style={{ color: t.color }}>
                    {t.icon} {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Cashback', key: 'cashback' },
                { label: 'Daily Withdrawal', key: 'withdrawalLimit' },
                { label: 'Birthday Bonus', key: 'birthdayBonus' },
                { label: 'Weekly Free Spins', key: 'freeSpins' },
              ].map((row, ri) => (
                <tr key={row.label} style={{ backgroundColor: ri % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#b1bad3' }}>{row.label}</td>
                  {tiers.map(t => (
                    <td key={t.name} className="px-4 py-3 text-center font-bold" style={{ color: t.current ? t.color : '#fff' }}>
                      {String((t as unknown as Record<string, unknown>)[row.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#b1bad3' }}>Personal Manager</td>
                {tiers.map(t => (
                  <td key={t.name} className="px-4 py-3 text-center">
                    {t.manager ? <span style={{ color: '#00e676' }}>✓</span> : <span style={{ color: '#4a6478' }}>—</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
      <div className="h-10" />
    </div>
  );
}

export default function VipPage() {
  return (
    <PageShell>
      <VipContent />
    </PageShell>
  );
}
