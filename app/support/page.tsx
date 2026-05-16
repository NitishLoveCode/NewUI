'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, MessageCircle, ChevronDown, Mail, AtSign, Send, Zap, Clock, CheckCircle, Search } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

const faqs = [
  {
    category: 'Account',
    q: 'How do I verify my account?',
    a: 'Go to Settings → Account Verification. Upload a government-issued ID and proof of address. Verification typically completes within 24 hours.',
  },
  {
    category: 'Payments',
    q: 'How long do withdrawals take?',
    a: 'Crypto withdrawals are processed within minutes. Bank transfers take 1-3 business days. VIP players enjoy instant processing with zero fees.',
  },
  {
    category: 'Bonuses',
    q: 'Why was my bonus not credited?',
    a: 'Bonuses are credited within 5 minutes of qualifying. Ensure you met the minimum deposit, used the correct promo code, and are in an eligible region.',
  },
  {
    category: 'Account',
    q: 'How do I change my password?',
    a: 'Navigate to Settings → Security → Change Password. You\'ll need your current password and will receive a confirmation email.',
  },
  {
    category: 'Games',
    q: 'A game has crashed — what should I do?',
    a: 'Game rounds interrupted by technical issues are automatically void. Your balance is restored. If not resolved within 15 minutes, contact our live support.',
  },
  {
    category: 'Payments',
    q: 'Which cryptocurrencies do you accept?',
    a: 'We accept BTC, ETH, LTC, XRP, USDT (ERC-20 & TRC-20), BNB, SOL, DOGE, and 20+ more. New coins are added regularly.',
  },
  {
    category: 'Account',
    q: 'Can I have multiple accounts?',
    a: 'No. Each player is permitted one account. Duplicate accounts are closed and any bonuses forfeited. Contact support to resolve any access issues.',
  },
  {
    category: 'Games',
    q: 'What is the RTP on your slots?',
    a: 'Our slot games average 96.2% RTP. Individual game RTP is displayed in the game info panel. All games are audited by independent third parties.',
  },
];

const faqCategories = ['All', 'Account', 'Payments', 'Bonuses', 'Games'];

const supportOptions = [
  {
    icon: MessageCircle,
    title: 'Live Chat',
    desc: 'Instant help from our support team',
    availability: 'Online — ~2 min wait',
    availableNow: true,
    color: '#00e676',
    bg: 'rgba(0,230,118,0.08)',
    cta: 'Start Chat',
  },
  {
    icon: Mail,
    title: 'Email Support',
    desc: 'Detailed help via email',
    availability: 'Response in < 4 hours',
    availableNow: true,
    color: '#1475e1',
    bg: 'rgba(20,117,225,0.08)',
    cta: 'Send Email',
  },
  {
    icon: AtSign,
    title: 'Twitter / X',
    desc: 'Reach us on social media',
    availability: '@StakeSupport',
    availableNow: true,
    color: '#1DA1F2',
    bg: 'rgba(29,161,242,0.08)',
    cta: 'Tweet Us',
  },
  {
    icon: Send,
    title: 'Telegram',
    desc: 'Community & support bot',
    availability: '@StakeOfficial',
    availableNow: true,
    color: '#0088cc',
    bg: 'rgba(0,136,204,0.08)',
    cta: 'Open Telegram',
  },
];

const recentTickets = [
  { id: '#48291', subject: 'Bonus not credited after deposit', status: 'Resolved', date: 'May 14', color: '#00e676' },
  { id: '#47834', subject: 'Withdrawal delay inquiry', status: 'In Progress', date: 'May 12', color: '#ffd700' },
  { id: '#46102', subject: 'Account verification documents', status: 'Resolved', date: 'May 8', color: '#00e676' },
];

function FaqItem({ q, a, category }: { q: string; a: string; category: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
        style={{ backgroundColor: open ? 'rgba(0,230,118,0.04)' : '#213743' }}
      >
        <div className="flex items-center gap-2 pr-4 flex-1">
          <span
            className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: 'rgba(20,117,225,0.12)', color: '#1475e1' }}
          >
            {category}
          </span>
          <span className="text-sm font-semibold text-white">{q}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: '#b1bad3', flexShrink: 0 }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4 pt-2" style={{ backgroundColor: 'rgba(0,230,118,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#b1bad3' }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupportContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = faqs.filter(faq => {
    const matchesCat = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="px-6 py-8 max-w-[1400px]">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden mb-8 p-8 md:p-12 text-center"
        style={{
          background: 'linear-gradient(135deg, #001a0a 0%, #003320 50%, #001a0a 100%)',
          border: '1px solid rgba(0,230,118,0.15)',
          boxShadow: '0 0 40px rgba(0,230,118,0.06)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,230,118,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"
            style={{ background: 'linear-gradient(135deg, #00e676, #00c853)', boxShadow: '0 0 30px rgba(0,230,118,0.4)' }}
          >
            <Headphones size={28} className="text-black" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">How can we <span style={{ color: '#00e676' }}>help?</span></h1>
          <p className="text-base mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Our support team is available 24/7 — average response time under 2 minutes
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#b1bad3' }} />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
          </div>

          {/* Status badges */}
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,230,118,0.1)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#00e676' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#00e676' }} />
              </span>
              <span className="text-xs font-semibold" style={{ color: '#00e676' }}>All Systems Operational</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#b1bad3' }}>
              <Clock size={11} />
              Avg wait: ~2 min
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {supportOptions.map((opt, i) => (
          <motion.div
            key={opt.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.04, y: -4 }}
            className="rounded-2xl p-4 cursor-pointer text-center"
            style={{
              backgroundColor: '#213743',
              border: `1px solid ${opt.color}20`,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: opt.bg }}
            >
              <opt.icon size={20} style={{ color: opt.color }} />
            </div>
            <div className="font-bold text-white text-sm mb-0.5">{opt.title}</div>
            <div className="text-[10px] mb-2" style={{ color: '#b1bad3' }}>{opt.desc}</div>
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold mb-3" style={{ color: opt.color }}>
              {opt.availableNow && <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: opt.color }} />}
              {opt.availability}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-2 rounded-xl text-xs font-bold"
              style={{ background: `linear-gradient(135deg, ${opt.color}bb, ${opt.color})`, color: '#000' }}
            >
              {opt.cta}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Live Chat CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6"
        style={{
          background: 'linear-gradient(135deg, #001a0a, #003320)',
          border: '1px solid rgba(0,230,118,0.2)',
          boxShadow: '0 0 30px rgba(0,230,118,0.08)',
        }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} style={{ color: '#00e676' }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#00e676' }}>Live Chat — Online</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Get instant help right now</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">
            Our expert support agents are standing by. No bots, no scripts — real humans ready to help.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: '0 0 30px rgba(0,230,118,0.6)' }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-xl font-bold text-black text-sm flex items-center gap-2 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
          >
            <MessageCircle size={17} />
            Start Live Chat
          </motion.button>
          <div className="flex items-center gap-2">
            <CheckCircle size={13} style={{ color: '#00e676' }} />
            <span className="text-xs" style={{ color: '#b1bad3' }}>Average reply time: 1m 48s</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white">Frequently Asked Questions</h2>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {faqCategories.map(cat => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: activeCategory === cat ? '#1475e1' : '#213743',
                  color: activeCategory === cat ? '#fff' : '#b1bad3',
                  boxShadow: activeCategory === cat ? '0 0 12px rgba(20,117,225,0.4)' : 'none',
                }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {filtered.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} category={faq.category} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10" style={{ color: '#b1bad3' }}>
                <Search size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: tickets + hours */}
        <div className="flex flex-col gap-4">
          {/* Operating hours */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Clock size={14} style={{ color: '#00e676' }} />
              Support Hours
            </h3>
            {[
              { label: 'Live Chat', value: '24/7', color: '#00e676' },
              { label: 'Email', value: '24/7', color: '#1475e1' },
              { label: 'VIP Line', value: '24/7', color: '#ffd700' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-sm" style={{ color: '#b1bad3' }}>{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Recent tickets */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="font-bold text-white mb-3">My Recent Tickets</h3>
            <div className="flex flex-col gap-2">
              {recentTickets.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{t.subject}</div>
                    <div className="text-[10px]" style={{ color: '#b1bad3' }}>{t.id} · {t.date}</div>
                  </div>
                  <span
                    className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: `${t.color}15`, color: t.color }}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#b1bad3' }}>
              Open New Ticket
            </button>
          </motion.div>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
}

export default function SupportPage() {
  return (
    <PageShell>
      <SupportContent />
    </PageShell>
  );
}
