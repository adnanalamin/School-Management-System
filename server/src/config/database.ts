import mongoose from 'mongoose';
import { env, isProduction } from './env';
import { logger } from './logger';

const CONNECT_MAX_ATTEMPTS = 5;
const CONNECT_RETRY_DELAY_MS = 2_000;
const PING_TIMEOUT_MS = 2_000;
const READY_STATE_CONNECTED = 1;

export type DatabaseState = 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'unknown';

const READY_STATE_LABELS: Record<number, DatabaseState> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

mongoose.set('strictQuery', true);

let listenersRegistered = false;

function registerConnectionListeners(): void {
  if (listenersRegistered) return;
  listenersRegistered = true;

  const { connection } = mongoose;
  connection.on('connected', () => logger.info('MongoDB connected'));
  connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  connection.on('reconnected', () => logger.info('MongoDB reconnected'));
  connection.on('error', (error: Error) =>
    logger.error({ errorName: error.name, errorMessage: error.message }, 'MongoDB connection error'),
  );
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Connects to MongoDB with a bounded retry. Throws after the last attempt so the
 * process can fail fast instead of serving traffic without a database.
 * The connection string is never logged.
 */
export async function connectDatabase(): Promise<void> {
  registerConnectionListeners();

  for (let attempt = 1; attempt <= CONNECT_MAX_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5_000,
        socketTimeoutMS: 45_000,
        // Index builds on startup are convenient in development but risky on large
        // production collections; run them through migrations there.
        autoIndex: !isProduction,
      });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(
        { attempt, maxAttempts: CONNECT_MAX_ATTEMPTS, errorMessage: message },
        'MongoDB connection attempt failed',
      );
      if (attempt === CONNECT_MAX_ATTEMPTS) throw error;
      await delay(CONNECT_RETRY_DELAY_MS * attempt);
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  logger.info('MongoDB connection closed');
}

export function getDatabaseState(): DatabaseState {
  return READY_STATE_LABELS[mongoose.connection.readyState] ?? 'unknown';
}

/** Round-trip check used by the readiness probe. Never throws. */
export async function pingDatabase(): Promise<boolean> {
  if (mongoose.connection.readyState !== READY_STATE_CONNECTED) return false;
  const db = mongoose.connection.db;
  if (!db) return false;

  try {
    await Promise.race([
      db.admin().ping(),
      new Promise<never>((_resolve, reject) => {
        setTimeout(() => reject(new Error('Database ping timed out')), PING_TIMEOUT_MS).unref();
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}
