import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemStatusCard } from '@/features/system/SystemStatusCard';
import { usePageTitle } from '@/hooks/use-page-title';

export function Component() {
  usePageTitle('System status');

  return (
    <>
      <PageHeader title="System status" description="Live health of the services this workspace depends on. Refreshes every 30 seconds." />
      <div className="grid gap-6 lg:grid-cols-2">
        <SystemStatusCard detailed />
        <Card>
          <CardHeader>
            <CardTitle>What is checked</CardTitle>
            <CardDescription>Two checks run against the API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">API server</h3>
              <p className="text-muted-foreground">The server answers requests. If this fails, the app cannot reach the API at all.</p>
            </div>
            <div>
              <h3 className="font-medium">Database</h3>
              <p className="text-muted-foreground">
                The server can reach MongoDB. When it cannot, the API still responds but reports a degraded state.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
