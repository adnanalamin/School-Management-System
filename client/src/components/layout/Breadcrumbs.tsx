import { ChevronRight } from 'lucide-react';
import { Link, useMatches } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Attach to a route as `handle: { crumb: 'Students' } satisfies RouteHandle` to include it in the trail. */
export interface RouteHandle {
  crumb?: string;
}

function getCrumb(handle: unknown): string | undefined {
  if (typeof handle === 'object' && handle !== null && 'crumb' in handle && typeof handle.crumb === 'string') {
    return handle.crumb;
  }
  return undefined;
}

/** Trail built from the matched routes' `handle.crumb`. Hidden when there is nothing above the current page. */
export function Breadcrumbs({ className }: { className?: string }) {
  const matches = useMatches();
  const crumbs = matches.flatMap((match) => {
    const label = getCrumb(match.handle);
    return label ? [{ label, to: match.pathname, id: match.id }] : [];
  });

  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.id} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className={cn('font-medium text-foreground')}>
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link to={crumb.to} className="rounded-sm hover:text-foreground hover:underline">
                    {crumb.label}
                  </Link>
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
