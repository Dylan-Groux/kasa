import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddPropertyGate } from '../AddPropertyGate';
import { useAuth } from '@/lib/auth/AuthContext';

vi.mock('@/lib/auth/AuthContext', () => ({ useAuth: vi.fn() }));

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const mockedUseAuth = vi.mocked(useAuth);
const logout = vi.fn();

describe('AddPropertyGate', () => {
  beforeEach(() => {
    push.mockClear();
    logout.mockClear();
  });

  it('renders the property form for an owner account', () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 't', user: { id: 1, name: 'Alex', role: 'owner' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout,
    });

    render(<AddPropertyGate />);

    expect(screen.getByLabelText('Titre de la propriété')).toBeInTheDocument();
  });

  it('renders the "Devenir vendeur" prompt for a client account instead of the form', () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 't', user: { id: 5, name: 'Alex', role: 'client' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout,
    });

    render(<AddPropertyGate />);

    expect(screen.queryByLabelText('Titre de la propriété')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Devenir vendeur' })).toBeInTheDocument();
  });

  it('switches the role then asks to reconnect, without pretending the current session is upgraded', async () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 'old-token', user: { id: 5, name: 'Alex', role: 'client' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout,
    });
    const updatedUser = { id: 5, name: 'Alex', picture: null, role: 'owner' };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(updatedUser), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<AddPropertyGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Devenir vendeur' }));

    expect(await screen.findByRole('button', { name: 'Se reconnecter' })).toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/users/5');
    expect(init.method).toBe('PATCH');
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer old-token');
    expect(JSON.parse(init.body as string)).toEqual({ role: 'owner' });

    fireEvent.click(screen.getByRole('button', { name: 'Se reconnecter' }));
    expect(logout).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/login');

    vi.unstubAllGlobals();
  });

  it('shows the backend error when the role switch fails', async () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 'old-token', user: { id: 5, name: 'Alex', role: 'client' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout,
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: 'insufficient role' }), { status: 403 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<AddPropertyGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Devenir vendeur' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('insufficient role');
    expect(screen.queryByRole('button', { name: 'Se reconnecter' })).not.toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
