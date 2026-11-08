import { model, Schema, type InferSchemaType } from 'mongoose';
import { LIMITS, MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, maxItems, noDuplicateIds, optionalRef, requiredRef, type Persisted } from '../../database/schema-helpers';

export const ASSIGNMENT_STATUSES = ['draft', 'published', 'closed'] as const;

/** Homework or coursework set by a teacher for one subject in one section. Student work is in `assignmentSubmissions`. */
const assignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: LIMITS.title },
    description: { type: String, trim: true, maxlength: LIMITS.longText },
    section: requiredRef(MODELS.Section),
    subject: requiredRef(MODELS.Subject),
    teacher: requiredRef(MODELS.Teacher),
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, min: 0 },
    allowLateSubmission: { type: Boolean, default: false },
    attachments: { type: [optionalRef(MODELS.Document)], validate: [maxItems(LIMITS.maxAttachments), noDuplicateIds] },
    status: { type: String, enum: ASSIGNMENT_STATUSES, default: 'draft' },
    publishedAt: { type: Date },
    ...softDeleteFields,
  },
  baseSchemaOptions('assignments'),
);

activeIndex(assignmentSchema, { section: 1, status: 1, dueDate: -1 }); // a class's homework list
activeIndex(assignmentSchema, { teacher: 1, status: 1, dueDate: -1 }); // a teacher's own assignments

applyStandardPlugins(assignmentSchema, { softDelete: true });

export type Assignment = Persisted<InferSchemaType<typeof assignmentSchema>>;
export const AssignmentModel = model(MODELS.Assignment, assignmentSchema);
