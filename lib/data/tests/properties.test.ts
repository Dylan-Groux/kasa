import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getHomeProperties } from '../properties';

describe('getHomeProperties', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns the parsed listing on success', async () => {
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
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(backendResponse), { status: 200 })),
    );

    const result = await getHomeProperties();

    expect(result).toEqual(backendResponse);
  });

  it('falls back to an empty list when the backend is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getHomeProperties();

    expect(result).toEqual([]);
  });

  it('falls back to an empty list when the backend response fails schema validation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: '1' }]), { status: 200 })),
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getHomeProperties();

    expect(result).toEqual([]);
  });

  it('falls back to an empty list when BACKEND_API_URL is not set', async () => {
    delete process.env.BACKEND_API_URL;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getHomeProperties();

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
