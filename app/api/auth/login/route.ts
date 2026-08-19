import { createProxyMutationRoute } from '@/lib/proxy/createProxyRoute';
import {
  authLoginBodySchema,
  authLoginResponseSchema,
} from '@/lib/proxy/schemas/auth/authLogin.schema';

export const POST = createProxyMutationRoute({
  method: 'POST',
  backendPath: '/auth/login',
  bodySchema: authLoginBodySchema,
  responseSchema: authLoginResponseSchema,
});
