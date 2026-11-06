import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default('/api/v1'),
  VITE_APP_NAME: z.string().min(1).default('School Management System'),
});

/**
 * Validated, typed client configuration. Everything here ends up in the public bundle,
 * so secrets must never be read from import.meta.env.
 */
export const env = envSchema.parse(import.meta.env);
