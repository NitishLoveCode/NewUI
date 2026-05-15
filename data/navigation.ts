import type { MobileNavItem } from '@/types';

export const mobileNavItems: MobileNavItem[] = [
  {
    id: 'browse',
    label: 'Browse',
    icon: 'search',
    href: '/',
  },
  {
    id: 'casino',
    label: 'Casino',
    icon: 'diamond',
    href: '/casino',
  },
  {
    id: 'bets',
    label: 'Bets',
    icon: 'clipboard-list',
    href: '/bets',
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: 'trophy',
    href: '/sports',
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: 'message-circle',
    href: '/chat',
  },
];
