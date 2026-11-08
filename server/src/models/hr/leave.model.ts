import { model, Schema, type InferSchemaType } from 'mongoose';
import { LIMITS, MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, endNotBeforeStart, maxItems, noDuplicateIds, optionalRef, requiredDateOnly, requiredRef, type Persisted } from '../../database/schema-helpers';

export const LEAVE_TYPES = ['casual', 'sick', 'annual', 'maternity', 'paternity', 'unpaid', 'other'] as const;
export const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const;

/**
 * A staff leave request. The number of days is derived from the dates (and the weekend/holiday calendar), so it is
 * not stored. Never deleted: a withdrawn request is `cancelled`. Overlapping approved leave is checked by the service.
 */
const leaveSchema = new Schema(
  {
    staff: requiredRef(MODELS.Staff),
    type: { type: String, enum: LEAVE_TYPES, required: true },
    startDate: requiredDateOnly,
    endDate: requiredDateOnly,
    reason: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: LEAVE_STATUSES, default: 'pending' },
    reviewedBy: optionalRef(MODELS.User, false),
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true, maxlength: 500 },
    attachments: { type: [optionalRef(MODELS.Document)], validate: [maxItems(LIMITS.maxAttachments), noDuplicateIds] },
  },
  baseSchemaOptions('leaves'),
);

endNotBeforeStart(leaveSchema, 'startDate', 'endDate', 'endDate cannot be before startDate');

leaveSchema.index({ staff: 1, startDate: -1 }); // a person's leave history
leaveSchema.index({ status: 1, startDate: 1 }); // approval queue
leaveSchema.index({ startDate: 1, endDate: 1 }); // "who is away on this date"

applyStandardPlugins(leaveSchema);

export type Leave = Persisted<InferSchemaType<typeof leaveSchema>>;
export const LeaveModel = model(MODELS.Leave, leaveSchema);
