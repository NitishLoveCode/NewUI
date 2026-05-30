'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, LogOut, User } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import SiteLogo from '@/components/SiteLogo';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarExpanded?: boolean;
  showSidebarToggle?: boolean;
  sidebarWidth?: number;
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

export default function Navbar({
  onToggleSidebar,
  isSidebarExpanded = true,
  showSidebarToggle = true,
  sidebarWidth = 260,
  onOpenAuth,
}: NavbarProps) {
  const { user, loading } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    window.location.href = '/';
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center"
      style={{
        // backgroundColor: '#1a2d38',
        // backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,230,118,0.08)',
      }}
    >
      {/* Left section: matches sidebar width (desktop only) */}
      <motion.div
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="hidden md:flex items-center gap-3 h-full shrink-0 px-4"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#13242e' }}
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

        {isSidebarExpanded && (
          <>
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
          </>
        )}
      </motion.div>

      {/* Right section: fills remaining content area (desktop only) */}
      <div className="hidden bg-[#1a2d38] md:flex flex-1 items-center justify-between px-4 h-full">
        {/* Brand */}
        <Link href="/" aria-label="Go to ilovedsa.com home">
          <motion.div className="flex items-center gap-2 cursor-pointer" whileHover={{ scale: 1.03 }}>
            <SiteLogo size="md" />
          </motion.div>
        </Link>

        {/* Auth buttons or User Profile */}
        <div className="flex items-center gap-2 relative">
          {loading ? (
            <div style={{ color: '#b1bad3' }}>Loading...</div>
          ) : user ? (
            <div className="relative">
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(0,230,118,0.1)',
                  border: '1px solid rgba(0,230,118,0.3)',
                }}
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full" style={{ backgroundColor: 'rgba(0,230,118,0.2)' }}>
                  <User size={14} style={{ color: '#00e676' }} />
                </div>
                <span className="text-sm font-semibold text-white">{user.user_metadata.name}</span>
              </motion.button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-12 right-0 w-48 rounded-lg shadow-lg z-50"
                  style={{
                    backgroundColor: '#0d1d2b',
                    border: '1px solid rgba(0,230,118,0.2)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b" style={{ borderColor: 'rgba(0,230,118,0.1)' }}>
                    <p className="text-xs text-gray-400">Logged in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500 hover:hover:bg-opacity-10 transition-colors"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Mobile: logo + auth buttons or profile */}
      <div className="flex md:hidden items-center justify-between w-full px-4">
        <Link href="/" aria-label="Go to ilovedsa.com home">
          <motion.div className="flex items-center gap-2 cursor-pointer" whileHover={{ scale: 1.03 }}>
            <SiteLogo size="sm" />
          </motion.div>
        </Link>

        <div className="flex items-center gap-2 relative">
          {loading ? (
            <div style={{ color: '#b1bad3' }}>...</div>
          ) : user ? (
            <div className="relative">
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: 'rgba(0,230,118,0.1)',
                  border: '1px solid rgba(0,230,118,0.3)',
                }}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'rgba(0,230,118,0.2)' }}>
                  <User size={12} style={{ color: '#00e676' }} />
                </div>
                <span className="text-xs font-semibold text-white">{user.user_metadata.name}</span>
              </motion.button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-10 right-0 w-48 rounded-lg shadow-lg z-50"
                  style={{
                    backgroundColor: '#0d1d2b',
                    border: '1px solid rgba(0,230,118,0.2)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b" style={{ borderColor: 'rgba(0,230,118,0.1)' }}>
                    <p className="text-xs text-gray-400">Logged in as</p>
                    <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500 hover:hover:bg-opacity-10 transition-colors"
                  >
                    <LogOut size={12} />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <>
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
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-black"
                style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
              >
                Sign Up
              </motion.button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
