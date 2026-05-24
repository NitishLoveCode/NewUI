'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { GameCard } from '@/types';

export default function GameCardComponent({ game, onClick }: { game: GameCard; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex-shrink-0 cursor-pointer"
      style={{ width: 130 }}
      onClick={onClick}
    >
      {/* Card image area */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ aspectRatio: '3/4' }}
      >
        {/* Gradient or image game art */}
        {game.image ? (
          <Image
            src={game.image}
            alt={game.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: game.gradient }}
          />
        )}

        {/* Title overlay */}
        {/* <div
          className="absolute inset-0 flex flex-col justify-end p-2"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
          }}
        >
          <p
            className="text-xs font-black text-white leading-tight uppercase"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)', whiteSpace: 'pre-line' }}
          >
            {game.title}
          </p>
          <p
            className="text-[9px] font-medium mt-0.5 uppercase tracking-wide"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {game.provider}
          </p>
        </div> */}

        {/* Decorative accent element (only shown without image) */}
        {!game.image && (
          <div
            className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-20"
            style={{ backgroundColor: game.accentColor }}
          />
        )}
      </div>

      {/* Playing count */}
      <div className="flex items-center gap-1 mt-1.5 px-0.5">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: '#00e701', boxShadow: '0 0 4px #00e701' }}
        />
        <span className="text-xs" style={{ color: '#b1bad3' }}>
          <span className="font-semibold text-white">{game.playing}</span> solving
        </span>
      </div>
    </motion.div>
  );
}
