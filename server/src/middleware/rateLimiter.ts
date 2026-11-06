import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

/** Global per-IP limiter for /api/v1. Health probes are exempt. Stricter limits (login etc.) come with auth. */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path.startsWith('/health/'),
  handler: (_req, _res, next) => {
    next(AppError.tooManyRequests());
  },
});
