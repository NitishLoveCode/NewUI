'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Clock, Zap, Star, Trophy, Flame, Sparkles, Play } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import GameDetailFullscreen from '@/components/overlays/GameDetailFullscreen';

const promos = [
  {
    id: 1,
    category: 'Welcome',
    badge: 'NEW',
    badgeColor: '#00e676',
    title: 'Welcome Bonus',
    subtitle: 'First deposit bonus',
    amount: '200%',
    value: 'Up to $1,000',
    gradient: 'linear-gradient(135deg, #0f4c2a 0%, #1a7a44 50%, #00e676 100%)',
    glowColor: 'rgba(0,230,118,0.35)',
    icon: '🎰',
    timer: { d: 0, h: 23, m: 14, s: 8 },
    cta: 'Claim Now',
  },
  {
    id: 2,
    category: 'Reload',
    badge: 'HOT',
    badgeColor: '#ff6b35',
    title: 'Weekend Reload',
    subtitle: 'Every Friday & Saturday',
    amount: '50%',
    value: 'Up to $500',
    gradient: 'linear-gradient(135deg, #3d1a6e 0%, #6b2fa0 50%, #9b59b6 100%)',
    glowColor: 'rgba(155,89,182,0.35)',
    icon: '🔄',
    timer: { d: 2, h: 7, m: 42, s: 55 },
    cta: 'Get Bonus',
  },
  {
    id: 3,
    category: 'Free Spins',
    badge: 'LIMITED',
    badgeColor: '#f39c12',
    title: 'Free Spins Frenzy',
    subtitle: 'Book of Dead special',
    amount: '100',
    value: 'Free Spins',
    gradient: 'linear-gradient(135deg, #7f4200 0%, #c05d00 50%, #f39c12 100%)',
    glowColor: 'rgba(243,156,18,0.35)',
    icon: '🎡',
    timer: { d: 1, h: 5, m: 30, s: 0 },
    cta: 'Spin Now',
  },
  {
    id: 4,
    category: 'Cashback',
    badge: 'WEEKLY',
    badgeColor: '#1475e1',
    title: 'Cashback King',
    subtitle: 'Every Monday 00:00 UTC',
    amount: '15%',
    value: 'Weekly Cashback',
    gradient: 'linear-gradient(135deg, #0d2b5a 0%, #1a4f9e 50%, #1475e1 100%)',
    glowColor: 'rgba(20,117,225,0.35)',
    icon: '💰',
    timer: { d: 4, h: 11, m: 20, s: 33 },
    cta: 'Activate',
  },
  {
    id: 5,
    category: 'VIP',
    badge: 'EXCLUSIVE',
    badgeColor: '#ffd700',
    title: 'High Roller Bonus',
    subtitle: 'VIP players only',
    amount: '25%',
    value: 'Up to $5,000',
    gradient: 'linear-gradient(135deg, #5a3a00 0%, #9a6200 50%, #ffd700 100%)',
    glowColor: 'rgba(255,215,0,0.35)',
    icon: '👑',
    timer: { d: 6, h: 0, m: 0, s: 0 },
    cta: 'Go VIP',
  },
  {
    id: 6,
    category: 'Tournament',
    badge: 'LIVE',
    badgeColor: '#e74c3c',
    title: 'Weekly Tournament',
    subtitle: '$50,000 prize pool',
    amount: '$50K',
    value: 'Prize Pool',
    gradient: 'linear-gradient(135deg, #5c0a0a 0%, #9b1515 50%, #e74c3c 100%)',
    glowColor: 'rgba(231,76,60,0.35)',
    icon: '🏆',
    timer: { d: 3, h: 16, m: 45, s: 12 },
    cta: 'Join Now',
  },
];

const tabs = ['All', 'Welcome', 'Reload', 'Free Spins', 'Cashback', 'VIP', 'Tournament'];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45 } }),
};

function TimerBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-sm font-bold tabular-nums leading-tight"
        style={{ color: '#fff' }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] uppercase tracking-widest" style={{ color: '#b1bad3' }}>{label}</span>
    </div>
  );
}

function PromoCard({ promo, index, onPlay }: { promo: typeof promos[0]; index: number; onPlay: () => void }) {

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={{ scale: 1.025, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: promo.gradient,
        boxShadow: `0 8px 32px ${promo.glowColor}, 0 2px 8px rgba(0,0,0,0.4)`,
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)',
        }}
      />

      {/* Badge */}
      <div className="absolute top-3 right-3">
        <span
          className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ backgroundColor: promo.badgeColor, color: '#000' }}
        >
          {promo.badge}
        </span>
      </div>

      <div className="p-5">
        {/* Icon + category */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">{promo.icon}</span>
          <span
            className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.7)' }}
          >
            {promo.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-white leading-tight">{promo.title}</h3>
        <p className="text-xs mt-0.5 mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>{promo.subtitle}</p>

        {/* Amount */}
        <div className="mb-4">
          <div className="text-4xl font-black text-white leading-none">{promo.amount}</div>
          <div className="text-sm font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{promo.value}</div>
        </div>

        {/* Timer */}
        <div
          className="flex items-center gap-1 rounded-xl p-2.5 mb-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          <Clock size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
          <div className="flex items-center gap-2 ml-1">
            <TimerBlock value={promo.timer.d} label="D" />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>:</span>
            <TimerBlock value={promo.timer.h} label="H" />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>:</span>
            <TimerBlock value={promo.timer.m} label="M" />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>:</span>
            <TimerBlock value={promo.timer.s} label="S" />
          </div>
        </div>

        {/* Eye-catching Play button */}
        <div className="flex justify-center mb-2">
          <motion.button
            animate={{
              boxShadow: [
                `0 0 0px 0px ${promo.badgeColor}`,
                `0 0 20px 6px ${promo.badgeColor}60`,
                `0 0 0px 0px ${promo.badgeColor}`,
              ],
              scale: [1, 1.05, 1],
            }}
            transition={{
              boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileHover={{
              scale: 1.15,
              boxShadow: `0 0 30px 10px ${promo.badgeColor}80`,
            }}
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${promo.badgeColor}dd, ${promo.badgeColor}99)`,
              border: `2px solid ${promo.badgeColor}`,
            }}
          >
            <Play size={28} fill="currentColor" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function PromotionsContent() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedPromo, setSelectedPromo] = useState<typeof promos[0] | null>(null);

  const filtered = activeTab === 'All' ? promos : promos.filter(p => p.category === activeTab);

  return (
    <>
      {selectedPromo && (
        <GameDetailFullscreen
          key={selectedPromo.id}
          promo={selectedPromo}
          onClose={() => setSelectedPromo(null)}
        />
      )}
      <div className="px-6 py-8 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00e676, #00c853)', boxShadow: '0 4px 16px rgba(0,230,118,0.4)' }}
          >
            <Gift size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Promotions</h1>
            <p style={{ color: '#b1bad3' }} className="text-sm">Exclusive bonuses & offers — updated daily</p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mt-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#00e676' }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: '#00e676' }} />
          </span>
          <span className="text-xs font-semibold" style={{ color: '#00e676' }}>6 Active Promotions</span>
          <span className="text-xs" style={{ color: '#b1bad3' }}>• Refreshed 2 min ago</span>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 mb-8 flex-wrap"
      >
        {tabs.map(tab => (
          <motion.button
            key={tab}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === tab ? '#00e676' : '#213743',
              color: activeTab === tab ? '#000' : '#b1bad3',
              boxShadow: activeTab === tab ? '0 0 16px rgba(0,230,118,0.45)' : 'none',
            }}
          >
            {tab}
          </motion.button>
        ))}
      </motion.div>

      {/* Featured banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-2xl overflow-hidden mb-8 p-6 md:p-8 flex items-center gap-8"
        style={{
          background: 'linear-gradient(120deg, #0d2b1a 0%, #1a4a2e 40%, #0f3d2a 70%, #112d1f 100%)',
          border: '1px solid rgba(0,230,118,0.2)',
          boxShadow: '0 0 40px rgba(0,230,118,0.12)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,230,118,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} style={{ color: '#00e676' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00e676' }}>Featured Offer</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight">
            Double Your First<br />Deposit — Up to <span style={{ color: '#00e676' }}>$1,000</span>
          </h2>
          <p className="text-sm mb-5" style={{ color: '#b1bad3' }}>
            New players only. Min deposit $20. Wagering 40x. T&Cs apply.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(0,230,118,0.6)' }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-xl text-sm font-bold text-black inline-flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
          >
            <Zap size={16} />
            Claim Welcome Bonus
          </motion.button>
        </div>
        <div className="hidden md:flex flex-col items-center text-center">
          <span className="text-7xl font-black" style={{ color: '#00e676', textShadow: '0 0 40px rgba(0,230,118,0.6)' }}>200%</span>
          <span className="text-sm font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Match Bonus</span>
        </div>
      </motion.div>

      {/* Promo cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((promo, i) => (
          <PromoCard key={promo.id} promo={promo} index={i} onPlay={() => setSelectedPromo(promo)} />
        ))}
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
      >
        {[
          { icon: '🎁', label: 'Active Bonuses', value: '6' },
          { icon: '👥', label: 'Players Claimed Today', value: '2,847' },
          { icon: '💵', label: 'Total Given Out', value: '$1.2M' },
          { icon: '⭐', label: 'Avg. Player Rating', value: '4.9' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <div className="text-lg font-black text-white">{stat.value}</div>
              <div className="text-xs" style={{ color: '#b1bad3' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>
      <div className="h-10" />
    </div>
    </>
  );
}

export default function PromotionsPage() {
  return (
    <PageShell>
      <PromotionsContent />
    </PageShell>
  );
}
