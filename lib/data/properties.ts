import {
  propertyListSchema,
  type PropertyBaseSchema,
} from '@/lib/proxy/schemas/properties/propertyBase.schema';

/**
 * Fetches the homepage listing straight from the backend. Runs in a Server
 * Component, so it talks to BACKEND_API_URL directly instead of bouncing
 * through our own /api/properties proxy route. Any failure (network, bad
 * shape) degrades to an empty list rather than crashing the homepage.
 */
export async function getHomeProperties(): Promise<PropertyBaseSchema[]> {
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    console.error('BACKEND_API_URL is not set');
    return [];
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl}/api/properties`, { next: { revalidate: 60 } });
  } catch (error) {
    console.error('GET /api/properties unreachable', error);
    return [];
  }

  if (!response.ok) {
    console.error(`GET /api/properties returned status ${response.status}`);
    return [];
  }

  const rawBody: unknown = await response.json();
  const parsed = propertyListSchema.safeParse(rawBody);

  if (!parsed.success) {
    console.error('GET /api/properties response failed schema validation', parsed.error);
    return [];
  }

  return parsed.data;
}
