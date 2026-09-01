const SWIPE_THRESHOLD_PX = 40;

/**
 * Ramène un index hors bornes dans l'intervalle [0, length) en bouclant.
 * @objectif Permet une navigation cyclique (précédent depuis le premier
 * élément revient au dernier, suivant depuis le dernier revient au premier)
 * sans que les appelants aient à gérer les cas limites eux-mêmes.
 * @note `length <= 0` renvoie toujours 0 (rien à boucler dessus).
 */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  return ((index % length) + length) % length;
}

export type SwipeDirection = 'prev' | 'next' | null;

/**
 * Détermine si un déplacement horizontal (pointeur/tactile) doit déclencher
 * un changement de slide.
 * @objectif Centralise le seuil de déclenchement pour que le drag pointeur
 * et les tests restent cohérents entre eux.
 * @note Sous le seuil, renvoie `null` (aucun changement) pour distinguer un
 * simple clic d'un vrai geste de balayage.
 */
export function resolveSwipeDirection(deltaX: number): SwipeDirection {
  if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
    return null;
  }
  return deltaX > 0 ? 'prev' : 'next';
}
