import { createProxyGetRoute, createProxyMutationRoute } from '@/lib/proxy/createProxyRoute';
import {
  createConversationBodySchema,
  createConversationResponseSchema,
} from '@/lib/proxy/schemas/conversations/createConversation.schema';
import { conversationListSchema } from '@/lib/proxy/schemas/conversations/conversationBase.schema';

export const GET = createProxyGetRoute({
  backendPath: '/api/conversations',
  responseSchema: conversationListSchema,
  requireAuth: true,
});

export const POST = createProxyMutationRoute({
  method: 'POST',
  backendPath: '/api/conversations',
  bodySchema: createConversationBodySchema,
  responseSchema: createConversationResponseSchema,
});
