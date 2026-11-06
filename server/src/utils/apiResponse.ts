import type { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ResponseMeta {
  pagination?: PaginationMeta;
}

interface SendSuccessOptions {
  status?: number;
  meta?: ResponseMeta;
}

/**
 * Success envelope: { success: true, data, meta? }.
 * Error envelope (see errorHandler): { success: false, error: { code, message, details?, requestId } }.
 */
export function sendSuccess<T>(res: Response, data: T, options: SendSuccessOptions = {}): void {
  res.status(options.status ?? 200).json({
    success: true,
    data,
    ...(options.meta ? { meta: options.meta } : {}),
  });
}
