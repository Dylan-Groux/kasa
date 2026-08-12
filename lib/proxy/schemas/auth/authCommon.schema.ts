import { z } from 'zod';

/**
 * Schema utilisateur commun aux réponses d'authentification.
 * @route /auth/register, /auth/login
 * @returns {AuthUserSchema} Utilisateur authentifié
 */
export const authUserRoleSchema = z.enum(['owner', 'client', 'admin']);

export const authUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().nullable().optional(),
  picture: z.string().nullable().optional(),
  role: authUserRoleSchema,
});

export type AuthUserRole = z.infer<typeof authUserRoleSchema>;
export type AuthUserSchema = z.infer<typeof authUserSchema>;
