import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, optionalRef, type Persisted } from '../../database/schema-helpers';
import { isSettingKey, SETTING_DEFINITIONS } from './setting.registry';

/**
 * One document per configuration key. `value` is free-form in MongoDB but validated here against the key's schema in
 * setting.registry.ts. When updating `value` in place, call `doc.markModified('value')` (Mixed fields are not tracked).
 */
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 80 },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String, trim: true, maxlength: 200 },
    isPublic: { type: Boolean, default: false },
    updatedBy: optionalRef(MODELS.User, false),
  },
  baseSchemaOptions('settings'),
);

settingSchema.pre('validate', function () {
  const key: string = this.key;
  if (!isSettingKey(key)) {
    this.invalidate('key', `Unknown setting "${key}"`);
    return;
  }
  const parsed = SETTING_DEFINITIONS[key].schema.safeParse(this.value);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`).join('; ');
    this.invalidate('value', message);
    return;
  }
  this.value = parsed.data; // store the normalised value (trimmed strings, stripped unknown fields)
});

applyStandardPlugins(settingSchema);

export type Setting = Persisted<InferSchemaType<typeof settingSchema>>;
export const SettingModel = model(MODELS.Setting, settingSchema);
