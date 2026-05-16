'use client';

import { useEffect, useRef } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import PromoCard from './PromoCard';
import SocialLoginButtons from './SocialLoginButtons';
import { Users, DollarSign, Gamepad2 } from 'lucide-react';

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
  { icon: Users, label: 'Players Online', value: 84_320, suffix: '+' },
  { icon: DollarSign, label: 'Won Today', value: 48_600_000, prefix: '$', suffix: '' },
  { icon: Gamepad2, label: 'Games Available', value: 3_000, suffix: '+' },
];

export default function HeroSection({ onOpenAuth }: HeroSectionProps) {
  return (
    <section className="w-full relative">
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-8 items-start">
        {/* Left: CTA content */}
        <div className="flex flex-col gap-5 py-2 relative">
          {/* Green ambient glow behind content */}
          <div
            className="absolute -top-16 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,230,118,0.07) 0%, transparent 70%)',
            }}
          />

          {/* Bonus badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,200,83,0.08))',
              border: '1px solid rgba(0,230,118,0.25)',
            }}
          >
            <span className="text-sm">🎁</span>
            <span className="text-xs font-semibold" style={{ color: '#00e676' }}>
              100% Welcome Bonus up to $1,000
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl xl:text-4xl font-black leading-tight"
            style={{ color: '#fff' }}
          >
            The World&apos;s Most{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00e676 0%, #69f0ae 60%, #b9f6ca 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Trusted Casino
            </span>{' '}
            &amp; Sportsbook
          </motion.h1>

          {/* Register CTA */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(0,230,118,0.55)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenAuth?.('register')}
            className="self-start px-8 py-3.5 rounded-xl text-base font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
          >
            Register Now — It&apos;s Free
          </motion.button>

          {/* Social login */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <p className="text-sm mb-3" style={{ color: '#b1bad3' }}>
              Or Sign Up With
            </p>
            <SocialLoginButtons />
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="grid grid-cols-3 gap-3 mt-1"
          >
            {stats.map(({ icon: Icon, label, value, suffix, prefix }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-center"
                style={{
                  backgroundColor: 'rgba(33,55,67,0.6)',
                  border: '1px solid rgba(0,230,118,0.1)',
                }}
              >
                <Icon size={14} style={{ color: '#00e676' }} />
                <p className="text-base font-black text-white leading-tight">
                  <AnimatedCounter to={value} suffix={suffix} prefix={prefix ?? ''} />
                </p>
                <p className="text-[10px] leading-tight" style={{ color: '#b1bad3' }}>
                  {label}
                </p>
              </div>
            ))}
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
            title="Casino"
            players={67738}
            gradient="linear-gradient(135deg, #0a3d1a 0%, #1a6b3a 50%, #2dd06e 100%)"
            icon="🃏"
          />
          <PromoCard
            title="Sports"
            players={12506}
            gradient="linear-gradient(135deg, #0a2e1a 0%, #0f5c38 50%, #00e676 100%)"
            icon="⚽"
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
                  JACKPOT
                </p>
                <p className="text-lg font-black text-white">$12,450,000+</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(0,230,118,0.45)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpenAuth?.('register')}
                className="px-4 py-2 rounded-lg text-xs font-bold text-black"
                style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
              >
                Play Now
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
            100% Bonus up to $1,000
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
            Trusted Casino
          </span>{' '}
          &amp; Sportsbook
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
          Register Now — It&apos;s Free
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

        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-sm" style={{ color: '#b1bad3' }}>
            Or Sign Up With
          </p>
          <SocialLoginButtons />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <PromoCard
            title="Casino"
            players={67738}
            gradient="linear-gradient(135deg, #0a3d1a 0%, #1a6b3a 50%, #2dd06e 100%)"
            icon="🃏"
          />
          <PromoCard
            title="Sports"
            players={12506}
            gradient="linear-gradient(135deg, #0a2e1a 0%, #0f5c38 50%, #00e676 100%)"
            icon="⚽"
          />
        </div>
      </div>
    </section>
  );
}
