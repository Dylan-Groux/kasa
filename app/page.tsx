import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { Gallery } from '@/components/home/Gallery';
import { HowItWorks } from '@/components/home/HowItWorks';
import { getHomeProperties } from '@/lib/data/properties';
import styles from './page.module.css';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function Home() {
  const properties = await getHomeProperties();

  return (
    <main className={styles.main}>
      <Hero />
      <Gallery properties={properties} />
      <HowItWorks />
    </main>
  );
}
