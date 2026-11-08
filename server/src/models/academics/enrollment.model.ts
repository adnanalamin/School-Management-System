import mongoose, { model, Schema, type InferSchemaType, type Types } from 'mongoose';
import { MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, dateOnly, endNotBeforeStart, requiredDateOnly, requiredRef, type Persisted } from '../../database/schema-helpers';

export const ENROLLMENT_STATUSES = ['active', 'promoted', 'repeated', 'transferred', 'withdrawn', 'graduated'] as const;

/**
 * Which section a student belongs to in an academic year. This is what makes "current class" a lookup instead
 * of a field to keep in sync, and keeps every past year's roster intact.
 *
 * `academicYear` repeats what the section already implies. It is kept deliberately: it is the only way for the
 * database to enforce "one enrollment per student per year" with a unique index. A hook verifies it matches the section.
 * Rows are never deleted; the outcome of a year is recorded in `status`.
 */
const enrollmentSchema = new Schema(
  {
    student: requiredRef(MODELS.Student),
    academicYear: requiredRef(MODELS.AcademicYear),
    section: requiredRef(MODELS.Section),
    rollNumber: { type: Number, min: 1, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } },
    status: { type: String, enum: ENROLLMENT_STATUSES, default: 'active' },
    enrolledOn: { ...requiredDateOnly, default: () => new Date() },
    endedOn: dateOnly,
  },
  baseSchemaOptions('enrollments'),
);

endNotBeforeStart(enrollmentSchema, 'enrolledOn', 'endedOn', 'endedOn cannot be before enrolledOn');

enrollmentSchema.pre('validate', async function () {
  if (!this.isNew && !this.isModified('section') && !this.isModified('academicYear')) return;

  const section = await mongoose
    .model(MODELS.Section)
    .findById(this.section)
    .select('academicYear')
    .session(this.$session() ?? null)
    .lean<{ academicYear: Types.ObjectId } | null>();

  if (section && String(section.academicYear) !== String(this.academicYear)) {
    this.invalidate('academicYear', 'academicYear must match the academic year of the section');
  }
});

enrollmentSchema.index({ student: 1, academicYear: 1 }, { unique: true }); // one enrollment per student per year
enrollmentSchema.index(
  { section: 1, rollNumber: 1 },
  { unique: true, partialFilterExpression: { status: 'active', rollNumber: { $type: 'number' } } }, // roll numbers are unique within a section
);
enrollmentSchema.index({ academicYear: 1, section: 1, status: 1 }); // class roster

applyStandardPlugins(enrollmentSchema);

export type Enrollment = Persisted<InferSchemaType<typeof enrollmentSchema>>;
export const EnrollmentModel = model(MODELS.Enrollment, enrollmentSchema);
