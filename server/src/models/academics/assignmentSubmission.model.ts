import { model, Schema, type InferSchemaType } from 'mongoose';
import { LIMITS, MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, maxItems, noDuplicateIds, optionalRef, requiredRef, type Persisted } from '../../database/schema-helpers';

export const SUBMISSION_STATUSES = ['submitted', 'late', 'graded', 'returned'] as const;

/**
 * A student's answer to an assignment, plus the teacher's grading. Kept apart from `assignments` because it grows
 * with the class and is written by different people at different times. Whether it is late is `submittedAt` against
 * the assignment's due date, recorded in `status` at submission time.
 */
const submissionSchema = new Schema(
  {
    assignment: requiredRef(MODELS.Assignment),
    student: requiredRef(MODELS.Student),
    submittedAt: { type: Date, required: true, default: () => new Date() },
    text: { type: String, trim: true, maxlength: 5000 },
    attachments: { type: [optionalRef(MODELS.Document)], validate: [maxItems(LIMITS.maxAttachments), noDuplicateIds] },
    status: { type: String, enum: SUBMISSION_STATUSES, default: 'submitted' },
    marks: { type: Number, min: 0 },
    feedback: { type: String, trim: true, maxlength: 2000 },
    gradedBy: optionalRef(MODELS.User, false),
    gradedAt: { type: Date },
  },
  baseSchemaOptions('assignmentSubmissions'),
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true }); // one submission per student; also the grading list
submissionSchema.index({ student: 1, submittedAt: -1 }); // a student's submission history

applyStandardPlugins(submissionSchema);

export type AssignmentSubmission = Persisted<InferSchemaType<typeof submissionSchema>>;
export const AssignmentSubmissionModel = model(MODELS.AssignmentSubmission, submissionSchema);
