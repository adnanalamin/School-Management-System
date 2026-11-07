export type SortDirection = 'asc' | 'desc';

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/** Click cycle for a column header: ascending, then descending, then unsorted. */
export function nextSort(current: SortState | null, columnId: string): SortState | null {
  if (current?.columnId !== columnId) return { columnId, direction: 'asc' };
  if (current.direction === 'asc') return { columnId, direction: 'desc' };
  return null;
}

export interface ClientTableOptions<TRow> {
  search: string;
  searchFields: ReadonlyArray<(row: TRow) => string>;
  sort: SortState | null;
  sortAccessors: Record<string, (row: TRow) => string | number>;
  page: number;
  pageSize: number;
}

export interface ClientTableResult<TRow> {
  rows: TRow[];
  /** Matching rows before pagination. */
  total: number;
  totalPages: number;
  /** Page after clamping to the available range. */
  page: number;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * Search, sort and paginate an in-memory list. Used for demos and small static lists;
 * real modules send the same state (search, sort, page, pageSize) to the API instead.
 */
export function applyClientTable<TRow>(rows: readonly TRow[], options: ClientTableOptions<TRow>): ClientTableResult<TRow> {
  const query = options.search.trim().toLowerCase();
  let result = query
    ? rows.filter((row) => options.searchFields.some((field) => field(row).toLowerCase().includes(query)))
    : [...rows];

  const { sort } = options;
  const accessor = sort ? options.sortAccessors[sort.columnId] : undefined;
  if (sort && accessor) {
    const factor = sort.direction === 'asc' ? 1 : -1;
    result = result.sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
      return collator.compare(String(left), String(right)) * factor;
    });
  }

  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / options.pageSize));
  const page = Math.min(Math.max(1, options.page), totalPages);
  const start = (page - 1) * options.pageSize;

  return { rows: result.slice(start, start + options.pageSize), total, totalPages, page };
}
