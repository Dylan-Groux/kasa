'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  conversationListSchema,
  type ConversationSchema,
} from '@/lib/proxy/schemas/conversations/conversationBase.schema';
import type { MessageSchema } from '@/lib/proxy/schemas/messages/messageBase.schema';

// Refetch interval for the conversation list: the backend has no push
// mechanism (no websocket/SSE), so a new conversation or message from
// someone else only shows up on the next poll rather than instantly.
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

// "Unread" is a client-only approximation: the backend doesn't track a
// read/unread flag per message, so this compares each conversation's last
// message timestamp against a per-viewer "last opened" timestamp kept in
// localStorage (see markConversationSeen). It resets if storage is cleared
// and doesn't sync across devices — acceptable for a v1 badge, not an
// authoritative unread count.
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
 * Single source of truth for the logged-in user's conversation list, scoped
 * to the /messagerie route tree (mounted in app/messagerie/layout.tsx, not
 * the root layout — nothing outside messaging needs this). Loads once a
 * session is available, then polls (see POLL_INTERVAL_MS) so a conversation
 * or message started by someone else eventually shows up without a manual
 * reload. `recordSentMessage` lets the thread view bump a conversation's
 * preview + move it to the top locally right after a successful send,
 * without waiting for the next poll.
 */
export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<ConversationSchema[]>([]);
  const [loadedForToken, setLoadedForToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Lazy-initialized (not synced via an effect): RequireAuth only ever
  // mounts this provider once a session exists, and unmounts it on logout —
  // so a fresh session always means a fresh mount, and reading localStorage
  // once here is enough to pick up the right user's "seen" state.
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
        // Never move a stored "seen" timestamp backwards — a poll racing a
        // markConversationSeen call could otherwise resurrect an already-read badge.
        if (current[conversationId] && new Date(current[conversationId]) >= new Date(seenAt)) {
          return current;
        }

        const next = { ...current, [conversationId]: seenAt };
        try {
          window.localStorage.setItem(lastSeenStorageKey(session.user.id), JSON.stringify(next));
        } catch {
          // Storage unavailable (private browsing, quota) — the badge just won't persist across reloads.
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

      // Move the conversation to the top, mirroring "most recent activity first".
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
