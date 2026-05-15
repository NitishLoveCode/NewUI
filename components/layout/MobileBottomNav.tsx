'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Gem, ClipboardList, Trophy, MessageCircle } from 'lucide-react';

const navItems = [
  { id: 'browse', label: 'Browse', icon: Search, href: '/' },
  { id: 'casino', label: 'Casino', icon: Gem, href: '/casino' },
  { id: 'bets', label: 'Bets', icon: ClipboardList, href: '/bets' },
  { id: 'sports', label: 'Sports', icon: Trophy, href: '/sports' },
  { id: 'chat', label: 'Chat', icon: MessageCircle, href: '/chat' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [active, setActive] = useState('browse');

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center"
      style={{
        backgroundColor: 'rgba(15,33,46,0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 60,
      }}
    >
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all"
            aria-label={item.label}
          >
            <motion.div
              whileTap={{ scale: 0.85 }}
              className="flex flex-col items-center gap-0.5"
            >
              <Icon
                size={20}
                style={{ color: isActive ? '#1475e1' : '#b1bad3' }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? '#1475e1' : '#b1bad3' }}
              >
                {item.label}
              </span>
            </motion.div>
          </button>
        );
      })}
    </nav>
  );
}
