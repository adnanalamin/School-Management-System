import { model, Schema, type InferSchemaType } from 'mongoose';
import { applyStandardPlugins, baseSchemaOptions, type Persisted } from '../../database/schema-helpers';
import { MODELS } from '../../database/constants';

/** "resource:action", lowercase, hyphens allowed: students:read, academic-years:update */
export const PERMISSION_KEY_PATTERN = /^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/;

/**
 * The catalogue of things a role can be allowed to do. Seeded from code (database/seed/permissions.ts),
 * never edited by users. Resource and action are the two halves of `key`, so they are not stored twice.
 */
const permissionSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80, match: [PERMISSION_KEY_PATTERN, '{PATH} must look like "resource:action"'] },
    description: { type: String, required: true, trim: true, maxlength: 200 },
    group: { type: String, required: true, trim: true, maxlength: 60 },
  },
  baseSchemaOptions('permissions'),
);

permissionSchema.index({ group: 1, key: 1 }); // grouped display in the role editor

applyStandardPlugins(permissionSchema);

export type Permission = Persisted<InferSchemaType<typeof permissionSchema>>;
export const PermissionModel = model(MODELS.Permission, permissionSchema);
