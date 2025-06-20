import type { LucideIcon } from 'lucide-react';
import { ShoppingCart, Search, Ticket, CalendarDays, Home } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    label: 'Marketplace',
    href: '/',
    icon: ShoppingCart,
  },
  {
    label: 'Lost & Found',
    href: '/lost-and-found',
    icon: Search,
  },
  {
    label: 'Ticket Exchange',
    href: '/ticket-exchange',
    icon: Ticket,
  },
  {
    label: 'Campus Events',
    href: '/events',
    icon: CalendarDays,
  },
];
