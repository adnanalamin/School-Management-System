import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/** 1 … 4 5 6 … 20 style page list. Always includes first and last page. */
export function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  if (page >= totalPages - 3) {
    return [1, 'ellipsis-start', ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index)];
  }
  return [1, 'ellipsis-start', page - 1, page, page + 1, 'ellipsis-end', totalPages];
}

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  /** Plural noun for the summary, e.g. "students". */
  itemLabel?: string;
  className?: string;
}

/**
 * Controlled pagination. Works for client-side slices and for server-driven lists:
 * page and pageSize map directly to the API's ?page=&limit= query.
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemLabel = 'results',
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);

  return (
    <div className={cn('flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">
          {formatNumber(from)}–{formatNumber(to)}
        </span>{' '}
        of {formatNumber(total)} {itemLabel}
      </p>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline" aria-hidden="true">
              Rows
            </span>
            <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger aria-label="Rows per page" className="h-9 w-[4.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <nav aria-label="Pagination">
          <ul className="flex items-center gap-1">
            <li>
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                aria-label="Previous page"
                disabled={current <= 1}
                onClick={() => onPageChange(current - 1)}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
            </li>
            <li className="px-2 text-sm text-muted-foreground sm:hidden">
              Page {current} of {totalPages}
            </li>
            {getPageItems(current, totalPages).map((item) =>
              typeof item === 'number' ? (
                <li key={item} className="hidden sm:block">
                  <Button
                    variant={item === current ? 'default' : 'ghost'}
                    size="icon"
                    className="size-9"
                    aria-label={`Page ${item}`}
                    aria-current={item === current ? 'page' : undefined}
                    onClick={() => onPageChange(item)}
                  >
                    {item}
                  </Button>
                </li>
              ) : (
                <li key={item} aria-hidden="true" className="hidden px-1 text-muted-foreground sm:block">
                  …
                </li>
              ),
            )}
            <li>
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                aria-label="Next page"
                disabled={current >= totalPages}
                onClick={() => onPageChange(current + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
