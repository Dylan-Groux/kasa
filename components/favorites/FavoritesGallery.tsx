'use client';

import { PropertyCardGrid } from '@/components/ui/PropertyCardGrid';
import { useFavorites } from '@/lib/favorites/FavoritesContext';
import styles from './FavoritesGallery.module.css';

export function FavoritesGallery() {
  const { favorites, isLoading } = useFavorites();

  if (!isLoading && favorites.length === 0) {
    return <p className={styles.empty}>Vous n&apos;avez pas encore de favoris.</p>;
  }

  return <PropertyCardGrid properties={favorites} />;
}
