'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Mail, Lock, User, Zap } from 'lucide-react';
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
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setShowPass(false);
      setShowConfirm(false);
    }
  }, [isOpen, defaultTab]);

  const inputClass =
    'w-full py-2.5 rounded-lg text-sm outline-none transition-all placeholder:text-white/25 font-medium';
  const inputBase: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
  };

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = 'rgba(0,230,118,0.55)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,230,118,0.09)';
  }
  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
    e.currentTarget.style.boxShadow = 'none';
  }

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
                      Stake
                    </p>
                    <p className="text-[10px] font-semibold" style={{ color: GREEN }}>
                      World&apos;s #1 Online Casino
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
                  {activeTab === 'login' ? (
                    <motion.div
                      key="login-form"
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 18 }}
                      transition={{ duration: 0.18 }}
                    >
                      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        {/* Email */}
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
                              placeholder="you@example.com"
                              className={`${inputClass} pl-9 pr-4`}
                              style={inputBase}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium" style={{ color: '#b1bad3' }}>
                              Password
                            </label>
                            <button
                              type="button"
                              className="text-[11px] font-semibold"
                              style={{ color: GREEN }}
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock
                              size={14}
                              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ color: '#b1bad3' }}
                            />
                            <input
                              type={showPass ? 'text' : 'password'}
                              placeholder="••••••••"
                              className={`${inputClass} pl-9 pr-10`}
                              style={inputBase}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{ color: '#b1bad3' }}
                            >
                              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${GREEN_GLOW}` }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 rounded-xl text-sm font-bold text-black"
                          style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
                        >
                          Login to Stake
                        </motion.button>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                          <div
                            className="flex-1 h-px"
                            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                          />
                          <span className="text-xs" style={{ color: '#b1bad3' }}>
                            or continue with
                          </span>
                          <div
                            className="flex-1 h-px"
                            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                          />
                        </div>

                        <SocialLoginButtons />

                        <p className="text-center text-xs" style={{ color: '#b1bad3' }}>
                          No account?{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('register')}
                            className="font-semibold"
                            style={{ color: GREEN }}
                          >
                            Create one free
                          </button>
                        </p>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register-form"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -18 }}
                      transition={{ duration: 0.18 }}
                    >
                      {/* Welcome bonus banner */}
                      <div
                        className="flex items-center gap-3 px-3.5 py-3 rounded-xl mb-4"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(0,230,118,0.13), rgba(0,200,83,0.07))',
                          border: '1px solid rgba(0,230,118,0.22)',
                        }}
                      >
                        <span className="text-2xl select-none">🎁</span>
                        <div>
                          <p className="text-xs font-bold text-white">100% Welcome Bonus</p>
                          <p className="text-[11px]" style={{ color: '#b1bad3' }}>
                            Get up to{' '}
                            <span className="font-bold" style={{ color: GREEN }}>
                              $1,000
                            </span>{' '}
                            on your first deposit
                          </p>
                        </div>
                      </div>

                      <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
                        {/* Username */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium" style={{ color: '#b1bad3' }}>
                            Username
                          </label>
                          <div className="relative">
                            <User
                              size={14}
                              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ color: '#b1bad3' }}
                            />
                            <input
                              type="text"
                              placeholder="Choose a username"
                              className={`${inputClass} pl-9 pr-4`}
                              style={inputBase}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                          </div>
                        </div>

                        {/* Email */}
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
                              placeholder="you@example.com"
                              className={`${inputClass} pl-9 pr-4`}
                              style={inputBase}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                          </div>
                        </div>

                        {/* Password */}
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
                              type={showPass ? 'text' : 'password'}
                              placeholder="At least 8 characters"
                              className={`${inputClass} pl-9 pr-10`}
                              style={inputBase}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{ color: '#b1bad3' }}
                            >
                              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm password */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium" style={{ color: '#b1bad3' }}>
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock
                              size={14}
                              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ color: '#b1bad3' }}
                            />
                            <input
                              type={showConfirm ? 'text' : 'password'}
                              placeholder="Repeat your password"
                              className={`${inputClass} pl-9 pr-10`}
                              style={inputBase}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{ color: '#b1bad3' }}
                            >
                              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Terms */}
                        <p className="text-[11px]" style={{ color: '#b1bad3' }}>
                          By registering you agree to our{' '}
                          <span
                            className="font-semibold cursor-pointer"
                            style={{ color: GREEN }}
                          >
                            Terms of Service
                          </span>{' '}
                          and{' '}
                          <span
                            className="font-semibold cursor-pointer"
                            style={{ color: GREEN }}
                          >
                            Privacy Policy
                          </span>
                        </p>

                        {/* Submit */}
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${GREEN_GLOW}` }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 rounded-xl text-sm font-bold text-black"
                          style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
                        >
                          Create Free Account 🚀
                        </motion.button>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                          <div
                            className="flex-1 h-px"
                            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                          />
                          <span className="text-xs" style={{ color: '#b1bad3' }}>
                            or sign up with
                          </span>
                          <div
                            className="flex-1 h-px"
                            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                          />
                        </div>

                        <SocialLoginButtons />

                        <p className="text-center text-xs" style={{ color: '#b1bad3' }}>
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('login')}
                            className="font-semibold"
                            style={{ color: GREEN }}
                          >
                            Login
                          </button>
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
