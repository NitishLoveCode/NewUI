'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, Phone, ExternalLink, AlertTriangle, Heart, Clock, DollarSign } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';

const tools = [
  {
    icon: DollarSign,
    title: 'Deposit Limits',
    desc: 'Set daily, weekly, or monthly deposit caps to control your spending',
    color: '#00e676',
    bg: 'rgba(0,230,118,0.08)',
    options: ['Daily: $50', 'Weekly: $200', 'Monthly: $500'],
    cta: 'Set Limit',
  },
  {
    icon: Clock,
    title: 'Session Time Limits',
    desc: 'Receive reminders or auto-logout after your chosen play duration',
    color: '#1475e1',
    bg: 'rgba(20,117,225,0.08)',
    options: ['1 hour limit', '2 hour limit', '4 hour limit'],
    cta: 'Set Timer',
  },
  {
    icon: AlertTriangle,
    title: 'Reality Check',
    desc: 'Regular pop-up reminders showing how long you\'ve been playing',
    color: '#ffd700',
    bg: 'rgba(255,215,0,0.08)',
    options: ['Every 30 mins', 'Every 1 hour', 'Every 2 hours'],
    cta: 'Enable',
  },
  {
    icon: Shield,
    title: 'Self-Exclusion',
    desc: 'Temporarily or permanently exclude yourself from the platform',
    color: '#e74c3c',
    bg: 'rgba(231,76,60,0.08)',
    options: ['1 month', '6 months', 'Permanent'],
    cta: 'Exclude',
  },
];

const faqs = [
  {
    q: 'How do I set deposit limits?',
    a: 'Navigate to Account Settings → Responsible Gambling → Deposit Limits. Choose daily, weekly, or monthly caps. Changes to increase limits require a 24-hour cooling-off period.',
  },
  {
    q: 'Can I reverse a self-exclusion?',
    a: 'Short-term exclusions (1–6 months) can be reversed after a 24-hour cooling-off once the period ends. Permanent exclusions cannot be reversed.',
  },
  {
    q: 'What is a reality check reminder?',
    a: 'Reality check reminders are pop-up notifications that appear at your chosen intervals showing total session time, wins, and losses — helping you stay in control.',
  },
  {
    q: 'How can I get help for gambling addiction?',
    a: 'Reach out to dedicated helplines like GamCare (0808 8020 133), Gamblers Anonymous, or BeGambleAware. These services offer free, confidential support 24/7.',
  },
  {
    q: 'Can a family member request an account block?',
    a: 'Yes. Third-party exclusion requests can be submitted via our support team with the relevant documentation. We take these requests seriously and act promptly.',
  },
];

const helplines = [
  { name: 'GamCare', phone: '0808 802 0133', url: '#', desc: '24/7 free support & counselling', color: '#00e676' },
  { name: 'BeGambleAware', phone: '0808 8020 133', url: '#', desc: 'National Gambling Helpline', color: '#1475e1' },
  { name: 'Gamblers Anonymous', phone: 'GA.org', url: '#', desc: '12-step recovery program', color: '#ffd700' },
  { name: 'GamStop', phone: 'GamStop.co.uk', url: '#', desc: 'Self-exclusion from all UK sites', color: '#9b59b6' },
];

const warningSigns = [
  'Spending more money than you can afford to lose',
  'Gambling to escape problems, anxiety, or depression',
  'Hiding gambling activity from friends or family',
  'Chasing losses and being unable to stop',
  'Neglecting work, family, or personal responsibilities',
  'Borrowing money or selling possessions to fund gambling',
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
        style={{ backgroundColor: open ? 'rgba(0,230,118,0.04)' : '#213743' }}
      >
        <span className="text-sm font-semibold text-white pr-4">{q}</span>
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

function ResponsibleContent() {
  return (
    <div className="px-6 py-8 max-w-[1400px]">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden mb-10 p-8 md:p-12 text-center"
        style={{
          background: 'linear-gradient(135deg, #001a0a 0%, #003320 40%, #001a0a 100%)',
          border: '1px solid rgba(0,230,118,0.15)',
          boxShadow: '0 0 50px rgba(0,230,118,0.05)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,230,118,0.05) 0%, transparent 70%)' }} />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 mx-auto"
          style={{
            background: 'linear-gradient(135deg, #00e676, #00c853)',
            boxShadow: '0 0 30px rgba(0,230,118,0.4)',
          }}
        >
          <Heart size={28} className="text-black" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
          Play <span style={{ color: '#00e676' }}>Responsibly</span>
        </h1>
        <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Gambling should be enjoyable. We provide tools and resources to help you stay in control and play safely.
        </p>
      </motion.div>

      {/* Tools grid */}
      <div className="mb-10">
        <h2 className="text-xl font-black text-white mb-5">Safety Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -3 }}
              className="rounded-2xl p-5"
              style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: tool.bg }}
                >
                  <tool.icon size={22} style={{ color: tool.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{tool.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#b1bad3' }}>{tool.desc}</p>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                {tool.options.map((opt) => (
                  <button
                    key={opt}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-center"
                    style={{ backgroundColor: `${tool.color}12`, color: tool.color, border: `1px solid ${tool.color}25` }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-xl text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${tool.color}cc, ${tool.color})`, color: '#000' }}
              >
                {tool.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Warning signs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 mb-8"
        style={{
          background: 'linear-gradient(135deg, #1a0a00, #2a1400)',
          border: '1px solid rgba(255,107,53,0.2)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} style={{ color: '#ff6b35' }} />
          <h2 className="text-lg font-black text-white">Warning Signs of Problem Gambling</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {warningSigns.map((sign, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="flex items-start gap-2 py-1.5"
            >
              <span className="text-sm mt-0.5" style={{ color: '#ff6b35' }}>⚠</span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{sign}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.15)' }}>
          <p className="text-sm font-semibold" style={{ color: '#ff6b35' }}>
            If you recognize these signs in yourself or someone you know, reach out for help immediately.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-black text-white mb-4">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </motion.div>

        {/* Help resources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-black text-white mb-4">Help & Support Resources</h2>
          <div className="flex flex-col gap-3">
            {helplines.map((h, i) => (
              <motion.div
                key={h.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
                style={{ backgroundColor: '#213743', border: `1px solid ${h.color}20` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                  style={{ backgroundColor: `${h.color}15` }}
                >
                  <Phone size={16} style={{ color: h.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{h.name}</span>
                  </div>
                  <div className="text-xs" style={{ color: '#b1bad3' }}>{h.desc}</div>
                  <div className="text-xs font-bold mt-0.5" style={{ color: h.color }}>{h.phone}</div>
                </div>
                <ExternalLink size={14} style={{ color: '#4a6478' }} />
              </motion.div>
            ))}
          </div>

          <div
            className="rounded-2xl p-5 mt-4"
            style={{ background: 'linear-gradient(135deg, #001a0a, #003320)', border: '1px solid rgba(0,230,118,0.12)' }}
          >
            <p className="text-sm font-semibold text-white mb-1">Need to talk to someone now?</p>
            <p className="text-xs mb-3" style={{ color: '#b1bad3' }}>Our Responsible Gambling team is available 24/7</p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-black"
              style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
            >
              Chat with RG Team
            </motion.button>
          </div>
        </motion.div>
      </div>
      <div className="h-10" />
    </div>
  );
}

export default function ResponsiblePage() {
  return (
    <PageShell>
      <ResponsibleContent />
    </PageShell>
  );
}
