import {
  propertyListSchema,
  type PropertyBaseSchema,
} from '@/lib/proxy/schemas/properties/propertyBase.schema';
import {
  propertyDetailSchema,
  type PropertyDetailSchema,
} from '@/lib/proxy/schemas/properties/propertyDetail.schema';

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

export const homeProperties: PropertyBaseSchema[] = [
  {
    id: '1',
    slug: 'appartement-cosy',
    title: 'Appartement cosy',
    description:
      "Votre maison loin de chez vous. Que vous veniez de l'autre bout du monde, ou juste de quelques stations de RER, vous vous sentirez chez vous dans notre appartement.",
    cover: '/images/properties/property-1.jpg',
    location: 'Ile de France - Paris 17e',
    price_per_night: 100,
    rating_avg: 3,
    ratings_count: 12,
    host: { id: 1, name: 'Nathalie Jean', picture: '/images/hosts/avatar.jpg' },
  },
  {
    id: '2',
    slug: 'magnifique-appartement-canal-saint-martin',
    title: 'Magnifique appartement proche Canal Saint Martin',
    description: null,
    cover: '/images/properties/property-2.jpg',
    location: 'Ile de France - Paris 10e',
    price_per_night: 110,
    rating_avg: 4.9,
    ratings_count: 27,
    host: { id: 2, name: 'Marion', picture: null },
  },
  {
    id: '3',
    slug: 'studio-de-charme-buttes-chaumont',
    title: 'Studio de charme - Buttes Chaumont',
    description: null,
    cover: '/images/properties/property-3.jpg',
    location: 'Ile de France - Paris 20e',
    price_per_night: 120,
    rating_avg: 4.7,
    ratings_count: 9,
    host: { id: 3, name: 'Nicolas', picture: null },
  },
  {
    id: '4',
    slug: 'nid-douillet-11eme',
    title: 'Nid douillet au coeur du 11ème',
    description: null,
    cover: '/images/properties/property-4.jpg',
    location: 'Ile de France - Paris 11e',
    price_per_night: 130,
    rating_avg: 4.6,
    ratings_count: 18,
    host: { id: 4, name: 'Camille', picture: null },
  },
  {
    id: '5',
    slug: 'appartement-de-standing-10e',
    title: 'Appartement de Standing - 10e',
    description: null,
    cover: '/images/properties/property-5.jpg',
    location: 'Ile de France - Paris 10e',
    price_per_night: 140,
    rating_avg: 5,
    ratings_count: 6,
    host: { id: 5, name: 'Julien', picture: null },
  },
  {
    id: '6',
    slug: 'studio-artiste',
    title: "Studio d'artiste",
    description: null,
    cover: '/images/properties/property-6.jpg',
    location: 'Ile de France - Paris 18e',
    price_per_night: 150,
    rating_avg: 4.5,
    ratings_count: 15,
    host: { id: 6, name: 'Sophie', picture: null },
  },
];

/**
 * Fetches one property's full detail for `/logement/:slug`. The backend has
 * no slug-based lookup, so this resolves the id from the listing first, then
 * fetches `/api/properties/:id` for the pictures/equipments/tags the listing
 * doesn't carry. Any failure (network, bad shape, unknown slug) degrades to
 * `null` so the page can render its own not-found state.
 */
export async function getPropertyDetailBySlug(slug: string): Promise<PropertyDetailSchema | null> {
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    console.error('BACKEND_API_URL is not set');
    return null;
  }

  const properties = await getHomeProperties();
  const match = properties.find((property) => property.slug === slug);

  if (!match) {
    return null;
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl}/api/properties/${match.id}`, {
      next: { revalidate: 60 },
    });
  } catch (error) {
    console.error(`GET /api/properties/${match.id} unreachable`, error);
    return null;
  }

  if (!response.ok) {
    console.error(`GET /api/properties/${match.id} returned status ${response.status}`);
    return null;
  }

  const rawBody: unknown = await response.json();
  const parsed = propertyDetailSchema.safeParse(rawBody);

  if (!parsed.success) {
    console.error(
      `GET /api/properties/${match.id} response failed schema validation`,
      parsed.error,
    );
    return null;
  }

  return parsed.data;
}
