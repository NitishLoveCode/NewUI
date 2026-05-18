'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Gift, Trophy, Users, Crown, Newspaper, MessageSquare,
  Handshake, Shield, Headphones, Globe, ChevronDown, Code2, Activity,
} from 'lucide-react';
import { sidebarItems } from '@/data/sidebar';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  gift: Gift,
  trophy: Trophy,
  users: Users,
  crown: Crown,
  newspaper: Newspaper,
  'message-square': MessageSquare,
  handshake: Handshake,
  shield: Shield,
  headphones: Headphones,
  globe: Globe,
  'code-2': Code2,
  activity: Activity,
};

interface SidebarProps {
  isExpanded: boolean;
}

export default function Sidebar({ isExpanded }: SidebarProps) {
  const mainItems = sidebarItems.filter(i => i.section === 'main');
  const infoItems = sidebarItems.filter(i => i.section === 'info');
  const supportItems = sidebarItems.filter(i => i.section === 'support');

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 260 : 68 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 z-40 overflow-hidden"
      style={{ backgroundColor: '#1a2c38' }}
    >
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden py-3">
        <SidebarGroup items={mainItems} isExpanded={isExpanded} />
        <div className="my-3 mx-3" style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <SidebarGroup items={infoItems} isExpanded={isExpanded} />
        <div className="my-3 mx-3" style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <SidebarGroup items={supportItems} isExpanded={isExpanded} />
      </div>
    </motion.aside>
  );
}

function SidebarGroup({
  items,
  isExpanded,
}: {
  items: typeof sidebarItems;
  isExpanded: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-0.5 px-2">
      {items.map(item => {
        const Icon = iconMap[item.icon] || Gift;
        const isActive = item.href ? pathname === item.href : false;

        const innerContent = (
          <>
            <div
              className="flex-shrink-0 flex items-center justify-center w-6 h-6"
              style={{ color: isActive ? '#00e676' : 'inherit' }}
            >
              <Icon size={18} />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between flex-1 overflow-hidden"
                >
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown size={14} className="flex-shrink-0 ml-1 opacity-60" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        );

        const baseStyle: React.CSSProperties = {
          color: isActive ? '#00e676' : '#b1bad3',
          backgroundColor: isActive ? 'rgba(0,230,118,0.08)' : undefined,
          borderLeft: isActive ? '2px solid #00e676' : '2px solid transparent',
          minHeight: 42,
        };

        if (item.href) {
          return (
            <Link key={item.id} href={item.href} className="block w-full">
              <motion.div
                whileHover={{
                  backgroundColor: isActive ? 'rgba(0,230,118,0.12)' : 'rgba(47,69,83,0.8)',
                }}
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer transition-colors w-full"
                style={baseStyle}
                title={!isExpanded ? item.label : undefined}
              >
                {innerContent}
              </motion.div>
            </Link>
          );
        }

        return (
          <motion.button
            key={item.id}
            whileHover={{ backgroundColor: 'rgba(47,69,83,0.8)' }}
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer transition-colors w-full text-left"
            style={baseStyle}
            title={!isExpanded ? item.label : undefined}
          >
            {innerContent}
          </motion.button>
        );
      })}
    </div>
  );
}
