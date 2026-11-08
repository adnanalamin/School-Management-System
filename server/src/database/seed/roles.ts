export interface RoleSeed {
  key: string;
  name: string;
  description: string;
  /** Patterns: "students:read" (exact), "students:*" (every action), "*:read" (that action everywhere). */
  grants: readonly string[];
  /** Keys the role must NOT receive even if a pattern matches. */
  except?: readonly string[];
  /**
   * true  -> permissions are re-synced from `grants` on every seed run (use for "everything" roles, so new
   *          permissions reach them automatically)
   * false -> set once on creation; later edits made in the UI are preserved
   */
  syncPermissions: boolean;
}

function matches(pattern: string, key: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith(':*')) return key.startsWith(pattern.slice(0, -1));
  if (pattern.startsWith('*:')) return key.endsWith(pattern.slice(1));
  return pattern === key;
}

/** Patterns that match no permission are typos; this is exported so tests can find them. */
export function unmatchedPatterns(patterns: readonly string[], allKeys: readonly string[]): string[] {
  return patterns.filter((pattern) => !allKeys.some((key) => matches(pattern, key)));
}

export function resolvePermissionKeys(role: RoleSeed, allKeys: readonly string[]): string[] {
  const excluded = new Set(role.except ?? []);
  return allKeys.filter((key) => !excluded.has(key) && role.grants.some((pattern) => matches(pattern, key)));
}

const messaging = ['messages:read', 'messages:create', 'messages:delete'] as const;

export const SYSTEM_ROLES: readonly RoleSeed[] = [
  {
    key: 'super_admin',
    name: 'Super admin',
    description: 'Unrestricted access, including deleting users and roles.',
    grants: ['*'],
    syncPermissions: true,
  },
  {
    key: 'admin',
    name: 'Administrator',
    description: 'Runs the school day to day. Cannot delete users or roles.',
    grants: ['*'],
    except: ['users:delete', 'roles:delete'],
    syncPermissions: true,
  },
  {
    key: 'teacher',
    name: 'Teacher',
    description: 'Takes attendance, sets assignments and enters marks for their classes.',
    grants: [
      'dashboard:read',
      'students:read',
      'parents:read',
      'teachers:read',
      'academic-years:read',
      'classes:read',
      'sections:read',
      'subjects:read',
      'enrollments:read',
      'attendance:*',
      'exams:read',
      'marks:*',
      'results:read',
      'assignments:read',
      'assignments:create',
      'assignments:update',
      'assignments:grade',
      'notices:read',
      'events:read',
      'documents:read',
      'documents:upload',
      'leaves:read',
      'leaves:create',
      'books:read',
      ...messaging,
    ],
    syncPermissions: false,
  },
  {
    key: 'student',
    name: 'Student',
    description: 'Sees their own timetable, attendance, assignments and results.',
    grants: [
      'dashboard:read',
      'attendance:read',
      'exams:read',
      'results:read',
      'assignments:read',
      'assignments:submit',
      'notices:read',
      'events:read',
      'documents:read',
      'books:read',
      'messages:read',
      'messages:create',
    ],
    syncPermissions: false,
  },
  {
    key: 'parent',
    name: 'Parent',
    description: 'Follows their children’s attendance, results and fees.',
    grants: [
      'dashboard:read',
      'attendance:read',
      'exams:read',
      'results:read',
      'assignments:read',
      'fees:read',
      'payments:read',
      'notices:read',
      'events:read',
      'documents:read',
      'messages:read',
      'messages:create',
    ],
    syncPermissions: false,
  },
  {
    key: 'accountant',
    name: 'Accountant',
    description: 'Manages fees, payments, expenses and payroll.',
    grants: [
      'dashboard:read',
      'students:read',
      'parents:read',
      'staff:read',
      'academic-years:read',
      'classes:read',
      'sections:read',
      'enrollments:read',
      'fees:*',
      'payments:*',
      'expenses:*',
      'salaries:*',
      'leaves:read',
      'reports:*',
      'notices:read',
      'events:read',
      ...messaging,
    ],
    syncPermissions: false,
  },
  {
    key: 'librarian',
    name: 'Librarian',
    description: 'Manages the book catalogue and loans.',
    grants: ['dashboard:read', 'books:*', 'book-issues:*', 'students:read', 'staff:read', 'notices:read', 'events:read', ...messaging],
    syncPermissions: false,
  },
];
