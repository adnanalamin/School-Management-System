import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { AppError, type ErrorDetail } from '../utils/AppError';

interface MongoDuplicateKeyError {
  code: 11000;
  keyPattern?: Record<string, unknown>;
}

interface HttpLikeError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
}

function isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 11000;
}

function isHttpLikeError(error: unknown): error is HttpLikeError {
  return error instanceof Error && ('status' in error || 'statusCode' in error || 'type' in error);
}

/** Maps any thrown value to an AppError with a safe client-facing message. */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof ZodError) {
    return AppError.validation(
      error.issues.map((issue): ErrorDetail => ({ path: issue.path.join('.'), message: issue.message })),
    );
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return AppError.validation(
      Object.values(error.errors).map((item): ErrorDetail => ({ path: item.path, message: item.message })),
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return AppError.badRequest(`Invalid value for "${error.path}"`);
  }

  if (isDuplicateKeyError(error)) {
    // Report which fields collided, never the conflicting values.
    const details = Object.keys(error.keyPattern ?? {}).map(
      (path): ErrorDetail => ({ path, message: 'Must be unique' }),
    );
    return AppError.conflict('A record with the same unique value already exists', details);
  }

  if (isHttpLikeError(error)) {
    if (error.type === 'entity.parse.failed') return AppError.badRequest('Request body contains malformed JSON');
    if (error.type === 'entity.too.large') return AppError.payloadTooLarge();
    const status = error.status ?? error.statusCode;
    if (status !== undefined && status >= 400 && status < 500) return AppError.badRequest();
  }

  return AppError.internal(error);
}

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  const appError = normalizeError(error);

  const logContext = {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    statusCode: appError.statusCode,
    code: appError.code,
  };
  if (appError.statusCode >= 500) {
    logger.error({ ...logContext, err: error }, 'Request failed');
  } else {
    logger.debug(logContext, 'Request rejected');
  }

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
      requestId: req.requestId,
    },
  });
};
