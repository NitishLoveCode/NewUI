'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import SectionHeader from './SectionHeader';
import GameCardComponent from '@/components/cards/GameCard';
import GameDetailOverlay from '@/components/overlays/GameDetailOverlay';
import { trendingGames } from '@/data/games';
import type { GameCard } from '@/types';

const MOBILE_INITIAL = 6;

export default function TrendingGames() {
  const [showAll, setShowAll] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameCard | null>(null);

  const mobileGames = showAll ? trendingGames : trendingGames.slice(0, MOBILE_INITIAL);

  return (
    <section className="w-full">
      <SectionHeader
        title="Trending Problems"
        icon={<TrendingUp size={18} className="text-white" />}
      />

      {/* Desktop: horizontal scrollable row */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-2 mt-4 no-scrollbar">
        {trendingGames.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <GameCardComponent game={game} onClick={() => setSelectedGame(game)} />
          </motion.div>
        ))}
      </div>

      {/* Mobile: 3-column grid */}
      <div className="md:hidden mt-3">
        <div className="grid grid-cols-3 gap-2">
          {mobileGames.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="w-full"
            >
              <div
                className="cursor-pointer"
                style={{ width: '100%' }}
                onClick={() => setSelectedGame(game)}
              >
                <div
                  className="relative rounded-xl overflow-hidden"
                  style={{ aspectRatio: '3/4', background: game.gradient }}
                >
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-1.5"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 70%, transparent 100%)',
                    }}
                  >
                    <p className="text-[9px] font-black text-white leading-tight uppercase" style={{ whiteSpace: 'pre-line' }}>
                      {game.title}
                    </p>
                    <p className="text-[8px] font-medium mt-0.5 uppercase" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {game.provider}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1 px-0.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#00e701' }} />
                  <span className="text-[10px]" style={{ color: '#b1bad3' }}>
                    <span className="font-semibold text-white">{game.playing}</span> solving
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        {!showAll && trendingGames.length > MOBILE_INITIAL && (
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

      {/* Game detail overlay */}
      <AnimatePresence>
        {selectedGame && (
          <GameDetailOverlay
            key={selectedGame.id}
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
