import type { NavItem } from '@/components/layout/navigation';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { usePageTitle } from '@/hooks/use-page-title';

/** Stand-in for a module that has not been built yet. Replaced route-by-route as modules ship. */
export function ModulePlaceholderPage({ item }: { item: NavItem }) {
  usePageTitle(item.label);

  return (
    <>
      <PageHeader title={item.label} />
      <EmptyState
        icon={item.icon}
        title={`${item.label} is coming soon`}
        description={item.description ?? 'This area is planned for a later release.'}
        className="bg-card py-16"
      />
    </>
  );
}
