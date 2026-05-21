'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, Zap } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarExpanded?: boolean;
  showSidebarToggle?: boolean;
  sidebarWidth?: number;
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

export default function Navbar({
  onToggleSidebar,
  showSidebarToggle = true,
  sidebarWidth = 260,
  onOpenAuth,
}: NavbarProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center"
      style={{
        backgroundColor: 'rgba(13, 29, 43, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,230,118,0.08)',
      }}
    >
      {/* Left section: matches sidebar width (desktop only) */}
      <motion.div
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="hidden md:flex items-center gap-3 h-full shrink-0 px-4"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            style={{ color: '#b1bad3' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2f4553')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <button
          className="px-4 py-1.5 rounded-md text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: 'rgba(0,230,118,0.15)', color: '#00e676' }}
        >
          Casino
        </button>
        <button
          className="px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
          style={{ color: '#b1bad3' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2f4553';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#b1bad3';
          }}
        >
          Sports
        </button>
      </motion.div>

      {/* Right section: fills remaining content area (desktop only) */}
      <div className="hidden md:flex flex-1 items-center justify-between px-4 h-full">
        {/* Brand */}
        <Link href="/" aria-label="Go to Stake home">
          <motion.div className="flex items-center gap-3 cursor-pointer" whileHover={{ scale: 1.03 }}>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #00e676, #00b84d)',
                boxShadow: '0 0 24px rgba(0,230,118,0.35)',
              }}
            >
              <Zap size={18} fill="#000" className="text-black" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[1.28rem] font-black italic tracking-tight text-white">ilovedsa.com</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: '#00e676' }}>
                Play smart every day
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenAuth?.('login')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#2f4553', color: '#fff' }}
          >
            Login
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(0,230,118,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenAuth?.('register')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-black"
            style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
          >
            Register
          </motion.button>
        </div>
      </div>

      {/* Mobile: logo + auth buttons */}
      <div className="flex md:hidden items-center justify-between w-full px-4">
        <Link href="/" aria-label="Go to Stake home">
          <motion.div className="flex items-center gap-2.5 cursor-pointer" whileHover={{ scale: 1.03 }}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #00e676, #00b84d)',
                boxShadow: '0 0 20px rgba(0,230,118,0.3)',
              }}
            >
              <Zap size={16} fill="#000" className="text-black" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-black italic tracking-tight text-white">ilovedsa.com</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#00e676' }}>
                Learn and win
              </span>
            </div>
          </motion.div>
        </Link>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenAuth?.('login')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#2f4553', color: '#fff' }}
          >
            Login
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(0,230,118,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenAuth?.('register')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-black"
            style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
          >
            Register
          </motion.button>
        </div>
      </div>
    </header>
  );
}
