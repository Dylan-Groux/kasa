import type { Metadata } from 'next';
import { FavoritesIntro } from '@/components/favorites/FavoritesIntro';
import { PropertyCardGrid } from '@/components/ui/PropertyCardGrid';
import { homeProperties } from '@/lib/data/properties';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Vos favoris - Kasa' };

// No backend yet: mimics an already-favorited subset of the listing mock.
const favoriteProperties = homeProperties.slice(0, 3);

export default function FavorisPage() {
  return (
    <main id="main-content" className={styles.main}>
      <FavoritesIntro />
      <PropertyCardGrid properties={favoriteProperties} initialFavorite />
    </main>
  );
}
