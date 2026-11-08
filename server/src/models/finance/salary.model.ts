import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS, PAYMENT_METHODS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, maxItems, optionalRef, requiredMoney, requiredRef, type Persisted } from '../../database/schema-helpers';

export const SALARY_STATUSES = ['draft', 'approved', 'paid', 'void'] as const;

const lineSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 80 },
    amount: requiredMoney,
  },
  { _id: false },
);

interface LineLike {
  amount: number;
}

const sum = (lines: LineLike[]) => lines.reduce((total, line) => total + line.amount, 0);

/**
 * One month's pay for one staff member: a payslip snapshot. The figures are frozen at the time it is issued, so raising
 * someone's base salary later does not rewrite history. `net` is calculated from the components on every save; it is
 * stored so payroll reports and bank files can read it without recomputing.
 */
const salarySchema = new Schema(
  {
    staff: requiredRef(MODELS.Staff),
    year: { type: Number, required: true, min: 2000, max: 2100, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } },
    month: { type: Number, required: true, min: 1, max: 12, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } },
    basic: requiredMoney,
    allowances: { type: [lineSchema], validate: maxItems(20) },
    deductions: { type: [lineSchema], validate: maxItems(20) },
    net: { type: Number, min: 0, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } },
    status: { type: String, enum: SALARY_STATUSES, default: 'draft' },
    paidOn: { type: Date },
    method: { type: String, enum: PAYMENT_METHODS },
    reference: { type: String, trim: true, maxlength: 100 },
    approvedBy: optionalRef(MODELS.User, false),
    processedBy: optionalRef(MODELS.User, false),
    note: { type: String, trim: true, maxlength: 500 },
  },
  baseSchemaOptions('salaries'),
);

salarySchema.pre('validate', function () {
  const net = this.basic + sum(this.allowances) - sum(this.deductions);
  if (net < 0) this.invalidate('deductions', 'Deductions cannot exceed basic pay plus allowances');
  this.net = net;
  if (this.status === 'paid' && !this.paidOn) this.invalidate('paidOn', 'paidOn is required once a salary is paid');
});

salarySchema.index({ staff: 1, year: 1, month: 1 }, { unique: true }); // one payslip per person per month; also a person's pay history
salarySchema.index({ year: 1, month: 1, status: 1 }); // monthly payroll run

applyStandardPlugins(salarySchema);

export type Salary = Persisted<InferSchemaType<typeof salarySchema>>;
export const SalaryModel = model(MODELS.Salary, salarySchema);
