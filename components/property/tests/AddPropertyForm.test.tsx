import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AddPropertyForm } from '../AddPropertyForm';
import { useAuth } from '@/lib/auth/AuthContext';

vi.mock('@/lib/auth/AuthContext', () => ({ useAuth: vi.fn() }));

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const mockedUseAuth = vi.mocked(useAuth);

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Titre de la propriété'), {
    target: { value: 'Appartement cosy' },
  });
  fireEvent.change(screen.getByLabelText("Nom de l'hôte"), {
    target: { value: 'Alexandre' },
  });
}

const createdProperty = {
  id: '1',
  slug: 'appartement-cosy',
  title: 'Appartement cosy',
  description: null,
  cover: null,
  location: null,
  price_per_night: 80,
  rating_avg: 0,
  ratings_count: 0,
  host: { id: 1, name: 'Alexandre', picture: null },
  pictures: [],
  equipments: [],
  tags: [],
};

describe('AddPropertyForm', () => {
  beforeEach(() => {
    push.mockClear();
    mockedUseAuth.mockReturnValue({
      session: { token: 'token123', user: { id: 1, name: 'Alexandre', role: 'owner' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    URL.createObjectURL = vi.fn(() => 'blob:mock-preview');
    URL.revokeObjectURL = vi.fn();
  });

  it('requires the title and the host name before submitting', () => {
    render(<AddPropertyForm />);

    expect(screen.getByLabelText('Titre de la propriété')).toBeRequired();
    expect(screen.getByLabelText("Nom de l'hôte")).toBeRequired();
  });

  it('sends the property to the API with the auth header and redirects on success', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(createdProperty), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<AddPropertyForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/properties');
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer token123');

    const body = JSON.parse(init.body as string) as { title: string; host: { name: string } };
    expect(body.title).toBe('Appartement cosy');
    expect(body.host.name).toBe('Alexandre');

    vi.unstubAllGlobals();
  });

  it('shows the backend error message and does not redirect when creation fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: 'title manquant' }), { status: 400 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<AddPropertyForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('title manquant');
    expect(push).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('shows which image failed to upload instead of a generic error', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: 'fichier trop volumineux' }), { status: 400 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<AddPropertyForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/Image de couverture/), {
      target: { files: [new File(['content'], 'cover.jpg', { type: 'image/jpeg' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Image de couverture : fichier trop volumineux',
    );
    expect(push).not.toHaveBeenCalled();
    // La propriété n'est jamais créée si l'upload de sa cover a échoué.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/uploads/image');

    vi.unstubAllGlobals();
  });

  it('uploads selected property pictures and includes their URLs in the payload', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/uploads/image') {
        return Promise.resolve(
          new Response(JSON.stringify({ url: 'https://cdn.kasa.test/salon.jpg' }), {
            status: 201,
          }),
        );
      }
      return Promise.resolve(new Response(JSON.stringify(createdProperty), { status: 201 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AddPropertyForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/Photos du logement/), {
      target: { files: [new File(['content'], 'salon.jpg', { type: 'image/jpeg' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));

    const propertyCall = fetchMock.mock.calls.find(([url]) => url === '/api/properties');
    const body = JSON.parse((propertyCall?.[1] as RequestInit).body as string) as {
      pictures: string[];
    };
    expect(body.pictures).toEqual(['https://cdn.kasa.test/salon.jpg']);

    vi.unstubAllGlobals();
  });

  it('adds a custom tag and includes it in the submitted payload', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(createdProperty), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<AddPropertyForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Ajouter une catégorie personnalisée'), {
      target: { value: 'Vue Montagne' },
    });
    fireEvent.click(screen.getByRole('button', { name: '+Ajouter un tag' }));

    expect(screen.getByText('Vue Montagne')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { tags: string[] };
    expect(body.tags).toContain('Vue Montagne');

    vi.unstubAllGlobals();
  });
});
