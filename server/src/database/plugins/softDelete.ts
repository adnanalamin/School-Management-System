import mongoose, { Schema, type ClientSession, type Model, type MongooseQueryMiddleware, type Query, type Types } from 'mongoose';
import { AppError, type ErrorDetail } from '../../utils/AppError';

/**
 * Soft delete = keep the document, hide it from normal queries.
 *
 * - Every query on a soft-deletable model gets `isDeleted: false` added automatically.
 * - To read deleted documents, put `isDeleted` in the filter yourself ({ isDeleted: true } for a trash view,
 *   { isDeleted: { $in: [true, false] } } for both). The plugin never overrides a filter that mentions it.
 * - `isDeleted` is a boolean (not a nullable date) because MongoDB partial indexes support equality on it,
 *   which is how unique constraints are scoped to live documents so a deleted value can be reused.
 */
export const softDeleteFields = {
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
} as const;

const QUERY_HOOKS: MongooseQueryMiddleware[] = [
  'find',
  'findOne',
  'findOneAndUpdate',
  'findOneAndDelete',
  'findOneAndReplace',
  'countDocuments',
  'distinct',
  'updateOne',
  'updateMany',
  'replaceOne',
  'deleteOne',
  'deleteMany',
];

/** Aggregation stages that MongoDB requires to be first in the pipeline. */
const MUST_BE_FIRST = new Set(['$geoNear', '$search', '$searchMeta', '$vectorSearch']);

function excludeDeleted(this: Query<unknown, unknown>): void {
  if (Object.prototype.hasOwnProperty.call(this.getFilter(), 'isDeleted')) return;
  this.where({ isDeleted: false });
}

export function softDeletePlugin(schema: Schema): void {
  schema.pre(QUERY_HOOKS, excludeDeleted);

  schema.pre('aggregate', function () {
    const pipeline = this.pipeline();
    if (JSON.stringify(pipeline).includes('"isDeleted"')) return;
    const firstStage = pipeline[0];
    const firstKey = firstStage ? Object.keys(firstStage)[0] : undefined;
    const position = firstKey !== undefined && MUST_BE_FIRST.has(firstKey) ? 1 : 0;
    pipeline.splice(position, 0, { $match: { isDeleted: false } });
  });
}

/* -------------------------------------------------------------------------- */
/* Delete protection ("restrict")                                             */
/* -------------------------------------------------------------------------- */

export interface RestrictRule {
  /** Model that holds the reference. */
  referrer: string;
  /** Path of the reference inside the referrer (dotted for subdocuments, e.g. "guardians.parent"). */
  path: string;
  /** Human-readable name of the referrers, used in the error message. */
  label: string;
}

const restrictions = new Map<string, RestrictRule[]>();

/** Declare that `target` must not be soft-deleted while live `referrer` documents still point at it. */
export function registerRestriction(target: string, rule: RestrictRule): void {
  const rules = restrictions.get(target) ?? [];
  rules.push(rule);
  restrictions.set(target, rules);
}

export function getRestrictions(target: string): readonly RestrictRule[] {
  return restrictions.get(target) ?? [];
}

/** Returns the labels of everything that still references the document (empty = safe to delete). */
export async function findBlockingReferences(
  target: string,
  id: Types.ObjectId | string,
  session?: ClientSession,
): Promise<ErrorDetail[]> {
  const blockers: ErrorDetail[] = [];
  await Promise.all(
    getRestrictions(target).map(async (rule) => {
      const hit = await mongoose.model(rule.referrer).exists({ [rule.path]: id }).session(session ?? null);
      if (hit) blockers.push({ path: rule.path, message: `Still used by ${rule.label}` });
    }),
  );
  return blockers;
}

interface SoftDeleteOptions {
  actorId?: Types.ObjectId | string;
  session?: ClientSession;
}

/**
 * Soft-deletes one document after checking that nothing live still references it.
 * Returns false when the document does not exist or is already deleted.
 */
export async function softDelete<T extends object>(
  model: Model<T>,
  id: Types.ObjectId | string,
  { actorId, session }: SoftDeleteOptions = {},
): Promise<boolean> {
  const blockers = await findBlockingReferences(model.modelName, id, session);
  if (blockers.length > 0) {
    throw AppError.conflict('This record cannot be deleted because other records still depend on it', blockers);
  }

  const result = await model.updateOne(
    { _id: id },
    { $set: { isDeleted: true, deletedAt: new Date(), ...(actorId ? { deletedBy: actorId } : {}) } },
    { session },
  );
  return result.modifiedCount === 1;
}

/** Brings a soft-deleted document back. Unique values must still be free, or the unique index will reject it. */
export async function restore<T extends object>(
  model: Model<T>,
  id: Types.ObjectId | string,
  session?: ClientSession,
): Promise<boolean> {
  const result = await model.updateOne(
    { _id: id, isDeleted: true },
    { $set: { isDeleted: false }, $unset: { deletedAt: '', deletedBy: '' } },
    { session },
  );
  return result.modifiedCount === 1;
}
