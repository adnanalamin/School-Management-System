import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, requiredRef, type Persisted } from '../../database/schema-helpers';

export const RESULT_STATUSES = ['pass', 'fail', 'withheld', 'absent'] as const;

/**
 * Computed outcome of an exam for one student. This is the one deliberately derived collection: totals, grade and
 * rank can always be recomputed from `marks` and the grading scale in settings, but are stored because ranking and
 * report cards read them constantly, and a published result must not change if the grading scale is edited later.
 * `section` records the group the student was ranked in (a snapshot; later promotion does not alter it).
 */
const resultSchema = new Schema(
  {
    exam: requiredRef(MODELS.Exam, false),
    student: requiredRef(MODELS.Student, false),
    section: requiredRef(MODELS.Section, false),
    totalObtained: { type: Number, required: true, min: 0 },
    totalMaximum: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, trim: true, maxlength: 4 },
    gradePoint: { type: Number, min: 0, max: 10 },
    rank: { type: Number, min: 1, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } },
    status: { type: String, enum: RESULT_STATUSES, required: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    computedAt: { type: Date, required: true, default: () => new Date() },
    remarks: { type: String, trim: true, maxlength: 300 },
  },
  baseSchemaOptions('results'),
);

resultSchema.pre('validate', function () {
  if (this.totalObtained > this.totalMaximum) this.invalidate('totalObtained', 'totalObtained cannot exceed totalMaximum');
  if (this.isPublished && !this.publishedAt) this.publishedAt = new Date();
});

resultSchema.index({ exam: 1, student: 1 }, { unique: true });
resultSchema.index({ exam: 1, section: 1, rank: 1 }); // merit list
resultSchema.index({ exam: 1, status: 1 }); // pass/fail counts
resultSchema.index({ student: 1, exam: 1 }); // a student's result history

applyStandardPlugins(resultSchema);

export type Result = Persisted<InferSchemaType<typeof resultSchema>>;
export const ResultModel = model(MODELS.Result, resultSchema);
