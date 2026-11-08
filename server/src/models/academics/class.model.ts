import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

export const CLASS_STAGES = ['pre-primary', 'primary', 'lower-secondary', 'upper-secondary', 'other'] as const;

/**
 * A grade level ("Grade 6"). It does not change from year to year, so it carries no academic year;
 * the yearly groupings of students are `sections`.
 */
const classSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
    level: { type: Number, required: true, min: 0, max: 20, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } }, // order, used for promotion
    stage: { type: String, enum: CLASS_STAGES },
    description: { type: String, trim: true, maxlength: 300 },
    ...softDeleteFields,
  },
  baseSchemaOptions('classes'),
);

uniqueActiveIndex(classSchema, { name: 1 });
uniqueActiveIndex(classSchema, { code: 1 });
activeIndex(classSchema, { level: 1 });

applyStandardPlugins(classSchema, { softDelete: true });

export type SchoolClass = Persisted<InferSchemaType<typeof classSchema>>;
export const ClassModel = model(MODELS.Class, classSchema);
