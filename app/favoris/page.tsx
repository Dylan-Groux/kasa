import type { Metadata } from 'next';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { FavoritesGallery } from '@/components/favorites/FavoritesGallery';
import { FavoritesIntro } from '@/components/favorites/FavoritesIntro';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Vos favoris',
  robots: { index: false, follow: false },
};

export default function FavorisPage() {
  return (
    <RequireAuth>
      <main className={styles.main}>
        <FavoritesIntro />
        <FavoritesGallery />
      </main>
    </RequireAuth>
  );
}
