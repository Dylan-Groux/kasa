import { z } from 'zod';

/**
 * Schema d'upload d'image. Le body est multipart/form-data : Zod valide ici
 * les champs texte du formulaire et la réponse, pas le fichier binaire lui-même
 * (type MIME / taille ≤10MB), vérifié côté backend par `multer`.
 * @route /api/uploads/image
 * @method POST
 * @body multipart/form-data {file*, purpose?, property_id?}
 * @returns {UploadImageResponse} Métadonnées du fichier uploadé
 */
export const uploadImagePurposeSchema = z.enum([
  'property-cover',
  'property-picture',
  'user-picture',
  'other',
]);

export const uploadImageFieldsSchema = z.object({
  purpose: uploadImagePurposeSchema.optional(),
  property_id: z.string().optional(),
});

export const uploadImageResponseSchema = z.object({
  url: z.string(),
  filename: z.string().optional(),
  size: z.number().optional(),
  mimetype: z.string().optional(),
  purpose: uploadImagePurposeSchema.nullable().optional(),
  property_id: z.string().nullable().optional(),
  instructions: z.string().optional(),
});

export type UploadImagePurpose = z.infer<typeof uploadImagePurposeSchema>;
export type UploadImageFields = z.infer<typeof uploadImageFieldsSchema>;
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;
