import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Test-only values. Real configuration comes from .env (never committed).
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/sms_test',
      CLIENT_ORIGIN: 'http://localhost:5173',
      RATE_LIMIT_MAX: '1000',
    },
  },
});
