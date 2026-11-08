import { model, Schema, type InferSchemaType } from 'mongoose';
import { DOCUMENT_CATEGORIES, LIMITS, MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, requiredRef, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

export const STORAGE_PROVIDERS = ['local', 's3', 'gcs', 'azure'] as const;
export const DOCUMENT_VISIBILITIES = ['private', 'internal', 'public'] as const;
export const SCAN_STATUSES = ['pending', 'clean', 'infected', 'skipped'] as const;

const MIME_PATTERN = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i;
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

/**
 * Metadata for an uploaded file; the bytes live in object storage (or local disk in development), never in MongoDB.
 * Other collections reference a document by id (a student's photo, an assignment's attachments), so there is one place
 * to update a file's metadata and one place to scan for orphans. Soft-deleted, then purged from storage by a job.
 */
const documentSchema = new Schema(
  {
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    mimeType: { type: String, required: true, lowercase: true, trim: true, match: [MIME_PATTERN, '{PATH} must be a valid MIME type'] },
    sizeBytes: { type: Number, required: true, min: 0, max: LIMITS.maxDocumentBytes, validate: { validator: Number.isInteger, message: '{PATH} must be a whole number' } },
    storage: {
      provider: { type: String, enum: STORAGE_PROVIDERS, required: true },
      bucket: { type: String, trim: true, maxlength: 100 },
      key: { type: String, required: true, trim: true, maxlength: 500 },
    },
    checksumSha256: { type: String, lowercase: true, match: [SHA256_PATTERN, '{PATH} must be a 64-character hex SHA-256'] },
    category: { type: String, enum: DOCUMENT_CATEGORIES, default: 'other' },
    visibility: { type: String, enum: DOCUMENT_VISIBILITIES, default: 'private' },
    scanStatus: { type: String, enum: SCAN_STATUSES, default: 'pending' },
    uploadedBy: requiredRef(MODELS.User, false),
    ...softDeleteFields,
  },
  baseSchemaOptions('documents'),
);

uniqueActiveIndex(documentSchema, { 'storage.provider': 1, 'storage.bucket': 1, 'storage.key': 1 }); // one record per stored object
activeIndex(documentSchema, { uploadedBy: 1, createdAt: -1 });
activeIndex(documentSchema, { category: 1, createdAt: -1 });
activeIndex(documentSchema, { checksumSha256: 1 }, { partialFilterExpression: { checksumSha256: { $type: 'string' } } }); // duplicate detection
activeIndex(documentSchema, { createdAt: 1 }, { partialFilterExpression: { scanStatus: 'pending' } }); // virus-scan queue

applyStandardPlugins(documentSchema, { softDelete: true });

export type StoredDocument = Persisted<InferSchemaType<typeof documentSchema>>;
export const DocumentModel = model(MODELS.Document, documentSchema);
