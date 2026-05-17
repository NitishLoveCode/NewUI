'use client';

import { motion } from 'framer-motion';
import { Menu, Gamepad2 } from 'lucide-react';

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
        className="hidden md:flex items-center gap-3 h-full flex-shrink-0 px-4"
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
        {/* i want when click on iLoveDsa.com go back to home page. */}
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-bold tracking-tight italic cursor-pointer"
            style={{ fontFamily: 'Georgia, serif', color: '#fff' }}
            onClick={() => window.location.href = '/'}
          >
            iLoveDsa.com
          </span>
        </div>

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
        <div className="flex items-center gap-2">
          <Gamepad2 size={22} className="text-white" />
          <span
            className="text-2xl font-bold tracking-tight italic"
            style={{ fontFamily: 'Georgia, serif', color: '#fff' }}
          >
            Stake
          </span>
        </div>
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
