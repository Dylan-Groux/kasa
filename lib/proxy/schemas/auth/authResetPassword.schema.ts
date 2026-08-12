import { z } from 'zod';

/**
 * Schema de réinitialisation de mot de passe pour la validation des données envoyées.
 * @route /auth/reset-password
 * @method POST
 * @body {token*, password*(≥6)}
 * @returns {AuthResetPasswordResponse} Confirmation de réinitialisation
 */
export const authResetPasswordBodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export const authResetPasswordResponseSchema = z.object({
  ok: z.boolean(),
});

export type AuthResetPasswordBody = z.infer<typeof authResetPasswordBodySchema>;
export type AuthResetPasswordResponse = z.infer<typeof authResetPasswordResponseSchema>;
