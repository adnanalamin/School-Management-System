import { Activity, LayoutDashboard, Palette, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match the path exactly (use for index routes). */
  end?: boolean;
  /** Hidden in production builds. */
  devOnly?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

/**
 * Single source of truth for sidebar and mobile navigation.
 * Feature phases add their entries here; Phase 2 adds permission filtering.
 */
const navGroups: NavGroup[] = [
  {
    items: [
      { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
      { label: 'System status', to: '/app/system', icon: Activity },
    ],
  },
  {
    label: 'Developer',
    items: [{ label: 'Design system', to: '/app/design-system', icon: Palette, devOnly: true }],
  },
];

export function getNavGroups(): NavGroup[] {
  return navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.devOnly || import.meta.env.DEV) }))
    .filter((group) => group.items.length > 0);
}
