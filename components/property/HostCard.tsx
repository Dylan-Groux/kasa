'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StarIcon } from '@/components/icons/StarIcon';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/AuthContext';
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

  /**
   * Trouve ou crée une conversation avec l'hôte, puis redirige vers son fil —
   * seul point d'entrée de la messagerie en dehors de /messagerie elle-même.
   * @route /api/conversations
   * @method POST
   */
  async function handleMessageHost() {
    if (!isAuthenticated || !session) {
      router.push('/login');
      return;
    }

    setIsStartingConversation(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ participant_id: host.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start conversation with status ${response.status}`);
      }

      const rawBody: unknown = await response.json();
      const parsed = createConversationResponseSchema.safeParse(rawBody);
      if (!parsed.success) {
        throw new Error('Unexpected response shape');
      }

      router.push(`/messagerie/${parsed.data.id}`);
    } catch (error) {
      console.error('Failed to start conversation with host', error);
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
    </div>
  );
}
