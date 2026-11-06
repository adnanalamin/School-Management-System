import { Outlet, ScrollRestoration } from 'react-router-dom';
import { SkipLink } from '@/components/common/SkipLink';
import { NavigationProgress } from './NavigationProgress';
import { SidebarContent } from './SidebarContent';
import { Topbar } from './Topbar';

/**
 * Authenticated-area layout: fixed sidebar on large screens, slide-over drawer below `lg`.
 * Phase 2 wraps this in an auth guard.
 */
export function AppShell() {
  return (
    <div className="min-h-dvh bg-background">
      <SkipLink />
      <NavigationProgress />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-64">
        <Topbar />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-6 focus:outline-none sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>

      <ScrollRestoration />
    </div>
  );
}
