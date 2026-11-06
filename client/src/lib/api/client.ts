import type { z, ZodTypeAny } from 'zod';
import { env } from '@/lib/env';
import { ApiError, NetworkError } from './errors';
import { errorEnvelopeSchema, successEnvelope } from './schemas';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = env.VITE_API_BASE_URL.replace(/\/+$/, '');
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

function toApiError(response: Response, payload: unknown): ApiError {
  const requestId = response.headers.get('X-Request-Id') ?? undefined;
  const parsed = errorEnvelopeSchema.safeParse(payload);

  if (parsed.success) {
    const { code, message, details, requestId: bodyRequestId } = parsed.data.error;
    return new ApiError({ status: response.status, code, message, details, requestId: bodyRequestId ?? requestId });
  }
  return new ApiError({
    status: response.status,
    code: 'HTTP_ERROR',
    message: 'The server could not complete the request.',
    requestId,
  });
}

/**
 * Typed request helper. The response is validated against `schema`, so callers get a value whose
 * runtime shape matches its static type, and a changed API fails loudly instead of corrupting the UI.
 * Aborted requests rethrow the original AbortError so TanStack Query can ignore them.
 */
export async function apiRequest<TSchema extends ZodTypeAny>(
  method: HttpMethod,
  path: string,
  schema: TSchema,
  options: RequestOptions = {},
): Promise<z.infer<TSchema>> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      credentials: 'include',
      signal: options.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new NetworkError(error);
  }

  const payload = await readJson(response);
  if (!response.ok) throw toApiError(response, payload);

  const parsed = successEnvelope(schema).safeParse(payload);
  if (!parsed.success) {
    throw new ApiError({
      status: response.status,
      code: 'INVALID_RESPONSE',
      message: 'The server sent a response the app could not understand.',
      requestId: response.headers.get('X-Request-Id') ?? undefined,
    });
  }
  return parsed.data.data;
}

type ReadOptions = Omit<RequestOptions, 'body'>;

export const api = {
  get: <TSchema extends ZodTypeAny>(path: string, schema: TSchema, options?: ReadOptions) =>
    apiRequest('GET', path, schema, options),
  post: <TSchema extends ZodTypeAny>(path: string, schema: TSchema, body?: unknown, options?: ReadOptions) =>
    apiRequest('POST', path, schema, { ...options, body }),
  put: <TSchema extends ZodTypeAny>(path: string, schema: TSchema, body?: unknown, options?: ReadOptions) =>
    apiRequest('PUT', path, schema, { ...options, body }),
  patch: <TSchema extends ZodTypeAny>(path: string, schema: TSchema, body?: unknown, options?: ReadOptions) =>
    apiRequest('PATCH', path, schema, { ...options, body }),
  delete: <TSchema extends ZodTypeAny>(path: string, schema: TSchema, options?: ReadOptions) =>
    apiRequest('DELETE', path, schema, options),
};
