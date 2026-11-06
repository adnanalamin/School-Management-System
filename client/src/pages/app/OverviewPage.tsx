import { LayoutGrid } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { SystemStatusCard } from '@/features/system/SystemStatusCard';
import { usePageTitle } from '@/hooks/use-page-title';

export function Component() {
  usePageTitle('Overview');

  return (
    <>
      <PageHeader title="Overview" description="Your school workspace at a glance." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SystemStatusCard />
        </div>
        <div className="lg:col-span-2">
          <EmptyState
            icon={LayoutGrid}
            title="No school modules yet"
            description="Modules appear in the sidebar and on this page as they are added to the workspace."
            className="h-full bg-card"
          />
        </div>
      </div>
    </>
  );
}
