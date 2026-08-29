import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '../route';

function jsonRequest(body: unknown, headers?: HeadersInit) {
  return new Request('http://localhost/api/conversations', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
  }) as unknown as Parameters<typeof POST>[0];
}

describe('GET /api/conversations', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  it('forwards the Authorization header and returns the conversation list', async () => {
    const backendResponse = [
      {
        id: 'conv_1',
        other_participant: { id: 2, name: 'Alex', picture: null },
        last_message: { content: 'Salut', created_at: '2026-08-28T14:32:00.000Z', sender_id: 2 },
        updated_at: '2026-08-28T14:32:00.000Z',
      },
    ];
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(backendResponse), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost/api/conversations', {
      headers: { Authorization: 'Bearer token-123' },
    }) as unknown as Parameters<typeof GET>[0];

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(backendResponse);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://backend.test/api/conversations');
    expect((init.headers as Headers).get('authorization')).toBe('Bearer token-123');
  });

  it('returns 502 when the backend response fails schema validation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: 'conv_1' }]), { status: 200 })),
    );

    const request = new Request('http://localhost/api/conversations') as unknown as Parameters<
      typeof GET
    >[0];
    const response = await GET(request);

    expect(response.status).toBe(502);
  });
});

describe('POST /api/conversations', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  it('creates (or finds) a conversation with the given participant', async () => {
    const backendResponse = {
      id: 'conv_1',
      other_participant: { id: 2, name: 'Alex', picture: null },
      created_at: '2026-08-28T14:32:00.000Z',
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(backendResponse), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(jsonRequest({ participant_id: 2 }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(backendResponse);
  });

  it('rejects a body without participant_id', async () => {
    const response = await POST(jsonRequest({}));
    expect(response.status).toBe(400);
  });
});
