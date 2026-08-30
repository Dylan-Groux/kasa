'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { favoriteListResponseSchema } from '@/lib/proxy/schemas/favorites/favoriteList.schema';
import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';

type FavoritesContextValue = {
  favorites: PropertyBaseSchema[];
  isLoading: boolean;
  isFavorite: (propertyId: string) => boolean;
  isPending: (propertyId: string) => boolean;
  toggleFavorite: (property: PropertyBaseSchema) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/**
 * Source unique des favoris de l'utilisateur, partagée par tous les
 * FavoriteButton et par la page /favoris (contient des PropertyBase
 * complets, pas juste des ids, pour éviter un second fetch). Charge la
 * liste dès qu'une session existe et la vide au logout — le token vit en
 * mémoire uniquement (voir AuthContext), impossible à fetch côté serveur.
 *
 * Le toggle est optimiste : l'UI change immédiatement et ne revient en
 * arrière que si l'appel backend échoue vraiment. Les endpoints favoris
 * sont idempotents ({ok:true} peu importe l'état précédent), donc le seul
 * garde-fou nécessaire est de bloquer un second clic pendant qu'un premier
 * est en cours.
 */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [favorites, setFavorites] = useState<PropertyBaseSchema[]>([]);
  // Loading dérivé plutôt qu'un flag séparé mis à jour via setState dans
  // l'effect : vrai tant qu'une session existe sans que son token ait fini de fetch.
  const [loadedForToken, setLoadedForToken] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const isLoading = session !== null && loadedForToken !== session.token;

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    /**
     * @route /api/users/:id/favorites
     * @method GET
     */
    function fetchFavorites() {
      if (!session) {
        return;
      }

      fetch(`/api/users/${session.user.id}/favorites`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
        .then((response) => (response.ok ? response.json() : Promise.reject(response)))
        .then((rawBody: unknown) => {
          const parsed = favoriteListResponseSchema.safeParse(rawBody);
          if (!cancelled && parsed.success) {
            setFavorites(parsed.data);
          }
        })
        .catch((error: unknown) => {
          console.error('GET /api/users/:id/favorites failed', error);
        })
        .finally(() => {
          if (!cancelled) {
            setLoadedForToken(session.token);
          }
        });
    }

    fetchFavorites();

    return () => {
      cancelled = true;
    };
  }, [session]);

  /**
   * @route /api/properties/:id/favorite
   * @method POST, DELETE
   */
  const toggleFavorite = useCallback(
    (property: PropertyBaseSchema) => {
      if (!session || pendingIds.has(property.id)) {
        return;
      }

      const wasFavorite = favorites.some((favorite) => favorite.id === property.id);

      setFavorites((current) =>
        wasFavorite
          ? current.filter((favorite) => favorite.id !== property.id)
          : [...current, property],
      );
      setPendingIds((current) => new Set(current).add(property.id));

      fetch(`/api/properties/${property.id}/favorite`, {
        method: wasFavorite ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Favorite toggle failed with status ${response.status}`);
          }
        })
        .catch((error: unknown) => {
          console.error('Favorite toggle failed, rolling back', error);
          setFavorites((current) =>
            wasFavorite
              ? [...current, property]
              : current.filter((favorite) => favorite.id !== property.id),
          );
        })
        .finally(() => {
          setPendingIds((current) => {
            const next = new Set(current);
            next.delete(property.id);
            return next;
          });
        });
    },
    [session, favorites, pendingIds],
  );

  const value = useMemo<FavoritesContextValue>(() => {
    // La liste exposée dépend de `session` (plutôt qu'un reset de
    // `favorites` au logout) pour qu'un changement de token ne laisse pas
    // fuiter brièvement les favoris du user précédent avant le nouveau fetch.
    const activeFavorites = session ? favorites : [];

    return {
      favorites: activeFavorites,
      isLoading,
      isFavorite: (propertyId) => activeFavorites.some((favorite) => favorite.id === propertyId),
      isPending: (propertyId) => pendingIds.has(propertyId),
      toggleFavorite,
    };
  }, [session, favorites, isLoading, pendingIds, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
