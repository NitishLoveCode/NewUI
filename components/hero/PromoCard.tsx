'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';


interface PromoCardProps {
  title: string;
  players: number;
  gradient: string;
  icon: string;
  imageUrl: string;
}

export default function PromoCard({ title, imageUrl, players, gradient, icon }: PromoCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-xl overflow-hidden cursor-pointer"
      style={{ aspectRatio: '4/3' }}
    >
      {/* Background gradient art */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center 22%', backgroundBlendMode: 'overlay', backgroundColor: gradient }}
      >
        {/* <Image src={imageUrl} alt="Banner" fill className="object-cover" /> */}
        {/* <span className="text-7xl select-none opacity-70">{icon}</span> */}
      </div>

      {/* Bottom overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
          // background: 'rgba(#203642)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xs">{icon}</span>
          </div>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#00e701', boxShadow: '0 0 6px #00e701' }}
          />
          <span className="text-xs font-medium" style={{ color: '#b1bad3' }}>
            {players.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
