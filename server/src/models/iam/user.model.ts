import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, emailValidator, noDuplicateIds, optionalRef, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

/**
 * What kind of person owns the account, i.e. which collection holds their profile:
 *   staff   -> staff (and teachers, for teaching staff)
 *   student -> students
 *   parent  -> parents
 *   system  -> no profile (service accounts)
 * The link points from the profile to the user (`profile.user`), never the other way, so it is stored once.
 */
export const USER_KINDS = ['staff', 'student', 'parent', 'system'] as const;
export const USER_STATUSES = ['invited', 'active', 'suspended', 'locked'] as const;

/**
 * A login account: credentials and access only. Names, phone and address live on the profile, so there is
 * one place to correct them. People who never log in (most young students, some parents) have a profile and no user.
 */
const userSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, validate: emailValidator },
    passwordHash: { type: String, select: false }, // never loaded unless asked for: .select('+passwordHash')
    kind: { type: String, enum: USER_KINDS, required: true },
    roles: {
      type: [optionalRef(MODELS.Role)],
      validate: [{ validator: (roles: unknown[]) => roles.length > 0, message: 'A user needs at least one role' }, noDuplicateIds],
    },
    status: { type: String, enum: USER_STATUSES, default: 'invited' },
    emailVerifiedAt: { type: Date },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    failedLoginAttempts: { type: Number, min: 0, default: 0 },
    lockedUntil: { type: Date },
    mustChangePassword: { type: Boolean, default: false },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      locale: { type: String, trim: true, maxlength: 10 },
    },
    ...softDeleteFields,
  },
  baseSchemaOptions('users'),
);

uniqueActiveIndex(userSchema, { email: 1 }); // login lookup
activeIndex(userSchema, { kind: 1, status: 1 }); // admin lists: "all suspended staff accounts"
activeIndex(userSchema, { roles: 1 }); // "who holds this role"

applyStandardPlugins(userSchema, { softDelete: true });

export type User = Persisted<InferSchemaType<typeof userSchema>>;
export const UserModel = model(MODELS.User, userSchema);
