'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

const categories = ['Casino', 'Sports', 'Live Casino', 'Slots', 'Table Games'];

export default function SearchBar() {
  const [category, setCategory] = useState('Casino');
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div
      className="flex items-center rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#213743',
        border: `1px solid ${focused ? 'rgba(20,117,225,0.5)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'border-color 0.2s',
      }}
    >
      {/* Category dropdown */}
      <div className="relative hidden md:block">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition-colors"
          style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          {category}
          <ChevronDown size={14} style={{ color: '#b1bad3' }} />
        </button>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-10 min-w-[140px]"
            style={{ backgroundColor: '#213743', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2f4553] transition-colors"
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Search input */}
      <div className="flex-1 flex items-center px-4 gap-3">
        <Search size={16} style={{ color: '#b1bad3', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search your game or event"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-sm text-white outline-none py-3"
          style={{ color: '#fff' }}
        />
      </div>
    </div>
  );
}
