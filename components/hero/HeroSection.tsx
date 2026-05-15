'use client';

import { motion } from 'framer-motion';
import PromoCard from './PromoCard';
import SocialLoginButtons from './SocialLoginButtons';

export default function HeroSection() {
  return (
    <section className="w-full">
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 items-start">
        {/* Left: CTA content */}
        <div className="flex flex-col gap-5 py-2">
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            The World&apos;s Largest Online Casino and Sportsbook
          </h1>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(20,117,225,0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="self-start px-8 py-3 rounded-lg text-base font-bold text-white"
            style={{ backgroundColor: '#1475e1' }}
          >
            Register
          </motion.button>
          <div>
            <p className="text-sm mb-3" style={{ color: '#b1bad3' }}>
              Or Sign Up With
            </p>
            <SocialLoginButtons />
          </div>
        </div>

        {/* Right: promo cards */}
        <div className="grid grid-cols-2 gap-4">
          <PromoCard
            title="Casino"
            players={67738}
            gradient="linear-gradient(135deg, #1a3a7e 0%, #2563b0 50%, #4facfe 100%)"
            icon="🃏"
          />
          <PromoCard
            title="Sports"
            players={12506}
            gradient="linear-gradient(135deg, #0a5e2a 0%, #16a34a 50%, #4ade80 100%)"
            icon="⚽"
          />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col items-center gap-5 text-center">
        <h1 className="text-2xl font-bold text-white leading-tight px-2">
          The World&apos;s Largest Online Casino and Sportsbook
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-xl text-base font-bold text-white"
          style={{ backgroundColor: '#1475e1', boxShadow: '0 4px 20px rgba(20,117,225,0.4)' }}
        >
          Register
        </motion.button>
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-sm" style={{ color: '#b1bad3' }}>Or Sign Up With</p>
          <SocialLoginButtons />
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          <PromoCard
            title="Casino"
            players={67738}
            gradient="linear-gradient(135deg, #1a3a7e 0%, #2563b0 50%, #4facfe 100%)"
            icon="🃏"
          />
          <PromoCard
            title="Sports"
            players={12506}
            gradient="linear-gradient(135deg, #0a5e2a 0%, #16a34a 50%, #4ade80 100%)"
            icon="⚽"
          />
        </div>
      </div>
    </section>
  );
}
