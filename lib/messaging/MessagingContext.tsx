'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  conversationListSchema,
  type ConversationSchema,
} from '@/lib/proxy/schemas/conversations/conversationBase.schema';
import type { MessageSchema } from '@/lib/proxy/schemas/messages/messageBase.schema';

// Intervalle de rafraîchissement de la liste : pas de websocket/SSE côté
// backend, donc une nouvelle conversation/message n'apparaît qu'au poll suivant.
const POLL_INTERVAL_MS = 15_000;

type LastSeenMap = Record<string, string>;

type MessagingContextValue = {
  conversations: ConversationSchema[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  isConversationUnread: (conversationId: string) => boolean;
  markConversationSeen: (conversationId: string, seenAt: string) => void;
  recordSentMessage: (conversationId: string, message: MessageSchema) => void;
};

const MessagingContext = createContext<MessagingContextValue | null>(null);

function lastSeenStorageKey(userId: number): string {
  return `kasa:messaging:lastSeen:${userId}`;
}

// "Non lu" est une approximation côté client : le backend n'a pas de flag
// lu/non-lu par message, donc on compare le timestamp du dernier message à
// un timestamp "dernière ouverture" stocké en localStorage (voir
// markConversationSeen). Ne survit pas à un clear du storage, pas synchronisé
// entre appareils — suffisant pour un badge v1, pas un compteur fiable.
function isUnread(
  conversation: ConversationSchema,
  currentUserId: number,
  lastSeenAt: LastSeenMap,
): boolean {
  const { last_message: lastMessage } = conversation;
  if (!lastMessage || lastMessage.sender_id === currentUserId) {
    return false;
  }

  const seenAt = lastSeenAt[conversation.id];
  return !seenAt || new Date(lastMessage.created_at) > new Date(seenAt);
}

/**
 * Source unique de la liste de conversations, limitée à l'arborescence
 * /messagerie (monté dans app/messagerie/layout.tsx, pas le layout racine —
 * rien en dehors de la messagerie n'en a besoin). Charge dès qu'une session
 * existe, puis poll (voir POLL_INTERVAL_MS). `recordSentMessage` met à jour
 * l'aperçu et remonte la conversation en tête localement juste après un envoi
 * réussi, sans attendre le prochain poll.
 */
export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<ConversationSchema[]>([]);
  const [loadedForToken, setLoadedForToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Initialisation paresseuse (pas de sync via un effect) : RequireAuth ne
  // monte ce provider qu'avec une session existante, et le démonte au
  // logout — une nouvelle session = un nouveau montage, donc lire
  // localStorage une seule fois ici suffit.
  const [lastSeenAt, setLastSeenAt] = useState<LastSeenMap>(() => {
    if (!session || typeof window === 'undefined') {
      return {};
    }
    try {
      const stored = window.localStorage.getItem(lastSeenStorageKey(session.user.id));
      return stored ? (JSON.parse(stored) as LastSeenMap) : {};
    } catch {
      return {};
    }
  });
  const isLoading = session !== null && loadedForToken !== session.token;

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    /**
     * @route /api/conversations
     * @method GET
     */
    function fetchConversations() {
      if (!session) {
        return;
      }

      fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${session.token}` },
      })
        .then((response) => (response.ok ? response.json() : Promise.reject(response)))
        .then((rawBody: unknown) => {
          if (cancelled) {
            return;
          }
          const parsed = conversationListSchema.safeParse(rawBody);
          if (parsed.success) {
            setConversations(parsed.data);
            setError(null);
          } else {
            setError('Réponse inattendue du serveur.');
          }
        })
        .catch((reason: unknown) => {
          console.error('GET /api/conversations failed', reason);
          if (!cancelled) {
            setError('Impossible de charger vos conversations.');
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoadedForToken(session.token);
          }
        });
    }

    fetchConversations();
    const intervalId = window.setInterval(fetchConversations, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [session]);

  const markConversationSeen = useCallback(
    (conversationId: string, seenAt: string) => {
      if (!session) {
        return;
      }

      setLastSeenAt((current) => {
        // Ne jamais faire reculer un timestamp "vu" — un poll concurrent à
        // markConversationSeen pourrait sinon faire réapparaître un badge déjà lu.
        if (current[conversationId] && new Date(current[conversationId]) >= new Date(seenAt)) {
          return current;
        }

        const next = { ...current, [conversationId]: seenAt };
        try {
          window.localStorage.setItem(lastSeenStorageKey(session.user.id), JSON.stringify(next));
        } catch {
          // Storage indisponible (navigation privée, quota) — le badge ne persiste juste pas au reload.
        }
        return next;
      });
    },
    [session],
  );

  const recordSentMessage = useCallback((conversationId: string, message: MessageSchema) => {
    setConversations((current) => {
      const target = current.find((conversation) => conversation.id === conversationId);
      if (!target) {
        return current;
      }

      const updated: ConversationSchema = {
        ...target,
        last_message: {
          content: message.content,
          created_at: message.created_at,
          sender_id: message.sender.id,
        },
        updated_at: message.created_at,
      };

      // Remonte la conversation en tête, activité la plus récente en premier.
      return [updated, ...current.filter((conversation) => conversation.id !== conversationId)];
    });
  }, []);

  const activeConversations = useMemo(
    () => (session ? conversations : []),
    [session, conversations],
  );
  const isConversationUnread = useCallback(
    (conversationId: string) => {
      if (!session) {
        return false;
      }
      const conversation = activeConversations.find((c) => c.id === conversationId);
      return conversation ? isUnread(conversation, session.user.id, lastSeenAt) : false;
    },
    [session, activeConversations, lastSeenAt],
  );

  const unreadCount = session
    ? activeConversations.filter((conversation) =>
        isUnread(conversation, session.user.id, lastSeenAt),
      ).length
    : 0;

  const value = useMemo<MessagingContextValue>(
    () => ({
      conversations: activeConversations,
      isLoading,
      error,
      unreadCount,
      isConversationUnread,
      markConversationSeen,
      recordSentMessage,
    }),
    [
      activeConversations,
      isLoading,
      error,
      unreadCount,
      isConversationUnread,
      markConversationSeen,
      recordSentMessage,
    ],
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export function useMessaging(): MessagingContextValue {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
