import { z } from 'zod';

import { messageParticipantSchema } from '../messages/messageBase.schema';

/**
 * Schema de création (find-or-create) d'une conversation avec un participant.
 * @route /api/conversations
 * @method POST
 * @returns {CreateConversationResponse} La conversation existante ou nouvellement créée
 */
export const createConversationBodySchema = z.object({
  participant_id: z.number(),
});

export const createConversationResponseSchema = z.object({
  id: z.string(),
  other_participant: messageParticipantSchema,
  created_at: z.string(),
});

export type CreateConversationBody = z.infer<typeof createConversationBodySchema>;
export type CreateConversationResponse = z.infer<typeof createConversationResponseSchema>;
