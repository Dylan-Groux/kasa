'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

type RequireAuthProps = {
  children: React.ReactNode;
};

/**
 * Client-side guard: the session lives in memory only (see AuthProvider), so
 * there's no cookie a server middleware could check on a hard navigation —
 * gating has to happen here, after the provider has mounted. Redirects to
 * /login and renders nothing until an authenticated session is confirmed.
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
