import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

const readinessSchema = z.object({
  status: z.literal('ready'),
  version: z.string(),
  uptimeSeconds: z.number(),
  timestamp: z.string(),
  checks: z.object({ database: z.object({ status: z.literal('up') }) }),
});

export type Readiness = z.infer<typeof readinessSchema>;

/**
 * checking     first request still in flight
 * operational  API reachable and database answering
 * degraded     API reachable but the database check failed (503)
 * unreachable  no usable response from the API
 */
export type SystemState = 'checking' | 'operational' | 'degraded' | 'unreachable';

export const systemKeys = {
  readiness: ['system', 'readiness'] as const,
};

export function deriveSystemState(isPending: boolean, error: unknown): SystemState {
  if (error) {
    return error instanceof ApiError && error.code === 'SERVICE_UNAVAILABLE' ? 'degraded' : 'unreachable';
  }
  return isPending ? 'checking' : 'operational';
}

export function useSystemStatus() {
  const query = useQuery({
    queryKey: systemKeys.readiness,
    queryFn: ({ signal }) => api.get('/health/ready', readinessSchema, { signal }),
    refetchInterval: 30_000,
    retry: false,
  });

  return {
    state: deriveSystemState(query.isPending, query.error),
    data: query.data,
    error: query.error,
    isFetching: query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
    refetch: query.refetch,
  };
}
