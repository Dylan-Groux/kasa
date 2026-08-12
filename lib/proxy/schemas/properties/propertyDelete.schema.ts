import { noContentSchema, propertyIdParamsSchema } from './propertyCommon.schema';

/**
 * Schémas de suppression d'une propriété.
 * @route /api/properties/:id
 * @method DELETE
 * @returns {void} Réponse 204 sans contenu
 */
export const propertyDeleteParamsSchema = propertyIdParamsSchema;
export const propertyDeleteResponseSchema = noContentSchema;
