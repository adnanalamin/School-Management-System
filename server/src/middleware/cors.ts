import cors from 'cors';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

/**
 * Only origins listed in CLIENT_ORIGIN may call the API from a browser.
 * Requests without an Origin header (curl, server-to-server, same-origin) pass through;
 * Phase 2 cookie-based endpoints must still enforce SameSite and an Origin check.
 */
export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || env.CLIENT_ORIGIN.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(AppError.forbidden('Origin is not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 600,
});
