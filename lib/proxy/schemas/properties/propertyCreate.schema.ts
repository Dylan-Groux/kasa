import { z } from 'zod';

import { propertyDetailSchema } from './propertyDetail.schema';

const createHostSchema = z.object({
  name: z.string().min(1),
  picture: z.string().nullable().optional(),
});

/**
 * Schéma du body de création d'une propriété.
 * @route /api/properties
 * @method POST
 * @returns {PropertyCreateBody} Body validé
 */
export const propertyCreateBodySchema = z
  .object({
    id: z.string().min(1).optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    cover: z.string().optional(),
    location: z.string().optional(),
    price_per_night: z.number().nonnegative().optional(),
    host_id: z.number().int().positive().optional(),
    host: createHostSchema.optional(),
    pictures: z.array(z.string()).optional(),
    equipments: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine((value) => value.host_id !== undefined || value.host !== undefined, {
    message: 'host_id ou host est obligatoire',
    path: ['host_id'],
  });

/**
 * Schéma de réponse de création d'une propriété.
 * @route /api/properties
 * @method POST
 * @returns {PropertyCreateResponse} Détail de la propriété créée
 */
export const propertyCreateResponseSchema = propertyDetailSchema;

export type PropertyCreateBody = z.infer<typeof propertyCreateBodySchema>;
export type PropertyCreateResponse = z.infer<typeof propertyCreateResponseSchema>;
