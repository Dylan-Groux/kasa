import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

describe('GET /api/properties', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  it('forwards to /api/properties and returns the listing', async () => {
    const backendResponse = [
      {
        id: '1',
        slug: 'appartement-cosy',
        title: 'Appartement cosy',
        description: null,
        cover: 'https://cdn.kasa.test/property-1.jpg',
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

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(backendResponse);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('http://backend.test/api/properties');
  });

  it('returns 502 when the backend response fails schema validation', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify([{ id: '1' }]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await GET();

    expect(response.status).toBe(502);
  });
});

describe('POST /api/properties', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  it('forwards a valid body with the auth header and returns the created property', async () => {
    const created = {
      id: '42',
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
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(created), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest('http://localhost/api/properties', {
      method: 'POST',
      headers: { authorization: 'Bearer token123' },
      body: JSON.stringify({ title: 'Appartement cosy', host: { name: 'Alexandre' } }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(created);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://backend.test/api/properties');
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token123');
  });

  it('rejects a body without title or host without calling the backend', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest('http://localhost/api/properties', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
