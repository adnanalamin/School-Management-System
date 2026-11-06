import type { Request } from 'express';
import pinoHttp from 'pino-http';
import { logger } from '../config/logger';

/** Structured request logging. Auth headers and cookies are redacted in config/logger.ts. */
export const httpLogger = pinoHttp({
  logger,
  customProps: (req) => ({ requestId: (req as Request).requestId }),
  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  autoLogging: {
    // Probes hit these every few seconds; logging them only adds noise.
    ignore: (req) => req.url?.startsWith('/api/v1/health') ?? false,
  },
});
