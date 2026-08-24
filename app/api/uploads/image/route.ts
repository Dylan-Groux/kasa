import { createProxyMultipartRoute, resolveBackendUrl } from '@/lib/proxy/createProxyRoute';
import { uploadImageResponseSchema } from '@/lib/proxy/schemas/uploads/uploadImage.schema';

export const POST = createProxyMultipartRoute({
  backendPath: '/api/uploads/image',
  responseSchema: uploadImageResponseSchema,
  // Le backend renvoie une URL relative à son propre domaine (ex: "/uploads/x.jpg") :
  // sans ça, <Image src={...}> irait la chercher sur le domaine du frontend.
  transformResponse: (data) => ({ ...data, url: resolveBackendUrl(data.url) }),
});
