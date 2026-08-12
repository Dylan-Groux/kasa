import { z } from 'zod';

import { userSchema } from '../users/userBase.schema';

/**
 * Schema d'avis pour la validation des données d'avis.
 * @route /api/properties/:id/ratings
 * @method GET
 * @returns {RatingSchema[]} Liste des avis de la propriété
 */
export const ratingSchema = z.object({
  id: z.number(),
  score: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
  created_at: z.string(),
  user: userSchema,
});

export const ratingListSchema = z.array(ratingSchema);

export type RatingSchema = z.infer<typeof ratingSchema>;
