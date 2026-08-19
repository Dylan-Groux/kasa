import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../route';

describe('GET /api/users/:id/favorites', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  it('forwards to /api/users/:id/favorites and returns the listing', async () => {
    const backendResponse = [
      {
        id: '1',
        slug: 'appartement-cosy',
        title: 'Appartement cosy',
        description: null,
        cover: null,
        location: 'Ile de France - Paris 17e',
        price_per_night: 100,
        rating_avg: 4.8,
        ratings_count: 12,
        host: { id: 1, name: 'Alexandre', picture: null },
      },
    ];
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(backendResponse), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await GET(undefined, { params: Promise.resolve({ id: '7' }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(backendResponse);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('http://backend.test/api/users/7/favorites');
  });

  it('returns 502 when the backend response fails schema validation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: '1' }]), { status: 200 })),
    );

    const response = await GET(undefined, { params: Promise.resolve({ id: '7' }) });

    expect(response.status).toBe(502);
  });
});
