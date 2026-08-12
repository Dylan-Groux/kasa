import { createProxyGetRoute } from '@/lib/proxy/createProxyRoute';
import { propertyListSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';

export const GET = createProxyGetRoute({
  backendPath: '/api/properties',
  responseSchema: propertyListSchema,
});