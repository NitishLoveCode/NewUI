import type { SidebarMenuItem } from '@/types';

export const sidebarItems: SidebarMenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    section: 'main',
    href: '/',
  },
  {
    id: 'problems',
    label: 'Problems',
    icon: 'code-2',
    section: 'main',
    href: '/problems',
  },
  {
    id: 'collaborate',
    label: 'Collaborate',
    icon: 'users',
    section: 'main',
    href: '/pair',
  },
  {
    id: 'contests',
    label: 'Contests',
    icon: 'trophy',
    section: 'main',
    href: '/challenges',
  },
  {
    id: 'discuss',
    label: 'Discuss',
    icon: 'message-square',
    section: 'main',
    href: '/discussion',
  },
  {
    id: 'newsroom',
    label: 'Newsroom',
    icon: 'newspaper',
    section: 'main',
    href: '/news',
  },
  {
    id: 'studio',
    label: 'Content Studio',
    icon: 'pen-square',
    section: 'main',
    href: '/cms',
  },
  {
    id: 'leaderboards',
    label: 'Leaderboards',
    icon: 'crown',
    section: 'main',
    href: '/leaderboard',
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    icon: 'bookmark',
    section: 'main',
    href: '/bookmarks',
  },
];
