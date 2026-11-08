import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, requiredRef, type Persisted } from '../../database/schema-helpers';

export const NOTIFICATION_CATEGORIES = ['attendance', 'fees', 'exam', 'notice', 'event', 'message', 'system'] as const;
export const NOTIFICATION_SEVERITIES = ['info', 'success', 'warning', 'critical'] as const;

const RETENTION_DAYS = 90;

/**
 * An in-app alert for one user. The thing it is about is a loose pointer (model name + id), not a reference: the
 * notification outlives or ignores the target, and is cleaned up by the database itself. MongoDB's TTL index deletes
 * the row once `expiresAt` passes (default 90 days), so this collection cannot grow without bound.
 */
const notificationSchema = new Schema(
  {
    user: requiredRef(MODELS.User, false),
    category: { type: String, enum: NOTIFICATION_CATEGORIES, required: true },
    severity: { type: String, enum: NOTIFICATION_SEVERITIES, default: 'info' },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, trim: true, maxlength: 500 },
    target: {
      model: { type: String, enum: Object.values(MODELS) },
      id: { type: Schema.Types.ObjectId },
    },
    readAt: { type: Date },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + RETENTION_DAYS * 86_400_000) },
  },
  baseSchemaOptions('notifications'),
);

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 }); // unread first, newest first, per user
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL: delete when expiresAt passes

applyStandardPlugins(notificationSchema);

export type Notification = Persisted<InferSchemaType<typeof notificationSchema>>;
export const NotificationModel = model(MODELS.Notification, notificationSchema);
