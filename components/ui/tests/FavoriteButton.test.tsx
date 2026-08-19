import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FavoriteButton } from '../FavoriteButton';
import { useAuth } from '@/lib/auth/AuthContext';
import { useFavorites } from '@/lib/favorites/FavoritesContext';
import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';

vi.mock('@/lib/auth/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('@/lib/favorites/FavoritesContext', () => ({ useFavorites: vi.fn() }));

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseFavorites = vi.mocked(useFavorites);

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

describe('FavoriteButton', () => {
  beforeEach(() => {
    push.mockClear();
  });

  it('redirects to /login instead of toggling when logged out', () => {
    mockedUseAuth.mockReturnValue({
      session: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    const toggleFavorite = vi.fn();
    mockedUseFavorites.mockReturnValue({
      favorites: [],
      isLoading: false,
      isFavorite: () => false,
      isPending: () => false,
      toggleFavorite,
    });

    render(<FavoriteButton property={property} />);
    fireEvent.click(screen.getByRole('button'));

    expect(push).toHaveBeenCalledWith('/login');
    expect(toggleFavorite).not.toHaveBeenCalled();
  });

  it('toggles the favorite when logged in', () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 't', user: { id: 1, name: 'Alex', role: 'client' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    const toggleFavorite = vi.fn();
    mockedUseFavorites.mockReturnValue({
      favorites: [],
      isLoading: false,
      isFavorite: () => false,
      isPending: () => false,
      toggleFavorite,
    });

    render(<FavoriteButton property={property} />);
    fireEvent.click(screen.getByRole('button'));

    expect(push).not.toHaveBeenCalled();
    expect(toggleFavorite).toHaveBeenCalledWith(property);
  });

  it('disables the button while a toggle for this property is pending', () => {
    mockedUseAuth.mockReturnValue({
      session: { token: 't', user: { id: 1, name: 'Alex', role: 'client' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockedUseFavorites.mockReturnValue({
      favorites: [],
      isLoading: false,
      isFavorite: () => false,
      isPending: () => true,
      toggleFavorite: vi.fn(),
    });

    render(<FavoriteButton property={property} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
