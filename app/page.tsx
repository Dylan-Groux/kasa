import { Hero } from '@/components/home/Hero';
import { Gallery } from '@/components/home/Gallery';
import { HowItWorks } from '@/components/home/HowItWorks';
import { homeProperties } from '@/lib/data/properties';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Hero />
      <Gallery properties={homeProperties} />
      <HowItWorks />
    </main>
  );
}
