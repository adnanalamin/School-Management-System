import { model, Schema, type InferSchemaType, type MongooseQueryMiddleware } from 'mongoose';
import { MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, type Persisted } from '../../database/schema-helpers';

export const AUDIT_OUTCOMES = ['success', 'failure'] as const;

/** "student.create", "payment.void", "role.update": a module and a verb, lowercase. */
export const AUDIT_ACTION_PATTERN = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/;

const SENSITIVE_KEY = /pass(word)?|token|secret|hash|authorization|cookie|nationalid/i;

/** Removes secrets from a before/after snapshot before it is stored. Applied by the audit service, tested here. */
export function redactAuditPayload(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[truncated]';
  if (Array.isArray(value)) return value.map((item) => redactAuditPayload(item, depth + 1));
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactAuditPayload(entry, depth + 1)]),
    );
  }
  return value;
}

/**
 * Who did what to which record, and when. Append-only: the model refuses updates and deletes, so history cannot be
 * rewritten through it. The entity is a loose pointer (model name + id) because the record may be deleted later while
 * its history must remain. Rows are small; retention is handled by archiving, not by editing.
 */
const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: MODELS.User }, // absent for system actions; users are soft-deleted so this stays valid
    action: { type: String, required: true, trim: true, lowercase: true, maxlength: 100, match: [AUDIT_ACTION_PATTERN, '{PATH} must look like "module.action"'] },
    entity: {
      model: { type: String, enum: Object.values(MODELS), required: true },
      id: { type: Schema.Types.ObjectId, required: true },
    },
    summary: { type: String, trim: true, maxlength: 300 },
    changes: { before: { type: Schema.Types.Mixed }, after: { type: Schema.Types.Mixed } },
    outcome: { type: String, enum: AUDIT_OUTCOMES, default: 'success' },
    ip: { type: String, trim: true, maxlength: 64 },
    userAgent: { type: String, trim: true, maxlength: 512 },
    requestId: { type: String, trim: true, maxlength: 64 },
  },
  { ...baseSchemaOptions('auditLogs'), timestamps: { createdAt: true, updatedAt: false } },
);

const IMMUTABLE_QUERY_HOOKS: MongooseQueryMiddleware[] = [
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'findOneAndReplace',
  'replaceOne',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
];

const refuse = (): never => {
  throw new Error('Audit logs are append-only');
};

auditLogSchema.pre(IMMUTABLE_QUERY_HOOKS, refuse);
auditLogSchema.pre('save', function () {
  if (!this.isNew) refuse();
});
auditLogSchema.pre('deleteOne', { document: true, query: false }, refuse);
auditLogSchema.pre('updateOne', { document: true, query: false }, refuse);

auditLogSchema.index({ 'entity.model': 1, 'entity.id': 1, createdAt: -1 }); // history of one record
auditLogSchema.index({ actor: 1, createdAt: -1 }); // what a person did
auditLogSchema.index({ action: 1, createdAt: -1 }); // all payment voids, all logins...
auditLogSchema.index({ createdAt: -1 }); // the global feed

applyStandardPlugins(auditLogSchema);

export type AuditLog = Persisted<InferSchemaType<typeof auditLogSchema>>;
export const AuditLogModel = model(MODELS.AuditLog, auditLogSchema);
