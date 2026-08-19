import { createProxyGetRoute } from '@/lib/proxy/createProxyRoute';
import { favoriteListResponseSchema } from '@/lib/proxy/schemas/favorites/favoriteList.schema';

export const GET = createProxyGetRoute({
  backendPath: (params: { id: string }) => `/api/users/${params.id}/favorites`,
  responseSchema: favoriteListResponseSchema,
});
