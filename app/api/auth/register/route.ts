import { createProxyMutationRoute } from '@/lib/proxy/createProxyRoute';
import {
  authRegisterBodySchema,
  authRegisterResponseSchema,
} from '@/lib/proxy/schemas/auth/authRegister.schema';

export const POST = createProxyMutationRoute({
  method: 'POST',
  backendPath: '/auth/register',
  bodySchema: authRegisterBodySchema,
  responseSchema: authRegisterResponseSchema,
});
