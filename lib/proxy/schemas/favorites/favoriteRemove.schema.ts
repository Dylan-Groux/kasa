import { z } from 'zod';

import { propertyIdParamsSchema } from '../properties/propertyCommon.schema';

/**
 * Schema de retrait des favoris pour la validation de la réponse.
 * @route /api/properties/:id/favorite
 * @method DELETE
 * @returns {FavoriteRemoveResponse} Confirmation idempotente
 */
export const favoriteRemoveParamsSchema = propertyIdParamsSchema;

export const favoriteRemoveResponseSchema = z.object({
  ok: z.boolean(),
});

export type FavoriteRemoveResponse = z.infer<typeof favoriteRemoveResponseSchema>;
