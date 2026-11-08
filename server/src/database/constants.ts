/** Registered Mongoose model names. Use these in `ref:` so a typo is a compile error, not a runtime surprise. */
export const MODELS = {
  User: 'User',
  Role: 'Role',
  Permission: 'Permission',
  Student: 'Student',
  Parent: 'Parent',
  Teacher: 'Teacher',
  Staff: 'Staff',
  AcademicYear: 'AcademicYear',
  Class: 'Class',
  Section: 'Section',
  Subject: 'Subject',
  Enrollment: 'Enrollment',
  Attendance: 'Attendance',
  Exam: 'Exam',
  Mark: 'Mark',
  Result: 'Result',
  Assignment: 'Assignment',
  AssignmentSubmission: 'AssignmentSubmission',
  Fee: 'Fee',
  Payment: 'Payment',
  Expense: 'Expense',
  Salary: 'Salary',
  Leave: 'Leave',
  Book: 'Book',
  BookIssue: 'BookIssue',
  Notice: 'Notice',
  Event: 'Event',
  Message: 'Message',
  Notification: 'Notification',
  Document: 'Document',
  AuditLog: 'AuditLog',
  Setting: 'Setting',
} as const;

export type ModelName = (typeof MODELS)[keyof typeof MODELS];

export const GENDERS = ['female', 'male', 'other'] as const;
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const PAYMENT_METHODS = ['cash', 'card', 'bank-transfer', 'mobile-banking', 'cheque', 'online'] as const;
export const AUDIENCE_SCOPES = ['all', 'roles', 'classes', 'sections'] as const;

export const DOCUMENT_CATEGORIES = [
  'profile-photo',
  'student-record',
  'staff-record',
  'assignment',
  'submission',
  'expense-receipt',
  'leave-attachment',
  'notice-attachment',
  'message-attachment',
  'library',
  'other',
] as const;

/** Kinds of record documents attached to a student or staff profile. */
export const RECORD_DOCUMENT_KINDS = [
  'birth-certificate',
  'national-id',
  'transfer-certificate',
  'previous-results',
  'medical',
  'contract',
  'qualification',
  'other',
] as const;

export const LIMITS = {
  name: 80,
  title: 200,
  shortText: 300,
  text: 2000,
  longText: 10_000,
  maxAttachments: 10,
  maxRecipients: 100,
  maxDocumentBytes: 50 * 1024 * 1024,
} as const;
