'use client';

import { useRouter } from 'next/navigation';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { useAuth } from '@/lib/auth/AuthContext';
import { useFavorites } from '@/lib/favorites/FavoritesContext';
import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import styles from './FavoriteButton.module.css';

type FavoriteButtonProps = {
  property: PropertyBaseSchema;
};

export function FavoriteButton({ property }: FavoriteButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isFavorite, isPending, toggleFavorite } = useFavorites();
  const isFavorited = isFavorite(property.id);

  // Stops the click from bubbling to the card link underneath it.
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    toggleFavorite(property);
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      disabled={isPending(property.id)}
      aria-pressed={isFavorited}
      aria-label={
        isFavorited
          ? `Retirer ${property.title} des favoris`
          : `Ajouter ${property.title} aux favoris`
      }
    >
      <HeartIcon filled={isFavorited} className={styles.icon} />
    </button>
  );
}
