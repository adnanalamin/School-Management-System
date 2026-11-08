import { Schema, type IndexDefinition, type IndexOptions, type SchemaOptions, type Types } from 'mongoose';
import { z } from 'zod';
import { BLOOD_GROUPS, GENDERS, type ModelName } from './constants';
import { referentialIntegrityPlugin } from './plugins/referentialIntegrity';
import { softDeletePlugin } from './plugins/softDelete';

/** A document as read back from the database: schema fields plus _id and timestamps. */
export type Persisted<T> = T & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

/* -------------------------------------------------------------------------- */
/* Schema options and plugins                                                 */
/* -------------------------------------------------------------------------- */

function jsonTransform(_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
  ret['id'] = String(ret['_id']);
  delete ret['_id'];
  return ret;
}

/**
 * Options every schema shares.
 * - explicit camelCase collection name (Mongoose would otherwise lowercase and pluralise it)
 * - createdAt / updatedAt
 * - optimisticConcurrency: a save based on a stale read fails instead of silently overwriting a newer change
 * - clean JSON: `id` instead of `_id`, no `__v`
 */
export function baseSchemaOptions(collection: string) {
  return {
    collection,
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true, versionKey: false, transform: jsonTransform },
    toObject: { virtuals: true, versionKey: false },
  } satisfies SchemaOptions;
}

export function applyStandardPlugins(schema: Schema, options: { softDelete?: boolean } = {}): void {
  if (options.softDelete) schema.plugin(softDeletePlugin);
  schema.plugin(referentialIntegrityPlugin);
}

/* -------------------------------------------------------------------------- */
/* Index helpers                                                              */
/* -------------------------------------------------------------------------- */

type PartialFilter = Record<string, unknown>;

/**
 * Index restricted to live documents (`isDeleted: false`). It is smaller than a full index and is
 * used by every normal query, because the soft-delete plugin adds `isDeleted: false` to them.
 */
export function activeIndex(schema: Schema, fields: IndexDefinition, options: IndexOptions = {}): void {
  const partial = (options.partialFilterExpression ?? {}) as PartialFilter;
  schema.index(fields, { ...options, partialFilterExpression: { ...partial, isDeleted: false } });
}

/**
 * Unique among live documents only, so a deleted record's value (an email, an admission number) can be reused.
 * `where` narrows uniqueness further, e.g. { email: { $type: 'string' } } to ignore documents without the field.
 */
export function uniqueActiveIndex(schema: Schema, fields: IndexDefinition, where: PartialFilter = {}, options: IndexOptions = {}): void {
  schema.index(fields, { ...options, unique: true, partialFilterExpression: { ...where, isDeleted: false } });
}

/* -------------------------------------------------------------------------- */
/* References                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * ObjectId reference. `check` makes save() verify the target exists (see referentialIntegrity plugin).
 * Pass `false` on hot, bulk-written collections (attendance, marks) where the service validates the whole batch once.
 */
export const requiredRef = (ref: ModelName, check = true) => ({ type: Schema.Types.ObjectId, ref, required: true, refCheck: check }) as const;
export const optionalRef = (ref: ModelName, check = true) => ({ type: Schema.Types.ObjectId, ref, refCheck: check }) as const;

/** Array validator: no id appears twice. */
export const noDuplicateIds = {
  validator: (values: Types.ObjectId[]) => new Set(values.map(String)).size === values.length,
  message: '{PATH} must not contain duplicates',
};

export const maxItems = (limit: number) => ({
  validator: (values: unknown[]) => values.length <= limit,
  message: `{PATH} cannot have more than ${limit} entries`,
});

/* -------------------------------------------------------------------------- */
/* Field fragments                                                            */
/* -------------------------------------------------------------------------- */

export const emailValidator = {
  validator: (value: string) => z.string().email().safeParse(value).success,
  message: '{PATH} must be a valid email address',
};

const PHONE_PATTERN = /^\+?[0-9][0-9\s\-()]{6,19}$/;
export const phoneField = { type: String, trim: true, validate: { validator: (value: string) => PHONE_PATTERN.test(value), message: '{PATH} must be a valid phone number' } } as const;
export const requiredPhoneField = { ...phoneField, required: true } as const;

/**
 * Money is stored as an integer count of minor units (cents, paisa). Floats cannot represent decimal
 * currency exactly; integers can, sum exactly, and compare reliably. The currency and its number of
 * minor units come from settings ('locale.settings').
 */
const wholeNumber = { validator: Number.isInteger, message: '{PATH} must be a whole number of minor currency units' };
export const money = { type: Number, min: 0, default: 0, validate: wholeNumber } as const;
export const requiredMoney = { type: Number, min: 0, required: true, validate: wholeNumber } as const;
export const requiredPositiveMoney = { type: Number, min: 1, required: true, validate: wholeNumber } as const;

/** Calendar date without a time: normalised to 00:00 UTC so equality, uniqueness and range queries behave. */
export function toDateOnly(value: unknown): unknown {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match) return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  }
  return value;
}

export const dateOnly = { type: Date, set: toDateOnly } as const;
export const requiredDateOnly = { type: Date, set: toDateOnly, required: true } as const;

const inThePast = { validator: (value: Date) => value.getTime() <= Date.now(), message: '{PATH} cannot be in the future' };

export const addressSchema = new Schema(
  {
    line1: { type: String, required: true, trim: true, maxlength: 200 },
    line2: { type: String, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 100 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    country: { type: String, trim: true, uppercase: true, minlength: 2, maxlength: 2 },
  },
  { _id: false },
);

/** Fields every person profile (student, parent, staff) shares. Contact email lives on the user account. */
export const personFields = {
  firstName: { type: String, required: true, trim: true, maxlength: 80 },
  lastName: { type: String, required: true, trim: true, maxlength: 80 },
  gender: { type: String, enum: GENDERS },
  dateOfBirth: { type: Date, set: toDateOnly, validate: inThePast },
  phone: phoneField,
  address: addressSchema,
} as const;

export const bloodGroupField = { type: String, enum: BLOOD_GROUPS } as const;

/* -------------------------------------------------------------------------- */
/* Cross-field rules                                                          */
/* -------------------------------------------------------------------------- */

/** Adds a validation that `endPath` is not before `startPath` (only when both are set). */
export function endNotBeforeStart(schema: Schema, startPath: string, endPath: string, message?: string): void {
  schema.pre('validate', function () {
    const start: unknown = this.get(startPath);
    const end: unknown = this.get(endPath);
    if (start instanceof Date && end instanceof Date && end.getTime() < start.getTime()) {
      this.invalidate(endPath, message ?? `${endPath} cannot be before ${startPath}`, end);
    }
  });
}
