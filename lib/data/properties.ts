import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import type { PropertyDetailSchema } from '@/lib/proxy/schemas/properties/propertyDetail.schema';

/**
 * Homepage listing mock, shaped exactly like the `/api/properties` response
 * (see propertySchema) so the Gallery can be pointed at the real API later
 * without changing PropertyCard.
 */
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

const FALLBACK_EQUIPMENTS = ['Wifi', 'Cuisine équipée', 'Chauffage', 'Télévision'];
const FALLBACK_TAGS = ['Paris'];

/**
 * `/logement/:slug` mock, shaped like `/api/properties/:id` (propertyDetailSchema).
 * Only "appartement-cosy" mirrors the Figma detail frame exactly (pictures,
 * equipments, tags); the other listings fall back to their cover photo and a
 * generic amenity set so every homepage card still links to a working page.
 */
export const propertyDetails: PropertyDetailSchema[] = homeProperties.map((property) =>
  property.slug === 'appartement-cosy'
    ? {
        ...property,
        pictures: [
          '/images/properties/property-1.jpg',
          '/images/properties/thumb-2.jpg',
          '/images/properties/thumb-3.jpg',
          '/images/properties/thumb-4.jpg',
          '/images/properties/thumb-5.jpg',
        ],
        equipments: [
          'Cafetière',
          'Bouilloire',
          'Vaisselle',
          'Micro-onde',
          'Sèche-linge',
          'Sèche Cheveux',
          'Lit pour bébé',
          'Télévision',
        ],
        tags: ['Batignolle', 'Montmartre'],
      }
    : {
        ...property,
        pictures: [property.cover ?? ''],
        equipments: FALLBACK_EQUIPMENTS,
        tags: FALLBACK_TAGS,
      },
);

// Detail pages are looked up by slug (the public URL segment) rather than id.
export function getPropertyDetailBySlug(slug: string): PropertyDetailSchema | undefined {
  return propertyDetails.find((property) => property.slug === slug);
}
