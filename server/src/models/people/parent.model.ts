import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, optionalRef, personFields, phoneField, requiredPhoneField, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

export const PARENT_STATUSES = ['active', 'inactive'] as const;

/**
 * A parent or guardian. Which students they are responsible for, and in what relation, is stored once on the
 * student (`students.guardians`); look children up with { 'guardians.parent': parentId }.
 */
const parentSchema = new Schema(
  {
    user: optionalRef(MODELS.User),
    ...personFields,
    phone: requiredPhoneField, // the school must always be able to reach a guardian
    alternatePhone: phoneField,
    occupation: { type: String, trim: true, maxlength: 100 },
    nationalId: { type: String, trim: true, maxlength: 40, select: false }, // sensitive: opt in with .select('+nationalId')
    photo: optionalRef(MODELS.Document),
    status: { type: String, enum: PARENT_STATUSES, default: 'active' },
    ...softDeleteFields,
  },
  baseSchemaOptions('parents'),
);

uniqueActiveIndex(parentSchema, { user: 1 }, { user: { $type: 'objectId' } });
activeIndex(parentSchema, { lastName: 1, firstName: 1 });
activeIndex(parentSchema, { phone: 1 }); // reception looks guardians up by phone
activeIndex(parentSchema, { firstName: 'text', lastName: 'text' }, { name: 'parent_text', default_language: 'none' });

applyStandardPlugins(parentSchema, { softDelete: true });

export type Parent = Persisted<InferSchemaType<typeof parentSchema>>;
export const ParentModel = model(MODELS.Parent, parentSchema);
