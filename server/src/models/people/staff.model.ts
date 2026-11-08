import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, endNotBeforeStart, maxItems, money, optionalRef, personFields, phoneField, requiredDateOnly, dateOnly, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';
import { attachedDocumentSchema } from '../../database/subschemas';

export const STAFF_STATUSES = ['active', 'on-leave', 'resigned', 'terminated', 'retired'] as const;
export const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'intern'] as const;

/**
 * Everyone the school employs, teachers included. HR facts live here once; a teacher is a staff record plus a
 * `teachers` record for the teaching-specific details. Payroll (`salaries`) and `leaves` therefore only ever
 * reference `staff`.
 */
const staffSchema = new Schema(
  {
    user: optionalRef(MODELS.User),
    employeeId: { type: String, required: true, trim: true, uppercase: true, maxlength: 30 },
    ...personFields,
    nationalId: { type: String, trim: true, maxlength: 40, select: false }, // sensitive: opt in with .select('+nationalId')
    designation: { type: String, required: true, trim: true, maxlength: 100 },
    department: { type: String, trim: true, maxlength: 100 },
    employmentType: { type: String, enum: EMPLOYMENT_TYPES, default: 'full-time' },
    joiningDate: requiredDateOnly,
    leavingDate: dateOnly,
    status: { type: String, enum: STAFF_STATUSES, default: 'active' },
    baseSalary: { ...money, select: false }, // pay is HR-sensitive: opt in with .select('+baseSalary')
    emergencyContact: {
      name: { type: String, trim: true, maxlength: 100 },
      relation: { type: String, trim: true, maxlength: 50 },
      phone: phoneField,
    },
    photo: optionalRef(MODELS.Document),
    documents: { type: [attachedDocumentSchema], validate: maxItems(20) },
    ...softDeleteFields,
  },
  baseSchemaOptions('staff'),
);

endNotBeforeStart(staffSchema, 'joiningDate', 'leavingDate', 'leavingDate cannot be before joiningDate');

uniqueActiveIndex(staffSchema, { employeeId: 1 });
uniqueActiveIndex(staffSchema, { user: 1 }, { user: { $type: 'objectId' } });
activeIndex(staffSchema, { status: 1, department: 1, lastName: 1 }); // staff directory
activeIndex(
  staffSchema,
  { firstName: 'text', lastName: 'text', employeeId: 'text' },
  { name: 'staff_text', weights: { employeeId: 10, lastName: 5, firstName: 5 }, default_language: 'none' },
);

applyStandardPlugins(staffSchema, { softDelete: true });

export type Staff = Persisted<InferSchemaType<typeof staffSchema>>;
export const StaffModel = model(MODELS.Staff, staffSchema);
