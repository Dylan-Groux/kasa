import { z } from 'zod';

/**
 * Schema de suppression d'images pour la validation des données envoyées.
 * @route /api/uploads/images
 * @method DELETE
 * @body {filenames?[], urls?[], filename?, url?}
 * @returns {UploadDeleteImagesResponse} Résultat détaillé de la suppression (200 ou 207 partiel)
 */
export const uploadDeleteImagesBodySchema = z.object({
  filenames: z.array(z.string()).optional(),
  urls: z.array(z.string()).optional(),
  filename: z.string().optional(),
  url: z.string().optional(),
});

export const uploadDeleteImagesResponseSchema = z.object({
  ok: z.boolean(),
  deleted: z.array(z.string()),
  not_found: z.array(z.string()),
  errors: z.array(z.object({ filename: z.string(), error: z.string() })),
  results: z.array(z.unknown()),
});

export type UploadDeleteImagesBody = z.infer<typeof uploadDeleteImagesBodySchema>;
export type UploadDeleteImagesResponse = z.infer<typeof uploadDeleteImagesResponseSchema>;
