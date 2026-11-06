export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

export interface ErrorDetail {
  path: string;
  message: string;
}

interface AppErrorOptions {
  code: ErrorCode;
  statusCode: number;
  message: string;
  details?: ErrorDetail[] | undefined;
  cause?: unknown;
}

/**
 * Error with a safe, client-facing message and a stable machine-readable code.
 * Anything that is not an AppError is treated as a bug and returned as a generic 500.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details: ErrorDetail[] | undefined;

  constructor({ code, statusCode, message, details, cause }: AppErrorOptions) {
    super(message, { cause });
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message = 'The request is invalid', details?: ErrorDetail[]): AppError {
    return new AppError({ code: 'BAD_REQUEST', statusCode: 400, message, details });
  }

  static validation(details: ErrorDetail[], message = 'Some fields are invalid'): AppError {
    return new AppError({ code: 'VALIDATION_ERROR', statusCode: 422, message, details });
  }

  static unauthenticated(message = 'Authentication is required'): AppError {
    return new AppError({ code: 'UNAUTHENTICATED', statusCode: 401, message });
  }

  static forbidden(message = 'You do not have permission to perform this action'): AppError {
    return new AppError({ code: 'FORBIDDEN', statusCode: 403, message });
  }

  static notFound(message = 'The requested resource was not found'): AppError {
    return new AppError({ code: 'NOT_FOUND', statusCode: 404, message });
  }

  static conflict(message = 'The request conflicts with existing data', details?: ErrorDetail[]): AppError {
    return new AppError({ code: 'CONFLICT', statusCode: 409, message, details });
  }

  static payloadTooLarge(message = 'The request body is too large'): AppError {
    return new AppError({ code: 'PAYLOAD_TOO_LARGE', statusCode: 413, message });
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.'): AppError {
    return new AppError({ code: 'RATE_LIMITED', statusCode: 429, message });
  }

  static internal(cause?: unknown): AppError {
    return new AppError({
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      message: 'Something went wrong on our side. Please try again.',
      cause,
    });
  }

  static serviceUnavailable(message = 'The service is temporarily unavailable', details?: ErrorDetail[]): AppError {
    return new AppError({ code: 'SERVICE_UNAVAILABLE', statusCode: 503, message, details });
  }
}
