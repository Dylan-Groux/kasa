import { z } from 'zod';

/**
 * Trimmed user shape used wherever the messaging API references "the other
 * person" (message sender/receiver, a conversation's other participant) —
 * same shape as `propertyBase.schema.ts`'s `host`, without `role`: role is
 * an authz concept, never exposed about a different user than yourself.
 */
export const messageParticipantSchema = z.object({
  id: z.number(),
  name: z.string(),
  picture: z.string().nullable().optional(),
});

/**
 * Schema de message pour la validation des données de messagerie.
 * @route /api/conversations/:conversationId/messages
 * @method GET, POST
 * @returns {MessageSchema} Un message avec expéditeur/destinataire enrichis (nom + photo)
 */
export const messageSchema = z.object({
  id: z.string(),
  conversation_id: z.string().optional(),
  content: z.string(),
  sender: messageParticipantSchema,
  receiver: messageParticipantSchema,
  created_at: z.string(),
});

export const messageListSchema = z.array(messageSchema);

export type MessageSchema = z.infer<typeof messageSchema>;
