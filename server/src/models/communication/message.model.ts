import { model, Schema, type InferSchemaType, type Types } from 'mongoose';
import { LIMITS, MODELS } from '../../database/constants';
import { applyStandardPlugins, baseSchemaOptions, maxItems, noDuplicateIds, optionalRef, requiredRef, type Persisted } from '../../database/schema-helpers';

const recipientSchema = new Schema(
  {
    user: requiredRef(MODELS.User, false),
    readAt: { type: Date },
    deletedAt: { type: Date }, // this recipient removed it from their inbox; others still see it
  },
  { _id: false },
);

interface RecipientLike {
  user: Types.ObjectId;
}

/**
 * A direct message from one user to up to 100 others. Read and delete state is per recipient, so it sits inside the
 * message (a bounded array) rather than in a second collection. Replies share a `thread` id (the first message's own id).
 * Messages are append-only; announcements to large groups belong in `notices`.
 */
const messageSchema = new Schema(
  {
    sender: requiredRef(MODELS.User, false),
    recipients: {
      type: [recipientSchema],
      validate: [
        { validator: (items: RecipientLike[]) => items.length >= 1 && items.length <= LIMITS.maxRecipients, message: `A message needs between 1 and ${LIMITS.maxRecipients} recipients` },
        { validator: (items: RecipientLike[]) => new Set(items.map((i) => String(i.user))).size === items.length, message: 'A recipient can be listed only once' },
      ],
    },
    subject: { type: String, trim: true, maxlength: LIMITS.title },
    body: { type: String, required: true, trim: true, maxlength: LIMITS.longText },
    thread: { type: Schema.Types.ObjectId, required: true }, // a new message starts its own thread (set in the validate hook below)
    parent: optionalRef(MODELS.Message),
    attachments: { type: [optionalRef(MODELS.Document)], validate: [maxItems(LIMITS.maxAttachments), noDuplicateIds] },
    senderDeletedAt: { type: Date }, // sender removed it from their sent folder
  },
  baseSchemaOptions('messages'),
);

messageSchema.pre('validate', function () {
  if (!this.thread) this.thread = this._id;
  if (this.recipients.some((recipient) => String(recipient.user) === String(this.sender))) {
    this.invalidate('recipients', 'You cannot send a message to yourself');
  }
});

messageSchema.index({ 'recipients.user': 1, createdAt: -1 }); // inbox
messageSchema.index({ sender: 1, createdAt: -1 }); // sent
messageSchema.index({ thread: 1, createdAt: 1 }); // a conversation, oldest first

applyStandardPlugins(messageSchema);

export type Message = Persisted<InferSchemaType<typeof messageSchema>>;
export const MessageModel = model(MODELS.Message, messageSchema);
