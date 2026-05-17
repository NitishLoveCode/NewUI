'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSidebar } from '@/hooks/useSidebar';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import AuthDialog from '@/components/auth/AuthDialog';
import MusicPlayer from './MusicPlayer';

export default function PageShell({ children }: { children: React.ReactNode }) {
  const { isExpanded, toggle } = useSidebar();
  const sidebarWidth = isExpanded ? 260 : 68;
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f212e', color: '#fff' }}>
      <Navbar
        onToggleSidebar={toggle}
        isSidebarExpanded={isExpanded}
        sidebarWidth={sidebarWidth}
        onOpenAuth={(tab) => { setAuthTab(tab); setAuthOpen(true); }}
      />
      <Sidebar isExpanded={isExpanded} />

      <motion.main
        initial={false}
        animate={{ paddingLeft: sidebarWidth }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="hidden md:block pt-14"
      >
        {children}
      </motion.main>

      <main className="md:hidden pt-14 pb-16" style={{ backgroundColor: '#0f212e' }}>
        {children}
      </main>

      <MobileBottomNav />
      <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
      <MusicPlayer />
    </div>
  );
}
