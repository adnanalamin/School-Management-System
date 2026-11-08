import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../../config/database';
import { logger } from '../../config/logger';
import '../../models';

/*
 * Reconciles the indexes in MongoDB with the ones declared in the schemas.
 *
 *   npm run db:indexes          show what would change (default; changes nothing)
 *   npm run db:indexes:apply    create missing indexes and DROP indexes the schemas no longer declare
 *
 * Production runs with autoIndex off (see config/database.ts) so a deploy never triggers surprise index builds.
 * Run this deliberately, ideally outside peak hours: building an index on a large collection takes time.
 */

const NAMESPACE_EXISTS = 48;

async function ensureCollection(model: mongoose.Model<unknown>): Promise<void> {
  try {
    await model.createCollection();
  } catch (error) {
    if ((error as { code?: number }).code !== NAMESPACE_EXISTS) throw error;
  }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  await connectDatabase();

  try {
    let pending = 0;
    for (const name of mongoose.modelNames().sort()) {
      const model = mongoose.model(name);
      await ensureCollection(model);

      const { toCreate, toDrop } = await model.diffIndexes();
      pending += toCreate.length + toDrop.length;
      if (toCreate.length > 0 || toDrop.length > 0) {
        logger.info({ model: name, create: toCreate.length, drop: toDrop }, apply ? 'Applying index changes' : 'Index changes needed');
      }
      if (apply) await model.syncIndexes();
    }

    logger.info(
      { pending },
      pending === 0 ? 'Indexes are in sync' : apply ? 'Indexes synchronised' : 'Run with --apply (npm run db:indexes:apply) to make these changes',
    );
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Index synchronisation failed');
  process.exitCode = 1;
});
