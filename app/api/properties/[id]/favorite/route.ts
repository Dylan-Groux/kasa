import { createProxyActionRoute } from '@/lib/proxy/createProxyRoute';
import { favoriteAddResponseSchema } from '@/lib/proxy/schemas/favorites/favoriteAdd.schema';
import { favoriteRemoveResponseSchema } from '@/lib/proxy/schemas/favorites/favoriteRemove.schema';

const backendPath = (params: { id: string }) => `/api/properties/${params.id}/favorite`;

export const POST = createProxyActionRoute({
  method: 'POST',
  backendPath,
  responseSchema: favoriteAddResponseSchema,
});

export const DELETE = createProxyActionRoute({
  method: 'DELETE',
  backendPath,
  responseSchema: favoriteRemoveResponseSchema,
});
