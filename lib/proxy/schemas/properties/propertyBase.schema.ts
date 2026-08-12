import { z } from 'zod';

/**
 * Schéma de base d'une propriété (liste).
 * @route /api/properties
 * @method GET
 * @returns {PropertyBaseSchema} Propriété de base
 */
export const propertySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  cover: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  price_per_night: z.number(),
  rating_avg: z.number(),
  ratings_count: z.number(),
  host: z.object({
    id: z.number(),
    name: z.string(),
    picture: z.string().nullable().optional(),
  }),
});

export const propertyListSchema = z.array(propertySchema);

export type PropertyBaseSchema = z.infer<typeof propertySchema>;
