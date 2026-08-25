import { createProxyGetRoute, createProxyMutationRoute } from '@/lib/proxy/createProxyRoute';
import { propertyListSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import {
  propertyCreateBodySchema,
  propertyCreateResponseSchema,
} from '@/lib/proxy/schemas/properties/propertyCreate.schema';

export const GET = createProxyGetRoute({
  backendPath: '/api/properties',
  responseSchema: propertyListSchema,
});

export const POST = createProxyMutationRoute({
  method: 'POST',
  backendPath: '/api/properties',
  bodySchema: propertyCreateBodySchema,
  responseSchema: propertyCreateResponseSchema,
});
