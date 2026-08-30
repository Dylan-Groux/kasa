'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

type RequireAuthProps = {
  children: React.ReactNode;
};

/**
 * Garde côté client : la session vit uniquement en mémoire (voir AuthProvider),
 * donc pas de cookie qu'un middleware serveur pourrait vérifier au chargement —
 * le contrôle doit se faire ici, une fois le provider monté. Redirige vers
 * /login et n'affiche rien tant que la session n'est pas confirmée.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
