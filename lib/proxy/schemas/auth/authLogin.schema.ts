import { z } from 'zod';

import { authUserSchema } from './authCommon.schema';

/**
 * Schema de connexion pour la validation des données de connexion.
 * @route /auth/login
 * @method POST
 * @body {email*, password*}
 * @returns {AuthLoginResponse} Token et utilisateur authentifié
 */
export const authLoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authLoginResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
});

export type AuthLoginBody = z.infer<typeof authLoginBodySchema>;
export type AuthLoginResponse = z.infer<typeof authLoginResponseSchema>;
