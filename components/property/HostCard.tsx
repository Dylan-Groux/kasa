'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StarIcon } from '@/components/icons/StarIcon';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/AuthContext';
import { extractErrorMessage } from '@/lib/http/extractErrorMessage';
import { createConversationResponseSchema } from '@/lib/proxy/schemas/conversations/createConversation.schema';
import type { PropertyDetailSchema } from '@/lib/proxy/schemas/properties/propertyDetail.schema';
import styles from './HostCard.module.css';

type HostCardProps = {
  host: PropertyDetailSchema['host'];
  rating: number;
};

export function HostCard({ host, rating }: HostCardProps) {
  const router = useRouter();
  const { session, isAuthenticated } = useAuth();
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Masque les boutons quand l'utilisateur connecté est lui-même l'hôte de
  // cette annonce (on ne se contacte pas soi-même).
  const isOwnListing = session?.user.id === host.id;

  /**
   * Trouve ou crée une conversation avec l'hôte, puis redirige vers son fil —
   * seul point d'entrée de la messagerie en dehors de /messagerie elle-même.
   * @route /api/conversations
   * @method POST
   * @note Le backend refuse aussi explicitement de se contacter soi-même
   * (400 "cannot create a conversation with yourself") — `isOwnListing`
   * masque déjà les boutons dans ce cas, mais cette erreur reste affichée
   * proprement (au lieu d'un simple console.error) si ce garde-fou front
   * est un jour contourné, par exemple par une donnée `host` obsolète.
   */
  async function handleMessageHost() {
    if (!isAuthenticated || !session) {
      router.push('/login');
      return;
    }

    setError(null);
    setIsStartingConversation(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ participant_id: host.id }),
      });

      const rawBody: unknown = await response.json();

      if (!response.ok) {
        throw new Error(extractErrorMessage(rawBody, 'Impossible de contacter cet hôte.'));
      }

      const parsed = createConversationResponseSchema.safeParse(rawBody);
      if (!parsed.success) {
        throw new Error('Réponse inattendue du serveur.');
      }

      router.push(`/messagerie/${parsed.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de contacter cet hôte.');
      setIsStartingConversation(false);
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Votre hôte</h2>
      <div className={styles.profile}>
        <div className={styles.avatar}>
          {host.picture ? (
            <Image src={host.picture} alt={host.name} fill sizes="82px" />
          ) : (
            <span className={styles.avatarFallback} aria-hidden="true">
              {host.name.charAt(0)}
            </span>
          )}
        </div>
        <span className={styles.name}>{host.name}</span>
        <span className={styles.rating} aria-label={`Note : ${rating} sur 5`}>
          <StarIcon className={styles.star} />
          {rating}
        </span>
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {isOwnListing ? null : (
        <>
          <Button
            variant="brand"
            className={styles.actionButton}
            disabled={isStartingConversation}
            onClick={handleMessageHost}
          >
            Contacter l&apos;hôte
          </Button>
          <Button
            variant="brand"
            className={styles.actionButton}
            disabled={isStartingConversation}
            onClick={handleMessageHost}
          >
            Envoyer un message
          </Button>
        </>
      )}
    </div>
  );
}
