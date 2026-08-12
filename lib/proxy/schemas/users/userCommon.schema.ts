import { z } from 'zod';

/**
 * Schema commun aux routes /api/users/:id.
 * @route /api/users/:id
 */
export const userIdParamsSchema = z.object({
  id: z.string(),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;
