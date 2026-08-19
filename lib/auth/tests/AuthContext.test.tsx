import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import type { AuthLoginResponse } from '@/lib/proxy/schemas/auth/authLogin.schema';

const session: AuthLoginResponse = {
  token: 'token-123',
  user: { id: 1, name: 'Alex', email: 'alex@kasa.test', picture: null, role: 'client' },
};

function Consumer() {
  const { session: current, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <p>authenticated: {String(isAuthenticated)}</p>
      <p>user: {current?.user.name ?? 'none'}</p>
      <button onClick={() => login(session)}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('starts unauthenticated', () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByText('authenticated: false')).toBeInTheDocument();
    expect(screen.getByText('user: none')).toBeInTheDocument();
  });

  it('login() stores the session and logout() clears it', () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText('login'));
    expect(screen.getByText('authenticated: true')).toBeInTheDocument();
    expect(screen.getByText('user: Alex')).toBeInTheDocument();

    fireEvent.click(screen.getByText('logout'));
    expect(screen.getByText('authenticated: false')).toBeInTheDocument();
    expect(screen.getByText('user: none')).toBeInTheDocument();
  });

  it('throws when useAuth is called outside an AuthProvider', () => {
    // Swallow the expected React error boundary console noise for this assertion.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow('useAuth must be used within an AuthProvider');
    consoleError.mockRestore();
  });
});
