'use client';

import { useState, useEffect } from 'react';
import type { SidebarMode } from '@/types';

export function useSidebar() {
  const [mode, setMode] = useState<SidebarMode>('expanded');

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-mode') as SidebarMode | null;
    if (stored) setMode(stored);
  }, []);

  const toggle = () => {
    const next: SidebarMode = mode === 'expanded' ? 'collapsed' : 'expanded';
    setMode(next);
    localStorage.setItem('sidebar-mode', next);
  };

  const isExpanded = mode === 'expanded';
  const isCollapsed = mode === 'collapsed';

  return { mode, toggle, isExpanded, isCollapsed };
}
