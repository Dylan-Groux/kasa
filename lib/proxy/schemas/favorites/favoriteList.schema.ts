import type { z } from 'zod';

import { propertyListSchema } from '../properties/propertyBase.schema';
import { userIdParamsSchema } from '../users/userCommon.schema';

/**
 * Schema de liste des favoris pour la validation de la réponse.
 * @route /api/users/:id/favorites
 * @method GET
 * @returns {FavoriteListResponse} Propriétés favorites de l'utilisateur
 */
export const favoriteListParamsSchema = userIdParamsSchema;

export const favoriteListResponseSchema = propertyListSchema;

export type FavoriteListResponse = z.infer<typeof favoriteListResponseSchema>;
