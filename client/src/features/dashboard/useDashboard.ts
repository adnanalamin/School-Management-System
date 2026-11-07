import { useQuery } from '@tanstack/react-query';
import { getDashboardSample } from '@/mocks/dashboard';
import type { DashboardData } from './types';

export const dashboardKeys = {
  summary: ['dashboard', 'summary'] as const,
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Sample data behind the same hook shape the real API will use.
 * To connect the backend, replace the queryFn body with
 * `api.get('/dashboard/summary', dashboardSchema, { signal })`; the page code does not change.
 */
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: dashboardKeys.summary,
    queryFn: async () => {
      await sleep(700); // simulate network latency so loading states are visible
      return getDashboardSample();
    },
    staleTime: 60_000,
  });
}
