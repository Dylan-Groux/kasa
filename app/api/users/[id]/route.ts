import { createProxyMutationRoute } from '@/lib/proxy/createProxyRoute';
import {
  userUpdateBodySchema,
  userUpdateResponseSchema,
} from '@/lib/proxy/schemas/users/userUpdate.schema';

export const PATCH = createProxyMutationRoute({
  method: 'PATCH',
  backendPath: (params) => `/api/users/${params.id}`,
  bodySchema: userUpdateBodySchema,
  responseSchema: userUpdateResponseSchema,
});
