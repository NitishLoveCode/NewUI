'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Clock, ArrowRight, TrendingUp, BookOpen, Tag } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

const categories = ['All', 'Strategy', 'Casino Tips', 'Sports', 'News', 'Promotions', 'Guides'];

const featured = {
  category: 'News',
  title: 'Stake Announces $100M Partnership with World\'s Top Football Club',
  excerpt: 'In a historic deal that reshapes the sports sponsorship landscape, Stake has signed a landmark agreement that will see our brand displayed globally across all major tournaments and broadcasts.',
  author: 'James Crawford',
  date: 'May 15, 2026',
  readTime: '5 min read',
  gradient: 'linear-gradient(135deg, #0d2b1a 0%, #1a4a2e 40%, #0f3322 100%)',
};

const articles = [
  {
    id: 1, category: 'Strategy', tag: 'POPULAR',
    title: 'The Ultimate Blackjack Strategy Guide for 2026',
    excerpt: 'Master the art of blackjack with our comprehensive strategy guide covering basic strategy, card counting fundamentals, and bankroll management.',
    author: 'Maria Santos', date: 'May 14, 2026', readTime: '8 min', color: '#1475e1',
    gradient: 'linear-gradient(135deg, #0d2040, #1a3a7a)',
  },
  {
    id: 2, category: 'Casino Tips', tag: 'NEW',
    title: '10 Slot Machine Myths Debunked by Experts',
    excerpt: 'We asked professional gamblers and mathematicians to separate fact from fiction when it comes to slot machine payouts and patterns.',
    author: 'Alex Thompson', date: 'May 13, 2026', readTime: '6 min', color: '#9b59b6',
    gradient: 'linear-gradient(135deg, #1a0a2e, #3d1a6e)',
  },
  {
    id: 3, category: 'Sports', tag: 'HOT',
    title: 'Champions League Predictions: Who Lifts the Trophy?',
    excerpt: 'Our expert analysts break down the contenders, form guides, and odds for the most prestigious club football competition in the world.',
    author: 'Carlos Mendes', date: 'May 12, 2026', readTime: '10 min', color: '#00e676',
    gradient: 'linear-gradient(135deg, #0d2c1a, #1a4a2e)',
  },
  {
    id: 4, category: 'Promotions', tag: 'FEATURED',
    title: 'How to Maximize Your Welcome Bonus: A Step-by-Step Guide',
    excerpt: 'New to Stake? Our guide walks you through every step to claim, wager, and maximize your welcome bonus package with proven strategies.',
    author: 'Sarah Kim', date: 'May 11, 2026', readTime: '7 min', color: '#ffd700',
    gradient: 'linear-gradient(135deg, #2a1a00, #4a3000)',
  },
  {
    id: 5, category: 'Guides', tag: 'ESSENTIAL',
    title: 'Responsible Gambling: Setting Limits That Work for You',
    excerpt: 'Understanding your limits is the foundation of enjoyable gambling. We explore practical tools, mental frameworks, and resources for healthy play.',
    author: 'Dr. Lisa Park', date: 'May 10, 2026', readTime: '12 min', color: '#00e5ff',
    gradient: 'linear-gradient(135deg, #001a2a, #003a5a)',
  },
  {
    id: 6, category: 'Casino Tips', tag: 'GUIDE',
    title: 'Live Casino vs RNG: Which Should You Choose?',
    excerpt: 'We compare the experience, odds, and atmosphere of live dealer games against their RNG counterparts to help you make the best choice.',
    author: 'Tom Wilson', date: 'May 9, 2026', readTime: '5 min', color: '#ff6b35',
    gradient: 'linear-gradient(135deg, #2a0d00, #5a2000)',
  },
];

function ArticleCard({ a, i }: { a: typeof articles[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="rounded-2xl overflow-hidden cursor-pointer flex flex-col"
      style={{
        backgroundColor: '#213743',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Image area */}
      <div
        className="h-36 relative"
        style={{ background: a.gradient }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ backgroundColor: a.color, color: '#000' }}
          >
            {a.tag}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.8)' }}
          >
            {a.category}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-black text-white mb-2 leading-snug line-clamp-2">{a.title}</h3>
        <p className="text-xs leading-relaxed mb-3 flex-1" style={{ color: '#b1bad3' }}>{a.excerpt}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-xs font-semibold text-white">{a.author}</div>
            <div className="text-[10px]" style={{ color: '#b1bad3' }}>{a.date} · {a.readTime}</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${a.color}18`, color: a.color }}
          >
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function BlogContent() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="px-6 py-8 max-w-[1400px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1475e1, #0a47a0)', boxShadow: '0 4px 16px rgba(20,117,225,0.4)' }}
          >
            <Newspaper size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Blog</h1>
            <p style={{ color: '#b1bad3' }} className="text-sm">Strategies, news & insights from our expert team</p>
          </div>
        </div>
      </motion.div>

      {/* Featured article */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.01 }}
        className="relative rounded-2xl overflow-hidden mb-8 cursor-pointer"
        style={{
          background: featured.gradient,
          border: '1px solid rgba(0,230,118,0.15)',
          boxShadow: '0 0 40px rgba(0,230,118,0.08)',
        }}
      >
        <div className="p-6 md:p-10">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={12} style={{ color: '#00e676' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00e676' }}>Featured</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(0,230,118,0.1)', color: '#00e676' }}
            >
              {featured.category}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3 max-w-2xl leading-tight">
            {featured.title}
          </h2>
          <p className="text-sm md:text-base mb-5 max-w-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {featured.excerpt}
          </p>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm font-semibold text-white">{featured.author}</span>
              <span className="text-xs mx-2" style={{ color: '#b1bad3' }}>•</span>
              <span className="text-xs" style={{ color: '#b1bad3' }}>{featured.date}</span>
              <span className="text-xs mx-2" style={{ color: '#b1bad3' }}>•</span>
              <span className="text-xs" style={{ color: '#b1bad3' }}>{featured.readTime}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,230,118,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="ml-auto px-5 py-2.5 rounded-xl text-sm font-bold text-black flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
            >
              Read Article <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Category filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <motion.button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: activeCategory === cat ? '#1475e1' : '#213743',
              color: activeCategory === cat ? '#fff' : '#b1bad3',
              boxShadow: activeCategory === cat ? '0 0 16px rgba(20,117,225,0.4)' : 'none',
            }}
          >
            {cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Stats row */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {[
          { icon: BookOpen, label: 'Articles Published', value: '247', color: '#1475e1' },
          { icon: TrendingUp, label: 'Monthly Readers', value: '84K', color: '#00e676' },
          { icon: Clock, label: 'New This Week', value: '12', color: '#ffd700' },
        ].map(s => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <s.icon size={14} style={{ color: s.color }} />
            <span className="text-sm font-bold text-white">{s.value}</span>
            <span className="text-xs" style={{ color: '#b1bad3' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((a, i) => <ArticleCard key={a.id} a={a} i={i} />)}
      </div>

      {/* Load more */}
      <div className="flex justify-center mt-8">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-3 rounded-xl text-sm font-bold"
          style={{ backgroundColor: '#213743', color: '#b1bad3', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Load More Articles
        </motion.button>
      </div>
      <div className="h-10" />
    </div>
  );
}

export default function BlogPage() {
  return (
    <PageShell>
      <BlogContent />
    </PageShell>
  );
}
