'use client';

import { useCallback, useState } from 'react';
import { wrapIndex } from './carouselMath';

export type UseCarouselResult = {
  activeIndex: number;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
};

/**
 * Gère l'état d'index actif d'un carrousel générique.
 * @objectif Isole la logique de navigation (suivant/précédent/aller à) du
 * rendu, pour qu'elle soit testable sans monter de DOM et réutilisable sur
 * n'importe quelle liste de slides.
 * @note La navigation boucle via `wrapIndex` ; avec `itemCount` à 0 ou 1,
 * goNext/goPrev retombent toujours sur le même index (pas d'effet visible).
 */
export function useCarousel(itemCount: number): UseCarouselResult {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (index: number) => setActiveIndex(wrapIndex(index, itemCount)),
    [itemCount],
  );
  const goNext = useCallback(
    () => setActiveIndex((current) => wrapIndex(current + 1, itemCount)),
    [itemCount],
  );
  const goPrev = useCallback(
    () => setActiveIndex((current) => wrapIndex(current - 1, itemCount)),
    [itemCount],
  );

  return { activeIndex, goNext, goPrev, goTo };
}
