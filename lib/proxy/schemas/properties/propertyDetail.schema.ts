import { z } from 'zod';
import { propertySchema as propertyBaseSchema } from './propertyBase.schema';

/**
 * Schéma détaillé d'une propriété (base + pictures/equipments/tags).
 * @route /api/properties/:id
 * @method GET
 * @returns {PropertyDetailSchema} Détails d'une propriété
 */
export const propertyDetailSchema = propertyBaseSchema.extend({
    pictures: z.array(z.string()),
    equipments: z.array(z.string()),
    tags: z.array(z.string()),
});

export const propertyDetailListSchema = z.array(propertyDetailSchema);

export type PropertyDetailSchema = z.infer<typeof propertyDetailSchema>;