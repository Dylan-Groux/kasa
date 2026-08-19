import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  createProxyActionRoute,
  createProxyDeleteRoute,
  createProxyGetRoute,
  createProxyMutationRoute,
} from '../createProxyRoute';

const itemSchema = z.object({ id: z.string(), name: z.string() });

describe('createProxyRoute', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    process.env.BACKEND_API_URL = 'http://backend.test';
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.unstubAllGlobals();
  });

  describe('createProxyGetRoute', () => {
    it('renvoie les données quand la forme est valide', async () => {
      const payload = [{ id: '1', name: 'Villa' }];
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 })),
      );

      const handler = createProxyGetRoute({
        backendPath: '/api/items',
        responseSchema: z.array(itemSchema),
      });

      const response = await handler();

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(payload);
    });

    it('renvoie 502 si la forme ne correspond pas au schéma', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: '1' }]), { status: 200 })),
      );

      const handler = createProxyGetRoute({
        backendPath: '/api/items',
        responseSchema: z.array(itemSchema),
      });

      const response = await handler();

      expect(response.status).toBe(502);
    });

    it('renvoie 502 si le backend est injoignable', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

      const handler = createProxyGetRoute({
        backendPath: '/api/items',
        responseSchema: z.array(itemSchema),
      });

      const response = await handler();

      expect(response.status).toBe(502);
    });

    it("propage le statut backend quand ce n'est pas une dérive de contrat", async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

      const handler = createProxyGetRoute({
        backendPath: '/api/items/999',
        responseSchema: z.array(itemSchema),
      });

      const response = await handler();

      expect(response.status).toBe(404);
    });

    it('résout un backendPath dynamique à partir des params de route', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify([{ id: '1', name: 'Villa' }]), { status: 200 }),
        );
      vi.stubGlobal('fetch', fetchMock);

      const handler = createProxyGetRoute({
        backendPath: (params: { id: string }) => `/api/items/${params.id}/related`,
        responseSchema: z.array(itemSchema),
      });

      await handler(undefined, { params: Promise.resolve({ id: '42' }) });

      const [url] = fetchMock.mock.calls[0] as [string];
      expect(url).toBe('http://backend.test/api/items/42/related');
    });
  });

  describe('createProxyMutationRoute', () => {
    it('valide le body, le forward avec le header auth, et propage le statut backend', async () => {
      const created = { id: '1', name: 'Villa' };
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(created), { status: 201 }));
      vi.stubGlobal('fetch', fetchMock);

      const handler = createProxyMutationRoute({
        method: 'POST',
        backendPath: '/api/items',
        bodySchema: z.object({ name: z.string() }),
        responseSchema: itemSchema,
      });

      const request = new NextRequest('http://localhost/api/items', {
        method: 'POST',
        headers: { authorization: 'Bearer token123' },
        body: JSON.stringify({ name: 'Villa' }),
      });

      const response = await handler(request);

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual(created);

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe('POST');
      expect(new Headers(init.headers).get('authorization')).toBe('Bearer token123');
      expect(init.body).toBe(JSON.stringify({ name: 'Villa' }));
    });

    it('renvoie 400 sans appeler le backend si le body ne respecte pas le schéma', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const handler = createProxyMutationRoute({
        method: 'POST',
        backendPath: '/api/items',
        bodySchema: z.object({ name: z.string() }),
        responseSchema: itemSchema,
      });

      const request = new NextRequest('http://localhost/api/items', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await handler(request);

      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('renvoie 502 si le backend est injoignable', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

      const handler = createProxyMutationRoute({
        method: 'PATCH',
        backendPath: '/api/items/1',
        bodySchema: z.object({ name: z.string() }),
        responseSchema: itemSchema,
      });

      const request = new NextRequest('http://localhost/api/items/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Villa' }),
      });

      const response = await handler(request);

      expect(response.status).toBe(502);
    });
  });

  describe('createProxyDeleteRoute', () => {
    it('forward le header auth et propage le statut backend sans body', async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
      vi.stubGlobal('fetch', fetchMock);

      const handler = createProxyDeleteRoute({ backendPath: '/api/items/1' });

      const request = new NextRequest('http://localhost/api/items/1', {
        method: 'DELETE',
        headers: { authorization: 'Bearer token123' },
      });

      const response = await handler(request);

      expect(response.status).toBe(204);

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe('DELETE');
      expect(new Headers(init.headers).get('authorization')).toBe('Bearer token123');
    });

    it('renvoie 502 si le backend est injoignable', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

      const handler = createProxyDeleteRoute({ backendPath: '/api/items/1' });

      const request = new NextRequest('http://localhost/api/items/1', { method: 'DELETE' });

      const response = await handler(request);

      expect(response.status).toBe(502);
    });
  });

  describe('createProxyActionRoute', () => {
    const actionResponseSchema = z.object({ ok: z.boolean() });

    it('forward le header auth sans body, résout le backendPath dynamique, et valide la réponse', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      const handler = createProxyActionRoute({
        method: 'POST',
        backendPath: (params: { id: string }) => `/api/items/${params.id}/favorite`,
        responseSchema: actionResponseSchema,
      });

      const request = new NextRequest('http://localhost/api/items/1/favorite', {
        method: 'POST',
        headers: { authorization: 'Bearer token123' },
      });

      const response = await handler(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://backend.test/api/items/1/favorite');
      expect(init.method).toBe('POST');
      expect(init.body).toBeUndefined();
      expect(new Headers(init.headers).get('authorization')).toBe('Bearer token123');
    });

    it('renvoie 502 si la réponse backend ne respecte pas le schéma', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 })),
      );

      const handler = createProxyActionRoute({
        method: 'DELETE',
        backendPath: '/api/items/1/favorite',
        responseSchema: actionResponseSchema,
      });

      const request = new NextRequest('http://localhost/api/items/1/favorite', {
        method: 'DELETE',
      });

      const response = await handler(request);

      expect(response.status).toBe(502);
    });

    it('renvoie 502 si le backend est injoignable', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

      const handler = createProxyActionRoute({
        method: 'DELETE',
        backendPath: '/api/items/1/favorite',
        responseSchema: actionResponseSchema,
      });

      const request = new NextRequest('http://localhost/api/items/1/favorite', {
        method: 'DELETE',
      });

      const response = await handler(request);

      expect(response.status).toBe(502);
    });
  });
});
