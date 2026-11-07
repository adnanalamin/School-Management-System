import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiError, getErrorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils';
import { nextSort, type SortState } from './table-utils';

export interface DataTableColumn<TRow> {
  id: string;
  header: string;
  cell: (row: TRow) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  headerClassName?: string;
  cellClassName?: string;
  /**
   * Role in the stacked layout used below the `md` breakpoint:
   * 'title' is the card heading, 'actions' sits top-right, 'hidden' is omitted, 'field' (default) is a label/value row.
   */
  mobile?: 'title' | 'actions' | 'field' | 'hidden';
  /** Keep the header text for screen readers only (for icon or action columns). */
  hideHeader?: boolean;
}

interface DataTableProps<TRow> {
  columns: ReadonlyArray<DataTableColumn<TRow>>;
  rows: readonly TRow[];
  getRowId: (row: TRow) => string;
  /** Accessible name for the table, e.g. "Students". */
  caption: string;
  isLoading?: boolean;
  /** Any thrown value; rendered as an inline error with a retry button. */
  error?: unknown;
  onRetry?: () => void;
  /** Shown when there are no rows and nothing is loading. */
  emptyState?: ReactNode;
  sort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** Search box, filters and bulk actions. */
  toolbar?: ReactNode;
  /** Usually <Pagination />. */
  footer?: ReactNode;
  skeletonRows?: number;
}

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' } as const;

function SortIcon({ direction }: { direction: SortState['direction'] | null }) {
  if (direction === 'asc') return <ArrowUp className="size-3.5" aria-hidden="true" />;
  if (direction === 'desc') return <ArrowDown className="size-3.5" aria-hidden="true" />;
  return <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" />;
}

/**
 * Responsive data table: a real <table> from `md` up, stacked cards on phones.
 * Presentational only; sorting, filtering and paging state live with the caller so the same
 * component serves client-side lists and server-driven ones.
 */
export function DataTable<TRow>({
  columns,
  rows,
  getRowId,
  caption,
  isLoading = false,
  error,
  onRetry,
  emptyState,
  sort = null,
  onSortChange,
  toolbar,
  footer,
  skeletonRows = 6,
}: DataTableProps<TRow>) {
  const hasError = error !== undefined && error !== null;
  const showSkeleton = isLoading && !hasError;
  const showEmpty = !isLoading && !hasError && rows.length === 0;

  const titleColumn = columns.find((column) => column.mobile === 'title');
  const actionsColumn = columns.find((column) => column.mobile === 'actions');
  const fieldColumns = columns.filter((column) => column.mobile === undefined || column.mobile === 'field');

  return (
    <section aria-busy={isLoading} className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      {toolbar ? <div className="border-b p-3 sm:p-4">{toolbar}</div> : null}

      {hasError ? (
        <ErrorState
          title="Could not load this list"
          message={getErrorMessage(error)}
          requestId={error instanceof ApiError ? error.requestId : undefined}
          {...(onRetry ? { onRetry } : {})}
          className="border-0 bg-transparent"
        />
      ) : showEmpty ? (
        <div className="p-4 sm:p-6">{emptyState}</div>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <caption className="sr-only">{caption}</caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {columns.map((column) => {
                    const direction = sort?.columnId === column.id ? sort.direction : null;
                    const ariaSort = column.sortable ? (direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none') : undefined;
                    return (
                      <TableHead key={column.id} scope="col" aria-sort={ariaSort} className={cn(alignClass[column.align ?? 'left'], column.headerClassName)}>
                        {column.hideHeader ? (
                          <span className="sr-only">{column.header}</span>
                        ) : column.sortable && onSortChange ? (
                          <button
                            type="button"
                            onClick={() => onSortChange(nextSort(sort, column.id))}
                            className="-mx-2 inline-flex items-center gap-1.5 rounded px-2 py-1 uppercase tracking-wide hover:text-foreground"
                          >
                            {column.header}
                            <SortIcon direction={direction} />
                          </button>
                        ) : (
                          column.header
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {showSkeleton
                  ? Array.from({ length: skeletonRows }, (_, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-transparent" aria-hidden="true">
                        {columns.map((column) => (
                          <TableCell key={column.id}>
                            <Skeleton className="h-4 w-3/4" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : rows.map((row) => (
                      <TableRow key={getRowId(row)}>
                        {columns.map((column) => (
                          <TableCell key={column.id} className={cn(alignClass[column.align ?? 'left'], column.cellClassName)}>
                            {column.cell(row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          <ul aria-label={caption} className="divide-y md:hidden">
            {showSkeleton
              ? Array.from({ length: Math.min(skeletonRows, 4) }, (_, index) => (
                  <li key={index} aria-hidden="true" className="space-y-3 p-4">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </li>
                ))
              : rows.map((row) => (
                  <li key={getRowId(row)} className="space-y-3 p-4">
                    {titleColumn || actionsColumn ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">{titleColumn ? titleColumn.cell(row) : null}</div>
                        {actionsColumn ? <div className="shrink-0">{actionsColumn.cell(row)}</div> : null}
                      </div>
                    ) : null}
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                      {fieldColumns.map((column) => (
                        <div key={column.id} className="col-span-2 grid grid-cols-subgrid items-center">
                          <dt className="text-muted-foreground">{column.header}</dt>
                          <dd className="min-w-0 text-right">{column.cell(row)}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
          </ul>
        </>
      )}

      {hasError || showEmpty ? null : footer}
    </section>
  );
}
