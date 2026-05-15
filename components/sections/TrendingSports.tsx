'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dices } from 'lucide-react';
import SectionHeader from './SectionHeader';
import SportsCardComponent from '@/components/cards/SportsCard';
import { trendingSports } from '@/data/sports';

const MOBILE_INITIAL = 3;

export default function TrendingSports() {
  const [showAll, setShowAll] = useState(false);
  const mobileSports = showAll ? trendingSports : trendingSports.slice(0, MOBILE_INITIAL);

  return (
    <section className="w-full">
      <SectionHeader
        title="Trending Sports"
        icon={<Dices size={18} className="text-white" />}
      />

      {/* Desktop: horizontal scrollable row */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-2 mt-4 no-scrollbar">
        {trendingSports.map((sport, i) => (
          <motion.div
            key={sport.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
          >
            <SportsCardComponent sport={sport} />
          </motion.div>
        ))}
      </div>

      {/* Mobile: 3-column grid */}
      <div className="md:hidden mt-3">
        <div className="grid grid-cols-3 gap-2">
          {mobileSports.map((sport, i) => (
            <motion.div
              key={sport.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="w-full"
            >
              <div
                className="relative rounded-xl overflow-hidden cursor-pointer"
                style={{ aspectRatio: '3/4', background: sport.gradient }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl opacity-35 select-none">
                    {sport.name === 'Soccer' && '⚽'}
                    {sport.name === 'Tennis' && '🎾'}
                    {sport.name === 'Basketball' && '🏀'}
                    {sport.name === 'Baseball' && '⚾'}
                    {sport.name === 'MMA' && '🥊'}
                    {sport.name === 'Hockey' && '🏒'}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs font-black text-white uppercase tracking-wide"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                    {sport.name}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!showAll && trendingSports.length > MOBILE_INITIAL && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm font-medium"
              style={{ color: '#b1bad3' }}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
