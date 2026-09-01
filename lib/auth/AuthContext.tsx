'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AuthLoginResponse } from '@/lib/proxy/schemas/auth/authLogin.schema';

type AuthSession = AuthLoginResponse;

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  updateUser: (patch: Partial<Pick<AuthSession['user'], 'name' | 'picture'>>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Fonction de contexte pour l'authentification.
 * @objectif Garde la session (token + user, même forme que la réponse de
 * @route POST /auth/login) en mémoire uniquement — pas de localStorage/cookies,
 * @note donc reset à chaque reload complet. Remplaçable par un store persisté
 * plus tard sans toucher aux consommateurs, qui passent tous par `useAuth()`.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  const login = useCallback((next: AuthSession) => {
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  /**
   * @note Met à jour name/picture localement après un PATCH /api/users/:id
   * réussi, sans repasser par login() — contrairement au rôle, ni l'un ni
   * l'autre n'est figé dans le JWT côté usage front, donc pas besoin de
   * reconnexion pour que le reste de l'app (Navbar, etc.) les reflète.
   */
  const updateUser = useCallback(
    (patch: Partial<Pick<AuthSession['user'], 'name' | 'picture'>>) => {
      setSession((current) =>
        current ? { ...current, user: { ...current.user, ...patch } } : current,
      );
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAuthenticated: session !== null, login, logout, updateUser }),
    [session, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
