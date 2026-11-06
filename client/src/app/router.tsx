import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RouteError } from '@/components/common/RouteError';
import { LandingPage } from '@/pages/public/LandingPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

/*
 * Pages under /app are code-split with React Router's `lazy`; each page module exports `Component`.
 * Feature modules add their routes to `appChildren` (and, later, wrap them in auth/permission guards).
 */
const appChildren: RouteObject[] = [
  { index: true, lazy: () => import('@/pages/app/OverviewPage') },
  { path: 'system', lazy: () => import('@/pages/app/SystemStatusPage') },
];

if (import.meta.env.DEV) {
  // Living style guide. Excluded from production builds.
  appChildren.push({ path: 'design-system', lazy: () => import('@/pages/app/DesignSystemPage') });
}

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage />, errorElement: <RouteError /> },
  { path: '/app', element: <AppShell />, errorElement: <RouteError />, children: appChildren },
  { path: '*', element: <NotFoundPage /> },
]);
