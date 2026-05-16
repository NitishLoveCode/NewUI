'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Handshake, ExternalLink, Globe, Users, TrendingUp, ChevronRight } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

const categories = ['All', 'Football', 'MMA', 'eSports', 'Racing', 'Tennis', 'Cricket'];

const partners = [
  {
    id: 1, category: 'Football',
    name: 'Watford FC',
    desc: 'Premier League & Championship partner — Official front-of-shirt sponsor',
    founded: '2022',
    fans: '18M+',
    gradient: 'linear-gradient(135deg, #1a0a2a, #3d1a6e)',
    color: '#ffd700',
    emoji: '⚽',
  },
  {
    id: 2, category: 'MMA',
    name: 'UFC',
    desc: 'Global MMA partnership — Octagon branding at all major events',
    founded: '2021',
    fans: '625M+',
    gradient: 'linear-gradient(135deg, #1a0000, #4a0000)',
    color: '#e74c3c',
    emoji: '🥊',
  },
  {
    id: 3, category: 'eSports',
    name: 'Team Liquid',
    desc: 'Esports titan — Sponsoring world champions across 15+ game titles',
    founded: '2021',
    fans: '8M+',
    gradient: 'linear-gradient(135deg, #001a3a, #003a8a)',
    color: '#1475e1',
    emoji: '🎮',
  },
  {
    id: 4, category: 'Racing',
    name: 'Alfa Romeo F1',
    desc: 'Formula 1 partner — Stake branding on the iconic Alfa Romeo race cars',
    founded: '2023',
    fans: '77M+',
    gradient: 'linear-gradient(135deg, #1a0000, #3a0808, #8a0000)',
    color: '#ff6b35',
    emoji: '🏎️',
  },
  {
    id: 5, category: 'Cricket',
    name: 'Cricket Australia',
    desc: 'National cricket board partner — All international fixtures and Big Bash',
    founded: '2022',
    fans: '50M+',
    gradient: 'linear-gradient(135deg, #001a0a, #003a14, #006622)',
    color: '#00e676',
    emoji: '🏏',
  },
  {
    id: 6, category: 'MMA',
    name: 'ONE Championship',
    desc: 'Asia\'s premier MMA promotion — Main event title fights sponsorship',
    founded: '2023',
    fans: '150M+',
    gradient: 'linear-gradient(135deg, #0a001a, #1a0040, #4a0090)',
    color: '#9b59b6',
    emoji: '⚔️',
  },
  {
    id: 7, category: 'eSports',
    name: 'Fnatic',
    desc: 'Legendary esports organization — CS2, Valorant, and League of Legends',
    founded: '2022',
    fans: '12M+',
    gradient: 'linear-gradient(135deg, #1a0a00, #3a1500, #7a2800)',
    color: '#ff8c00',
    emoji: '🦁',
  },
  {
    id: 8, category: 'Tennis',
    name: 'ATP Tour',
    desc: 'Official ATP Tour partner — Courtside branding at Grand Slams & Masters',
    founded: '2023',
    fans: '400M+',
    gradient: 'linear-gradient(135deg, #001a1a, #003a3a, #006666)',
    color: '#00e5ff',
    emoji: '🎾',
  },
  {
    id: 9, category: 'Football',
    name: 'Everton FC',
    desc: 'Premier League club partner — Training kit sponsor & stadium branding',
    founded: '2022',
    fans: '30M+',
    gradient: 'linear-gradient(135deg, #001040, #002070, #0040c0)',
    color: '#1475e1',
    emoji: '⚽',
  },
];

function PartnerCard({ p, i }: { p: typeof partners[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: p.gradient,
        border: `1px solid ${p.color}30`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${p.color}15`,
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${p.color}18` }}
          >
            {p.emoji}
          </div>
          <div className="flex items-center gap-1">
            <span
              className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${p.color}22`, color: p.color, border: `1px solid ${p.color}33` }}
            >
              {p.category}
            </span>
          </div>
        </div>
        <h3 className="text-lg font-black text-white mb-1">{p.name}</h3>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{p.desc}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <div>
              <div className="text-xs font-bold" style={{ color: p.color }}>{p.fans}</div>
              <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Fans</div>
            </div>
            <div>
              <div className="text-xs font-bold text-white">{p.founded}</div>
              <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Since</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${p.color}20`, color: p.color }}
          >
            <ExternalLink size={13} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function SponsorshipsContent() {
  const [activeCategory, setActiveCategory] = useState('All');
  const filtered = activeCategory === 'All' ? partners : partners.filter(p => p.category === activeCategory);

  return (
    <div className="px-6 py-8 max-w-[1400px]">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden mb-10 p-8 md:p-14"
        style={{
          background: 'linear-gradient(135deg, #0d0a1a 0%, #1a0a2e 30%, #0a0d2a 70%, #05080f 100%)',
          border: '1px solid rgba(148,0,255,0.15)',
          boxShadow: '0 0 60px rgba(148,0,255,0.08)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(148,0,255,0.06) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,230,118,0.04) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={14} style={{ color: '#9b59b6' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9b59b6' }}>Global Partnerships</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight">
            Our <span style={{ color: '#9b59b6' }}>Partners</span>
          </h1>
          <p className="text-base max-w-xl mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Stake is proud to partner with the world's most iconic sports teams, athletes, and organizations — bringing fans closer to the action.
          </p>
          <div className="flex gap-6 flex-wrap">
            {[
              { value: '50+', label: 'Global Partners' },
              { value: '100+', label: 'Countries' },
              { value: '500M+', label: 'Fans Reached' },
              { value: '5+', label: 'Sports Categories' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black" style={{ color: '#9b59b6' }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Category filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-2 mb-8 flex-wrap">
        {categories.map(cat => (
          <motion.button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: activeCategory === cat ? '#9b59b6' : '#213743',
              color: activeCategory === cat ? '#fff' : '#b1bad3',
              boxShadow: activeCategory === cat ? '0 0 16px rgba(155,89,182,0.45)' : 'none',
            }}
          >
            {cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Partnership CTA banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl p-5 flex items-center justify-between mb-6"
        style={{ backgroundColor: '#213743', border: '1px solid rgba(155,89,182,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <Handshake size={20} style={{ color: '#9b59b6' }} />
          <div>
            <div className="text-sm font-bold text-white">Interested in a Partnership?</div>
            <div className="text-xs" style={{ color: '#b1bad3' }}>We're always looking to collaborate with the world's best sports brands</div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 rounded-xl text-sm font-bold shrink-0 flex items-center gap-1.5"
          style={{ background: 'linear-gradient(135deg, #9b59b6, #6c3483)', color: '#fff' }}
        >
          Get in Touch <ChevronRight size={14} />
        </motion.button>
      </motion.div>

      {/* Partners grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p, i) => <PartnerCard key={p.id} p={p} i={i} />)}
      </div>

      {/* Stats section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, #1a0a2e, #0d0a1a)',
          border: '1px solid rgba(155,89,182,0.15)',
        }}
      >
        <h2 className="text-xl font-black text-white mb-5 text-center">Partnership Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Globe, value: '100+', label: 'Countries', color: '#9b59b6' },
            { icon: Users, value: '500M+', label: 'Combined Fan Base', color: '#1475e1' },
            { icon: TrendingUp, value: '3.2B+', label: 'Impressions / Year', color: '#00e676' },
            { icon: Handshake, value: '50+', label: 'Active Partnerships', color: '#ffd700' },
          ].map((s) => (
            <div key={s.label}>
              <div className="flex justify-center mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${s.color}15` }}
                >
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#b1bad3' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
      <div className="h-10" />
    </div>
  );
}

export default function SponsorshipsPage() {
  return (
    <PageShell>
      <SponsorshipsContent />
    </PageShell>
  );
}
