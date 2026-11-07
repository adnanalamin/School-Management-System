import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Change versus a comparison period. Positive is shown as good. */
  delta?: { percent: number; comparison: string };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, delta, className }: StatCardProps) {
  const positive = delta ? delta.percent >= 0 : true;
  const TrendIcon = positive ? TrendingUp : TrendingDown;

  return (
    <Card className={className}>
      <CardContent className="p-5 sm:p-6">
        <dl className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight">{value}</dd>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </dl>
        {delta ? (
          <p className="mt-4 flex flex-wrap items-center gap-x-1.5 text-sm">
            <span className={cn('inline-flex items-center gap-1 font-medium', positive ? 'text-success' : 'text-destructive')}>
              <TrendIcon className="size-4" aria-hidden="true" />
              <span className="sr-only">{positive ? 'Up' : 'Down'} </span>
              {Math.abs(delta.percent).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{delta.comparison}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="size-10 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}
