'use client';

import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function SocialLoginButtons() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const buttons = [
    {
      label: 'Google',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      ),
      onClick: handleGoogleSignIn,
    },
    // {
    //   label: 'Facebook',
    //   icon: (
    //     <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2">
    //       <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    //     </svg>
    //   ),
    //   onClick: () => console.log('Facebook coming soon'),
    // },
    // {
    //   label: 'Kick',
    //   icon: (
    //     <span className="text-sm font-black" style={{ color: '#53fc18', fontFamily: 'monospace' }}>
    //       K
    //     </span>
    //   ),
    //   onClick: () => console.log('Kick coming soon'),
    // },
  ];

  return (
    <div className="flex gap-2 w-full md:w-auto ">
      {buttons.map(btn => (
        <motion.button
          key={btn.label}
          whileHover={{ scale: 1.04, backgroundColor: 'rgba(47,69,83,0.9)' }}
          whileTap={{ scale: 0.96 }}
          onClick={btn.onClick}
          disabled={loading && btn.label === 'Google'}
          className="flex-1 md:flex-none flex items-center 
          justify-center gap-2 px-4 py-2.5 rounded-lg
           font-medium text-sm text-white disabled:opacity-50"
          style={{ backgroundColor: '#2f4553', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {btn.icon}
          <span className="hidden sm:inline">
            {loading && btn.label === 'Google' ? 'Signing in...' : btn.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
