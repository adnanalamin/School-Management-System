import { Outlet, ScrollRestoration } from 'react-router-dom';
import { SkipLink } from '@/components/common/SkipLink';
import { useSidebarCollapsed } from '@/hooks/use-sidebar-collapsed';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from './Breadcrumbs';
import { NavigationProgress } from './NavigationProgress';
import { SidebarContent } from './SidebarContent';
import { Topbar } from './Topbar';

/**
 * Authenticated-area layout: collapsible sidebar from `lg`, slide-over drawer below it.
 * Landmarks: sidebar <aside> with <nav>, <header> in Topbar, <main id="main">.
 * Phase 3+ wraps this in an auth guard.
 */
export function AppShell() {
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <div className="min-h-dvh bg-background">
      <SkipLink />
      <NavigationProgress />

      <aside
        id="app-sidebar"
        aria-label="Sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border transition-[width] duration-200 lg:block',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        <Topbar sidebarCollapsed={collapsed} onToggleSidebar={toggle} />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-6 focus:outline-none sm:px-6 sm:py-8 lg:px-8">
          <Breadcrumbs className="mb-4" />
          <Outlet />
        </main>
      </div>

      <ScrollRestoration />
    </div>
  );
}
