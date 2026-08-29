import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '../route';

const sender = { id: 1, name: 'Dylan', picture: null };
const receiver = { id: 2, name: 'Alex', picture: null };

describe('GET /api/conversations/:id/messages', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  it('forwards the Authorization header and returns messages in order', async () => {
    const backendResponse = {
      conversation_id: 'conv_1',
      messages: [
        { id: 'msg_1', content: 'Salut', sender, receiver, created_at: '2026-08-28T14:32:00.000Z' },
        {
          id: 'msg_2',
          content: 'Salut !',
          sender: receiver,
          receiver: sender,
          created_at: '2026-08-28T14:35:00.000Z',
        },
      ],
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(backendResponse), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost/api/conversations/conv_1/messages', {
      headers: { Authorization: 'Bearer token-123' },
    }) as unknown as Parameters<typeof GET>[0];

    const response = await GET(request, { params: Promise.resolve({ id: 'conv_1' }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(backendResponse);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://backend.test/api/conversations/conv_1/messages');
    expect((init.headers as Headers).get('authorization')).toBe('Bearer token-123');
  });

  it('relays the backend 404 when the user is not a member (or the conversation does not exist)', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })),
    );

    const request = new Request(
      'http://localhost/api/conversations/not-mine/messages',
    ) as unknown as Parameters<typeof GET>[0];
    const response = await GET(request, { params: Promise.resolve({ id: 'not-mine' }) });

    expect(response.status).toBe(404);
  });
});

describe('POST /api/conversations/:id/messages', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  function jsonRequest(body: unknown) {
    return new Request('http://localhost/api/conversations/conv_1/messages', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as Parameters<typeof POST>[0];
  }

  it('sends the message and returns it enriched with sender/receiver', async () => {
    const backendResponse = {
      id: 'msg_3',
      content: 'Bonjour !',
      sender,
      receiver,
      created_at: '2026-08-29T10:15:00.000Z',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(backendResponse), { status: 201 })),
    );

    const response = await POST(jsonRequest({ content: 'Bonjour !' }), {
      params: Promise.resolve({ id: 'conv_1' }),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(backendResponse);
  });

  it('rejects an empty (or whitespace-only) message before calling the backend', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(jsonRequest({ content: '   ' }), {
      params: Promise.resolve({ id: 'conv_1' }),
    });

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects content longer than the maximum length', async () => {
    const response = await POST(jsonRequest({ content: 'a'.repeat(2001) }), {
      params: Promise.resolve({ id: 'conv_1' }),
    });

    expect(response.status).toBe(400);
  });
});
