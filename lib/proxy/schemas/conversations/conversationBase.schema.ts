import { z } from 'zod';

import { messageParticipantSchema } from '../messages/messageBase.schema';

/**
 * Schema de conversation pour la validation de la liste des conversations.
 * `id` est une string (UUID/CUID côté backend) et non un entier auto-increment:
 * exposé dans l'URL pour le deep-link /messagerie/:id, un id séquentiel serait
 * énumérable (IDOR).
 * @route /api/conversations
 * @method GET, POST
 * @returns {ConversationSchema} Une conversation avec l'autre participant et son dernier message
 */
export const conversationSchema = z.object({
  id: z.string(),
  other_participant: messageParticipantSchema,
  last_message: z
    .object({
      content: z.string(),
      created_at: z.string(),
      sender_id: z.number(),
    })
    .nullable(),
  updated_at: z.string(),
});

export const conversationListSchema = z.array(conversationSchema);

export type ConversationSchema = z.infer<typeof conversationSchema>;
