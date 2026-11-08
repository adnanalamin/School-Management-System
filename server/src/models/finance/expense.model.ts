import { model, Schema, type InferSchemaType } from 'mongoose';
import { LIMITS, MODELS, PAYMENT_METHODS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, maxItems, noDuplicateIds, optionalRef, requiredDateOnly, requiredPositiveMoney, requiredRef, type Persisted } from '../../database/schema-helpers';

export const EXPENSE_CATEGORIES = ['utilities', 'maintenance', 'supplies', 'transport', 'events', 'equipment', 'rent', 'other'] as const;
export const EXPENSE_STATUSES = ['pending', 'approved', 'rejected', 'paid', 'void'] as const;

/** Money the school spends, other than salaries (see `salaries`). Never deleted: a mistake is `void`. */
const expenseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: LIMITS.title },
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    amount: requiredPositiveMoney,
    expenseDate: requiredDateOnly,
    vendor: { type: String, trim: true, maxlength: 150 },
    method: { type: String, enum: PAYMENT_METHODS },
    reference: { type: String, trim: true, maxlength: 100 },
    receipts: { type: [optionalRef(MODELS.Document)], validate: [maxItems(LIMITS.maxAttachments), noDuplicateIds] },
    status: { type: String, enum: EXPENSE_STATUSES, default: 'pending' },
    recordedBy: requiredRef(MODELS.User, false),
    approvedBy: optionalRef(MODELS.User, false),
    approvedAt: { type: Date },
    note: { type: String, trim: true, maxlength: 500 },
  },
  baseSchemaOptions('expenses'),
);

expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ category: 1, expenseDate: -1 }); // spending by category
expenseSchema.index({ status: 1, expenseDate: -1 }); // approval queue

applyStandardPlugins(expenseSchema);

export type Expense = Persisted<InferSchemaType<typeof expenseSchema>>;
export const ExpenseModel = model(MODELS.Expense, expenseSchema);
