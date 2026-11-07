import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import type { RouteHandle } from '@/components/layout/Breadcrumbs';
import { getPlannedRoutes } from '@/components/layout/navigation';
import { RouteError } from '@/components/common/RouteError';
import { ModulePlaceholderPage } from '@/pages/app/ModulePlaceholderPage';
import { LandingPage } from '@/pages/public/LandingPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

/*
 * Pages under /app are code-split with React Router's `lazy`; each page module exports `Component`.
 * `handle.crumb` feeds the breadcrumb trail. Shipping a module: delete its `planned` flag in
 * components/layout/navigation.ts and add its real route here instead of the placeholder.
 */
const appChildren: RouteObject[] = [
  { index: true, lazy: () => import('@/pages/app/DashboardPage') },
  { path: 'system', lazy: () => import('@/pages/app/SystemStatusPage'), handle: { crumb: 'System status' } satisfies RouteHandle },
  ...getPlannedRoutes().map(
    (item): RouteObject => ({
      path: item.to.replace('/app/', ''),
      element: <ModulePlaceholderPage item={item} />,
      handle: { crumb: item.label } satisfies RouteHandle,
    }),
  ),
];

if (import.meta.env.DEV) {
  // Living style guide. Excluded from production builds.
  appChildren.push({
    path: 'design-system',
    lazy: () => import('@/pages/app/DesignSystemPage'),
    handle: { crumb: 'Design system' } satisfies RouteHandle,
  });
}

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage />, errorElement: <RouteError /> },
  {
    path: '/app',
    element: <AppShell />,
    errorElement: <RouteError />,
    handle: { crumb: 'Dashboard' } satisfies RouteHandle,
    children: appChildren,
  },
  { path: '*', element: <NotFoundPage /> },
]);
