import type { RequestHandler } from 'express';
import { pingDatabase } from '../../config/database';
import { APP_VERSION } from '../../config/version';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';

function baseStatus() {
  return {
    version: APP_VERSION,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

/** Liveness: the process is up and able to answer. Does not touch dependencies. */
export const getLiveness: RequestHandler = (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  sendSuccess(res, { status: 'ok' as const, ...baseStatus() });
};

/** Readiness: the service can do useful work, i.e. the database answers a ping. */
export const getReadiness = asyncHandler(async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const databaseUp = await pingDatabase();
  if (!databaseUp) {
    throw AppError.serviceUnavailable('Database is not reachable', [
      { path: 'database', message: 'Connection check failed' },
    ]);
  }

  sendSuccess(res, {
    status: 'ready' as const,
    ...baseStatus(),
    checks: { database: { status: 'up' as const } },
  });
});
