import { model, Schema, type InferSchemaType } from 'mongoose';
import { LIMITS, MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, endNotBeforeStart, maxItems, noDuplicateIds, optionalRef, requiredRef, type Persisted } from '../../database/schema-helpers';
import { audienceSchema } from '../../database/subschemas';

export const NOTICE_STATUSES = ['draft', 'published', 'archived'] as const;

/** An announcement to a defined audience. Visible while published, started and not expired. */
const noticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: LIMITS.title },
    body: { type: String, required: true, trim: true, maxlength: LIMITS.longText },
    audience: { type: audienceSchema, required: true, default: () => ({ scope: 'all' }) },
    status: { type: String, enum: NOTICE_STATUSES, default: 'draft' },
    publishAt: { type: Date },
    expiresAt: { type: Date },
    isPinned: { type: Boolean, default: false },
    attachments: { type: [optionalRef(MODELS.Document)], validate: [maxItems(LIMITS.maxAttachments), noDuplicateIds] },
    author: requiredRef(MODELS.User, false),
    ...softDeleteFields,
  },
  baseSchemaOptions('notices'),
);

endNotBeforeStart(noticeSchema, 'publishAt', 'expiresAt', 'expiresAt cannot be before publishAt');

activeIndex(noticeSchema, { status: 1, isPinned: -1, publishAt: -1 }); // the notice board
activeIndex(noticeSchema, { 'audience.roles': 1 });
activeIndex(noticeSchema, { 'audience.classes': 1 });
activeIndex(noticeSchema, { 'audience.sections': 1 });
activeIndex(noticeSchema, { title: 'text', body: 'text' }, { name: 'notice_text', weights: { title: 10, body: 1 }, default_language: 'none' });

applyStandardPlugins(noticeSchema, { softDelete: true });

export type Notice = Persisted<InferSchemaType<typeof noticeSchema>>;
export const NoticeModel = model(MODELS.Notice, noticeSchema);
