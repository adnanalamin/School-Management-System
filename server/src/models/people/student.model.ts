import { model, Schema, type InferSchemaType, type Types } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, bloodGroupField, maxItems, optionalRef, personFields, requiredDateOnly, requiredRef, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';
import { attachedDocumentSchema } from '../../database/subschemas';

export const STUDENT_STATUSES = ['active', 'suspended', 'graduated', 'transferred', 'withdrawn'] as const;
export const GUARDIAN_RELATIONS = ['father', 'mother', 'guardian', 'grandparent', 'sibling', 'other'] as const;

const guardianSchema = new Schema(
  {
    parent: requiredRef(MODELS.Parent),
    relation: { type: String, enum: GUARDIAN_RELATIONS, required: true },
    isPrimary: { type: Boolean, default: false },
    isEmergencyContact: { type: Boolean, default: false },
  },
  { _id: false },
);

interface GuardianLike {
  parent: Types.ObjectId;
  isPrimary?: boolean;
}

const medicalSchema = new Schema(
  {
    conditions: [{ type: String, trim: true, maxlength: 200 }],
    allergies: [{ type: String, trim: true, maxlength: 200 }],
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false },
);

/**
 * A student's profile. The class they are in this year is NOT stored here: it is an enrollment
 * (`enrollments`), so history is kept and there is nothing to keep in sync at promotion time.
 */
const studentSchema = new Schema(
  {
    user: optionalRef(MODELS.User),
    admissionNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 30 },
    ...personFields,
    bloodGroup: bloodGroupField,
    admissionDate: { ...requiredDateOnly, default: () => new Date() },
    status: { type: String, enum: STUDENT_STATUSES, default: 'active' },
    guardians: {
      type: [guardianSchema],
      validate: [
        maxItems(6),
        { validator: (guardians: GuardianLike[]) => guardians.filter((g) => g.isPrimary).length <= 1, message: 'Only one guardian can be primary' },
        { validator: (guardians: GuardianLike[]) => new Set(guardians.map((g) => String(g.parent))).size === guardians.length, message: 'A guardian can be listed only once' },
      ],
    },
    previousSchool: { name: { type: String, trim: true, maxlength: 200 }, lastClass: { type: String, trim: true, maxlength: 50 } },
    medical: { type: medicalSchema, select: false }, // health data: opt in with .select('+medical')
    photo: optionalRef(MODELS.Document),
    documents: { type: [attachedDocumentSchema], validate: maxItems(20) },
    ...softDeleteFields,
  },
  baseSchemaOptions('students'),
);

uniqueActiveIndex(studentSchema, { admissionNumber: 1 });
uniqueActiveIndex(studentSchema, { user: 1 }, { user: { $type: 'objectId' } });
activeIndex(studentSchema, { status: 1, lastName: 1, firstName: 1 }); // the default student list, sorted by name
activeIndex(studentSchema, { 'guardians.parent': 1 }); // "children of this parent"
activeIndex(
  studentSchema,
  { firstName: 'text', lastName: 'text', admissionNumber: 'text' },
  { name: 'student_text', weights: { admissionNumber: 10, lastName: 5, firstName: 5 }, default_language: 'none' },
);

applyStandardPlugins(studentSchema, { softDelete: true });

export type Student = Persisted<InferSchemaType<typeof studentSchema>>;
export const StudentModel = model(MODELS.Student, studentSchema);
