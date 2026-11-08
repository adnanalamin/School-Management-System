import { model, Schema, type InferSchemaType, type Types } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, maxItems, optionalRef, requiredRef, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

const subjectAssignmentSchema = new Schema(
  {
    subject: requiredRef(MODELS.Subject),
    teacher: optionalRef(MODELS.Teacher),
    periodsPerWeek: { type: Number, min: 1, max: 40, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } },
  },
  { _id: false },
);

interface SubjectAssignmentLike {
  subject: Types.ObjectId;
}

/**
 * A class group for one academic year ("Grade 6 / A / 2026-27"). Embeds the subject list with the teacher of each:
 * a section has a handful of subjects (capped at 30), and the list is always read together with the section.
 */
const sectionSchema = new Schema(
  {
    class: requiredRef(MODELS.Class),
    academicYear: requiredRef(MODELS.AcademicYear),
    name: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 }, // "A"
    capacity: { type: Number, min: 1, max: 200, default: 40, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } },
    classTeacher: optionalRef(MODELS.Teacher),
    room: { type: String, trim: true, maxlength: 50 },
    subjectAssignments: {
      type: [subjectAssignmentSchema],
      validate: [
        maxItems(30),
        { validator: (items: SubjectAssignmentLike[]) => new Set(items.map((i) => String(i.subject))).size === items.length, message: 'A subject can be assigned to a section only once' },
      ],
    },
    ...softDeleteFields,
  },
  baseSchemaOptions('sections'),
);

uniqueActiveIndex(sectionSchema, { academicYear: 1, class: 1, name: 1 });
activeIndex(sectionSchema, { classTeacher: 1 }, { partialFilterExpression: { classTeacher: { $type: 'objectId' } } });
activeIndex(sectionSchema, { 'subjectAssignments.teacher': 1 }); // "which sections does this teacher teach"

applyStandardPlugins(sectionSchema, { softDelete: true });

export type Section = Persisted<InferSchemaType<typeof sectionSchema>>;
export const SectionModel = model(MODELS.Section, sectionSchema);
