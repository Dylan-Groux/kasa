'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useMessaging } from '@/lib/messaging/MessagingContext';
import { conversationMessagesResponseSchema } from '@/lib/proxy/schemas/conversations/conversationMessages.schema';
import { messageSchema, type MessageSchema } from '@/lib/proxy/schemas/messages/messageBase.schema';
import { MessageComposer } from './MessageComposer';
import { MessageThread } from './MessageThread';
import styles from './ConversationThreadView.module.css';

type ConversationThreadViewProps = {
  conversationId: string;
};

type ThreadResult =
  { status: 'ready'; messages: MessageSchema[] } | { status: 'error' } | { status: 'not-found' };

// Client uniquement : le token de session vit en mémoire (voir AuthContext), impossible à fetch côté serveur.
export function ConversationThreadView({ conversationId }: ConversationThreadViewProps) {
  const { session } = useAuth();
  const { recordSentMessage, markConversationSeen } = useMessaging();
  const [result, setResult] = useState<ThreadResult | null>(null);
  // Loading dérivé (comme FavoritesContext) : évite un setState synchrone en
  // début d'effect juste pour passer le flag de chargement avant le fetch.
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const requestKey = session ? `${conversationId}:${session.token}` : null;
  const isLoading = requestKey !== null && loadedKey !== requestKey;

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;
    const key = `${conversationId}:${session.token}`;

    /**
     * @route /api/conversations/:conversationId/messages
     * @method GET
     */
    function fetchThread() {
      if (!session) {
        return;
      }

      fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
        .then((response) => {
          // 404 couvre "conversation inexistante" et "pas membre" — règle
          // anti-énumération de l'API messagerie (jamais 403).
          if (response.status === 404) {
            return Promise.reject(new Error('not-found'));
          }
          if (!response.ok) {
            return Promise.reject(new Error('error'));
          }
          return response.json() as Promise<unknown>;
        })
        .then((rawBody: unknown) => {
          if (cancelled) {
            return;
          }
          const parsed = conversationMessagesResponseSchema.safeParse(rawBody);
          if (parsed.success) {
            setResult({ status: 'ready', messages: parsed.data.messages });
            const latestMessage = parsed.data.messages.at(-1);
            markConversationSeen(
              conversationId,
              latestMessage?.created_at ?? new Date().toISOString(),
            );
          } else {
            setResult({ status: 'error' });
          }
        })
        .catch((reason: unknown) => {
          if (cancelled) {
            return;
          }
          setResult({
            status:
              reason instanceof Error && reason.message === 'not-found' ? 'not-found' : 'error',
          });
        })
        .finally(() => {
          if (!cancelled) {
            setLoadedKey(key);
          }
        });
    }

    fetchThread();

    return () => {
      cancelled = true;
    };
  }, [conversationId, session, markConversationSeen]);

  /**
   * @route /api/conversations/:conversationId/messages
   * @method POST
   */
  async function handleSend(content: string) {
    if (!session) {
      return;
    }

    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Send failed with status ${response.status}`);
    }

    const rawBody: unknown = await response.json();
    const parsed = messageSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new Error('Unexpected response shape');
    }

    setResult((current) =>
      current && current.status === 'ready'
        ? { status: 'ready', messages: [...current.messages, parsed.data] }
        : current,
    );
    recordSentMessage(conversationId, parsed.data);
  }

  if (isLoading || result === null) {
    return <p className={styles.status}>Chargement de la conversation...</p>;
  }

  if (result.status === 'not-found') {
    return <p className={styles.status}>Cette conversation est introuvable.</p>;
  }

  if (result.status === 'error') {
    return <p className={styles.status}>Impossible de charger cette conversation.</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.view}>
      <MessageThread messages={result.messages} currentUserId={session.user.id} />
      <MessageComposer onSend={handleSend} />
    </div>
  );
}
