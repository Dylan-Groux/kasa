import { z } from 'zod';

import { propertyIdParamsSchema } from '../properties/propertyCommon.schema';

/**
 * Schema d'ajout aux favoris pour la validation de la réponse.
 * @route /api/properties/:id/favorite
 * @method POST
 * @returns {FavoriteAddResponse} Confirmation idempotente
 */
export const favoriteAddParamsSchema = propertyIdParamsSchema;

export const favoriteAddResponseSchema = z.object({
  ok: z.boolean(),
});

export type FavoriteAddResponse = z.infer<typeof favoriteAddResponseSchema>;
