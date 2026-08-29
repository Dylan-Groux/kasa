import { z } from 'zod';

import { messageListSchema } from '../messages/messageBase.schema';

/**
 * Schema de la liste des messages d'une conversation: tableau plat trié
 * chronologiquement (ancien → récent), sans regroupement par jour côté
 * backend — le regroupement par date se fait côté front (voir
 * lib/messaging/groupMessagesByDay.ts) car le serveur ne connaît pas le
 * fuseau horaire du viewer.
 * @route /api/conversations/:conversationId/messages
 * @method GET
 * @returns {ConversationMessagesResponse} Les messages de la conversation
 */
export const conversationMessagesResponseSchema = z.object({
  conversation_id: z.string(),
  messages: messageListSchema,
});

/**
 * Body d'envoi d'un message: `content` seulement — senderId/receiverId ne
 * sont jamais fournis par le client, le backend les détermine à partir de
 * l'utilisateur authentifié et des participants de la conversation.
 */
export const sendMessageBodySchema = z.object({
  content: z.string().trim().min(1, 'Le message ne peut pas être vide.').max(2000),
});

export type ConversationMessagesResponse = z.infer<typeof conversationMessagesResponseSchema>;
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;
