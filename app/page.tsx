'use client';

import { useState } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HeroSection from '@/components/hero/HeroSection';
import SearchBar from '@/components/search/SearchBar';
import TrendingGames from '@/components/sections/TrendingGames';
import TrendingSports from '@/components/sections/TrendingSports';
import LiveWinsTicker from '@/components/sections/LiveWinsTicker';
import AuthDialog from '@/components/auth/AuthDialog';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { isExpanded, toggle } = useSidebar();
  const sidebarWidth = isExpanded ? 260 : 68;

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');

  function openAuth(tab: 'login' | 'register') {
    setAuthTab(tab);
    setAuthOpen(true);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f212e', color: '#fff' }}>
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={toggle}
        isSidebarExpanded={isExpanded}
        sidebarWidth={sidebarWidth}
        onOpenAuth={openAuth}
      />

      {/* Sidebar (desktop only) */}
      <Sidebar isExpanded={isExpanded} />

      {/* Desktop main content */}
      <motion.main
        initial={false}
        animate={{ paddingLeft: sidebarWidth }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="hidden md:flex justify-center pt-14"
      >
        <div className="mx-auto flex w-full max-w-350 flex-col items-center justify-center space-y-8 p-6">
          <HeroSection onOpenAuth={openAuth} />
          <SearchBar />
          <LiveWinsTicker />
          <TrendingGames />
          <TrendingSports />
          <div className="h-8" />
        </div>
      </motion.main>

      {/* Mobile main content */}
      <main className="md:hidden pt-14 pb-16" style={{ backgroundColor: '#0f212e' }}>
        <div className="px-4 py-5 space-y-7">
          <HeroSection onOpenAuth={openAuth} />
          <SearchBar />
          <LiveWinsTicker />
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <TrendingGames />
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <TrendingSports />
          <div className="h-4" />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </div>
  );
}
