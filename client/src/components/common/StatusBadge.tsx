import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

const toneToVariant = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  danger: 'destructive',
  neutral: 'secondary',
} as const satisfies Record<StatusTone, 'success' | 'warning' | 'info' | 'destructive' | 'secondary'>;

const toneToDot: Record<StatusTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  danger: 'bg-destructive',
  neutral: 'bg-muted-foreground',
};

/** Status chip with a leading dot, so meaning never relies on colour alone (the text always states it). */
export function StatusBadge({ tone, children, className }: { tone: StatusTone; children: ReactNode; className?: string }) {
  return (
    <Badge variant={toneToVariant[tone]} className={cn('font-medium', className)}>
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', toneToDot[tone])} />
      {children}
    </Badge>
  );
}
