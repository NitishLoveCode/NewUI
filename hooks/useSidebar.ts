'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SidebarMode } from '@/types';

const SIDEBAR_EVENT = 'sidebar-mode-change';

function persistMode(next: SidebarMode) {
  localStorage.setItem('sidebar-mode', next);
  window.dispatchEvent(new CustomEvent<SidebarMode>(SIDEBAR_EVENT, { detail: next }));
}

export function useSidebar() {
  const [mode, setMode] = useState<SidebarMode>('expanded');

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-mode') as SidebarMode | null;
    if (stored) setMode(stored);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<SidebarMode>).detail;
      if (detail === 'expanded' || detail === 'collapsed') setMode(detail);
    };
    window.addEventListener(SIDEBAR_EVENT, onChange);
    return () => window.removeEventListener(SIDEBAR_EVENT, onChange);
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next: SidebarMode = prev === 'expanded' ? 'collapsed' : 'expanded';
      persistMode(next);
      return next;
    });
  }, []);

  const collapse = useCallback(() => {
    setMode('collapsed');
    persistMode('collapsed');
  }, []);

  const expand = useCallback(() => {
    setMode('expanded');
    persistMode('expanded');
  }, []);

  const isExpanded = mode === 'expanded';
  const isCollapsed = mode === 'collapsed';

  return { mode, toggle, collapse, expand, isExpanded, isCollapsed };
}
