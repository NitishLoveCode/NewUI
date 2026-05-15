'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export default function SectionHeader({ title, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon ?? <TrendingUp size={18} className="text-white" />}
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      <button
        className="text-sm font-semibold transition-colors"
        style={{ color: '#b1bad3' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#b1bad3')}
      >
        View All
      </button>
    </div>
  );
}
