import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, requiredRef, type Persisted } from '../../database/schema-helpers';

/**
 * A student's score in one paper. The maximum is on the exam's schedule entry and is not copied here;
 * the service checks `marksObtained <= maxMarks` when marks are entered. Entered in bulk, so references are
 * verified once per batch by the service. Corrections are audited updates; rows are never deleted.
 */
const markSchema = new Schema(
  {
    exam: requiredRef(MODELS.Exam, false),
    subject: requiredRef(MODELS.Subject, false),
    student: requiredRef(MODELS.Student, false),
    marksObtained: { type: Number, min: 0 },
    isAbsent: { type: Boolean, default: false },
    remarks: { type: String, trim: true, maxlength: 200 },
    enteredBy: requiredRef(MODELS.User, false),
  },
  baseSchemaOptions('marks'),
);

markSchema.pre('validate', function () {
  if (this.isAbsent && this.marksObtained !== undefined && this.marksObtained !== null) {
    this.invalidate('marksObtained', 'An absent student cannot have marks');
  }
  if (!this.isAbsent && (this.marksObtained === undefined || this.marksObtained === null)) {
    this.invalidate('marksObtained', 'marksObtained is required unless the student was absent');
  }
});

markSchema.index({ exam: 1, subject: 1, student: 1 }, { unique: true }); // also serves the mark-entry sheet for a paper
markSchema.index({ student: 1, exam: 1 }); // a student's marks for report cards

applyStandardPlugins(markSchema);

export type Mark = Persisted<InferSchemaType<typeof markSchema>>;
export const MarkModel = model(MODELS.Mark, markSchema);
