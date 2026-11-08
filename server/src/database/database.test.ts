import mongoose, { type Schema } from 'mongoose';
import { describe, expect, it } from 'vitest';
import '../models';
import { PERMISSION_KEY_PATTERN } from '../models/iam/permission.model';
import { AttendanceModel } from '../models/academics/attendance.model';
import { SETTING_DEFINITIONS, SETTING_KEYS } from '../models/system/setting.registry';
import { AppError } from '../utils/AppError';
import { MODELS } from './constants';
import { decodeCursor, encodeCursor } from './paginate';
import { collectIds, collectRefTargets } from './plugins/referentialIntegrity';
import { getRestrictions } from './plugins/softDelete';
import { RELATIONSHIPS } from './relationships';
import { ALL_PERMISSION_KEYS, PERMISSION_CATALOG } from './seed/permissions';
import { resolvePermissionKeys, SYSTEM_ROLES, unmatchedPatterns } from './seed/roles';

interface RefInfo {
  path: string;
  model: string;
}

/** Every `ref` declared anywhere in a schema, whether or not it is existence-checked. */
function allRefs(schema: Schema, prefix = ''): RefInfo[] {
  const found: RefInfo[] = [];
  schema.eachPath((path, schemaType) => {
    const nested = (schemaType as unknown as { schema?: Schema }).schema;
    if (nested) {
      found.push(...allRefs(nested, `${prefix}${path}.`));
      return;
    }
    const options = schemaType.options as { ref?: unknown; type?: unknown };
    const caster = (schemaType as unknown as { caster?: { options?: { ref?: unknown } } }).caster?.options?.ref;
    const item = Array.isArray(options.type) ? (options.type[0] as { ref?: unknown } | undefined)?.ref : undefined;
    const ref = options.ref ?? caster ?? item;
    if (typeof ref === 'string') found.push({ path: `${prefix}${path}`, model: ref });
  });
  return found;
}

const isSoftDeletable = (schema: Schema) => schema.path('isDeleted') !== undefined;

const EXPECTED_COLLECTIONS: Record<string, string> = {
  User: 'users',
  Role: 'roles',
  Permission: 'permissions',
  Student: 'students',
  Parent: 'parents',
  Teacher: 'teachers',
  Staff: 'staff',
  AcademicYear: 'academicYears',
  Class: 'classes',
  Section: 'sections',
  Subject: 'subjects',
  Enrollment: 'enrollments',
  Attendance: 'attendance',
  Exam: 'exams',
  Mark: 'marks',
  Result: 'results',
  Assignment: 'assignments',
  AssignmentSubmission: 'assignmentSubmissions',
  Fee: 'fees',
  Payment: 'payments',
  Expense: 'expenses',
  Salary: 'salaries',
  Leave: 'leaves',
  Book: 'books',
  BookIssue: 'bookIssues',
  Notice: 'notices',
  Event: 'events',
  Message: 'messages',
  Notification: 'notifications',
  Document: 'documents',
  AuditLog: 'auditLogs',
  Setting: 'settings',
};

describe('model registry', () => {
  it('registers exactly the models in MODELS', () => {
    expect(mongoose.modelNames().sort()).toEqual(Object.values(MODELS).sort());
  });

  it('uses the intended camelCase collection names', () => {
    for (const [name, collection] of Object.entries(EXPECTED_COLLECTIONS)) {
      expect(mongoose.model(name).collection.name, name).toBe(collection);
    }
  });

  it('gives every schema timestamps and optimistic concurrency', () => {
    for (const name of mongoose.modelNames()) {
      const { options } = mongoose.model(name).schema;
      expect(options.timestamps, `${name} timestamps`).toBeTruthy();
      expect(options.optimisticConcurrency, `${name} optimisticConcurrency`).toBe(true);
    }
  });
});

describe('relationships', () => {
  const declared = new Set(RELATIONSHIPS.map((r) => `${r.from}.${r.path} -> ${r.to}`));
  const actual = new Set<string>();
  for (const name of mongoose.modelNames()) {
    for (const ref of allRefs(mongoose.model(name).schema)) {
      if (ref.path !== 'deletedBy') actual.add(`${name}.${ref.path} -> ${ref.model}`);
    }
  }

  it('points every reference at a registered model', () => {
    const registered = new Set(mongoose.modelNames());
    for (const key of actual) expect(registered.has(key.split(' -> ')[1] ?? ''), key).toBe(true);
  });

  it('declares every reference found in the schemas', () => {
    expect([...actual].filter((key) => !declared.has(key))).toEqual([]);
  });

  it('declares no relationship that is missing from the schemas', () => {
    expect([...declared].filter((key) => !actual.has(key))).toEqual([]);
  });

  it('only restricts deletion of soft-deletable targets', () => {
    for (const relationship of RELATIONSHIPS.filter((r) => r.onDelete === 'restrict')) {
      expect(isSoftDeletable(mongoose.model(relationship.to).schema), `${relationship.to} must be soft-deletable`).toBe(true);
    }
  });

  it('registers every restrict rule with the delete guard', () => {
    const registered = [...Object.values(MODELS)].reduce((total, name) => total + getRestrictions(name).length, 0);
    expect(registered).toBe(RELATIONSHIPS.filter((r) => r.onDelete === 'restrict').length);
    expect(getRestrictions('Parent')).toContainEqual({ referrer: 'Student', path: 'guardians.parent', label: 'students' });
  });

  it('checks existence on the references that are written one document at a time', () => {
    const paths = (name: string) => collectRefTargets(mongoose.model(name).schema).map((t) => t.path);
    expect(paths('User')).toContain('roles');
    expect(paths('Student')).toContain('guardians.parent');
    expect(paths('Section')).toContain('subjectAssignments.subject');
    expect(paths('Notice')).toContain('audience.roles');
  });

  it('skips per-row existence checks on bulk-written collections', () => {
    expect(collectRefTargets(AttendanceModel.schema).map((t) => t.path)).toEqual([]);
  });

  it('collects ids through arrays of subdocuments', () => {
    const value = { guardians: [{ parent: 'a' }, { parent: 'b' }], photo: 'c' };
    expect(collectIds(value, ['guardians', 'parent'])).toEqual(['a', 'b']);
    expect(collectIds(value, ['photo'])).toEqual(['c']);
    expect(collectIds(value, ['missing'])).toEqual([]);
  });
});

describe('index strategy', () => {
  const softDeletable = mongoose.modelNames().filter((name) => isSoftDeletable(mongoose.model(name).schema));

  it('soft-deletes the intended collections and keeps financial and historical records permanent', () => {
    expect(softDeletable.sort()).toEqual(
      ['AcademicYear', 'Assignment', 'Book', 'Class', 'Document', 'Event', 'Exam', 'Notice', 'Parent', 'Role', 'Section', 'Staff', 'Student', 'Subject', 'Teacher', 'User'].sort(),
    );
  });

  it('scopes every index on a soft-deletable collection to live documents, so deleted values can be reused', () => {
    for (const name of softDeletable) {
      for (const [fields, options] of mongoose.model(name).schema.indexes()) {
        expect(options.partialFilterExpression?.['isDeleted'], `${name} ${JSON.stringify(fields)}`).toBe(false);
      }
    }
  });

  it('makes notifications expire on their own', () => {
    const indexes = mongoose.model('Notification').schema.indexes();
    expect(indexes.some(([fields, options]) => 'expiresAt' in fields && options.expireAfterSeconds === 0)).toBe(true);
  });

  it('enforces the key business uniqueness rules in the database', () => {
    const unique = (name: string) => mongoose.model(name).schema.indexes().filter(([, o]) => o.unique).map(([f]) => Object.keys(f).join('+'));
    expect(unique('Enrollment')).toContain('student+academicYear');
    expect(unique('Attendance')).toContain('student+date');
    expect(unique('Mark')).toContain('exam+subject+student');
    expect(unique('Result')).toContain('exam+student');
    expect(unique('Salary')).toContain('staff+year+month');
    expect(unique('AssignmentSubmission')).toContain('assignment+student');
    expect(unique('Payment')).toContain('receiptNumber');
    expect(unique('Student')).toContain('admissionNumber');
    expect(unique('User')).toContain('email');
    expect(unique('AcademicYear')).toContain('isCurrent');
  });
});

describe('pagination cursor', () => {
  it('round-trips', () => {
    const payload = { id: '507f1f77bcf86cd799439011', value: '2026-01-02T03:04:05.000Z' };
    expect(decodeCursor(encodeCursor(payload))).toEqual(payload);
    expect(decodeCursor(encodeCursor({ id: payload.id }))).toEqual({ id: payload.id });
  });

  it('rejects tampered or malformed cursors with a 400', () => {
    for (const bad of ['not-base64-json', encodeCursor({ id: 'nope' }), Buffer.from('{"id":5}').toString('base64url')]) {
      expect(() => decodeCursor(bad)).toThrow(AppError);
    }
    try {
      decodeCursor('###');
    } catch (error) {
      expect((error as AppError).statusCode).toBe(400);
    }
  });
});

describe('permission catalogue and system roles', () => {
  it('has unique, well-formed keys', () => {
    expect(new Set(ALL_PERMISSION_KEYS).size).toBe(ALL_PERMISSION_KEYS.length);
    for (const permission of PERMISSION_CATALOG) {
      expect(permission.key).toMatch(PERMISSION_KEY_PATTERN);
      expect(permission.description.length).toBeGreaterThan(0);
    }
  });

  it('has no grant pattern that matches nothing (a typo would silently remove access)', () => {
    for (const role of SYSTEM_ROLES) {
      expect(unmatchedPatterns([...role.grants, ...(role.except ?? [])], ALL_PERMISSION_KEYS), role.key).toEqual([]);
    }
  });

  it('gives each role the intended reach', () => {
    const keysOf = (key: string) => resolvePermissionKeys(SYSTEM_ROLES.find((r) => r.key === key)!, ALL_PERMISSION_KEYS);
    expect(keysOf('super_admin')).toEqual(ALL_PERMISSION_KEYS);
    expect(keysOf('admin')).not.toContain('users:delete');
    expect(keysOf('admin')).toContain('payments:void');
    expect(keysOf('teacher')).toContain('attendance:mark');
    expect(keysOf('teacher')).not.toContain('fees:read');
    expect(keysOf('parent')).toContain('fees:read');
    expect(keysOf('parent')).not.toContain('fees:create');
    expect(keysOf('student')).toContain('assignments:submit');
    expect(keysOf('accountant')).toContain('salaries:pay');
    expect(keysOf('librarian')).toContain('book-issues:issue');
  });
});

describe('settings registry', () => {
  it('ships defaults that satisfy their own schemas', () => {
    for (const key of SETTING_KEYS) {
      const result = SETTING_DEFINITIONS[key].schema.safeParse(SETTING_DEFINITIONS[key].defaults);
      expect(result.success, key).toBe(true);
    }
  });
});
