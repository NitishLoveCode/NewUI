'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Flame, Eye, MessageCircle, ChevronRight, Users, Pin, TrendingUp } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

const forumCategories = [
  { id: 1, icon: '🎰', name: 'Casino Discussion', desc: 'Games, strategies, and big wins', posts: 8420, color: '#00e676', badge: 'HOT' },
  { id: 2, icon: '⚽', name: 'Sports Talk', desc: 'Predictions, tips & live coverage', posts: 5830, color: '#1475e1', badge: '' },
  { id: 3, icon: '💡', name: 'Strategy & Tips', desc: 'Share your winning strategies', posts: 3210, color: '#ffd700', badge: '' },
  { id: 4, icon: '🎁', name: 'Promotions & Bonuses', desc: 'Latest deals and how to claim', posts: 2140, color: '#ff6b35', badge: 'NEW' },
  { id: 5, icon: '🆘', name: 'Technical Support', desc: 'Account issues & troubleshooting', posts: 1540, color: '#9b59b6', badge: '' },
  { id: 6, icon: '💬', name: 'General Chat', desc: 'Off-topic fun and community', posts: 4890, color: '#00e5ff', badge: '' },
];

const hotTopics = [
  { id: 1, title: 'Just hit a 9,450x on Book of Dead! Proof inside 🔥', views: 24800, replies: 342, category: 'Casino Discussion', author: 'SlotLegend99', timeAgo: '2h ago', pinned: true, hot: true },
  { id: 2, title: 'Champions League predictions thread — Post your picks!', views: 18200, replies: 287, category: 'Sports Talk', author: 'FootballGuru', timeAgo: '4h ago', pinned: false, hot: true },
  { id: 3, title: 'The definitive blackjack basic strategy card (printable)', views: 15600, replies: 124, category: 'Strategy & Tips', author: 'CardCounter88', timeAgo: '1d ago', pinned: true, hot: false },
  { id: 4, title: 'Weekend Reload Bonus — share your results!', views: 9800, replies: 198, category: 'Promotions & Bonuses', author: 'BonusHunter', timeAgo: '6h ago', pinned: false, hot: false },
  { id: 5, title: 'Withdrawal processed in 4 minutes — amazing! ⚡', views: 7200, replies: 89, category: 'General Chat', author: 'HappyPlayer', timeAgo: '3h ago', pinned: false, hot: false },
  { id: 6, title: 'Baccarat strategy that increased my winrate by 23%', views: 12100, replies: 156, category: 'Strategy & Tips', author: 'BaccaratPro', timeAgo: '12h ago', pinned: false, hot: false },
];

const onlineUsers = [
  { name: 'CryptoKing_99', avatar: '👑', status: 'Playing Gates of Olympus' },
  { name: 'LuckyAce_7', avatar: '🃏', status: 'In Sports Lobby' },
  { name: 'SlotWizard', avatar: '🔮', status: 'Browsing Promotions' },
  { name: 'PokerFace88', avatar: '♠️', status: 'Playing Live Blackjack' },
  { name: 'SpinMaster', avatar: '🎡', status: 'Just joined' },
];

const categoryColors: Record<string, string> = {
  'Casino Discussion': '#00e676',
  'Sports Talk': '#1475e1',
  'Strategy & Tips': '#ffd700',
  'Promotions & Bonuses': '#ff6b35',
  'Technical Support': '#9b59b6',
  'General Chat': '#00e5ff',
};

function ForumContent() {
  const [activeSection, setActiveSection] = useState<'categories' | 'hot' | 'new'>('categories');

  return (
    <div className="px-6 py-8 max-w-[1400px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #9b59b6, #6c3483)', boxShadow: '0 4px 16px rgba(155,89,182,0.4)' }}
            >
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Community Forum</h1>
              <p style={{ color: '#b1bad3' }} className="text-sm">Connect, share & discuss with the Stake community</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(0,230,118,0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-black hidden md:flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
          >
            <MessageCircle size={15} />
            New Post
          </motion.button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: '25,934', label: 'Total Posts', icon: MessageSquare, color: '#9b59b6' },
            { value: '3,218', label: 'Members', icon: Users, color: '#1475e1' },
            { value: '47', label: 'Online Now', icon: Flame, color: '#00e676' },
            { value: '12', label: 'New Today', icon: TrendingUp, color: '#ffd700' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <s.icon size={16} style={{ color: s.color }} />
              <div>
                <div className="font-black text-white text-sm">{s.value}</div>
                <div className="text-[10px]" style={{ color: '#b1bad3' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Main content */}
        <div className="flex-1">
          {/* Section tabs */}
          <div className="flex gap-2 mb-5">
            {(['categories', 'hot', 'new'] as const).map(s => (
              <motion.button
                key={s}
                onClick={() => setActiveSection(s)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-full text-sm font-bold capitalize"
                style={{
                  backgroundColor: activeSection === s ? '#9b59b6' : '#213743',
                  color: activeSection === s ? '#fff' : '#b1bad3',
                  boxShadow: activeSection === s ? '0 0 16px rgba(155,89,182,0.4)' : 'none',
                }}
              >
                {s === 'categories' ? '📂 Categories' : s === 'hot' ? '🔥 Hot Topics' : '✨ New Posts'}
              </motion.button>
            ))}
          </div>

          {activeSection === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {forumCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="rounded-2xl p-4 cursor-pointer flex items-center gap-4"
                  style={{
                    backgroundColor: '#213743',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{cat.name}</span>
                      {cat.badge && (
                        <span
                          className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: cat.color, color: '#000' }}
                        >
                          {cat.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: '#b1bad3' }}>{cat.desc}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MessageCircle size={10} style={{ color: cat.color }} />
                      <span className="text-[10px] font-semibold" style={{ color: cat.color }}>{cat.posts.toLocaleString()} posts</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: '#4a6478' }} />
                </motion.div>
              ))}
            </div>
          )}

          {(activeSection === 'hot' || activeSection === 'new') && (
            <div className="flex flex-col gap-3">
              {hotTopics.map((topic, i) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ scale: 1.01, x: 3 }}
                  className="rounded-2xl p-4 cursor-pointer"
                  style={{
                    backgroundColor: '#213743',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      {topic.pinned && <Pin size={12} style={{ color: '#00e676' }} />}
                      {topic.hot && <Flame size={12} style={{ color: '#ff6b35' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white mb-1 leading-snug">{topic.title}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${categoryColors[topic.category]}15`,
                            color: categoryColors[topic.category],
                          }}
                        >
                          {topic.category}
                        </span>
                        <span className="text-[10px]" style={{ color: '#b1bad3' }}>by {topic.author}</span>
                        <span className="text-[10px]" style={{ color: '#b1bad3' }}>{topic.timeAgo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs" style={{ color: '#b1bad3' }}>
                      <div className="flex items-center gap-1">
                        <Eye size={11} />
                        <span>{topic.views >= 1000 ? `${(topic.views / 1000).toFixed(1)}k` : topic.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={11} />
                        <span>{topic.replies}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          {/* Online users */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#00e676' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#00e676' }} />
              </span>
              <span className="text-sm font-bold text-white">47 Online</span>
            </div>
            <div className="flex flex-col gap-2">
              {onlineUsers.map((u, i) => (
                <motion.div
                  key={u.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-base">{u.avatar}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{u.name}</div>
                    <div className="text-[10px] truncate" style={{ color: '#b1bad3' }}>{u.status}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#b1bad3' }}>
              View All Members
            </button>
          </motion.div>

          {/* Forum rules */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="text-sm font-bold text-white mb-3">Forum Rules</h3>
            {['Be respectful to all members', 'No spam or self-promotion', 'Keep topics on-subject', 'No sharing personal info'].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className="text-xs mt-0.5" style={{ color: '#00e676' }}>✓</span>
                <span className="text-xs" style={{ color: '#b1bad3' }}>{rule}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
}

export default function ForumPage() {
  return (
    <PageShell>
      <ForumContent />
    </PageShell>
  );
}
