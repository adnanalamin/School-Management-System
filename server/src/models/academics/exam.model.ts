import { model, Schema, type InferSchemaType, type Types } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, endNotBeforeStart, requiredDateOnly, requiredRef, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

export const EXAM_TYPES = ['unit-test', 'mid-term', 'final', 'mock', 'practical', 'other'] as const;
export const EXAM_STATUSES = ['draft', 'scheduled', 'ongoing', 'completed', 'published'] as const;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const scheduleEntrySchema = new Schema(
  {
    class: requiredRef(MODELS.Class),
    subject: requiredRef(MODELS.Subject),
    date: requiredDateOnly,
    startTime: { type: String, required: true, match: [TIME_PATTERN, '{PATH} must be HH:mm'] },
    durationMinutes: { type: Number, required: true, min: 5, max: 480, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } },
    maxMarks: { type: Number, required: true, min: 1 },
    passMarks: { type: Number, required: true, min: 0 },
    room: { type: String, trim: true, maxlength: 50 },
  },
  { _id: false },
);

scheduleEntrySchema.pre('validate', function () {
  if (this.passMarks > this.maxMarks) this.invalidate('passMarks', 'passMarks cannot exceed maxMarks');
});

interface ScheduleEntryLike {
  class: Types.ObjectId;
  subject: Types.ObjectId;
  date?: Date;
}

/**
 * An examination and its timetable. `schedule` holds one entry per class and subject with that paper's maximum and
 * pass marks, so the limits live in one place and marks are validated against them. The classes taking an exam are the
 * distinct `schedule.class` values, not a second list.
 */
const examSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    academicYear: requiredRef(MODELS.AcademicYear),
    type: { type: String, enum: EXAM_TYPES, default: 'other' },
    startDate: requiredDateOnly,
    endDate: requiredDateOnly,
    status: { type: String, enum: EXAM_STATUSES, default: 'draft' },
    description: { type: String, trim: true, maxlength: 500 },
    schedule: {
      type: [scheduleEntrySchema],
      validate: [
        { validator: (entries: ScheduleEntryLike[]) => entries.length <= 500, message: 'schedule cannot have more than 500 entries' },
        { validator: (entries: ScheduleEntryLike[]) => new Set(entries.map((e) => `${String(e.class)}:${String(e.subject)}`)).size === entries.length, message: 'Each class and subject can appear in the schedule only once' },
      ],
    },
    ...softDeleteFields,
  },
  baseSchemaOptions('exams'),
);

endNotBeforeStart(examSchema, 'startDate', 'endDate', 'endDate cannot be before startDate');

examSchema.pre('validate', function () {
  const start = this.startDate;
  const end = this.endDate;
  if (!(start instanceof Date) || !(end instanceof Date)) return;
  this.schedule.forEach((entry, index) => {
    if (entry.date instanceof Date && (entry.date < start || entry.date > end)) {
      this.invalidate(`schedule.${index}.date`, 'Paper date must fall between the exam start and end dates');
    }
  });
});

uniqueActiveIndex(examSchema, { academicYear: 1, name: 1 });
activeIndex(examSchema, { academicYear: 1, startDate: -1 });
activeIndex(examSchema, { status: 1, startDate: -1 });
activeIndex(examSchema, { 'schedule.class': 1 }); // "exams for Grade 6"

applyStandardPlugins(examSchema, { softDelete: true });

export type Exam = Persisted<InferSchemaType<typeof examSchema>>;
export const ExamModel = model(MODELS.Exam, examSchema);
