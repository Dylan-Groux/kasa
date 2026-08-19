import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropertyDetail } from '@/components/property/PropertyDetail';
import { getPropertyDetailBySlug } from '@/lib/data/properties';
import styles from './page.module.css';

export async function generateMetadata(props: PageProps<'/logement/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const property = await getPropertyDetailBySlug(slug);
  return { title: property ? `${property.title} - Kasa` : 'Logement introuvable - Kasa' };
}

export default async function LogementPage(props: PageProps<'/logement/[slug]'>) {
  const { slug } = await props.params;
  const property = await getPropertyDetailBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <PropertyDetail property={property} />
    </main>
  );
}
