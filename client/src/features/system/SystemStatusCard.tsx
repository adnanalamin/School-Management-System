import { RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDuration, formatTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/api/errors';
import { stateLabel } from './StatusIndicator';
import { useSystemStatus, type SystemState } from './useSystemStatus';

function StatusRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

const badgeVariant = {
  checking: 'secondary',
  operational: 'success',
  degraded: 'warning',
  unreachable: 'destructive',
} as const satisfies Record<SystemState, 'secondary' | 'success' | 'warning' | 'destructive'>;

const badgeText: Record<SystemState, string> = {
  checking: 'Checking',
  operational: 'Operational',
  degraded: 'Degraded',
  unreachable: 'Offline',
};

/** Live view of GET /api/v1/health/ready. Reused on the landing page, overview and status page. */
export function SystemStatusCard({ detailed = false }: { detailed?: boolean }) {
  const { state, data, error, isFetching, dataUpdatedAt, refetch } = useSystemStatus();
  const checking = state === 'checking';

  const apiValue = checking ? (
    <Skeleton className="h-4 w-16" />
  ) : state === 'unreachable' ? (
    <span className="text-destructive">Unreachable</span>
  ) : (
    <span className="text-success">Running</span>
  );

  const databaseValue = checking ? (
    <Skeleton className="h-4 w-16" />
  ) : state === 'operational' ? (
    <span className="text-success">Connected</span>
  ) : state === 'degraded' ? (
    <span className="text-warning-foreground">Not responding</span>
  ) : (
    <span className="text-muted-foreground">Unknown</span>
  );

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle>System status</CardTitle>
          <CardDescription>{stateLabel(state)}</CardDescription>
        </div>
        <Badge variant={badgeVariant[state]}>{badgeText[state]}</Badge>
      </CardHeader>
      <CardContent>
        <dl className="divide-y">
          <StatusRow label="API server">{apiValue}</StatusRow>
          <StatusRow label="Database">{databaseValue}</StatusRow>
          {detailed ? (
            <>
              <StatusRow label="Version">{data ? data.version : <span className="text-muted-foreground">—</span>}</StatusRow>
              <StatusRow label="Uptime">
                {data ? formatDuration(data.uptimeSeconds) : <span className="text-muted-foreground">—</span>}
              </StatusRow>
              <StatusRow label="Last checked">
                {dataUpdatedAt ? formatTime(dataUpdatedAt) : <span className="text-muted-foreground">—</span>}
              </StatusRow>
            </>
          ) : null}
        </dl>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-muted-foreground">
            {getErrorMessage(error)}
          </p>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
          <RotateCw className={isFetching ? 'animate-spin' : undefined} aria-hidden="true" />
          {isFetching ? 'Checking…' : 'Check again'}
        </Button>
      </CardFooter>
    </Card>
  );
}
