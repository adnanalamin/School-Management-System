import { z } from 'zod';

const isTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

const weekday = z.number().int().min(0).max(6);

const schoolProfile = z.object({
  name: z.string().trim().min(1).max(200),
  shortName: z.string().trim().max(40).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(30).optional(),
  website: z.string().url().optional(),
  address: z.string().trim().max(500).optional(),
});

const localeSettings = z.object({
  timezone: z.string().refine(isTimeZone, 'Must be a valid IANA time zone, e.g. Asia/Dhaka'),
  locale: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Must look like "en" or "en-GB"'),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Must be an ISO 4217 code, e.g. USD'),
  /** Decimal places of the currency: 2 for USD, 0 for JPY. All stored money is integer minor units. */
  currencyMinorUnits: z.number().int().min(0).max(4),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
  weekStartsOn: weekday,
  weekendDays: z.array(weekday).max(3),
});

const gradingScale = z
  .object({
    passPercent: z.number().min(0).max(100),
    scale: z
      .array(
        z.object({
          grade: z.string().trim().min(1).max(4),
          minPercent: z.number().min(0).max(100),
          gradePoint: z.number().min(0).max(10),
          remark: z.string().trim().max(40).optional(),
        }),
      )
      .min(1)
      .max(20),
  })
  .refine((value) => value.scale.some((band) => band.minPercent === 0), 'The scale must include a band starting at 0%')
  .refine((value) => new Set(value.scale.map((band) => band.minPercent)).size === value.scale.length, 'Two bands cannot start at the same percentage');

const attendanceRules = z.object({
  lateAfterMinutes: z.number().int().min(0).max(240),
  minimumPercent: z.number().min(0).max(100),
});

const feeSettings = z.object({
  graceDays: z.number().int().min(0).max(90),
  lateFeeMinor: z.number().int().min(0),
  receiptPrefix: z.string().regex(/^[A-Z0-9-]{1,10}$/, 'Use up to 10 capital letters, digits or hyphens'),
});

const libraryRules = z.object({
  maxBooksStudent: z.number().int().min(1).max(20),
  maxBooksStaff: z.number().int().min(1).max(50),
  loanDays: z.number().int().min(1).max(90),
  maxRenewals: z.number().int().min(0).max(5),
  finePerDayMinor: z.number().int().min(0),
});

/**
 * Every configuration key the system knows. A setting is one document per key, so a change is one atomic write,
 * and each key's value is validated against its own schema: unknown keys and malformed values are rejected.
 * `isPublic` marks keys safe to show before login (school name, locale).
 */
export const SETTING_DEFINITIONS = {
  'school.profile': {
    schema: schoolProfile,
    description: 'School name and contact details',
    isPublic: true,
    defaults: { name: 'My School' },
  },
  'locale.settings': {
    schema: localeSettings,
    description: 'Time zone, language, currency and calendar conventions',
    isPublic: true,
    defaults: { timezone: 'UTC', locale: 'en', currency: 'USD', currencyMinorUnits: 2, dateFormat: 'DD/MM/YYYY', weekStartsOn: 0, weekendDays: [5, 6] },
  },
  'academic.grading': {
    schema: gradingScale,
    description: 'Grade bands and the pass mark',
    isPublic: false,
    defaults: {
      passPercent: 40,
      scale: [
        { grade: 'A', minPercent: 80, gradePoint: 4, remark: 'Excellent' },
        { grade: 'B', minPercent: 70, gradePoint: 3, remark: 'Good' },
        { grade: 'C', minPercent: 60, gradePoint: 2, remark: 'Satisfactory' },
        { grade: 'D', minPercent: 40, gradePoint: 1, remark: 'Pass' },
        { grade: 'F', minPercent: 0, gradePoint: 0, remark: 'Fail' },
      ],
    },
  },
  'attendance.rules': {
    schema: attendanceRules,
    description: 'When a student counts as late, and the minimum attendance',
    isPublic: false,
    defaults: { lateAfterMinutes: 15, minimumPercent: 75 },
  },
  'fees.settings': {
    schema: feeSettings,
    description: 'Fee grace period, late fee and receipt numbering',
    isPublic: false,
    defaults: { graceDays: 7, lateFeeMinor: 0, receiptPrefix: 'RC' },
  },
  'library.rules': {
    schema: libraryRules,
    description: 'Library loan limits and fines',
    isPublic: false,
    defaults: { maxBooksStudent: 3, maxBooksStaff: 5, loanDays: 14, maxRenewals: 2, finePerDayMinor: 0 },
  },
} as const;

export type SettingKey = keyof typeof SETTING_DEFINITIONS;

export const SETTING_KEYS = Object.keys(SETTING_DEFINITIONS) as SettingKey[];

export function isSettingKey(key: string): key is SettingKey {
  return Object.prototype.hasOwnProperty.call(SETTING_DEFINITIONS, key);
}
