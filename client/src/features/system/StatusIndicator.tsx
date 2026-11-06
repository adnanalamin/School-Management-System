import { cn } from '@/lib/utils';
import { useSystemStatus, type SystemState } from './useSystemStatus';

const config: Record<SystemState, { label: string; shortLabel: string; dot: string }> = {
  checking: { label: 'Checking system status', shortLabel: 'Checking', dot: 'bg-muted-foreground animate-pulse' },
  operational: { label: 'All systems operational', shortLabel: 'Operational', dot: 'bg-success' },
  degraded: { label: 'Database unavailable', shortLabel: 'Degraded', dot: 'bg-warning' },
  unreachable: { label: 'API unreachable', shortLabel: 'Offline', dot: 'bg-destructive' },
};

export function StatusDot({ state, className }: { state: SystemState; className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block size-2 shrink-0 rounded-full', config[state].dot, className)} />;
}

export function stateLabel(state: SystemState): string {
  return config[state].label;
}

/** Compact live indicator for headers and sidebars. Shares one query with the rest of the app. */
export function StatusIndicator({ className }: { className?: string }) {
  const { state } = useSystemStatus();
  const { label, shortLabel } = config[state];

  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-xs text-muted-foreground', className)} title={label}>
      <StatusDot state={state} />
      <span className="sr-only sm:hidden">{label}</span>
      <span className="hidden sm:inline">{shortLabel}</span>
    </span>
  );
}
