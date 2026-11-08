import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, requiredDateOnly, requiredRef, type Persisted } from '../../database/schema-helpers';

export const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused', 'half-day'] as const;

/**
 * One row per student per day. A roll call writes a whole section at once, so `student` and `section` are not
 * existence-checked per row (`check: false`); the service verifies the roster once. Corrections are updates and
 * are recorded in the audit log, so rows are not soft-deleted.
 */
const attendanceSchema = new Schema(
  {
    student: requiredRef(MODELS.Student, false),
    section: requiredRef(MODELS.Section, false),
    date: requiredDateOnly,
    status: { type: String, enum: ATTENDANCE_STATUSES, required: true },
    markedBy: requiredRef(MODELS.User, false),
    note: { type: String, trim: true, maxlength: 200 },
  },
  baseSchemaOptions('attendance'),
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true }); // also serves a student's history, newest first
attendanceSchema.index({ section: 1, date: 1, status: 1 }); // roll call for a day, and per-section percentages
attendanceSchema.index({ date: 1, status: 1 }); // whole-school daily summary

applyStandardPlugins(attendanceSchema);

export type Attendance = Persisted<InferSchemaType<typeof attendanceSchema>>;
export const AttendanceModel = model(MODELS.Attendance, attendanceSchema);
