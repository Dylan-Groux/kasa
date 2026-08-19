'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AuthLoginResponse } from '@/lib/proxy/schemas/auth/authLogin.schema';

type AuthSession = AuthLoginResponse;

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Holds the logged-in session (token + user, shaped like POST /auth/login's
 * response) in memory only — no localStorage/cookies, so it resets on every
 * full page reload. Swap for a persisted store later without touching
 * consumers, since they only ever go through `useAuth()`.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  const login = useCallback((next: AuthSession) => {
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAuthenticated: session !== null, login, logout }),
    [session, login, logout],
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
