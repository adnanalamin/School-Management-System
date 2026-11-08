import { model, Schema, type InferSchemaType } from 'mongoose';
import { MODELS } from '../../database/constants';
import { softDeleteFields } from '../../database/plugins/softDelete';
import { activeIndex, applyStandardPlugins, baseSchemaOptions, maxItems, optionalRef, uniqueActiveIndex, type Persisted } from '../../database/schema-helpers';

const ISBN_PATTERN = /^(?:\d{9}[\dX]|\d{13})$/;
const wholeNumber = { validator: Number.isInteger, message: '{PATH} must be a whole number' };

/**
 * A title in the library catalogue. Copies are counted, not individually tracked.
 * `availableCopies` is a maintained counter (decremented on issue, incremented on return, inside one transaction)
 * so availability is a single field read; it can be rebuilt from `bookIssues` with status "issued".
 */
const bookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 250 },
    authors: { type: [{ type: String, trim: true, maxlength: 120 }], validate: [{ validator: (a: string[]) => a.length >= 1, message: 'At least one author is required' }, maxItems(20)] },
    isbn: { type: String, trim: true, uppercase: true, set: (value: unknown) => (typeof value === 'string' ? value.replace(/[\s-]/g, '') : value), match: [ISBN_PATTERN, '{PATH} must be a valid ISBN-10 or ISBN-13'] },
    publisher: { type: String, trim: true, maxlength: 150 },
    publishedYear: { type: Number, min: 1000, max: 2100, validate: wholeNumber },
    edition: { type: String, trim: true, maxlength: 50 },
    category: { type: String, trim: true, maxlength: 100 },
    language: { type: String, trim: true, lowercase: true, maxlength: 10, default: 'en' },
    description: { type: String, trim: true, maxlength: 2000 },
    location: { type: String, trim: true, maxlength: 100 }, // shelf
    totalCopies: { type: Number, min: 0, default: 1, validate: wholeNumber },
    availableCopies: { type: Number, min: 0, validate: wholeNumber }, // starts equal to totalCopies (set in the validate hook below)
    coverImage: optionalRef(MODELS.Document),
    ...softDeleteFields,
  },
  baseSchemaOptions('books'),
);

bookSchema.pre('validate', function () {
  if (this.availableCopies === undefined || this.availableCopies === null) this.availableCopies = this.totalCopies;
  if (this.availableCopies > this.totalCopies) this.invalidate('availableCopies', 'availableCopies cannot exceed totalCopies');
});

uniqueActiveIndex(bookSchema, { isbn: 1 }, { isbn: { $type: 'string' } });
activeIndex(bookSchema, { category: 1, title: 1 });
activeIndex(
  bookSchema,
  { title: 'text', authors: 'text', isbn: 'text' },
  { name: 'book_text', weights: { title: 10, authors: 5, isbn: 10 }, default_language: 'none' },
);

applyStandardPlugins(bookSchema, { softDelete: true });

export type Book = Persisted<InferSchemaType<typeof bookSchema>>;
export const BookModel = model(MODELS.Book, bookSchema);
