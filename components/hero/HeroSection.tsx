'use client';

import { useEffect, useRef } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import PromoCard from './PromoCard';
import SocialLoginButtons from './SocialLoginButtons';
import { Users, Code2, BookOpen, Video, MessageSquare, Rocket, ArrowRight, Heart } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

interface HeroSectionProps {
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

function AnimatedCounter({
  to,
  suffix = '',
  prefix = '',
}: {
  to: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, to, {
      duration: 2.2,
      ease: 'easeOut',
      onUpdate(v) {
        el.textContent = prefix + Math.floor(v).toLocaleString() + suffix;
      },
    });
    return controls.stop;
  }, [inView, to, suffix, prefix]);

  return (
    <span ref={ref}>
      {prefix}0{suffix}
    </span>
  );
}

const stats = [
  { icon: Users, label: 'Active Learners', value: 84_320, suffix: '+', prefix: '' },
  { icon: Code2, label: 'Problems Solved', value: 486_000, suffix: '+', prefix: '' },
  { icon: BookOpen, label: 'Notes Shared', value: 3_000, suffix: '+', prefix: '' },
];

const features = [
  { icon: Video, title: 'Video Call', desc: 'Talk face-to-face while coding', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  { icon: Code2, title: 'Live Editor', desc: 'Code together in real-time', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  { icon: MessageSquare, title: 'Live Chat', desc: 'Discuss and solve problems', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { icon: Users, title: 'Smart Match', desc: 'Find the perfect coding partner', color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
];

// Headline words — `grad` words get an animated green gradient shimmer
const titleWords: { t: string; grad?: string }[] = [
  { t: 'Find' },
  { t: 'your' },
  { t: 'coding' },
  { t: 'partner.' },
  { t: 'Solve', grad: 'linear-gradient(120deg, #00e676, #69f0ae, #00c853, #00e676)' },
  { t: 'together.', grad: 'linear-gradient(120deg, #00c853, #00e676, #b9f6ca, #00c853)' },
  { t: 'Grow', grad: 'linear-gradient(120deg, #69f0ae, #00e676, #00c853, #69f0ae)' },
  { t: 'faster.', grad: 'linear-gradient(120deg, #00e676, #b9f6ca, #69f0ae, #00e676)' },
];

const titleContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const titleWord = {
  hidden: { opacity: 0, y: 28, rotateX: -75, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 140, damping: 14 },
  },
};

export default function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const { user } = useUser();
  return (
    <section className="w-full relative">
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-8 items-start">
        {/* Left: CTA content */}
        <div className="flex flex-col gap-5 py-2 relative">
          {/* Purple ambient glow behind content */}
          <div
            className="absolute -top-16 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)',
            }}
          />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(168,85,247,0.3)',
            }}
          >
            <Rocket size={14} style={{ color: '#a855f7' }} />
            <span className="text-xs font-semibold text-white">Connect • Collaborate • Code</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={titleContainer}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-x-3 gap-y-1 text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight"
            style={{ color: '#fff', perspective: 800 }}
          >
            {titleWords.map((w, i) => (
              <motion.span
                key={i}
                variants={titleWord}
                whileHover={{ scale: 1.06 }}
                className="inline-block origin-bottom"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {w.grad ? (
                  <motion.span
                    className="inline-block"
                    style={{
                      background: w.grad,
                      backgroundSize: '300% 100%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 14px rgba(0,230,118,0.35))',
                    }}
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  >
                    {w.t}
                  </motion.span>
                ) : (
                  w.t
                )}
              </motion.span>
            ))}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="text-sm md:text-base max-w-lg leading-relaxed"
            style={{ color: '#b1bad3' }}
          >
            iLovedsa.com is a social DSA platform where developers match, collaborate in real-time, and
            achieve more together.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-1"
          >
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex flex-col gap-2">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: bg, border: `1px solid ${color}33` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-[11px] leading-snug" style={{ color: '#8a93a8' }}>
                  {desc}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="flex flex-wrap items-center gap-4 mt-2"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(0,230,118,0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenAuth?.('register')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-black"
              style={{ background: 'linear-gradient(135deg, #ffffff, #c8f7dd 55%, #69f0ae)' }}
            >
              Start Coding Now <ArrowRight size={17} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Explore Problems
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mt-2"
          >
            <div className="flex items-center">
              {[14, 22, 33, 44].map((img, i) => (
                <img
                  key={img}
                  src={`https://i.pravatar.cc/48?img=${img}`}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 object-cover"
                  style={{ marginLeft: i === 0 ? 0 : -10, borderColor: '#0f212e' }}
                />
              ))}
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
                style={{ background: '#ec4899' }}
              >
                +20K
              </span>
            </div>
            <span className="text-sm font-medium" style={{ color: '#e6eaf2' }}>
              Loved by <span className="font-bold text-white">80K+</span> developers worldwide
            </span>

            {/* Curvy arrow + heart */}
            <div className="relative flex items-center">
              <motion.svg
                width="82"
                height="34"
                viewBox="0 0 82 34"
                fill="none"
                className="shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.path
                  d="M2 14 C 16 30, 44 32, 66 16"
                  stroke="#f0438c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeInOut' }}
                />
                <motion.path
                  d="M66 16 L 56 18 M66 16 L 61 26"
                  stroke="#f0438c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.25, duration: 0.3 }}
                />
              </motion.svg>
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.4, type: 'spring', stiffness: 260, damping: 12 }}
                className="-ml-1"
              >
                <motion.div
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Heart size={24} className="fill-[#f0438c] text-[#f0438c]" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right: promo cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <PromoCard
            imageUrl='/images/bannerImage1.png'
            title="DSA"
            players={67738}
            gradient="linear-gradient(135deg, #0a3d1a 0%, #1a6b3a 50%, #2dd06e 100%)"
            icon="🧠"
          />
          <PromoCard
          imageUrl='/images/girlBannerImage1.png'
            title="DSA"
            players={12506}
            gradient="linear-gradient(135deg, #0a2e1a 0%, #0f5c38 50%, #00e676 100%)"
            icon="🧠"
          />
          {/* Extra wide jackpot promo */}
          <div
            className="col-span-2 relative rounded-xl overflow-hidden cursor-pointer"
            style={{ height: 80 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, #0d3321 0%, #1a5c3a 50%, #0a4028 100%)',
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-between px-5"
              style={{
                background:
                  'linear-gradient(to right, rgba(0,230,118,0.08) 0%, transparent 100%)',
              }}
            >
              <div>
                <p className="text-xs font-semibold" style={{ color: '#00e676' }}>
                  CURATED TRACK
                </p>
                <p className="text-lg font-black text-white">12,450+ Problems</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(0,230,118,0.45)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpenAuth?.('register')}
                className="px-4 py-2 rounded-lg text-xs font-bold text-black"
                style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
              >
                Explore Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col items-center gap-5 text-center">
        {/* Bonus badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,200,83,0.08))',
            border: '1px solid rgba(0,230,118,0.25)',
          }}
        >
          <span className="text-sm">🎁</span>
          <span className="text-xs font-semibold" style={{ color: '#00e676' }}>
            Daily DSA Sheets, Notes, and Practice Sets
          </span>
        </div>

        <h1 className="text-2xl font-black text-white leading-tight px-2">
          The World&apos;s Most{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #00e676, #69f0ae)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Trusted DSA
          </span>{' '}
          Platform
        </h1>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpenAuth?.('register')}
          className="w-full py-3.5 rounded-xl text-base font-bold text-black"
          style={{
            background: 'linear-gradient(135deg, #00e676, #00c853)',
            boxShadow: '0 4px 24px rgba(0,230,118,0.4)',
          }}
        >
          Start Learning — It&apos;s Free
        </motion.button>

        {/* Mobile stats */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {stats.map(({ icon: Icon, label, value, suffix, prefix }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 px-1 py-2.5 rounded-xl text-center"
              style={{
                backgroundColor: 'rgba(33,55,67,0.6)',
                border: '1px solid rgba(0,230,118,0.1)',
              }}
            >
              <Icon size={12} style={{ color: '#00e676' }} />
              <p className="text-sm font-black text-white leading-tight">
                <AnimatedCounter to={value} suffix={suffix} prefix={prefix ?? ''} />
              </p>
              <p className="text-[9px] leading-tight" style={{ color: '#b1bad3' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {!user && (
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-sm" style={{ color: '#b1bad3' }}>
            Or Sign Up With
          </p>
          <SocialLoginButtons />
        </div>
        )}

        <div className="grid grid-cols-2 gap-3 w-full">
          <PromoCard
            imageUrl="/image/bannerImage1.png"
            title="DSA"
            players={67738}
            gradient="linear-gradient(135deg, #0a3d1a 0%, #1a6b3a 50%, #2dd06e 100%)"
            icon="🧠"
          />
          <PromoCard
            imageUrl="/image/girlBannerImage1.png"
            title="DSA"
            players={12506}
            gradient="linear-gradient(135deg, #0a2e1a 0%, #0f5c38 50%, #00e676 100%)"
            icon="🧠"
          />
        </div>
      </div>
    </section>
  );
}
