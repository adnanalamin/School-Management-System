import {
  Activity,
  BookOpenCheck,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  Palette,
  Receipt,
  School,
  Settings,
  UserCog,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match the path exactly (use for index routes). */
  end?: boolean;
  /** Hidden in production builds. */
  devOnly?: boolean;
  /** Module not built yet: shows a "Soon" tag and routes to an explanatory page. Remove when the module ships. */
  planned?: boolean;
  /** One sentence for the placeholder page of a planned module. */
  description?: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

/**
 * Single source of truth for the sidebar, mobile drawer and command palette.
 * Shipping a module = delete `planned` here and replace its placeholder route in app/router.tsx.
 */
const navGroups: NavGroup[] = [
  {
    items: [{ label: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'People',
    items: [
      { label: 'Students', to: '/app/students', icon: GraduationCap, planned: true, description: 'Student records, admissions and guardians will be managed here.' },
      { label: 'Teachers', to: '/app/teachers', icon: UserCog, planned: true, description: 'Staff profiles and teaching assignments will be managed here.' },
    ],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Classes', to: '/app/classes', icon: School, planned: true, description: 'Classes, sections and timetables will be managed here.' },
      { label: 'Attendance', to: '/app/attendance', icon: CalendarCheck, planned: true, description: 'Daily attendance tracking and reports will live here.' },
      { label: 'Exams', to: '/app/exams', icon: BookOpenCheck, planned: true, description: 'Exam schedules, marks and report cards will live here.' },
    ],
  },
  {
    label: 'Finance',
    items: [{ label: 'Fees', to: '/app/fees', icon: Receipt, planned: true, description: 'Fee structures, invoices and payments will be managed here.' }],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'System status', to: '/app/system', icon: Activity },
      { label: 'Settings', to: '/app/settings', icon: Settings, planned: true, description: 'School and account settings will be managed here.' },
    ],
  },
  {
    label: 'Developer',
    items: [{ label: 'Design system', to: '/app/design-system', icon: Palette, devOnly: true }],
  },
];

/** Reachable from the user menu but not listed in the sidebar. */
const profileRoute: NavItem = {
  label: 'My profile',
  to: '/app/profile',
  icon: User,
  planned: true,
  description: 'Your personal details and preferences will be managed here.',
};

export function getNavGroups(): NavGroup[] {
  return navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.devOnly || import.meta.env.DEV) }))
    .filter((group) => group.items.length > 0);
}

/** Routes that need a placeholder page until their module exists. */
export function getPlannedRoutes(): NavItem[] {
  return [...navGroups.flatMap((group) => group.items), profileRoute].filter((item) => item.planned);
}
