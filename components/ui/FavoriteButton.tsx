'use client';

import { useState } from 'react';
import { HeartIcon } from '@/components/icons/HeartIcon';
import styles from './FavoriteButton.module.css';

type FavoriteButtonProps = {
  propertyTitle: string;
};

export function FavoriteButton({ propertyTitle }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Stops the click from bubbling to the card link underneath it.
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsFavorite((current) => !current);
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite ? `Retirer ${propertyTitle} des favoris` : `Ajouter ${propertyTitle} aux favoris`
      }
    >
      <HeartIcon filled={isFavorite} className={styles.icon} />
    </button>
  );
}
