'use client';

import { usePathname } from 'next/navigation';
import { useMessaging } from '@/lib/messaging/MessagingContext';
import { ConversationListItem } from './ConversationListItem';
import styles from './ConversationList.module.css';

export function ConversationList() {
  const pathname = usePathname();
  const { conversations, isLoading, error } = useMessaging();

  if (isLoading) {
    return <p className={styles.status}>Chargement de vos conversations...</p>;
  }

  if (error) {
    return <p className={styles.status}>{error}</p>;
  }

  if (conversations.length === 0) {
    return <p className={styles.status}>Vous n&apos;avez pas encore de conversation.</p>;
  }

  return (
    <nav className={styles.list} aria-label="Conversations">
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          isActive={pathname === `/messagerie/${conversation.id}`}
        />
      ))}
    </nav>
  );
}
