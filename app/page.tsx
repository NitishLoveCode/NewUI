'use client';

import { useSidebar } from '@/hooks/useSidebar';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HeroSection from '@/components/hero/HeroSection';
import SearchBar from '@/components/search/SearchBar';
import TrendingGames from '@/components/sections/TrendingGames';
import TrendingSports from '@/components/sections/TrendingSports';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { isExpanded, toggle } = useSidebar();
  const sidebarWidth = isExpanded ? 260 : 68;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f212e', color: '#fff' }}>
      {/* Top Navbar */}
      <Navbar onToggleSidebar={toggle} isSidebarExpanded={isExpanded} sidebarWidth={sidebarWidth} />

      {/* Sidebar (desktop only) */}
      <Sidebar isExpanded={isExpanded} />

      {/* Desktop main content */}
      <motion.main
        initial={false}
        animate={{ paddingLeft: sidebarWidth }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="hidden md:block pt-14"
      >
        <div className="px-6 py-6 max-w-[1400px] space-y-8">
          <HeroSection />
          <SearchBar />
          <TrendingGames />
          <TrendingSports />
          <div className="h-8" />
        </div>
      </motion.main>

      {/* Mobile main content */}
      <main className="md:hidden pt-14 pb-16" style={{ backgroundColor: '#0f212e' }}>
        <div className="px-4 py-5 space-y-7">
          <HeroSection />
          <SearchBar />
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <TrendingGames />
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <TrendingSports />
          <div className="h-4" />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
