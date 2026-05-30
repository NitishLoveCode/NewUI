export interface GameCard {
  id: string;
  title: string;
  provider: string;
  playing: number;
  gradient: string;
  accentColor: string;
  image?: string;
}

export interface SportsCard {
  id: string;
  name: string;
  gradient: string;
  textColor?: string;
}

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  hasDropdown?: boolean;
  href?: string;
  section?: 'main' | 'info' | 'support';
}

export interface MobileNavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export type SidebarMode = 'expanded' | 'collapsed';


export interface dsaTopic {
  step_name: string;
  id: number;
}
