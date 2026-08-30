import { z } from 'zod';

/**
 * Forme réduite d'utilisateur pour "l'autre personne" côté messagerie
 * (expéditeur/destinataire, autre participant) — sans `role` : c'est une
 * notion d'autorisation, jamais exposée à propos d'un autre utilisateur.
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
