import mongoose, { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';
import {
  AcademicYearModel,
  AttendanceModel,
  AuditLogModel,
  BookIssueModel,
  BookModel,
  DocumentModel,
  EventModel,
  ExamModel,
  FeeModel,
  LeaveModel,
  MarkModel,
  MessageModel,
  NoticeModel,
  NotificationModel,
  ParentModel,
  PaymentModel,
  ResultModel,
  RoleModel,
  SalaryModel,
  SectionModel,
  SettingModel,
  SETTING_DEFINITIONS,
  StaffModel,
  StudentModel,
  TeacherModel,
  UserModel,
  redactAuditPayload,
} from './index';

const oid = () => new Types.ObjectId();

/** Paths that failed validation (empty = valid). Runs the async pre-validate hooks too. */
async function invalidPaths(doc: { validate: () => Promise<void> }): Promise<string[]> {
  try {
    await doc.validate();
    return [];
  } catch (error) {
    return error instanceof mongoose.Error.ValidationError ? Object.keys(error.errors) : ['__unexpected__'];
  }
}

describe('users, roles and people', () => {
  it('requires a valid email and at least one role, and normalises the email', async () => {
    expect(await invalidPaths(new UserModel({ email: 'nope', kind: 'staff', roles: [] }))).toEqual(expect.arrayContaining(['email', 'roles']));
    const user = new UserModel({ email: ' Teacher@Example.COM ', kind: 'staff', roles: [oid()] });
    expect(await invalidPaths(user)).toEqual([]);
    expect(user.email).toBe('teacher@example.com');
    expect(user.status).toBe('invited');
  });

  it('rejects duplicate permissions in a role', async () => {
    const id = oid();
    expect(await invalidPaths(new RoleModel({ key: 'clerk', name: 'Clerk', permissions: [id, id] }))).toContain('permissions');
  });

  it('validates a student, normalising the admission number', async () => {
    expect(await invalidPaths(new StudentModel({}))).toEqual(expect.arrayContaining(['admissionNumber', 'firstName', 'lastName']));
    const student = new StudentModel({ admissionNumber: ' ad-0042 ', firstName: 'Aisha', lastName: 'Rahman' });
    expect(await invalidPaths(student)).toEqual([]);
    expect(student.admissionNumber).toBe('AD-0042');
    expect(student.status).toBe('active');
  });

  it('keeps guardians consistent: one primary, no repeats', async () => {
    const base = { admissionNumber: 'A1', firstName: 'A', lastName: 'B' };
    const parent = oid();
    const twoPrimary = new StudentModel({ ...base, guardians: [{ parent, relation: 'father', isPrimary: true }, { parent: oid(), relation: 'mother', isPrimary: true }] });
    const repeated = new StudentModel({ ...base, guardians: [{ parent, relation: 'father' }, { parent, relation: 'mother' }] });
    expect(await invalidPaths(twoPrimary)).toContain('guardians');
    expect(await invalidPaths(repeated)).toContain('guardians');
  });

  it('does not select sensitive fields by default', () => {
    expect(StudentModel.schema.path('medical').options.select).toBe(false);
    expect(ParentModel.schema.path('nationalId').options.select).toBe(false);
    expect(StaffModel.schema.path('baseSalary').options.select).toBe(false);
    expect(UserModel.schema.path('passwordHash').options.select).toBe(false);
  });

  it('requires a reachable phone for parents', async () => {
    expect(await invalidPaths(new ParentModel({ firstName: 'A', lastName: 'B' }))).toContain('phone');
    expect(await invalidPaths(new ParentModel({ firstName: 'A', lastName: 'B', phone: 'abc' }))).toContain('phone');
    expect(await invalidPaths(new ParentModel({ firstName: 'A', lastName: 'B', phone: '+880 1712-345678' }))).toEqual([]);
  });

  it('rejects a staff leaving date before the joining date', async () => {
    const staff = new StaffModel({ employeeId: 'e1', firstName: 'A', lastName: 'B', designation: 'Clerk', joiningDate: '2025-06-01', leavingDate: '2025-01-01' });
    expect(await invalidPaths(staff)).toContain('leavingDate');
  });

  it('rejects duplicate qualified subjects on a teacher', async () => {
    const subject = oid();
    expect(await invalidPaths(new TeacherModel({ staff: oid(), subjects: [subject, subject] }))).toContain('subjects');
  });
});

describe('academic structure', () => {
  it('rejects an academic year that ends before it starts', async () => {
    expect(await invalidPaths(new AcademicYearModel({ name: '2026', startDate: '2026-09-01', endDate: '2026-01-01' }))).toContain('endDate');
  });

  it('rejects a subject assigned twice to the same section', async () => {
    const subject = oid();
    const section = new SectionModel({ class: oid(), academicYear: oid(), name: 'a', subjectAssignments: [{ subject }, { subject }] });
    expect(await invalidPaths(section)).toContain('subjectAssignments');
    expect(section.name).toBe('A');
  });

  it('stores attendance dates as calendar days at 00:00 UTC', async () => {
    const row = new AttendanceModel({ student: oid(), section: oid(), date: '2026-03-05T18:30:00Z', status: 'present', markedBy: oid() });
    expect(await invalidPaths(row)).toEqual([]);
    expect(row.date.toISOString()).toBe('2026-03-05T00:00:00.000Z');
    expect(await invalidPaths(new AttendanceModel({ student: oid(), section: oid(), date: '2026-03-05', status: 'bunking', markedBy: oid() }))).toContain('status');
  });

  it('validates exam papers: pass mark, duplicate papers and dates within the exam window', async () => {
    const [classId, subjectId] = [oid(), oid()];
    const paper = { class: classId, subject: subjectId, date: '2026-05-10', startTime: '09:30', durationMinutes: 120, maxMarks: 100, passMarks: 40 };
    const exam = (schedule: object[], overrides = {}) => new ExamModel({ name: 'Mid-term', academicYear: oid(), startDate: '2026-05-01', endDate: '2026-05-20', schedule, ...overrides });

    expect(await invalidPaths(exam([paper]))).toEqual([]);
    expect((await invalidPaths(exam([{ ...paper, passMarks: 150 }]))).some((p) => p.endsWith('passMarks'))).toBe(true);
    expect(await invalidPaths(exam([paper, paper]))).toContain('schedule');
    expect(await invalidPaths(exam([{ ...paper, date: '2026-06-30' }]))).toContain('schedule.0.date');
    expect((await invalidPaths(exam([{ ...paper, startTime: '9am' }]))).some((p) => p.endsWith('startTime'))).toBe(true);
  });

  it('requires marks unless absent, and forbids marks when absent', async () => {
    const base = { exam: oid(), subject: oid(), student: oid(), enteredBy: oid() };
    expect(await invalidPaths(new MarkModel({ ...base, marksObtained: 72 }))).toEqual([]);
    expect(await invalidPaths(new MarkModel({ ...base }))).toContain('marksObtained');
    expect(await invalidPaths(new MarkModel({ ...base, isAbsent: true }))).toEqual([]);
    expect(await invalidPaths(new MarkModel({ ...base, isAbsent: true, marksObtained: 10 }))).toContain('marksObtained');
    expect(await invalidPaths(new MarkModel({ ...base, marksObtained: -1 }))).toContain('marksObtained');
  });

  it('rejects a result whose total exceeds the maximum', async () => {
    const result = new ResultModel({ exam: oid(), student: oid(), section: oid(), totalObtained: 600, totalMaximum: 500, percentage: 100, status: 'pass' });
    expect(await invalidPaths(result)).toContain('totalObtained');
  });
});

describe('finance', () => {
  const fee = (overrides = {}) => new FeeModel({ student: oid(), academicYear: oid(), category: 'tuition', title: 'Term 1 tuition', amount: 10_000, dueDate: '2026-02-01', ...overrides });

  it('keeps money as whole minor units and the balance consistent', async () => {
    expect(await invalidPaths(fee())).toEqual([]);
    expect(await invalidPaths(fee({ amount: 99.5 }))).toContain('amount');
    expect(await invalidPaths(fee({ amount: 0 }))).toContain('amount');
    expect(await invalidPaths(fee({ discount: 20_000 }))).toContain('discount');
    expect(await invalidPaths(fee({ discount: 1_000, paidAmount: 9_500 }))).toContain('paidAmount');
    expect(fee({ discount: 1_000, paidAmount: 2_000 }).get('balance')).toBe(7_000);
  });

  it('requires a reason to waive a fee', async () => {
    expect(await invalidPaths(fee({ status: 'waived' }))).toContain('waivedReason');
    expect(await invalidPaths(fee({ status: 'waived', waivedReason: 'Scholarship' }))).toEqual([]);
  });

  it('requires payment allocations to add up to the amount', async () => {
    const base = { student: oid(), method: 'cash', receiptNumber: 'rc-1', receivedBy: oid() };
    const [feeA, feeB] = [oid(), oid()];
    expect(await invalidPaths(new PaymentModel({ ...base, amount: 5_000, allocations: [{ fee: feeA, amount: 3_000 }, { fee: feeB, amount: 2_000 }] }))).toEqual([]);
    expect(await invalidPaths(new PaymentModel({ ...base, amount: 5_000, allocations: [{ fee: feeA, amount: 3_000 }] }))).toContain('allocations');
    expect(await invalidPaths(new PaymentModel({ ...base, amount: 5_000, allocations: [{ fee: feeA, amount: 2_500 }, { fee: feeA, amount: 2_500 }] }))).toContain('allocations');
    expect(await invalidPaths(new PaymentModel({ ...base, amount: 5_000, allocations: [] }))).toContain('allocations');
    expect(await invalidPaths(new PaymentModel({ ...base, amount: 5_000, status: 'void', allocations: [{ fee: feeA, amount: 5_000 }] }))).toContain('voidReason');
  });

  it('calculates net salary from its components on every validation', async () => {
    const slip = new SalaryModel({
      staff: oid(),
      year: 2026,
      month: 3,
      basic: 50_000,
      allowances: [{ label: 'Housing', amount: 5_000 }],
      deductions: [{ label: 'Tax', amount: 2_000 }],
      net: 1,
    });
    expect(await invalidPaths(slip)).toEqual([]);
    expect(slip.net).toBe(53_000);

    expect(await invalidPaths(new SalaryModel({ staff: oid(), year: 2026, month: 3, basic: 1_000, deductions: [{ label: 'Loan', amount: 5_000 }] }))).toContain('deductions');
    expect(await invalidPaths(new SalaryModel({ staff: oid(), year: 2026, month: 13, basic: 1_000 }))).toContain('month');
    expect(await invalidPaths(new SalaryModel({ staff: oid(), year: 2026, month: 3, basic: 1_000, status: 'paid' }))).toContain('paidOn');
  });
});

describe('hr and library', () => {
  it('rejects leave that ends before it starts', async () => {
    expect(await invalidPaths(new LeaveModel({ staff: oid(), type: 'sick', startDate: '2026-03-10', endDate: '2026-03-01' }))).toContain('endDate');
  });

  it('normalises ISBNs and keeps availability within the total', async () => {
    const book = new BookModel({ title: 'Dune', authors: ['Frank Herbert'], isbn: '978-0-306-40615-7', totalCopies: 3 });
    expect(await invalidPaths(book)).toEqual([]);
    expect(book.isbn).toBe('9780306406157');
    expect(book.availableCopies).toBe(3);
    expect(await invalidPaths(new BookModel({ title: 'X', authors: ['Y'], isbn: '12345' }))).toContain('isbn');
    expect(await invalidPaths(new BookModel({ title: 'X', authors: [] }))).toContain('authors');
    expect(await invalidPaths(new BookModel({ title: 'X', authors: ['Y'], totalCopies: 2, availableCopies: 5 }))).toContain('availableCopies');
  });

  it('requires a book loan to have exactly one borrower', async () => {
    const base = { book: oid(), issuedBy: oid(), dueDate: new Date(Date.now() + 7 * 86_400_000) };
    expect(await invalidPaths(new BookIssueModel({ ...base, student: oid() }))).toEqual([]);
    expect(await invalidPaths(new BookIssueModel({ ...base, staff: oid() }))).toEqual([]);
    expect(await invalidPaths(new BookIssueModel({ ...base }))).toContain('student');
    expect(await invalidPaths(new BookIssueModel({ ...base, student: oid(), staff: oid() }))).toContain('student');
    expect(await invalidPaths(new BookIssueModel({ ...base, student: oid(), status: 'returned' }))).toContain('returnedOn');
  });
});

describe('communication', () => {
  const notice = (audience: object) => new NoticeModel({ title: 'Holiday', body: 'School is closed.', author: oid(), audience });

  it('defaults a notice to everyone and validates targeted audiences', async () => {
    const everyone = new NoticeModel({ title: 'Hello', body: 'Welcome.', author: oid() });
    expect(await invalidPaths(everyone)).toEqual([]);
    expect(everyone.audience.scope).toBe('all');

    expect(await invalidPaths(notice({ scope: 'roles', roles: [oid()] }))).toEqual([]);
    expect(await invalidPaths(notice({ scope: 'roles', roles: [] }))).toContain('audience.roles');
    expect(await invalidPaths(notice({ scope: 'classes', classes: [oid()], roles: [oid()] }))).toContain('audience.roles');
    expect(await invalidPaths(notice({ scope: 'all', sections: [oid()] }))).toContain('audience.scope');
  });

  it('rejects an event that ends before it starts', async () => {
    expect(await invalidPaths(new EventModel({ title: 'Sports day', startsAt: '2026-03-10T10:00:00Z', endsAt: '2026-03-10T08:00:00Z', organizer: oid() }))).toContain('endsAt');
  });

  it('starts a message thread with its own id and blocks self-addressed messages', async () => {
    const sender = oid();
    const message = new MessageModel({ sender, recipients: [{ user: oid() }], body: 'Hi' });
    expect(await invalidPaths(message)).toEqual([]);
    expect(String(message.thread)).toBe(String(message._id));
    expect(await invalidPaths(new MessageModel({ sender, recipients: [{ user: sender }], body: 'Hi' }))).toContain('recipients');
    expect(await invalidPaths(new MessageModel({ sender, recipients: [], body: 'Hi' }))).toContain('recipients');
  });

  it('expires notifications after about 90 days by default', async () => {
    const note = new NotificationModel({ user: oid(), category: 'fees', title: 'Fee due' });
    expect(await invalidPaths(note)).toEqual([]);
    const days = (note.expiresAt.getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(89);
    expect(days).toBeLessThan(91);
    expect(await invalidPaths(new NotificationModel({ user: oid(), category: 'gossip', title: 'x' }))).toContain('category');
  });
});

describe('system collections', () => {
  const file = (overrides = {}) => ({ originalName: 'a.pdf', mimeType: 'application/pdf', sizeBytes: 1024, storage: { provider: 's3', key: 'uploads/a.pdf' }, uploadedBy: oid(), ...overrides });

  it('validates stored document metadata', async () => {
    expect(await invalidPaths(new DocumentModel(file()))).toEqual([]);
    expect(await invalidPaths(new DocumentModel(file({ sizeBytes: 200 * 1024 * 1024 })))).toContain('sizeBytes');
    expect(await invalidPaths(new DocumentModel(file({ mimeType: 'pdf' })))).toContain('mimeType');
    expect(await invalidPaths(new DocumentModel(file({ checksumSha256: 'abc' })))).toContain('checksumSha256');
  });

  it('only accepts known setting keys with valid values, and normalises them', async () => {
    const defaults = SETTING_DEFINITIONS['locale.settings'].defaults;
    expect(await invalidPaths(new SettingModel({ key: 'locale.settings', value: defaults }))).toEqual([]);
    expect(await invalidPaths(new SettingModel({ key: 'made.up', value: {} }))).toContain('key');
    expect(await invalidPaths(new SettingModel({ key: 'locale.settings', value: { ...defaults, currency: 'dollars' } }))).toContain('value');
    expect(await invalidPaths(new SettingModel({ key: 'locale.settings', value: { ...defaults, timezone: 'Mars/Olympus' } }))).toContain('value');

    const profile = new SettingModel({ key: 'school.profile', value: { name: '  Green Valley  ', rogue: true } });
    expect(await invalidPaths(profile)).toEqual([]);
    expect(profile.value).toEqual({ name: 'Green Valley' });
  });

  it('requires a grading scale that reaches 0%', () => {
    const grading = SETTING_DEFINITIONS['academic.grading'].schema;
    expect(grading.safeParse({ passPercent: 40, scale: [{ grade: 'A', minPercent: 80, gradePoint: 4 }] }).success).toBe(false);
  });

  it('validates audit entries and refuses to change or delete them', async () => {
    const entry = { action: 'student.create', entity: { model: 'Student', id: oid() } };
    expect(await invalidPaths(new AuditLogModel(entry))).toEqual([]);
    expect(await invalidPaths(new AuditLogModel({ ...entry, action: 'Create Student' }))).toContain('action');
    expect(await invalidPaths(new AuditLogModel({ ...entry, entity: { model: 'Spaceship', id: oid() } }))).toContain('entity.model');

    await expect(AuditLogModel.updateOne({}, { summary: 'edited' }).exec()).rejects.toThrow('append-only');
    await expect(AuditLogModel.deleteMany({}).exec()).rejects.toThrow('append-only');
  });

  it('redacts secrets from audit snapshots', () => {
    const redacted = redactAuditPayload({ name: 'Ada', passwordHash: 'x', nested: { apiToken: 'y', ok: 1 }, list: [{ secret: 'z' }] });
    expect(redacted).toEqual({ name: 'Ada', passwordHash: '[REDACTED]', nested: { apiToken: '[REDACTED]', ok: 1 }, list: [{ secret: '[REDACTED]' }] });
  });
});
