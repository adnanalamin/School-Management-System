import type { Server } from 'node:http';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

const SHUTDOWN_TIMEOUT_MS = 10_000;
let isShuttingDown = false;

async function shutdown(server: Server, reason: string, exitCode: number): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  process.exitCode = exitCode;
  logger.info({ reason }, 'Shutting down');

  // Safety net: if something hangs, exit anyway.
  setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
  await disconnectDatabase();
}

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'Server listening');
  });

  // Longer than typical load-balancer idle timeouts, to avoid sporadic 502s.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  process.on('SIGTERM', () => void shutdown(server, 'SIGTERM', 0));
  process.on('SIGINT', () => void shutdown(server, 'SIGINT', 0));
  process.on('unhandledRejection', (reason) => {
    logger.fatal({ err: reason }, 'Unhandled promise rejection');
    void shutdown(server, 'unhandledRejection', 1);
  });
  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught exception');
    void shutdown(server, 'uncaughtException', 1);
  });
}

main().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Failed to start server');
  process.exitCode = 1;
});
