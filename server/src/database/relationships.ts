import { MODELS, type ModelName } from './constants';
import { registerRestriction } from './plugins/softDelete';

/**
 * Every ObjectId reference between collections, declared once. This list is:
 *   1. the documentation of how collections relate (docs/DATABASE.md is generated from the same facts),
 *   2. the delete-protection rules: `restrict` blocks soft-deleting the target while live referrers exist,
 *   3. checked by tests against the real schemas, so it cannot drift: an undeclared or stale reference fails the build.
 *
 * `restrict`  the target cannot be soft-deleted while live documents in `from` point at it (history stays valid).
 * `none`      no protection. Used for actor references (who did it), loose links, and targets that are never deleted.
 *
 * Not listed: the `deletedBy` field that every soft-deletable collection has (always a User, never blocks anything).
 */
export type OnDelete = 'restrict' | 'none';

export interface Relationship {
  from: ModelName;
  /** Path of the reference inside `from`; dotted for subdocument arrays. */
  path: string;
  to: ModelName;
  onDelete: OnDelete;
}

const M = MODELS;
const rel = (from: ModelName, path: string, to: ModelName, onDelete: OnDelete = 'none'): Relationship => ({ from, path, to, onDelete });

export const RELATIONSHIPS: readonly Relationship[] = [
  // Access control
  rel(M.Role, 'permissions', M.Permission),
  rel(M.User, 'roles', M.Role, 'restrict'),

  // People. Profiles point at their user account (one direction only); a deleted account is unlinked by the service.
  rel(M.Student, 'user', M.User),
  rel(M.Parent, 'user', M.User),
  rel(M.Staff, 'user', M.User),
  rel(M.Teacher, 'staff', M.Staff, 'restrict'),
  rel(M.Teacher, 'subjects', M.Subject),
  rel(M.Student, 'guardians.parent', M.Parent, 'restrict'),
  rel(M.Student, 'photo', M.Document, 'restrict'),
  rel(M.Student, 'documents.document', M.Document, 'restrict'),
  rel(M.Parent, 'photo', M.Document, 'restrict'),
  rel(M.Staff, 'photo', M.Document, 'restrict'),
  rel(M.Staff, 'documents.document', M.Document, 'restrict'),

  // Academic structure
  rel(M.Section, 'class', M.Class, 'restrict'),
  rel(M.Section, 'academicYear', M.AcademicYear, 'restrict'),
  rel(M.Section, 'classTeacher', M.Teacher, 'restrict'),
  rel(M.Section, 'subjectAssignments.subject', M.Subject, 'restrict'),
  rel(M.Section, 'subjectAssignments.teacher', M.Teacher, 'restrict'),
  rel(M.Enrollment, 'student', M.Student, 'restrict'),
  rel(M.Enrollment, 'academicYear', M.AcademicYear, 'restrict'),
  rel(M.Enrollment, 'section', M.Section, 'restrict'),

  // Attendance
  rel(M.Attendance, 'student', M.Student, 'restrict'),
  rel(M.Attendance, 'section', M.Section, 'restrict'),
  rel(M.Attendance, 'markedBy', M.User),

  // Exams
  rel(M.Exam, 'academicYear', M.AcademicYear, 'restrict'),
  rel(M.Exam, 'schedule.class', M.Class, 'restrict'),
  rel(M.Exam, 'schedule.subject', M.Subject, 'restrict'),
  rel(M.Mark, 'exam', M.Exam, 'restrict'),
  rel(M.Mark, 'subject', M.Subject, 'restrict'),
  rel(M.Mark, 'student', M.Student, 'restrict'),
  rel(M.Mark, 'enteredBy', M.User),
  rel(M.Result, 'exam', M.Exam, 'restrict'),
  rel(M.Result, 'student', M.Student, 'restrict'),
  rel(M.Result, 'section', M.Section, 'restrict'),

  // Assignments
  rel(M.Assignment, 'section', M.Section, 'restrict'),
  rel(M.Assignment, 'subject', M.Subject, 'restrict'),
  rel(M.Assignment, 'teacher', M.Teacher, 'restrict'),
  rel(M.Assignment, 'attachments', M.Document, 'restrict'),
  rel(M.AssignmentSubmission, 'assignment', M.Assignment, 'restrict'),
  rel(M.AssignmentSubmission, 'student', M.Student, 'restrict'),
  rel(M.AssignmentSubmission, 'attachments', M.Document, 'restrict'),
  rel(M.AssignmentSubmission, 'gradedBy', M.User),

  // Finance. Fees and payments are never deleted, so nothing restricts on them.
  rel(M.Fee, 'student', M.Student, 'restrict'),
  rel(M.Fee, 'academicYear', M.AcademicYear, 'restrict'),
  rel(M.Fee, 'createdBy', M.User),
  rel(M.Payment, 'student', M.Student, 'restrict'),
  rel(M.Payment, 'allocations.fee', M.Fee),
  rel(M.Payment, 'receivedBy', M.User),
  rel(M.Expense, 'receipts', M.Document, 'restrict'),
  rel(M.Expense, 'recordedBy', M.User),
  rel(M.Expense, 'approvedBy', M.User),
  rel(M.Salary, 'staff', M.Staff, 'restrict'),
  rel(M.Salary, 'approvedBy', M.User),
  rel(M.Salary, 'processedBy', M.User),

  // HR
  rel(M.Leave, 'staff', M.Staff, 'restrict'),
  rel(M.Leave, 'reviewedBy', M.User),
  rel(M.Leave, 'attachments', M.Document, 'restrict'),

  // Library
  rel(M.Book, 'coverImage', M.Document, 'restrict'),
  rel(M.BookIssue, 'book', M.Book, 'restrict'),
  rel(M.BookIssue, 'student', M.Student, 'restrict'),
  rel(M.BookIssue, 'staff', M.Staff, 'restrict'),
  rel(M.BookIssue, 'issuedBy', M.User),
  rel(M.BookIssue, 'receivedBy', M.User),

  // Communication. Audience targets that disappear simply match nobody, so they do not block deletion.
  rel(M.Notice, 'audience.roles', M.Role),
  rel(M.Notice, 'audience.classes', M.Class),
  rel(M.Notice, 'audience.sections', M.Section),
  rel(M.Notice, 'attachments', M.Document, 'restrict'),
  rel(M.Notice, 'author', M.User),
  rel(M.Event, 'audience.roles', M.Role),
  rel(M.Event, 'audience.classes', M.Class),
  rel(M.Event, 'audience.sections', M.Section),
  rel(M.Event, 'organizer', M.User),
  rel(M.Message, 'sender', M.User),
  rel(M.Message, 'recipients.user', M.User),
  rel(M.Message, 'parent', M.Message),
  rel(M.Message, 'attachments', M.Document, 'restrict'),
  rel(M.Notification, 'user', M.User),

  // System
  rel(M.Document, 'uploadedBy', M.User),
  rel(M.AuditLog, 'actor', M.User),
  rel(M.Setting, 'updatedBy', M.User),
];

const IRREGULAR_PLURALS: Partial<Record<ModelName, string>> = {
  Staff: 'staff records',
  Class: 'classes',
};

/** "AssignmentSubmission" -> "assignment submissions"; used in "still used by ..." messages. */
function describeReferrers(model: ModelName): string {
  return IRREGULAR_PLURALS[model] ?? `${model.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()}s`;
}

let registered = false;

/** Feeds the `restrict` relationships to the soft-delete guard. Safe to call more than once. */
export function registerRestrictions(): void {
  if (registered) return;
  registered = true;
  for (const relationship of RELATIONSHIPS) {
    if (relationship.onDelete === 'restrict') {
      registerRestriction(relationship.to, {
        referrer: relationship.from,
        path: relationship.path,
        label: describeReferrers(relationship.from),
      });
    }
  }
}
