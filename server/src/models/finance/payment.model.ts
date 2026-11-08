import { model, Schema, type InferSchemaType, type Types } from 'mongoose';
import { MODELS, PAYMENT_METHODS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, requiredPositiveMoney, requiredRef, type Persisted } from '../../database/schema-helpers';

export const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded', 'void'] as const;

const allocationSchema = new Schema(
  {
    fee: requiredRef(MODELS.Fee),
    amount: requiredPositiveMoney,
  },
  { _id: false },
);

interface AllocationLike {
  fee: Types.ObjectId;
  amount: number;
}

/**
 * Money received from (or on behalf of) a student. One payment can settle several fees; `allocations` says how it was
 * split and must add up to `amount`. Receipts are numbered and unique. A payment is never deleted: errors are
 * `void`, returned money `refunded`, and each change is audited.
 */
const paymentSchema = new Schema(
  {
    student: requiredRef(MODELS.Student),
    amount: requiredPositiveMoney,
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'completed' },
    paidAt: { type: Date, required: true, default: () => new Date() },
    receiptNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 40 },
    transactionRef: { type: String, trim: true, maxlength: 100 }, // gateway or bank reference
    allocations: {
      type: [allocationSchema],
      validate: [
        { validator: (items: AllocationLike[]) => items.length >= 1 && items.length <= 50, message: 'A payment needs between 1 and 50 allocations' },
        { validator: (items: AllocationLike[]) => new Set(items.map((i) => String(i.fee))).size === items.length, message: 'A fee can appear in a payment only once' },
      ],
    },
    receivedBy: requiredRef(MODELS.User, false),
    note: { type: String, trim: true, maxlength: 500 },
    voidReason: { type: String, trim: true, maxlength: 300 },
  },
  baseSchemaOptions('payments'),
);

paymentSchema.pre('validate', function () {
  const allocated = this.allocations.reduce((sum, item) => sum + item.amount, 0);
  if (this.allocations.length > 0 && allocated !== this.amount) {
    this.invalidate('allocations', `Allocations (${allocated}) must add up to the payment amount (${this.amount})`);
  }
  if ((this.status === 'void' || this.status === 'refunded') && !this.voidReason) {
    this.invalidate('voidReason', 'A reason is required to void or refund a payment');
  }
});

paymentSchema.index({ receiptNumber: 1 }, { unique: true });
paymentSchema.index({ transactionRef: 1 }, { unique: true, partialFilterExpression: { transactionRef: { $type: 'string' } } }); // a gateway reference is used once
paymentSchema.index({ student: 1, paidAt: -1 }); // a student's payment history
paymentSchema.index({ paidAt: -1 }); // daily collection
paymentSchema.index({ status: 1, paidAt: -1 });
paymentSchema.index({ 'allocations.fee': 1 }); // payments against a fee

applyStandardPlugins(paymentSchema);

export type Payment = Persisted<InferSchemaType<typeof paymentSchema>>;
export const PaymentModel = model(MODELS.Payment, paymentSchema);
