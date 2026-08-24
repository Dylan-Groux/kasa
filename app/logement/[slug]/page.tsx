import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropertyDetail } from '@/components/property/PropertyDetail';
import { getPropertyDetailBySlug } from '@/lib/data/properties';
import { jsonLdScriptProps } from '@/lib/seo/jsonLd';
import { SITE_URL } from '@/lib/seo/site';
import styles from './page.module.css';

export async function generateMetadata(props: PageProps<'/logement/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const property = await getPropertyDetailBySlug(slug);

  if (!property) {
    return { title: 'Logement introuvable', robots: { index: false, follow: false } };
  }

  const locationSuffix = property.location ? ` (${property.location})` : '';
  const description =
    property.description ?? `${property.title} - Logement disponible sur Kasa${locationSuffix}.`;

  return {
    title: property.title,
    description,
    alternates: { canonical: `/logement/${slug}` },
    openGraph: property.pictures[0]
      ? { title: property.title, images: [{ url: property.pictures[0] }] }
      : undefined,
  };
}

export default async function LogementPage(props: PageProps<'/logement/[slug]'>) {
  const { slug } = await props.params;
  const property = await getPropertyDetailBySlug(slug);

  if (!property) {
    notFound();
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title,
    description: property.description ?? undefined,
    image: property.pictures.length > 0 ? property.pictures : undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/logement/${slug}`,
      price: property.price_per_night,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    ...(property.ratings_count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: property.rating_avg,
            reviewCount: property.ratings_count,
          },
        }
      : {}),
  };

  return (
    <main className={styles.main}>
      <script type="application/ld+json" {...jsonLdScriptProps(productJsonLd)} />
      <PropertyDetail property={property} />
    </main>
  );
}
