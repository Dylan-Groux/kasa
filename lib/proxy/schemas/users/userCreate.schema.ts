import { z } from 'zod';

import { userRoleSchema, userSchema } from './userBase.schema';

/**
 * Schema de création d'utilisateur pour la validation des données envoyées.
 * @route /api/users
 * @method POST
 * @body {name*, picture?, role?: owner|client|admin (def. client)}
 * @returns {UserCreateResponse} Utilisateur créé
 */
export const userCreateBodySchema = z.object({
  name: z.string().min(1),
  picture: z.string().nullable().optional(),
  role: userRoleSchema.optional(),
});

export const userCreateResponseSchema = userSchema;

export type UserCreateBody = z.infer<typeof userCreateBodySchema>;
export type UserCreateResponse = z.infer<typeof userCreateResponseSchema>;
