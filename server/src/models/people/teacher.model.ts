import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, maxItems, noDuplicateIds, optionalRef, requiredRef, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

const qualificationSchema = new Schema(
  {
    degree: { type: String, required: true, trim: true, maxlength: 100 },
    institution: { type: String, trim: true, maxlength: 200 },
    year: { type: Number, min: 1950, max: 2100 },
  },
  { _id: false },
);

/**
 * Teaching profile of a staff member. Name, contact, employment dates and status are on the linked `staff`
 * record. Which sections and subjects a teacher actually teaches is stored once on the section
 * (`sections.subjectAssignments`); `subjects` here is only what they are qualified to teach.
 */
const teacherSchema = new Schema(
  {
    staff: requiredRef(MODELS.Staff),
    qualifications: { type: [qualificationSchema], validate: maxItems(20) },
    specializations: [{ type: String, trim: true, maxlength: 100 }],
    subjects: { type: [optionalRef(MODELS.Subject)], validate: noDuplicateIds },
    experienceYears: { type: Number, min: 0, max: 60 },
    bio: { type: String, trim: true, maxlength: 1000 },
    ...softDeleteFields,
  },
  baseSchemaOptions('teachers'),
);

uniqueActiveIndex(teacherSchema, { staff: 1 }); // one teaching profile per staff member
activeIndex(teacherSchema, { subjects: 1 }); // "who can teach Mathematics"

applyStandardPlugins(teacherSchema, { softDelete: true });

export type Teacher = Persisted<InferSchemaType<typeof teacherSchema>>;
export const TeacherModel = model(MODELS.Teacher, teacherSchema);
