'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/AuthContext';
import { userUpdateResponseSchema } from '@/lib/proxy/schemas/users/userUpdate.schema';
import { AddPropertyForm } from './AddPropertyForm';
import styles from './AddPropertyGate.module.css';

// Seuls les comptes owner/admin peuvent créer une propriété (imposé par le
// backend). Un compte client voit un moyen de changer de rôle plutôt qu'un
// formulaire qui échouerait en 403 à la soumission.
export function AddPropertyGate() {
  const { session } = useAuth();

  if (session && session.user.role === 'client') {
    return <BecomeOwnerPrompt />;
  }

  return <AddPropertyForm />;
}

type Status = 'idle' | 'loading' | 'error' | 'success';

function BecomeOwnerPrompt() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  /**
   * @route /api/users/:id
   * @method PATCH
   */
  async function handleBecomeOwner() {
    if (!session) {
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ role: 'owner' }),
      });

      const rawBody: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof rawBody === 'object' && rawBody && 'error' in rawBody
            ? String((rawBody as { error: unknown }).error)
            : 'Impossible de mettre à jour votre compte.';
        setError(message);
        setStatus('error');
        return;
      }

      userUpdateResponseSchema.parse(rawBody);
      setStatus('success');
    } catch {
      setError('Impossible de mettre à jour votre compte. Réessayez plus tard.');
      setStatus('error');
    }
  }

  // Le rôle vient de changer côté backend, mais il est aussi figé dans le
  // JWT déjà détenu par cette session — seule une reconnexion émet un token
  // avec le nouveau rôle, donc le changement ne peut pas être transparent.
  function handleReconnect() {
    logout();
    router.push('/login');
  }

  if (status === 'success') {
    return (
      <div className={styles.wrapper}>
        <p className={styles.text}>
          Votre compte est maintenant un compte propriétaire. Reconnectez-vous pour continuer.
        </p>
        <Button variant="brand" onClick={handleReconnect}>
          Se reconnecter
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.text}>
        Seuls les comptes propriétaire peuvent ajouter un logement. Vous pouvez transformer votre
        compte en compte propriétaire à tout moment.
      </p>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <Button variant="brand" onClick={handleBecomeOwner} disabled={status === 'loading'}>
        {status === 'loading' ? 'Mise à jour...' : 'Devenir vendeur'}
      </Button>
    </div>
  );
}
