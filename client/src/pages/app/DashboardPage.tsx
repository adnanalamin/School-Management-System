import { CalendarCheck, GraduationCap, Receipt, Users, type LucideIcon } from 'lucide-react';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/features/account/useCurrentUser';
import { AttendanceChart } from '@/features/dashboard/AttendanceChart';
import { DashboardSkeleton } from '@/features/dashboard/DashboardSkeleton';
import { FeeCollectionCard } from '@/features/dashboard/FeeCollectionCard';
import { QuickLinksCard } from '@/features/dashboard/QuickLinksCard';
import { RecentActivityCard } from '@/features/dashboard/RecentActivityCard';
import type { DashboardStat, StatId } from '@/features/dashboard/types';
import { UpcomingEventsCard } from '@/features/dashboard/UpcomingEventsCard';
import { useDashboard } from '@/features/dashboard/useDashboard';
import { usePageTitle } from '@/hooks/use-page-title';
import { ApiError, getErrorMessage } from '@/lib/api/errors';
import { formatDate, formatNumber } from '@/lib/format';

const statIcons: Record<StatId, LucideIcon> = {
  students: GraduationCap,
  teachers: Users,
  attendance: CalendarCheck,
  fees: Receipt,
};

function formatStatValue(stat: DashboardStat): string {
  return stat.format === 'percent' ? `${stat.value.toFixed(1)}%` : formatNumber(stat.value);
}

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Component() {
  usePageTitle('Dashboard');
  const user = useCurrentUser();
  const { data, error, refetch } = useDashboard();
  const now = new Date();
  const firstName = user.name.split(' ')[0] ?? user.name;

  return (
    <>
      <PageHeader
        title={`${getGreeting(now.getHours())}, ${firstName}`}
        description={`${formatDate(now, { dateStyle: 'full' })}. Here is what is happening at your school today.`}
        actions={<Badge variant="info">Sample data</Badge>}
      />

      {error ? (
        <ErrorState
          title="Could not load the dashboard"
          message={getErrorMessage(error)}
          requestId={error instanceof ApiError ? error.requestId : undefined}
          onRetry={() => void refetch()}
        />
      ) : !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.stats.map((stat) => (
              <StatCard
                key={stat.id}
                label={stat.label}
                value={formatStatValue(stat)}
                icon={statIcons[stat.id]}
                delta={{ percent: stat.deltaPercent, comparison: stat.comparison }}
              />
            ))}
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AttendanceChart week={data.attendance.week} month={data.attendance.month} targetRate={data.attendance.targetRate} />
            </div>
            <FeeCollectionCard groups={data.feeCollection} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <RecentActivityCard items={data.activity} />
            <UpcomingEventsCard events={data.events} />
            <QuickLinksCard />
          </div>
        </div>
      )}
    </>
  );
}
