import { Hero } from '@/components/home/Hero';
import { Gallery } from '@/components/home/Gallery';
import { HowItWorks } from '@/components/home/HowItWorks';
import { getHomeProperties } from '@/lib/data/properties';
import styles from './page.module.css';

export default async function Home() {
  const properties = await getHomeProperties();

  return (
    <main id="main-content" className={styles.main}>
      <Hero />
      <Gallery properties={properties} />
      <HowItWorks />
    </main>
  );
}
