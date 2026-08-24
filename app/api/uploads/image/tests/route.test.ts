// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

describe('POST /api/uploads/image', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  it('forwards the uploaded file and returns its URL', async () => {
    const uploaded = { url: 'https://cdn.kasa.test/property-cover.jpg' };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(uploaded), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const body = new FormData();
    body.append('file', new File(['content'], 'cover.jpg', { type: 'image/jpeg' }));
    body.append('purpose', 'property-cover');

    const request = new NextRequest('http://localhost/api/uploads/image', {
      method: 'POST',
      headers: { authorization: 'Bearer token123' },
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(uploaded);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://backend.test/api/uploads/image');
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token123');
  });

  it('returns 502 when the backend response fails schema validation', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ notAUrl: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const body = new FormData();
    body.append('file', new File(['content'], 'cover.jpg', { type: 'image/jpeg' }));

    const request = new NextRequest('http://localhost/api/uploads/image', {
      method: 'POST',
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(502);
  });
});
