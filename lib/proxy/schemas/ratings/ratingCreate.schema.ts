import { z } from 'zod';

import { propertyIdParamsSchema } from '../properties/propertyCommon.schema';
import { ratingSchema } from './ratingBase.schema';

/**
 * Schema de création d'avis pour la validation des données envoyées.
 * @route /api/properties/:id/ratings
 * @method POST
 * @body {user_id*, score*(entier 1-5), comment?}
 * @returns {RatingCreateResponse} Moyenne, nombre et liste des avis mis à jour
 */
export const ratingCreateBodySchema = z.object({
  user_id: z.number(),
  score: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const ratingCreateParamsSchema = propertyIdParamsSchema;

export const ratingCreateResponseSchema = z.object({
  rating_avg: z.number(),
  ratings_count: z.number(),
  ratings: z.array(ratingSchema),
});

export type RatingCreateBody = z.infer<typeof ratingCreateBodySchema>;
export type RatingCreateResponse = z.infer<typeof ratingCreateResponseSchema>;
