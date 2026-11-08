import { registerRestrictions } from '../database/relationships';

// Importing a model file registers it with Mongoose. All of them must be loaded before the first query,
// because populate() and the referential-integrity checks resolve models by name.
export * from './iam/permission.model';
export * from './iam/role.model';
export * from './iam/user.model';
export * from './people/parent.model';
export * from './people/staff.model';
export * from './people/student.model';
export * from './people/teacher.model';
export * from './academics/academicYear.model';
export * from './academics/class.model';
export * from './academics/subject.model';
export * from './academics/section.model';
export * from './academics/enrollment.model';
export * from './academics/attendance.model';
export * from './academics/exam.model';
export * from './academics/mark.model';
export * from './academics/result.model';
export * from './academics/assignment.model';
export * from './academics/assignmentSubmission.model';
export * from './finance/fee.model';
export * from './finance/payment.model';
export * from './finance/expense.model';
export * from './finance/salary.model';
export * from './hr/leave.model';
export * from './library/book.model';
export * from './library/bookIssue.model';
export * from './communication/notice.model';
export * from './communication/event.model';
export * from './communication/message.model';
export * from './communication/notification.model';
export * from './system/document.model';
export * from './system/auditLog.model';
export * from './system/setting.model';
export * from './system/setting.registry';

registerRestrictions();
