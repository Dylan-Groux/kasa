// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  createProxyDeleteRoute,
  createProxyGetRoute,
  createProxyMultipartRoute,
  createProxyMutationRoute,
  resolveBackendUrl,
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

    it("relaie le message d'erreur exact du backend au lieu d'un message générique", async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValue(
            new Response(JSON.stringify({ error: 'email déjà pris' }), { status: 409 }),
          ),
      );

      const handler = createProxyMutationRoute({
        method: 'POST',
        backendPath: '/api/items',
        bodySchema: z.object({ name: z.string() }),
        responseSchema: itemSchema,
      });

      const request = new NextRequest('http://localhost/api/items', {
        method: 'POST',
        body: JSON.stringify({ name: 'Villa' }),
      });

      const response = await handler(request);

      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({ error: 'email déjà pris' });
    });

    it('résout backendPath à partir des params de route quand une fonction est fournie', async () => {
      const updated = { id: '7', name: 'Villa' };
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(updated), { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      const handler = createProxyMutationRoute({
        method: 'PATCH',
        backendPath: (params) => `/api/items/${params.id}`,
        bodySchema: z.object({ name: z.string() }),
        responseSchema: itemSchema,
      });

      const request = new NextRequest('http://localhost/api/items/7', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Villa' }),
      });

      const response = await handler(request, { params: Promise.resolve({ id: '7' }) });

      expect(response.status).toBe(200);
      const [url] = fetchMock.mock.calls[0] as [string];
      expect(url).toBe('http://backend.test/api/items/7');
    });

    it('retombe sur un message générique quand le corps du backend est vide/non-JSON', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

      const handler = createProxyMutationRoute({
        method: 'POST',
        backendPath: '/api/items',
        bodySchema: z.object({ name: z.string() }),
        responseSchema: itemSchema,
      });

      const request = new NextRequest('http://localhost/api/items', {
        method: 'POST',
        body: JSON.stringify({ name: 'Villa' }),
      });

      const response = await handler(request);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Backend returned an error' });
    });
  });

  describe('createProxyMultipartRoute', () => {
    it('forward le FormData et le header auth, et renvoie la réponse validée', async () => {
      const uploaded = { url: 'https://cdn.kasa.test/image.jpg' };
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(uploaded), { status: 201 }));
      vi.stubGlobal('fetch', fetchMock);

      const handler = createProxyMultipartRoute({
        backendPath: '/api/uploads/image',
        responseSchema: z.object({ url: z.string() }),
      });

      const body = new FormData();
      body.append('file', new File(['content'], 'photo.jpg', { type: 'image/jpeg' }));

      const request = new NextRequest('http://localhost/api/uploads/image', {
        method: 'POST',
        headers: { authorization: 'Bearer token123' },
        body,
      });

      const response = await handler(request);

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual(uploaded);

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('http://backend.test/api/uploads/image');
      expect(init.body).toBeInstanceOf(FormData);
      expect(new Headers(init.headers).get('authorization')).toBe('Bearer token123');
    });

    it('renvoie 502 si le backend est injoignable', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

      const handler = createProxyMultipartRoute({
        backendPath: '/api/uploads/image',
        responseSchema: z.object({ url: z.string() }),
      });

      const body = new FormData();
      body.append('file', new File(['content'], 'photo.jpg', { type: 'image/jpeg' }));

      const request = new NextRequest('http://localhost/api/uploads/image', {
        method: 'POST',
        body,
      });

      const response = await handler(request);

      expect(response.status).toBe(502);
    });

    it('applique transformResponse sur la réponse validée avant de la renvoyer', async () => {
      const uploaded = { url: '/uploads/photo.jpg' };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response(JSON.stringify(uploaded), { status: 201 })),
      );

      const handler = createProxyMultipartRoute({
        backendPath: '/api/uploads/image',
        responseSchema: z.object({ url: z.string() }),
        transformResponse: (data) => ({ url: `http://backend.test${data.url}` }),
      });

      const body = new FormData();
      body.append('file', new File(['content'], 'photo.jpg', { type: 'image/jpeg' }));

      const request = new NextRequest('http://localhost/api/uploads/image', {
        method: 'POST',
        body,
      });

      const response = await handler(request);

      expect(await response.json()).toEqual({ url: 'http://backend.test/uploads/photo.jpg' });
    });
  });

  describe('resolveBackendUrl', () => {
    it('laisse une URL déjà absolue inchangée', () => {
      expect(resolveBackendUrl('https://cdn.kasa.test/image.jpg')).toBe(
        'https://cdn.kasa.test/image.jpg',
      );
    });

    it('préfixe une URL relative avec BACKEND_API_URL', () => {
      expect(resolveBackendUrl('/uploads/photo.jpg')).toBe('http://backend.test/uploads/photo.jpg');
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
});
