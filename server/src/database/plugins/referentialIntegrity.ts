import mongoose, { type ClientSession, type Schema, type Types } from 'mongoose';
import { AppError, type ErrorDetail } from '../../utils/AppError';

/*
 * MongoDB has no foreign keys. This plugin gives `save()` / `create()` the missing check:
 * every reference declared with `refCheck: true` (see requiredRef / optionalRef) must point at an
 * existing, non-deleted document. It only inspects references that are new or modified.
 *
 * Limits, by design:
 * - It does not run for insertMany, updateOne, bulkWrite or findOneAndUpdate. Code that writes through
 *   those paths must call assertReferencesExist() once for the whole batch.
 * - Existence is checked, not business rules ("this student is enrolled in that section").
 * - Check-then-write is not atomic. A concurrent delete can slip through; restrictions on delete
 *   (see softDelete) close the other half of the gap.
 */

export interface RefTarget {
  path: string;
  model: string;
}

interface RefOptions {
  ref?: unknown;
  refCheck?: unknown;
  type?: unknown;
}

function pickCheckedSource(options: RefOptions | undefined): RefOptions | undefined {
  if (!options) return undefined;
  if (options.refCheck === true) return options;
  // Arrays of references keep the options on the first element of `type`.
  if (Array.isArray(options.type)) {
    const first: unknown = options.type[0];
    if (typeof first === 'object' && first !== null && (first as RefOptions).refCheck === true) return first as RefOptions;
  }
  return undefined;
}

/** Walks a schema (including subdocuments) and returns every reference marked `refCheck: true`. */
export function collectRefTargets(schema: Schema, prefix = ''): RefTarget[] {
  const targets: RefTarget[] = [];

  schema.eachPath((path, schemaType) => {
    const nested = (schemaType as unknown as { schema?: Schema }).schema;
    if (nested) {
      targets.push(...collectRefTargets(nested, `${prefix}${path}.`));
      return;
    }

    const caster = (schemaType as unknown as { caster?: { options?: RefOptions } }).caster?.options;
    const source = pickCheckedSource(schemaType.options as RefOptions) ?? pickCheckedSource(caster);
    if (source && typeof source.ref === 'string') targets.push({ path: `${prefix}${path}`, model: source.ref });
  });

  return targets;
}

/** Collects the id strings found at a dotted path, flattening arrays of subdocuments. */
export function collectIds(value: unknown, parts: readonly string[]): string[] {
  if (value === null || value === undefined) return [];
  if (parts.length === 0) {
    return Array.isArray(value) ? value.flatMap((item: unknown) => collectIds(item, [])) : [String(value)];
  }
  if (Array.isArray(value)) return value.flatMap((item: unknown) => collectIds(item, parts));
  if (typeof value === 'object') {
    const [head, ...rest] = parts;
    return head === undefined ? [] : collectIds((value as Record<string, unknown>)[head], rest);
  }
  return [];
}

export function referentialIntegrityPlugin(schema: Schema): void {
  const targets = collectRefTargets(schema);
  if (targets.length === 0) return;

  schema.pre('save', async function () {
    const session = this.$session() ?? null;
    const raw = this.toObject({ depopulate: true, virtuals: false, getters: false, versionKey: false }) as Record<string, unknown>;
    const problems: ErrorDetail[] = [];

    await Promise.all(
      targets.map(async (target) => {
        const parts = target.path.split('.');
        const head = parts[0];
        if (!this.isNew && head !== undefined && !this.isModified(head)) return;

        const ids = [...new Set(collectIds(raw, parts))];
        if (ids.length === 0) return;

        const found = await mongoose.model(target.model).countDocuments({ _id: { $in: ids } }).session(session);
        if (found !== ids.length) {
          problems.push({ path: target.path, message: `Referenced ${target.model} does not exist` });
        }
      }),
    );

    if (problems.length > 0) throw AppError.validation(problems, 'Some referenced records do not exist');
  });
}

/** For bulk writes that bypass save hooks: verify all ids in one query. */
export async function assertReferencesExist(
  model: string,
  ids: ReadonlyArray<Types.ObjectId | string>,
  path: string,
  session?: ClientSession,
): Promise<void> {
  const unique = [...new Set(ids.map(String))];
  if (unique.length === 0) return;
  const found = await mongoose.model(model).countDocuments({ _id: { $in: unique } }).session(session ?? null);
  if (found !== unique.length) {
    throw AppError.validation([{ path, message: `Referenced ${model} does not exist` }], 'Some referenced records do not exist');
  }
}
