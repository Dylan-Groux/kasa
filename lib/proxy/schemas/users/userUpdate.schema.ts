import { z } from 'zod';

import { userIdParamsSchema } from './userCommon.schema';
import { userRoleSchema, userSchema } from './userBase.schema';

/**
 * Schema de mise à jour d'utilisateur pour la validation des données envoyées.
 * `role: 'admin'` n'est pas restreint ici : le backend refuse cette valeur si
 * l'appelant n'est pas déjà admin, une règle qui dépend de l'identité de
 * l'appelant et ne peut pas être vérifiée par ce schéma.
 * @route /api/users/:id
 * @method PATCH
 * @body subset {name, picture, role} (≥1 champ)
 * @returns {UserUpdateResponse} Utilisateur mis à jour
 */
export const userUpdateBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    picture: z.string().nullable().optional(),
    role: userRoleSchema.optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.name !== undefined || value.picture !== undefined || value.role !== undefined,
    { message: 'Au moins un champ est requis pour la mise à jour' },
  );

export const userUpdateParamsSchema = userIdParamsSchema;
export const userUpdateResponseSchema = userSchema;

export type UserUpdateBody = z.infer<typeof userUpdateBodySchema>;
export type UserUpdateResponse = z.infer<typeof userUpdateResponseSchema>;
