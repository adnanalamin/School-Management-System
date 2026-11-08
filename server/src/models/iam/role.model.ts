import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, noDuplicateIds, optionalRef, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

/**
 * A named bundle of permissions. Permissions are references, so the permission catalogue stays the single
 * source of truth for what each key means. System roles (isSystem) are created by the seed and keep their `key`.
 */
const roleSchema = new Schema(
  {
    key: { type: String, required: true, lowercase: true, trim: true, maxlength: 50, match: [/^[a-z][a-z0-9_]*$/, '{PATH} may contain lowercase letters, digits and underscores'] },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300 },
    permissions: { type: [optionalRef(MODELS.Permission)], validate: noDuplicateIds },
    isSystem: { type: Boolean, default: false },
    ...softDeleteFields,
  },
  baseSchemaOptions('roles'),
);

uniqueActiveIndex(roleSchema, { key: 1 });
uniqueActiveIndex(roleSchema, { name: 1 });
activeIndex(roleSchema, { permissions: 1 }); // "which roles grant X"

applyStandardPlugins(roleSchema, { softDelete: true });

export type Role = Persisted<InferSchemaType<typeof roleSchema>>;
export const RoleModel = model(MODELS.Role, roleSchema);
