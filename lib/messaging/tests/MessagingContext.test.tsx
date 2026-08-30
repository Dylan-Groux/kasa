import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MessagingProvider, useMessaging } from '../MessagingContext';
import { useAuth } from '@/lib/auth/AuthContext';

vi.mock('@/lib/auth/AuthContext', () => ({ useAuth: vi.fn() }));
const mockedUseAuth = vi.mocked(useAuth);

function Harness() {
  const { conversations, unreadCount, markConversationSeen } = useMessaging();
  return (
    <div>
      <span data-testid="unread-count">{unreadCount}</span>
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() =>
            markConversationSeen(
              conversation.id,
              conversation.last_message?.created_at ?? new Date().toISOString(),
            )
          }
        >
          mark {conversation.id} seen
        </button>
      ))}
    </div>
  );
}

const otherParticipant = { id: 2, name: 'Alex', picture: null };

describe('MessagingContext unread tracking', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedUseAuth.mockReturnValue({
      session: { token: 't', user: { id: 1, name: 'Me', picture: null, role: 'client' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('counts a conversation as unread when its last message is from someone else and unseen', async () => {
    const conversation = {
      id: 'conv_1',
      other_participant: otherParticipant,
      last_message: { content: 'Salut', created_at: '2026-08-29T10:00:00.000Z', sender_id: 2 },
      updated_at: '2026-08-29T10:00:00.000Z',
    };
    vi.stubGlobal(
      'fetch',
      // Une nouvelle Response à chaque appel : le body ne se lit qu'une fois,
      // et ce context poll à intervalle + refetch au remount.
      vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(new Response(JSON.stringify([conversation]), { status: 200 })),
        ),
    );

    render(
      <MessagingProvider>
        <Harness />
      </MessagingProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('unread-count')).toHaveTextContent('1'));
  });

  it('clears the count once the conversation is marked as seen, and persists across a remount', async () => {
    const conversation = {
      id: 'conv_1',
      other_participant: otherParticipant,
      last_message: { content: 'Salut', created_at: '2026-08-29T10:00:00.000Z', sender_id: 2 },
      updated_at: '2026-08-29T10:00:00.000Z',
    };
    vi.stubGlobal(
      'fetch',
      // Une nouvelle Response à chaque appel : le body ne se lit qu'une fois,
      // et ce context poll à intervalle + refetch au remount.
      vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(new Response(JSON.stringify([conversation]), { status: 200 })),
        ),
    );

    const { unmount } = render(
      <MessagingProvider>
        <Harness />
      </MessagingProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('unread-count')).toHaveTextContent('1'));
    fireEvent.click(screen.getByRole('button', { name: 'mark conv_1 seen' }));
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');

    // Un nouveau montage (ex: reconnexion) doit relire l'état "vu" depuis
    // localStorage plutôt que remettre le badge à zéro non-lu. On attend le
    // rechargement réel (pas juste le 0 par défaut avant fetch), sinon le
    // test passerait même si localStorage était ignoré.
    unmount();
    render(
      <MessagingProvider>
        <Harness />
      </MessagingProvider>,
    );
    await screen.findByRole('button', { name: 'mark conv_1 seen' });
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
  });

  it('never counts a conversation as unread when I sent its last message myself', async () => {
    const conversation = {
      id: 'conv_1',
      other_participant: otherParticipant,
      last_message: { content: 'Salut', created_at: '2026-08-29T10:00:00.000Z', sender_id: 1 },
      updated_at: '2026-08-29T10:00:00.000Z',
    };
    vi.stubGlobal(
      'fetch',
      // Une nouvelle Response à chaque appel : le body ne se lit qu'une fois,
      // et ce context poll à intervalle + refetch au remount.
      vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(new Response(JSON.stringify([conversation]), { status: 200 })),
        ),
    );

    render(
      <MessagingProvider>
        <Harness />
      </MessagingProvider>,
    );

    // Attend que la conversation soit vraiment chargée (pas juste le rendu
    // initial avant fetch) avant de vérifier que le compteur reste à zéro.
    await screen.findByRole('button', { name: 'mark conv_1 seen' });
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
  });
});
