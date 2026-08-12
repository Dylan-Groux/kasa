import { z } from 'zod';

import { authUserSchema } from './authCommon.schema';

/**
 * Schema d'inscription pour la validation des données d'inscription.
 * @route /auth/register
 * @method POST
 * @body {name*, email*, password*(≥6), picture?, role?: 'owner'|'client'}
 * @returns {AuthRegisterResponse} Token et utilisateur créé
 */
export const authRegisterBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  picture: z.string().nullable().optional(),
  role: z.enum(['owner', 'client']).optional(),
});

export const authRegisterResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
});

export type AuthRegisterBody = z.infer<typeof authRegisterBodySchema>;
export type AuthRegisterResponse = z.infer<typeof authRegisterResponseSchema>;
