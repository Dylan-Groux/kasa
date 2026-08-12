import { z } from 'zod';

/**
 * Schema commun aux routes /api/properties/:id.
 * @route /api/properties/:id
 */
export const propertyIdParamsSchema = z.object({
  id: z.string(),
});

export const noContentSchema = z.undefined();

export type PropertyIdParams = z.infer<typeof propertyIdParamsSchema>;
