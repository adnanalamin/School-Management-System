import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, endNotBeforeStart, requiredDateOnly, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

export const ACADEMIC_YEAR_STATUSES = ['planned', 'active', 'closed'] as const;

/** A school year (or session). Sections, enrollments, exams and fees all hang off one. */
const academicYearSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 30 }, // e.g. "2026-2027"
    startDate: requiredDateOnly,
    endDate: requiredDateOnly,
    isCurrent: { type: Boolean, default: false },
    status: { type: String, enum: ACADEMIC_YEAR_STATUSES, default: 'planned' },
    ...softDeleteFields,
  },
  baseSchemaOptions('academicYears'),
);

endNotBeforeStart(academicYearSchema, 'startDate', 'endDate', 'endDate cannot be before startDate');

uniqueActiveIndex(academicYearSchema, { name: 1 });
// At most one current year. The partial filter makes the constraint apply only to documents where isCurrent is true.
uniqueActiveIndex(academicYearSchema, { isCurrent: 1 }, { isCurrent: true });
activeIndex(academicYearSchema, { startDate: -1 });

applyStandardPlugins(academicYearSchema, { softDelete: true });

export type AcademicYear = Persisted<InferSchemaType<typeof academicYearSchema>>;
export const AcademicYearModel = model(MODELS.AcademicYear, academicYearSchema);
