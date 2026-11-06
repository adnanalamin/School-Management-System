export interface ApiErrorDetail {
  path: string;
  message: string;
}

interface ApiErrorInit {
  status: number;
  code: string;
  message: string;
  details?: ApiErrorDetail[] | undefined;
  requestId?: string | undefined;
}

/** The server answered with an error (or an unusable response). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];
  readonly requestId: string | undefined;

  constructor({ status, code, message, details, requestId }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details ?? [];
    this.requestId = requestId;
  }
}

/** No response at all: offline, DNS failure, server down, or blocked by CORS. */
export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super('Unable to reach the server', { cause });
    this.name = 'NetworkError';
  }
}

/** A user-facing message for any thrown value. Never exposes stack traces or raw payloads. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'Cannot reach the server. Check your connection and try again.';
  }
  if (error instanceof ApiError) return error.message;
  return 'Something went wrong. Please try again.';
}

/** Maps server validation details to { fieldName: message } so forms can call setError(). */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const fields: Record<string, string> = {};
  for (const detail of error.details) {
    if (detail.path && !(detail.path in fields)) fields[detail.path] = detail.message;
  }
  return fields;
}
