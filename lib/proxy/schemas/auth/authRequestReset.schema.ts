import { z } from 'zod';

/**
 * Schema de demande de réinitialisation pour la validation des données envoyées.
 * @route /auth/request-reset
 * @method POST
 * @body {email*}
 * @returns {AuthRequestResetResponse} Toujours 200 (anti-enumeration)
 */
export const authRequestResetBodySchema = z.object({
  email: z.string().email(),
});

export const authRequestResetResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
  token: z.string().optional(),
});

export type AuthRequestResetBody = z.infer<typeof authRequestResetBodySchema>;
export type AuthRequestResetResponse = z.infer<typeof authRequestResetResponseSchema>;
