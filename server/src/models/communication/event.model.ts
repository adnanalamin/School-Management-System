import { model, Schema, type InferSchemaType } from 'mongoose';
import { LIMITS, MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, endNotBeforeStart, requiredRef, type Persisted } from '../../database/schema-helpers';
import { audienceSchema } from '../../database/subschemas';

export const EVENT_TYPES = ['academic', 'holiday', 'exam', 'meeting', 'sports', 'cultural', 'other'] as const;
export const EVENT_STATUSES = ['scheduled', 'cancelled', 'completed'] as const;

/** A calendar entry: holiday, meeting, sports day. Exams have their own schedule on `exams`. */
const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: LIMITS.title },
    description: { type: String, trim: true, maxlength: LIMITS.text },
    type: { type: String, enum: EVENT_TYPES, default: 'other' },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    location: { type: String, trim: true, maxlength: 200 },
    audience: { type: audienceSchema, required: true, default: () => ({ scope: 'all' }) },
    status: { type: String, enum: EVENT_STATUSES, default: 'scheduled' },
    organizer: requiredRef(MODELS.User, false),
    ...softDeleteFields,
  },
  baseSchemaOptions('events'),
);

endNotBeforeStart(eventSchema, 'startsAt', 'endsAt', 'endsAt cannot be before startsAt');

activeIndex(eventSchema, { startsAt: 1, endsAt: 1 }); // calendar range: startsAt <= to AND endsAt >= from
activeIndex(eventSchema, { type: 1, startsAt: 1 });

applyStandardPlugins(eventSchema, { softDelete: true });

export type SchoolEvent = Persisted<InferSchemaType<typeof eventSchema>>;
export const EventModel = model(MODELS.Event, eventSchema);
