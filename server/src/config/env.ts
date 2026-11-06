import 'dotenv/config';
import { z } from 'zod';

const mongoUriSchema = z
  .string({ required_error: 'MONGODB_URI is required' })
  .min(1, 'MONGODB_URI is required')
  .refine(
    (value) => /^mongodb(\+srv)?:\/\//.test(value),
    'MONGODB_URI must start with mongodb:// or mongodb+srv://',
  );

const clientOriginsSchema = z
  .string()
  .default('http://localhost:5173')
  .transform((value) =>
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().url('CLIENT_ORIGIN must contain valid URLs')).min(1))
  .transform((urls) => urls.map((url) => new URL(url).origin));

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: mongoUriSchema,
  CLIENT_ORIGIN: clientOriginsSchema,
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // Print variable names and reasons only, never values (they may be secrets).
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('\n');
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }
  return result.data;
}

export const env: Env = loadEnv();
export const isProduction = env.NODE_ENV === 'production';
