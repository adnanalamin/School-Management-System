import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

/** Always generates a fresh id; client-supplied ids are ignored so logs cannot be spoofed. */
export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const id = randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};
