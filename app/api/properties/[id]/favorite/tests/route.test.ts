import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, POST } from '../route';

describe('POST /api/properties/:id/favorite', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  it('forwards the auth header with no body and returns {ok:true}', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest('http://localhost/api/properties/5/favorite', {
      method: 'POST',
      headers: { authorization: 'Bearer token123' },
    });

    const response = await POST(request, { params: Promise.resolve({ id: '5' }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://backend.test/api/properties/5/favorite');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token123');
  });
});

describe('DELETE /api/properties/:id/favorite', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  it('forwards the auth header with no body and returns {ok:true}', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest('http://localhost/api/properties/5/favorite', {
      method: 'DELETE',
      headers: { authorization: 'Bearer token123' },
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: '5' }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://backend.test/api/properties/5/favorite');
    expect(init.method).toBe('DELETE');
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token123');
  });
});
