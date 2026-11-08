# Database architecture

MongoDB through Mongoose. 32 collections: the 30 requested plus two that integrity requires (`enrollments`, `assignmentSubmissions`, explained below). Models are in `server/src/models/<domain>/`, shared machinery in `server/src/database/`.

## Verification status

Authored without network access, so MongoDB and Mongoose could not be installed or run. Nothing here has touched a database.

| Check | Status |
| --- | --- |
| Syntax of all 174 TypeScript files; imports resolve; no unused locals or undefined names | Passed |
| Relationship registry matches the `ref` declarations in the model sources (scanned from the source text) | Passed |
| Executed for real (they do not need Mongoose): the permission catalogue (117 keys, no malformed or duplicate keys), every role's grant patterns, and all six settings schemas with their defaults and rejection rules | Passed |
| Full type-check against Mongoose's types | **Not run** |
| The 51 new model, index, relationship and seed tests (`npm test`) | **Not run** |
| Index creation, seeding, soft-delete hooks, transactions against a real server | **Not run** |

The tests were written to run **without** a database (they validate schemas, index definitions and hooks in memory), so `npm install && npm test` is the first check to run. Items most worth watching on first run: the Mongoose typing of `pre('validate')` hooks, `Model.diffIndexes()` (used by `db:indexes`), and the audit-log immutability test.

## Design decisions

**1. A login account is separate from the person.** `users` holds credentials and access only (email, password hash, roles, status). Names, phone, address and personal details live once, on the profile (`students`, `parents`, `staff`). The link points one way, `profile.user`, and `users.kind` says which collection to look in. Many young students and some parents never log in, so they have a profile and no user. Every administrator is a `staff` record too.

**2. Teachers are staff.** `staff` holds everything HR needs about every employee. `teachers` adds teaching-specific data and points at its staff record. So payroll (`salaries`) and `leaves` reference only `staff`, with no polymorphic references.

**3. "Current class" is a lookup, not a field.** A student's class lives in `enrollments` (student, academic year, section). History is kept and nothing needs syncing at promotion. `classes` are grade levels that do not change yearly; `sections` are the yearly groups ("Grade 6 / A / 2026-27").

**4. Money is integer minor units** (cents, paisa). Decimal money in floating point drifts; integers add and compare exactly. Currency and its decimal places come from the `locale.settings` setting. Every money field rejects fractions.

**5. Dates.** Calendar days (attendance, due dates, birthdays) are normalised to 00:00 UTC by a setter so equality, uniqueness and range queries behave. Moments (payment time, message time) are plain timestamps. The school's time zone is a setting, used only for display and for deciding which calendar day "now" is.

**6. Soft delete only where undoing makes sense.**

| Soft-deleted (`isDeleted`, `deletedAt`, `deletedBy`) | Permanent, changed by status |
| --- | --- |
| users, roles, students, parents, staff, teachers, academicYears, classes, sections, subjects, exams, assignments, books, notices, events, documents | attendance, marks, results, enrollments, fees, payments, expenses, salaries, leaves, bookIssues, assignmentSubmissions (history and money: corrected or voided, never removed) |
| | messages, notifications (per-user state, TTL cleanup), auditLogs (append-only), permissions, settings |

Reading: every query on a soft-deletable model gets `isDeleted: false` added automatically. To see deleted rows, put `isDeleted` in the filter yourself (`{ isDeleted: true }` for a trash view). `isDeleted` is a boolean, not a nullable date, because MongoDB partial indexes support equality on it. That is what lets a deleted record's email or admission number be reused.

**7. Referential consistency without foreign keys.** Four layers, each with stated limits:

1. *Indexed ObjectId references* everywhere (listed below).
2. *Existence check on save.* References marked `refCheck` (the default) are verified when a document is created or when the reference changes. Soft-deleted targets count as missing. **Limit:** `insertMany`, `bulkWrite` and `updateOne` bypass it; for those call `assertReferencesExist()` once for the batch. Attendance, marks and results turn the per-row check off on purpose, because they are written a section at a time and the service verifies the roster once.
3. *Delete protection.* A soft-delete is refused (HTTP 409 with the blockers listed) while live records still reference the target. Rules are the `restrict` rows below. This is why a student with attendance cannot be deleted (archive them with `status` instead), and a class with sections cannot.
4. *Transactions* for multi-document rules, via `withTransaction()` (payments update fee balances; loans update book availability).

Check-then-write is not atomic across processes, so layers 2 and 3 narrow the gap rather than seal it; the unique and partial indexes are the hard guarantees.

**8. Concurrency.** Every schema uses `optimisticConcurrency`: saving a document that changed since it was read fails with a version error instead of overwriting.

## Deliberate denormalization (everything stored twice, and why)

| Stored | Why it is kept | How it stays correct |
| --- | --- | --- |
| `enrollments.academicYear` (also implied by the section) | The only way a unique index can enforce "one enrollment per student per year" | Validation hook compares it with the section's year |
| `fees.paidAmount` | "Who still owes money" is the most common finance query; avoids joining payments | Updated in the same transaction as the payment; rebuildable from `payments.allocations` |
| `books.availableCopies` | Availability is read on every search result | Updated in the same transaction as the loan; rebuildable from open `bookIssues` |
| `results.*` (totals, grade, rank) and `results.section` | Ranking and report cards read them constantly; a published result must not change when the grading scale is edited later | Recomputable from `marks`; `isPublished` freezes it |
| `salaries.net` | Payroll reports and bank files read it; payslips are frozen snapshots | Computed from the components on every save |
| `payments.student` (also on each fee) | A payment needs a payer for receipts and history without opening every allocation | Service checks all allocated fees belong to that student |

Considered and **rejected**: names copied onto attendance/marks/fees "for display" (populate or look up instead), a class list copied onto exams (derived from `schedule.class`), a children list on parents (derived from `students.guardians`), and a "current class" on students.

Embedded rather than referenced, because they are small, bounded and always read with their parent: guardians on a student (max 6), subject assignments on a section (max 30), an exam's paper schedule, payment allocations, salary lines, message recipients (max 100), qualifications, record documents.

## Beyond the requested list

- `enrollments`: see decision 3. Without it there is nowhere correct to put "which section is this student in this year".
- `assignmentSubmissions`: submissions grow with the class and are written by students while teachers grade; embedding them in the assignment would make one hot, unbounded document.

Deferred on purpose (add when their feature is built): `feeStructures` (templates for bulk billing; today `fees.generationKey` makes bulk generation idempotent), `timetables`, staff attendance, and login `sessions` / refresh tokens (authentication phase; a collection with a TTL index, hashed tokens).

## Collections

| Collection | Purpose | Soft delete | Unique (among live docs where soft-deleted) | Other indexes |
| --- | --- | --- | --- | --- |
| `users` | Login accounts | yes | email | kind+status, roles |
| `roles` | Named bundles of permissions | yes | key, name | permissions |
| `permissions` | Catalogue of capabilities (seeded) | no | key | group+key |
| `students` | Student profiles | yes | admissionNumber, user | status+lastName+firstName, guardians.parent, text search |
| `parents` | Parent / guardian profiles | yes | user | lastName+firstName, phone, text search |
| `staff` | Every employee | yes | employeeId, user | status+department+lastName, text search |
| `teachers` | Teaching profile of a staff member | yes | staff | subjects |
| `academicYears` | School years | yes | name; one `isCurrent` | startDate |
| `classes` | Grade levels | yes | name, code | level |
| `sections` | Class group in a year, with subject/teacher list | yes | academicYear+class+name | classTeacher, subjectAssignments.teacher |
| `subjects` | Subject catalogue | yes | code, name | type+name |
| `enrollments` | Student in a section for a year | no | student+academicYear; section+rollNumber (active) | academicYear+section+status |
| `attendance` | One row per student per day | no | student+date | section+date+status, date+status |
| `exams` | Exams and their paper schedule | yes | academicYear+name | academicYear+startDate, status+startDate, schedule.class |
| `marks` | Score per student per paper | no | exam+subject+student | student+exam |
| `results` | Computed outcome per student per exam | no | exam+student | exam+section+rank, exam+status, student+exam |
| `assignments` | Homework set by a teacher | yes | none | section+status+dueDate, teacher+status+dueDate |
| `assignmentSubmissions` | Student work and grading | no | assignment+student | student+submittedAt |
| `fees` | Charges owed by students | no | student+generationKey (when set) | student+academicYear+status, status+dueDate, academicYear+category |
| `payments` | Money received, with allocations | no | receiptNumber; transactionRef (when set) | student+paidAt, paidAt, status+paidAt, allocations.fee |
| `expenses` | Non-salary spending | no | none | expenseDate, category+expenseDate, status+expenseDate |
| `salaries` | Monthly payslips | no | staff+year+month | year+month+status |
| `leaves` | Staff leave requests | no | none | staff+startDate, status+startDate, startDate+endDate |
| `books` | Library catalogue | yes | isbn (when set) | category+title, text search |
| `bookIssues` | Book loans | no | one open loan per book per borrower | book+status, student/staff+status+dueDate, dueDate (open loans) |
| `notices` | Announcements | yes | none | status+isPinned+publishAt, audience.roles/classes/sections, text search |
| `events` | Calendar entries | yes | none | startsAt+endsAt, type+startsAt |
| `messages` | Direct messages | no | none | recipients.user+createdAt, sender+createdAt, thread+createdAt |
| `notifications` | In-app alerts (auto-expire) | no | none | user+readAt+createdAt, TTL on expiresAt (90 days) |
| `documents` | File metadata (bytes live in object storage) | yes | storage provider+bucket+key | uploadedBy+createdAt, category+createdAt, checksum, pending scans |
| `auditLogs` | Append-only history of changes | n/a | none | entity+createdAt, actor+createdAt, action+createdAt, createdAt |
| `settings` | One document per configuration key | no | key | none |

Sensitive fields are `select: false` and must be requested explicitly: `users.passwordHash`, `students.medical`, `parents.nationalId`, `staff.nationalId`, `staff.baseSalary`. Audit snapshots are passed through `redactAuditPayload()` before they are stored.

## Relationships

Every ObjectId reference, generated from `server/src/database/relationships.ts`. A test fails if this list and the schemas ever disagree. `restrict` means the target cannot be soft-deleted while live records still point at it; `none` means no protection (actor references, loose links, and targets that are never deleted). The `deletedBy` field on soft-deletable collections (always a user) is omitted.

| From | Field | Points to | On delete |
| --- | --- | --- | --- |
| User | `roles` | Role | restrict |
| Role | `permissions` | Permission | none |
| Student | `user` | User | none |
| Student | `guardians.parent` | Parent | restrict |
| Student | `photo` | Document | restrict |
| Student | `documents.document` | Document | restrict |
| Parent | `user` | User | none |
| Parent | `photo` | Document | restrict |
| Teacher | `staff` | Staff | restrict |
| Teacher | `subjects` | Subject | none |
| Staff | `user` | User | none |
| Staff | `photo` | Document | restrict |
| Staff | `documents.document` | Document | restrict |
| Section | `class` | Class | restrict |
| Section | `academicYear` | AcademicYear | restrict |
| Section | `classTeacher` | Teacher | restrict |
| Section | `subjectAssignments.subject` | Subject | restrict |
| Section | `subjectAssignments.teacher` | Teacher | restrict |
| Enrollment | `student` | Student | restrict |
| Enrollment | `academicYear` | AcademicYear | restrict |
| Enrollment | `section` | Section | restrict |
| Attendance | `student` | Student | restrict |
| Attendance | `section` | Section | restrict |
| Attendance | `markedBy` | User | none |
| Exam | `academicYear` | AcademicYear | restrict |
| Exam | `schedule.class` | Class | restrict |
| Exam | `schedule.subject` | Subject | restrict |
| Mark | `exam` | Exam | restrict |
| Mark | `subject` | Subject | restrict |
| Mark | `student` | Student | restrict |
| Mark | `enteredBy` | User | none |
| Result | `exam` | Exam | restrict |
| Result | `student` | Student | restrict |
| Result | `section` | Section | restrict |
| Assignment | `section` | Section | restrict |
| Assignment | `subject` | Subject | restrict |
| Assignment | `teacher` | Teacher | restrict |
| Assignment | `attachments` | Document | restrict |
| AssignmentSubmission | `assignment` | Assignment | restrict |
| AssignmentSubmission | `student` | Student | restrict |
| AssignmentSubmission | `attachments` | Document | restrict |
| AssignmentSubmission | `gradedBy` | User | none |
| Fee | `student` | Student | restrict |
| Fee | `academicYear` | AcademicYear | restrict |
| Fee | `createdBy` | User | none |
| Payment | `student` | Student | restrict |
| Payment | `allocations.fee` | Fee | none |
| Payment | `receivedBy` | User | none |
| Expense | `receipts` | Document | restrict |
| Expense | `recordedBy` | User | none |
| Expense | `approvedBy` | User | none |
| Salary | `staff` | Staff | restrict |
| Salary | `approvedBy` | User | none |
| Salary | `processedBy` | User | none |
| Leave | `staff` | Staff | restrict |
| Leave | `reviewedBy` | User | none |
| Leave | `attachments` | Document | restrict |
| Book | `coverImage` | Document | restrict |
| BookIssue | `book` | Book | restrict |
| BookIssue | `student` | Student | restrict |
| BookIssue | `staff` | Staff | restrict |
| BookIssue | `issuedBy` | User | none |
| BookIssue | `receivedBy` | User | none |
| Notice | `audience.roles` | Role | none |
| Notice | `audience.classes` | Class | none |
| Notice | `audience.sections` | Section | none |
| Notice | `attachments` | Document | restrict |
| Notice | `author` | User | none |
| Event | `audience.roles` | Role | none |
| Event | `audience.classes` | Class | none |
| Event | `audience.sections` | Section | none |
| Event | `organizer` | User | none |
| Message | `sender` | User | none |
| Message | `recipients.user` | User | none |
| Message | `parent` | Message | none |
| Message | `attachments` | Document | restrict |
| Notification | `user` | User | none |
| Document | `uploadedBy` | User | none |
| AuditLog | `actor` | User | none |
| Setting | `updatedBy` | User | none |

### Overview

```mermaid
erDiagram
    USER ||--o| STAFF : "profile.user"
    USER ||--o| STUDENT : "profile.user"
    USER ||--o| PARENT : "profile.user"
    USER }o--o{ ROLE : roles
    ROLE }o--o{ PERMISSION : permissions
    STAFF ||--o| TEACHER : staff
    STUDENT }o--o{ PARENT : "guardians (embedded)"
    ACADEMIC_YEAR ||--o{ SECTION : has
    CLASS ||--o{ SECTION : has
    SECTION }o--o{ SUBJECT : "subjectAssignments (embedded, with TEACHER)"
    STUDENT ||--o{ ENROLLMENT : has
    SECTION ||--o{ ENROLLMENT : has
    ACADEMIC_YEAR ||--o{ ENROLLMENT : has
    STUDENT ||--o{ ATTENDANCE : has
    SECTION ||--o{ ATTENDANCE : has
    ACADEMIC_YEAR ||--o{ EXAM : has
    EXAM ||--o{ MARK : has
    STUDENT ||--o{ MARK : has
    SUBJECT ||--o{ MARK : has
    EXAM ||--o{ RESULT : has
    STUDENT ||--o{ RESULT : has
    SECTION ||--o{ ASSIGNMENT : has
    ASSIGNMENT ||--o{ ASSIGNMENT_SUBMISSION : has
    STUDENT ||--o{ ASSIGNMENT_SUBMISSION : has
    STUDENT ||--o{ FEE : owes
    ACADEMIC_YEAR ||--o{ FEE : has
    STUDENT ||--o{ PAYMENT : makes
    PAYMENT }o--o{ FEE : "allocations (embedded)"
    STAFF ||--o{ SALARY : paid
    STAFF ||--o{ LEAVE : requests
    BOOK ||--o{ BOOK_ISSUE : lent
    STUDENT |o--o{ BOOK_ISSUE : borrows
    STAFF |o--o{ BOOK_ISSUE : borrows
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ MESSAGE : sends
    DOCUMENT }o--o{ STUDENT : "photo, documents"
```

## Querying well

**Index rules used here.** Equality fields first, then sort fields, then range fields (so one index serves filter, order and paging). Indexes on soft-deletable collections are partial (`isDeleted: false`): smaller, and used because the plugin adds that condition to every query. Unique indexes that must ignore documents without the field (an optional email, ISBN or transaction reference) add `{ field: { $type: ... } }` to the same partial filter.

| Need | Served by |
| --- | --- |
| Log in by email | `users` unique `email` |
| Student list, filtered by status, sorted by name | `students` status+lastName+firstName |
| Search students by name or admission number | `students` text index (whole words, not partial prefixes; use Atlas Search later for type-ahead) |
| Children of a parent | `students` guardians.parent |
| Roster of a section for a year | `enrollments` academicYear+section+status |
| Roll call for a section on a date, and attendance percentages | `attendance` section+date+status |
| One student's attendance history | `attendance` student+date (read backwards for newest first) |
| Marks entry sheet for one paper | `marks` exam+subject+student (prefix) |
| A student's report card | `marks` student+exam, `results` student+exam |
| Merit list for a section | `results` exam+section+rank |
| Who still owes, who is overdue | `fees` status+dueDate |
| A student's fee statement and payment history | `fees` student+academicYear+status, `payments` student+paidAt |
| Overdue library loans | `bookIssues` dueDate (open loans only) |
| Notice board | `notices` status+isPinned+publishAt |
| Calendar range | `events` startsAt+endsAt |
| Inbox, unread alerts | `messages` recipients.user+createdAt, `notifications` user+readAt+createdAt |
| History of one record | `auditLogs` entity.model+entity.id+createdAt |

**Pagination.** Two helpers in `database/paginate.ts`, both returning plain lean objects and capped at 100 per page:

```ts
// Admin tables: page numbers and a total. Cost grows with the page number.
const { items, meta } = await paginate(StudentModel, { status: 'active' }, {
  page: 3, limit: 25, sort: { lastName: 1, firstName: 1 }, select: 'admissionNumber firstName lastName',
});

// Feeds, logs, notifications: constant cost per page, no total.
const page = await paginateByCursor(NotificationModel, { user: userId, readAt: { $exists: false } }, {
  limit: 20, cursor: req.query.cursor, sortField: 'createdAt', valueType: 'date',
});
// page.items, page.nextCursor (pass back as ?cursor=), page.hasMore
```

`paginate` always adds `_id` as a tie-breaker so rows never repeat or vanish between pages. `meta` is the shape `buildPaginationMeta` and the frontend's `paginationMetaSchema` already use. The `sortField` for cursors must be indexed together with `_id`.

**Other habits.** Read with `.lean()` and `select` only what the screen shows. Request sensitive fields explicitly. Use `explain('executionStats')` on any new list query and check it is not scanning the collection. Keep arrays bounded (every embedded array above has a cap).

**Recording a payment** (illustrative pattern for the finance phase; two documents change, so it is one transaction, and each fee is only updated if the payment fits what is still owed):

```ts
await withTransaction(async (session) => {
  const [payment] = await PaymentModel.create([{ student, amount, method, receiptNumber, allocations, receivedBy }], { session });
  for (const { fee, amount: part } of allocations) {
    const updated = await FeeModel.findOneAndUpdate(
      { _id: fee, student, status: { $in: ['unpaid', 'partial'] },
        $expr: { $lte: [{ $add: ['$paidAmount', part] }, { $subtract: ['$amount', '$discount'] }] } },
      [
        { $set: { paidAmount: { $add: ['$paidAmount', part] } } },
        { $set: { status: { $cond: [{ $eq: ['$paidAmount', { $subtract: ['$amount', '$discount'] }] }, 'paid', 'partial'] } } },
      ],
      { session, new: true },
    );
    if (!updated) throw AppError.conflict('A fee no longer accepts this payment');
  }
  return payment;
});
```

## Settings

One document per key, each validated against its own schema (`models/system/setting.registry.ts`), so unknown keys and malformed values are rejected. Seeded keys: `school.profile`, `locale.settings` (time zone, locale, currency, minor units, week), `academic.grading` (grade bands, pass mark), `attendance.rules`, `fees.settings`, `library.rules`. `isPublic` keys may be shown before login. After editing a setting's `value` in place call `doc.markModified('value')`.

## Seeding and indexes

```bash
npm run db:seed             # permissions, system roles, default settings. Idempotent; creates no users or school data
npm run db:indexes          # shows index changes needed; changes nothing
npm run db:indexes:apply    # creates missing indexes and drops ones the schemas no longer declare
```

Development builds indexes automatically (`autoIndex`). Production does not, so a deploy never starts surprise index builds: run `db:indexes` to review and `db:indexes:apply` deliberately (building on a large collection takes time). After `npm run build`, the same scripts run as `node server/dist/database/scripts/seed.js`.

Seed behaviour worth knowing: `super_admin` and `admin` are re-synced to "all permissions (minus a few for admin)" on every run, so new permissions reach them automatically. The other system roles (teacher, student, parent, accountant, librarian) get their permissions once and keep any edits made later. Permissions are capabilities; "only my own children" or "only my class" is an ownership rule applied in the API next to the permission check, not another key.

The local database now runs as a single-node **replica set** (`docker-compose.yml`), because transactions require one. Atlas always is one. The connection string uses `directConnection=true` for the local container only.

## Scale notes

Expected steady growth for a 1,500-student school: attendance about 300,000 rows a year, marks about 100,000, audit logs the fastest growing. Everything above is indexed for those sizes. When volume demands it: archive attendance and audit logs older than a retention window into cold storage (both are append-mostly and queried by date); shard on `student` for attendance and marks, `entity.model+entity.id` or `createdAt` buckets for audit logs. Neither is needed at launch.

## Not covered by this phase

Authentication and refresh tokens, the audit-writing service, the REST endpoints for each collection, permission checks, and per-field encryption (national IDs and medical notes are hidden by default but stored in plain text; add field-level or storage encryption before storing real data).
