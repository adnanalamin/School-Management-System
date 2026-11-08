import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, endNotBeforeStart, money, optionalRef, requiredRef, type Persisted } from '../../database/schema-helpers';

export const BOOK_ISSUE_STATUSES = ['issued', 'returned', 'lost'] as const;
export const FINE_STATUSES = ['none', 'due', 'paid', 'waived'] as const;

/**
 * One loan of one book to either a student or a staff member (exactly one of the two). Whether a loan is overdue is
 * `status === 'issued' && dueDate < now`, so it is not stored. A borrower cannot hold two copies of the same title
 * at once; that rule is a unique partial index, not application code.
 */
const bookIssueSchema = new Schema(
  {
    book: requiredRef(MODELS.Book),
    student: optionalRef(MODELS.Student),
    staff: optionalRef(MODELS.Staff),
    issuedOn: { type: Date, required: true, default: () => new Date() },
    dueDate: { type: Date, required: true },
    returnedOn: { type: Date },
    status: { type: String, enum: BOOK_ISSUE_STATUSES, default: 'issued' },
    renewals: { type: Number, min: 0, max: 5, default: 0, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } },
    fine: money,
    fineStatus: { type: String, enum: FINE_STATUSES, default: 'none' },
    issuedBy: requiredRef(MODELS.User, false),
    receivedBy: optionalRef(MODELS.User, false),
  },
  baseSchemaOptions('bookIssues'),
);

endNotBeforeStart(bookIssueSchema, 'issuedOn', 'dueDate', 'dueDate cannot be before issuedOn');
endNotBeforeStart(bookIssueSchema, 'issuedOn', 'returnedOn', 'returnedOn cannot be before issuedOn');

bookIssueSchema.pre('validate', function () {
  if (Boolean(this.student) === Boolean(this.staff)) {
    this.invalidate('student', 'Exactly one of student or staff must be given');
  }
  if (this.status === 'returned' && !this.returnedOn) this.invalidate('returnedOn', 'returnedOn is required for a returned book');
});

bookIssueSchema.index({ book: 1, status: 1 }); // current borrowers of a title
bookIssueSchema.index({ student: 1, status: 1, dueDate: 1 }, { partialFilterExpression: { student: { $type: 'objectId' } } });
bookIssueSchema.index({ staff: 1, status: 1, dueDate: 1 }, { partialFilterExpression: { staff: { $type: 'objectId' } } });
bookIssueSchema.index({ dueDate: 1 }, { partialFilterExpression: { status: 'issued' } }); // overdue scan only looks at open loans
bookIssueSchema.index({ book: 1, student: 1 }, { unique: true, partialFilterExpression: { status: 'issued', student: { $type: 'objectId' } } });
bookIssueSchema.index({ book: 1, staff: 1 }, { unique: true, partialFilterExpression: { status: 'issued', staff: { $type: 'objectId' } } });

applyStandardPlugins(bookIssueSchema);

export type BookIssue = Persisted<InferSchemaType<typeof bookIssueSchema>>;
export const BookIssueModel = model(MODELS.BookIssue, bookIssueSchema);
