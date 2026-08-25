// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from '../route';

describe('PATCH /api/users/:id', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  it("met à jour le rôle et renvoie l'utilisateur", async () => {
    const updated = { id: 15, name: 'Dup Test', picture: null, role: 'owner' };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(updated), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest('http://localhost/api/users/15', {
      method: 'PATCH',
      headers: { authorization: 'Bearer token123' },
      body: JSON.stringify({ role: 'owner' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: '15' }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updated);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://backend.test/api/users/15');
    expect(init.method).toBe('PATCH');
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token123');
  });

  it('renvoie 400 sans appeler le backend si le body est vide', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest('http://localhost/api/users/15', {
      method: 'PATCH',
      body: JSON.stringify({}),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: '15' }) });

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('relaie le 403 du backend (rôle admin non autorisé pour cet appelant)', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: 'insufficient role' }), { status: 403 }),
        ),
    );

    const request = new NextRequest('http://localhost/api/users/15', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'admin' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: '15' }) });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'insufficient role' });
  });
});
