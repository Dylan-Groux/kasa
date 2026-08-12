import { z } from 'zod';

import { propertyDetailSchema } from './propertyDetail.schema';

/**
 * Schéma du body de mise à jour d'une propriété.
 * @route /api/properties/:id
 * @method PATCH
 * @returns {PropertyUpdateBody} Body validé
 */
export const propertyUpdateBodySchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    cover: z.string().optional(),
    location: z.string().optional(),
    host_id: z.number().int().positive().optional(),
    price_per_night: z.number().nonnegative().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.cover !== undefined ||
      value.location !== undefined ||
      value.host_id !== undefined ||
      value.price_per_night !== undefined,
    {
      message: 'Au moins un champ est requis pour la mise à jour',
    },
  );

/**
 * Schéma de réponse de mise à jour d'une propriété.
 * @route /api/properties/:id
 * @method PATCH
 * @returns {PropertyUpdateResponse} Détail de la propriété mise à jour
 */
export const propertyUpdateResponseSchema = propertyDetailSchema;

export type PropertyUpdateBody = z.infer<typeof propertyUpdateBodySchema>;
export type PropertyUpdateResponse = z.infer<typeof propertyUpdateResponseSchema>;
