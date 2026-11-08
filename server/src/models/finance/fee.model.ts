import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, money, optionalRef, requiredDateOnly, requiredPositiveMoney, requiredRef, type Persisted } from '../../database/schema-helpers';

export const FEE_CATEGORIES = ['tuition', 'admission', 'exam', 'transport', 'library', 'activity', 'uniform', 'late-fee', 'other'] as const;
export const FEE_STATUSES = ['unpaid', 'partial', 'paid', 'waived', 'cancelled'] as const;

/**
 * An amount a student owes (one charge). Amounts are integers in minor currency units.
 *
 * `paidAmount` is the sum of the payment allocations against this fee. It is stored on purpose, as a counter kept in step
 * inside the same transaction that records a payment (see withTransaction), because "who still owes money" is the most
 * common finance query and must not need a join. It can always be rebuilt from `payments.allocations`.
 * Money records are never deleted: a mistaken charge is `cancelled`, a forgiven one `waived`.
 */
const feeSchema = new Schema(
  {
    student: requiredRef(MODELS.Student),
    academicYear: requiredRef(MODELS.AcademicYear),
    category: { type: String, enum: FEE_CATEGORIES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 500 },
    amount: requiredPositiveMoney,
    discount: money,
    paidAmount: money,
    dueDate: requiredDateOnly,
    status: { type: String, enum: FEE_STATUSES, default: 'unpaid' },
    waivedReason: { type: String, trim: true, maxlength: 300 },
    /** Idempotency key for bulk generation, e.g. "tuition:2026-11". Prevents billing the same charge twice. */
    generationKey: { type: String, trim: true, maxlength: 100 },
    createdBy: optionalRef(MODELS.User, false),
  },
  baseSchemaOptions('fees'),
);

feeSchema.virtual('balance').get(function () {
  return this.amount - this.discount - this.paidAmount;
});

feeSchema.pre('validate', function () {
  if (this.discount > this.amount) this.invalidate('discount', 'discount cannot exceed amount');
  if (this.paidAmount > this.amount - this.discount) this.invalidate('paidAmount', 'paidAmount cannot exceed the amount due');
  if (this.status === 'waived' && !this.waivedReason) this.invalidate('waivedReason', 'A reason is required to waive a fee');
});

feeSchema.index({ student: 1, academicYear: 1, status: 1 }); // a student's fee statement
feeSchema.index({ status: 1, dueDate: 1 }); // outstanding and overdue lists
feeSchema.index({ academicYear: 1, category: 1 }); // collection reports
feeSchema.index({ student: 1, generationKey: 1 }, { unique: true, partialFilterExpression: { generationKey: { $type: 'string' } } });

applyStandardPlugins(feeSchema);

export type Fee = Persisted<InferSchemaType<typeof feeSchema>>;
export const FeeModel = model(MODELS.Fee, feeSchema);
