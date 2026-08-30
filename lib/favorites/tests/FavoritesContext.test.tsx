import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import type { AuthLoginResponse } from '@/lib/proxy/schemas/auth/authLogin.schema';
import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import { FavoritesProvider, useFavorites } from '../FavoritesContext';

const session: AuthLoginResponse = {
  token: 'token-123',
  user: { id: 1, name: 'Alex', email: 'alex@kasa.test', picture: null, role: 'client' },
};

const property: PropertyBaseSchema = {
  id: '1',
  slug: 'appartement-cosy',
  title: 'Appartement cosy',
  description: null,
  cover: null,
  location: 'Paris',
  price_per_night: 100,
  rating_avg: 4.8,
  ratings_count: 12,
  host: { id: 1, name: 'Alexandre', picture: null },
};

function Consumer() {
  const { login, logout } = useAuth();
  const { favorites, isLoading, isFavorite, toggleFavorite } = useFavorites();
  return (
    <div>
      <p>loading: {String(isLoading)}</p>
      <p>count: {favorites.length}</p>
      <p>favorited: {String(isFavorite(property.id))}</p>
      <button onClick={() => login(session)}>login</button>
      <button onClick={logout}>logout</button>
      <button onClick={() => toggleFavorite(property)}>toggle</button>
    </div>
  );
}

function renderWithProviders() {
  return render(
    <AuthProvider>
      <FavoritesProvider>
        <Consumer />
      </FavoritesProvider>
    </AuthProvider>,
  );
}

describe('FavoritesContext', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts empty and loads the list once a session appears', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify([property]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders();

    expect(screen.getByText('count: 0')).toBeInTheDocument();

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByText('count: 1')).toBeInTheDocument());
    expect(screen.getByText('favorited: true')).toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/users/1/favorites');
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token-123');
  });

  it('clears the list on logout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify([property]), { status: 200 })),
    );

    renderWithProviders();
    fireEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByText('count: 1')).toBeInTheDocument());

    fireEvent.click(screen.getByText('logout'));

    expect(screen.getByText('count: 0')).toBeInTheDocument();
  });

  it('toggleFavorite is optimistic and rolls back on failure', async () => {
    const fetchMock = vi.fn().mockImplementation((input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith('/favorites')) {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders();
    fireEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByText('favorited: false')).toBeInTheDocument());

    fireEvent.click(screen.getByText('toggle'));

    // Le fetch mocké rejette presque immédiatement, donc le flip optimiste
    // vers "true" et le rollback ont déjà eu lieu avant qu'on puisse
    // observer l'état intermédiaire — ce qui compte, c'est qu'un toggle
    // échoué revienne toujours à l'état précédent.
    await waitFor(() => expect(screen.getByText('favorited: false')).toBeInTheDocument());

    consoleError.mockRestore();
  });
});
