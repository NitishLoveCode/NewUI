'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Zap, ShieldCheck } from 'lucide-react';
import SocialLoginButtons from '@/components/hero/SocialLoginButtons';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

const GREEN = '#00e676';
const GREEN_GLOW = 'rgba(0,230,118,0.5)';

export default function AuthDialog({ isOpen, onClose, defaultTab = 'register' }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const inputClass =
    'w-full py-2.5 rounded-lg text-sm outline-none transition-all placeholder:text-white/25 font-medium';
  const inputBase: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(14px)' }}
            onClick={onClose}
          />

          {/* Centering wrapper */}
          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.86, y: 28 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                backgroundColor: '#0d1d2b',
                border: '1px solid rgba(0,230,118,0.2)',
                boxShadow: `0 0 0 1px rgba(0,230,118,0.08), 0 0 60px rgba(0,230,118,0.1), 0 32px 80px rgba(0,0,0,0.85)`,
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top green line */}
              <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(90deg, transparent 5%, #00e676 50%, transparent 95%)',
                }}
              />

              {/* Ambient glow blobs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="absolute -top-24 -right-12 w-60 h-60 rounded-full blur-3xl"
                  style={{ backgroundColor: '#00e676', opacity: 0.06 }}
                />
                <div
                  className="absolute -bottom-24 -left-12 w-52 h-52 rounded-full blur-3xl"
                  style={{ backgroundColor: '#00c853', opacity: 0.05 }}
                />
              </div>

              {/* Header */}
              <div className="relative px-6 pt-6">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: '#b1bad3', backgroundColor: 'rgba(255,255,255,0.06)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2f4553')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')
                  }
                >
                  <X size={15} />
                </button>

                {/* Brand */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #00e676, #00b84d)',
                      boxShadow: '0 0 22px rgba(0,230,118,0.45)',
                    }}
                  >
                    <Zap size={17} fill="#000" className="text-black" />
                  </div>
                  <div>
                    <p
                      className="text-lg font-bold italic leading-tight"
                      style={{ fontFamily: 'Georgia, serif', color: '#fff' }}
                    >
                      iLoveDsa.com
                    </p>
                    <p className="text-[10px] font-semibold" style={{ color: GREEN }}>
                      World&apos;s #1 DSA Learning Platform
                    </p>
                  </div>
                </div>

                {/* Tab switcher */}
                <div
                  className="flex rounded-xl p-1 mb-5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  {(['login', 'register'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="relative flex-1 py-2.5 text-sm font-semibold rounded-lg capitalize"
                      style={{ color: activeTab === tab ? '#000' : '#b1bad3' }}
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="auth-tab-indicator"
                          className="absolute inset-0 rounded-lg"
                          style={{
                            background: 'linear-gradient(135deg, #00e676, #00c853)',
                            boxShadow: `0 0 24px ${GREEN_GLOW}`,
                          }}
                          transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                        />
                      )}
                      <span className="relative z-10">
                        {tab === 'login' ? 'Login' : 'Sign Up'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form body */}
              <div className="relative px-6 pb-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {/* Google-only notice */}
                    <div
                      className="flex items-start gap-3 px-3.5 py-3 rounded-xl mb-5"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(0,230,118,0.12), rgba(0,200,83,0.06))',
                        border: '1px solid rgba(0,230,118,0.22)',
                      }}
                    >
                      <ShieldCheck
                        size={18}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: GREEN }}
                      />
                      <div>
                        <p className="text-xs font-bold text-white">
                          {activeTab === 'login'
                            ? 'Secure Google Login Only'
                            : 'Secure Google Sign Up Only'}
                        </p>
                        <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: '#b1bad3' }}>
                          To keep our collaborative coding community spam-free and your account
                          safe, we only support {activeTab === 'login' ? 'logging in' : 'signing up'}{' '}
                          with Google. It&apos;s faster, more secure, and no password to remember.
                        </p>
                      </div>
                    </div>

                    {/* Disabled email/password preview */}
                    <div className="space-y-3.5 opacity-50 pointer-events-none select-none">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: '#b1bad3' }}>
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: '#b1bad3' }}
                          />
                          <input
                            type="email"
                            disabled
                            placeholder="Email login disabled"
                            className={`${inputClass} pl-9 pr-4`}
                            style={inputBase}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: '#b1bad3' }}>
                          Password
                        </label>
                        <div className="relative">
                          <Lock
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: '#b1bad3' }}
                          />
                          <input
                            type="password"
                            disabled
                            placeholder="Password login disabled"
                            className={`${inputClass} pl-9 pr-10`}
                            style={inputBase}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                      <div
                        className="flex-1 h-px"
                        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                      />
                      <span className="text-xs" style={{ color: '#b1bad3' }}>
                        {activeTab === 'login' ? 'continue with' : 'sign up with'}
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                      />
                    </div>

                    <SocialLoginButtons />

                    <p className="text-center text-xs mt-5" style={{ color: '#b1bad3' }}>
                      {activeTab === 'login' ? (
                        <>
                          New here?{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('register')}
                            className="font-semibold"
                            style={{ color: GREEN }}
                          >
                            Create an account
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('login')}
                            className="font-semibold"
                            style={{ color: GREEN }}
                          >
                            Login
                          </button>
                        </>
                      )}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
