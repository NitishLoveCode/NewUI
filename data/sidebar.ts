import type { SidebarMenuItem } from '@/types';

export const sidebarItems: SidebarMenuItem[] = [
  {
    id: 'promotions',
    label: 'Promotions',
    icon: 'gift',
    hasDropdown: true,
    section: 'main',
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: 'trophy',
    section: 'main',
  },
  {
    id: 'affiliate',
    label: 'Affiliate',
    icon: 'users',
    section: 'main',
  },
  {
    id: 'vip',
    label: 'VIP Club',
    icon: 'crown',
    section: 'main',
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: 'newspaper',
    section: 'main',
  },
  {
    id: 'forum',
    label: 'Forum',
    icon: 'message-square',
    section: 'main',
  },
  {
    id: 'sponsorships',
    label: 'Sponsorships',
    icon: 'handshake',
    hasDropdown: true,
    section: 'info',
  },
  {
    id: 'responsible',
    label: 'Responsible Gambling',
    icon: 'shield',
    section: 'info',
  },
  {
    id: 'support',
    label: 'Live Support',
    icon: 'headphones',
    section: 'support',
  },
  {
    id: 'language',
    label: 'Language: English',
    icon: 'globe',
    hasDropdown: true,
    section: 'support',
  },
];
