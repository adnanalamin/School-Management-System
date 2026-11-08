import type { Types } from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../../config/database';
import { logger } from '../../config/logger';
import { PermissionModel, RoleModel, SETTING_DEFINITIONS, SETTING_KEYS, SettingModel } from '../../models';
import { ALL_PERMISSION_KEYS, PERMISSION_CATALOG } from '../seed/permissions';
import { resolvePermissionKeys, SYSTEM_ROLES } from '../seed/roles';

/*
 * Idempotent baseline data: the permission catalogue, the system roles, and default settings.
 * Safe to run on every deploy. Creates no users and no school data (the first administrator is created
 * by the authentication phase's setup command).
 */

async function seedPermissions(): Promise<Map<string, Types.ObjectId>> {
  await PermissionModel.bulkWrite(
    PERMISSION_CATALOG.map((permission) => ({
      updateOne: {
        filter: { key: permission.key },
        update: { $set: { description: permission.description, group: permission.group } },
        upsert: true,
      },
    })),
  );

  const stored = await PermissionModel.find().select('_id key').lean();
  logger.info({ total: stored.length }, 'Permissions up to date');
  return new Map(stored.map((permission) => [permission.key, permission._id]));
}

async function seedRoles(idByKey: Map<string, Types.ObjectId>): Promise<void> {
  for (const role of SYSTEM_ROLES) {
    const ids = resolvePermissionKeys(role, ALL_PERMISSION_KEYS)
      .map((key) => idByKey.get(key))
      .filter((id): id is Types.ObjectId => id !== undefined);

    const onInsert = { name: role.name, description: role.description, isSystem: true };
    const update = role.syncPermissions
      ? { $set: { permissions: ids }, $setOnInsert: onInsert }
      : { $setOnInsert: { ...onInsert, permissions: ids } };

    await RoleModel.updateOne({ key: role.key, isDeleted: false }, update, { upsert: true });
    logger.info({ role: role.key, permissions: ids.length, resynced: role.syncPermissions }, 'Role ready');
  }
}

async function seedSettings(): Promise<void> {
  for (const key of SETTING_KEYS) {
    const definition = SETTING_DEFINITIONS[key];
    const value = definition.schema.parse(definition.defaults);
    await SettingModel.updateOne(
      { key },
      { $setOnInsert: { value, description: definition.description, isPublic: definition.isPublic } },
      { upsert: true },
    );
  }
  logger.info({ total: SETTING_KEYS.length }, 'Default settings present (existing values are never overwritten)');
}

async function main(): Promise<void> {
  await connectDatabase();
  try {
    const idByKey = await seedPermissions();
    await seedRoles(idByKey);
    await seedSettings();
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Seeding failed');
  process.exitCode = 1;
});
