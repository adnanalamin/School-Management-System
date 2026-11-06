import { z, type ZodTypeAny } from 'zod';

export const paginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export const errorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
    requestId: z.string().optional(),
  }),
});

/** Mirrors the server's { success: true, data, meta? } envelope around a feature-specific data schema. */
export function successEnvelope<TData extends ZodTypeAny>(data: TData) {
  return z.object({
    success: z.literal(true),
    data,
    meta: z.object({ pagination: paginationMetaSchema.optional() }).optional(),
  });
}
