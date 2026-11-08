import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

export const SUBJECT_TYPES = ['core', 'elective', 'language', 'co-curricular'] as const;

/** A subject in the catalogue. Where and by whom it is taught is on `sections.subjectAssignments`. */
const subjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
    type: { type: String, enum: SUBJECT_TYPES, default: 'core' },
    description: { type: String, trim: true, maxlength: 300 },
    isActive: { type: Boolean, default: true },
    ...softDeleteFields,
  },
  baseSchemaOptions('subjects'),
);

uniqueActiveIndex(subjectSchema, { code: 1 });
uniqueActiveIndex(subjectSchema, { name: 1 });
activeIndex(subjectSchema, { type: 1, name: 1 });

applyStandardPlugins(subjectSchema, { softDelete: true });

export type Subject = Persisted<InferSchemaType<typeof subjectSchema>>;
export const SubjectModel = model(MODELS.Subject, subjectSchema);
