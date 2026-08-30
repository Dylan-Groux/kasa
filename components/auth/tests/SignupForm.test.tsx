import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignupForm } from '../SignupForm';
import { useAuth } from '@/lib/auth/AuthContext';

vi.mock('@/lib/auth/AuthContext', () => ({ useAuth: vi.fn() }));

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const mockedUseAuth = vi.mocked(useAuth);
const login = vi.fn();

const registeredUser = {
  token: 'jwt-token',
  user: { id: 1, name: 'Alex Test', email: 'alex@kasa.test', picture: null, role: 'client' },
};

function fillCommonFields() {
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Test' } });
  fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Alex' } });
  fireEvent.change(screen.getByLabelText('Adresse email'), {
    target: { value: 'alex@kasa.test' },
  });
  fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'secret123' } });
}

describe('SignupForm', () => {
  beforeEach(() => {
    push.mockClear();
    login.mockClear();
    mockedUseAuth.mockReturnValue({
      session: null,
      isAuthenticated: false,
      login,
      logout: vi.fn(),
    });
  });

  it('registers with role "client" when the host checkbox is left unchecked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(registeredUser), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<SignupForm />);
    fillCommonFields();
    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { role: string };
    expect(body.role).toBe('client');

    vi.unstubAllGlobals();
  });

  it('registers with role "owner" when the host checkbox is checked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(registeredUser), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<SignupForm />);
    fillCommonFields();
    fireEvent.click(screen.getByLabelText('Je veux louer mon logement (compte propriétaire)'));
    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { role: string };
    expect(body.role).toBe('owner');

    vi.unstubAllGlobals();
  });
});
