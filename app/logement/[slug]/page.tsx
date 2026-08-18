import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropertyDetail } from '@/components/property/PropertyDetail';
import { getPropertyDetailBySlug, propertyDetails } from '@/lib/data/properties';
import styles from './page.module.css';

export function generateStaticParams() {
  return propertyDetails.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata(props: PageProps<'/logement/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const property = getPropertyDetailBySlug(slug);
  return { title: property ? `${property.title} - Kasa` : 'Logement introuvable - Kasa' };
}

export default async function LogementPage(props: PageProps<'/logement/[slug]'>) {
  const { slug } = await props.params;
  const property = getPropertyDetailBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <PropertyDetail property={property} />
    </main>
  );
}
