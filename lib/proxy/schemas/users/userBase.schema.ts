import { z } from 'zod';

/**
 * Schema utilisateur pour la validation des données utilisateur.
 * @route /api/users
 * @method GET
 * @returns {UserSchema[]} Liste des utilisateurs (aussi utilisé pour GET /api/users/:id)
 */
export const userRoleSchema = z.enum(['owner', 'client', 'admin']);

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  picture: z.string().nullable().optional(),
  role: userRoleSchema,
});

export const userListSchema = z.array(userSchema);

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserSchema = z.infer<typeof userSchema>;
