import { createProxyGetRoute, createProxyMutationRoute } from '@/lib/proxy/createProxyRoute';
import {
  conversationMessagesResponseSchema,
  sendMessageBodySchema,
} from '@/lib/proxy/schemas/conversations/conversationMessages.schema';
import { messageSchema } from '@/lib/proxy/schemas/messages/messageBase.schema';

export const GET = createProxyGetRoute({
  backendPath: (params: { id: string }) => `/api/conversations/${params.id}/messages`,
  responseSchema: conversationMessagesResponseSchema,
  requireAuth: true,
});

export const POST = createProxyMutationRoute({
  method: 'POST',
  backendPath: (params) => `/api/conversations/${params.id}/messages`,
  bodySchema: sendMessageBodySchema,
  responseSchema: messageSchema,
});
