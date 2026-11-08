import { Types, type FilterQuery, type Model, type PopulateOptions, type SortOrder } from 'mongoose';
import { z } from 'zod';
import { AppError } from '../utils/AppError';
import type { PaginationMeta } from '../utils/apiResponse';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../utils/pagination';

/** A lean (plain object) result row. */
export type Lean<T> = T & { _id: Types.ObjectId };

type Projection = string | Record<string, 0 | 1>;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/* -------------------------------------------------------------------------- */
/* Offset pagination: page numbers, total count. Right for admin tables.      */
/* -------------------------------------------------------------------------- */

export interface PageOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, SortOrder>;
  select?: Projection;
  populate?: PopulateOptions | PopulateOptions[];
}

export interface PageResult<T> {
  items: Array<Lean<T>>;
  meta: PaginationMeta;
}

/**
 * Runs the page query and the count in parallel and returns lean objects.
 * `_id` is always added as a tie-breaker so rows never repeat or vanish between pages.
 * Cost grows with `skip`; for feeds and very large collections use paginateByCursor.
 */
export async function paginate<T>(model: Model<T>, filter: FilterQuery<T> = {}, options: PageOptions = {}): Promise<PageResult<T>> {
  const limit = clamp(Math.floor(options.limit ?? DEFAULT_PAGE_SIZE), 1, MAX_PAGE_SIZE);
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const sort: Record<string, SortOrder> = options.sort ? { ...options.sort } : { _id: -1 };
  if (!('_id' in sort)) sort['_id'] = 1;

  const query = model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
  if (options.select) query.select(options.select);
  if (options.populate) query.populate(options.populate);

  const [items, total] = await Promise.all([query.lean<Array<Lean<T>>>().exec(), model.countDocuments(filter).exec()]);

  return { items, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

/* -------------------------------------------------------------------------- */
/* Cursor (keyset) pagination: constant cost per page. Right for feeds,       */
/* logs, notifications and any list that can grow without bound.              */
/* -------------------------------------------------------------------------- */

export interface CursorOptions {
  limit?: number;
  /** Opaque value from the previous page's `nextCursor`. */
  cursor?: string | undefined;
  /** Field to order by. Must be indexed together with _id. Defaults to _id (creation order). */
  sortField?: string;
  /** How to read the sort field back from a cursor. */
  valueType?: 'date' | 'number' | 'string';
  direction?: 1 | -1;
  select?: Projection;
  populate?: PopulateOptions | PopulateOptions[];
}

export interface CursorResult<T> {
  items: Array<Lean<T>>;
  nextCursor: string | null;
  hasMore: boolean;
}

interface CursorPayload {
  id: string;
  value?: string | number;
}

const cursorSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i),
  value: z.union([z.string(), z.number()]).optional(),
});

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(cursor: string): CursorPayload {
  try {
    const parsed = cursorSchema.parse(JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')));
    return parsed.value === undefined ? { id: parsed.id } : { id: parsed.id, value: parsed.value };
  } catch {
    throw AppError.badRequest('The pagination cursor is invalid');
  }
}

function readCursorValue(value: string | number | undefined, valueType: 'date' | 'number' | 'string'): unknown {
  if (value === undefined) throw AppError.badRequest('The pagination cursor is invalid');
  if (valueType === 'date') return new Date(value);
  if (valueType === 'number') return Number(value);
  return String(value);
}

function writeCursorValue(value: unknown): string | number | undefined {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number' || typeof value === 'string') return value;
  return undefined;
}

export async function paginateByCursor<T>(model: Model<T>, filter: FilterQuery<T> = {}, options: CursorOptions = {}): Promise<CursorResult<T>> {
  const limit = clamp(Math.floor(options.limit ?? DEFAULT_PAGE_SIZE), 1, MAX_PAGE_SIZE);
  const sortField = options.sortField ?? '_id';
  const direction = options.direction ?? -1;
  const operator = direction === 1 ? '$gt' : '$lt';

  let effectiveFilter: FilterQuery<T> = filter;
  if (options.cursor) {
    const { id, value } = decodeCursor(options.cursor);
    const idValue = new Types.ObjectId(id);
    const after =
      sortField === '_id'
        ? { _id: { [operator]: idValue } }
        : (() => {
            const sortValue = readCursorValue(value, options.valueType ?? 'string');
            return { $or: [{ [sortField]: { [operator]: sortValue } }, { [sortField]: sortValue, _id: { [operator]: idValue } }] };
          })();
    effectiveFilter = { $and: [filter, after] } as FilterQuery<T>;
  }

  const sort: Record<string, SortOrder> = sortField === '_id' ? { _id: direction } : { [sortField]: direction, _id: direction };

  // One extra row tells us whether another page exists without a count query.
  const query = model.find(effectiveFilter).sort(sort).limit(limit + 1);
  if (options.select) query.select(options.select);
  if (options.populate) query.populate(options.populate);
  const rows = await query.lean<Array<Lean<T>>>().exec();

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  const last = items[items.length - 1];

  let nextCursor: string | null = null;
  if (hasMore && last) {
    const value = sortField === '_id' ? undefined : writeCursorValue((last as Record<string, unknown>)[sortField]);
    nextCursor = encodeCursor(value === undefined ? { id: String(last._id) } : { id: String(last._id), value });
  }

  return { items, nextCursor, hasMore };
}
