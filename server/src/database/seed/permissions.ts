interface ResourceDefinition {
  group: string;
  actions: readonly string[];
}

const crud = ['read', 'create', 'update', 'delete'] as const;

/**
 * Everything a role can be allowed to do, as resource -> actions. Keys are "resource:action".
 * Adding a feature means adding its resource here and re-running `npm run db:seed`.
 * Note: these are capabilities. "Only my own children / my own class" is enforced by ownership rules
 * in the API layer (next to the permission check), not by extra keys.
 */
export const RESOURCES: Record<string, ResourceDefinition> = {
  users: { group: 'Access', actions: crud },
  roles: { group: 'Access', actions: crud },
  permissions: { group: 'Access', actions: ['read'] },

  students: { group: 'People', actions: [...crud, 'export'] },
  parents: { group: 'People', actions: crud },
  teachers: { group: 'People', actions: crud },
  staff: { group: 'People', actions: [...crud, 'export'] },

  'academic-years': { group: 'Academics', actions: crud },
  classes: { group: 'Academics', actions: crud },
  sections: { group: 'Academics', actions: crud },
  subjects: { group: 'Academics', actions: crud },
  enrollments: { group: 'Academics', actions: crud },
  attendance: { group: 'Academics', actions: ['read', 'mark', 'update'] },
  exams: { group: 'Academics', actions: crud },
  marks: { group: 'Academics', actions: ['read', 'enter', 'update'] },
  results: { group: 'Academics', actions: ['read', 'compute', 'publish'] },
  assignments: { group: 'Academics', actions: [...crud, 'grade', 'submit'] },

  fees: { group: 'Finance', actions: [...crud, 'waive'] },
  payments: { group: 'Finance', actions: ['read', 'create', 'refund', 'void'] },
  expenses: { group: 'Finance', actions: [...crud, 'approve'] },
  salaries: { group: 'Finance', actions: ['read', 'create', 'update', 'approve', 'pay'] },

  leaves: { group: 'HR', actions: ['read', 'create', 'update', 'approve'] },

  books: { group: 'Library', actions: crud },
  'book-issues': { group: 'Library', actions: ['read', 'issue', 'return'] },

  notices: { group: 'Communication', actions: [...crud, 'publish'] },
  events: { group: 'Communication', actions: crud },
  messages: { group: 'Communication', actions: ['read', 'create', 'delete'] },
  documents: { group: 'Communication', actions: ['read', 'upload', 'delete'] },

  'audit-logs': { group: 'System', actions: ['read'] },
  settings: { group: 'System', actions: ['read', 'update'] },
  reports: { group: 'System', actions: ['read', 'export'] },
  dashboard: { group: 'System', actions: ['read'] },
};

export interface PermissionSeed {
  key: string;
  description: string;
  group: string;
}

export const PERMISSION_CATALOG: PermissionSeed[] = Object.entries(RESOURCES).flatMap(([resource, definition]) =>
  definition.actions.map((action) => ({
    key: `${resource}:${action}`,
    description: `${action.charAt(0).toUpperCase()}${action.slice(1)} ${resource.replace(/-/g, ' ')}`,
    group: definition.group,
  })),
);

export const ALL_PERMISSION_KEYS: string[] = PERMISSION_CATALOG.map((permission) => permission.key);
