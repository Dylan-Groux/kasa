import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireAuth } from '../RequireAuth';
import { useAuth } from '@/lib/auth/AuthContext';

vi.mock('@/lib/auth/AuthContext', () => ({ useAuth: vi.fn() }));

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const mockedUseAuth = vi.mocked(useAuth);

describe('RequireAuth', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it('redirects to /login and renders nothing when unauthenticated', () => {
    mockedUseAuth.mockReturnValue({
      session: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    const { container } = render(
      <RequireAuth>
        <p>Protected content</p>
      </RequireAuth>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('renders children when authenticated', () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 't', user: { id: 1, name: 'Alex', role: 'client' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <RequireAuth>
        <p>Protected content</p>
      </RequireAuth>,
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
