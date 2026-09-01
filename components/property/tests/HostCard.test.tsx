import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HostCard } from '../HostCard';
import { useAuth } from '@/lib/auth/AuthContext';

vi.mock('@/lib/auth/AuthContext', () => ({ useAuth: vi.fn() }));

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const mockedUseAuth = vi.mocked(useAuth);

const host = { id: 2, name: 'Nathalie', picture: null };

describe('HostCard', () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("shows the contact buttons for a visitor viewing someone else's listing", () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 't', user: { id: 1, name: 'Alex', role: 'client' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(<HostCard host={host} rating={4} />);

    expect(screen.getByRole('button', { name: "Contacter l'hôte" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Envoyer un message' })).toBeInTheDocument();
  });

  it('hides the contact buttons when the connected user is the host of this listing', () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 't', user: { id: 2, name: 'Nathalie', role: 'owner' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(<HostCard host={host} rating={4} />);

    expect(screen.queryByRole('button', { name: "Contacter l'hôte" })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Envoyer un message' })).not.toBeInTheDocument();
  });

  it('redirects to /login when contacting the host while logged out', () => {
    mockedUseAuth.mockReturnValue({
      session: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(<HostCard host={host} rating={4} />);
    fireEvent.click(screen.getByRole('button', { name: "Contacter l'hôte" }));

    expect(push).toHaveBeenCalledWith('/login');
  });

  it('starts the conversation and redirects to its thread on success', async () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 't', user: { id: 1, name: 'Alex', role: 'client' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'conv-1',
          other_participant: host,
          created_at: '2026-01-01T00:00:00.000Z',
        }),
        { status: 201 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<HostCard host={host} rating={4} />);
    fireEvent.click(screen.getByRole('button', { name: "Contacter l'hôte" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/messagerie/conv-1'));

    vi.unstubAllGlobals();
  });

  it('shows a clean error message instead of failing silently when the backend refuses (e.g. messaging yourself)', async () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 't', user: { id: 1, name: 'Alex', role: 'client' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'cannot create a conversation with yourself' }), {
        status: 400,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<HostCard host={host} rating={4} />);
    fireEvent.click(screen.getByRole('button', { name: "Contacter l'hôte" }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'cannot create a conversation with yourself',
    );
    expect(push).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
