import { NextResponse, type NextRequest } from 'next/server';
import type { ZodType } from 'zod';

type BackendResult = { ok: true; response: Response } | { ok: false; errorResponse: NextResponse };

type BackendPath<TParams extends Record<string, string>> = string | ((params: TParams) => string);

type RouteContext<TParams extends Record<string, string>> = { params?: Promise<TParams> };

/**
 * Résout un backendPath statique ou dérivé des params de route dynamique
 * (ex: `(params) => \`/api/properties/${params.id}/favorite\``).
 * Utilisation: toutes les factories de routes proxy.
 */
async function resolveBackendPath<TParams extends Record<string, string>>(
  backendPath: BackendPath<TParams>,
  context?: RouteContext<TParams>,
): Promise<string> {
  if (typeof backendPath === 'string') {
    return backendPath;
  }

  const params = context?.params ? await context.params : ({} as TParams);
  return backendPath(params);
}

/**
 * Appelle le backend et centralise les erreurs techniques.
 * Utilisation: toutes les méthodes HTTP (GET/POST/PATCH/DELETE).
 * @param path Chemin backend (ex: /api/properties).
 * @param init Options fetch (method, headers, body...).
 * @returns Soit la réponse backend, soit une NextResponse d'erreur prête à renvoyer.
 */
async function callBackend(path: string, init?: RequestInit): Promise<BackendResult> {
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    console.error('BACKEND_API_URL is not set');
    return {
      ok: false,
      errorResponse: NextResponse.json({ error: 'Backend not configured' }, { status: 500 }),
    };
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${backendUrl}${path}`, init);
  } catch {
    return {
      ok: false,
      errorResponse: NextResponse.json({ error: 'Backend unreachable' }, { status: 502 }),
    };
  }

  if (!upstreamResponse.ok) {
    return {
      ok: false,
      errorResponse: NextResponse.json(
        { error: 'Backend returned an error' },
        { status: upstreamResponse.status },
      ),
    };
  }

  return { ok: true, response: upstreamResponse };
}

/**
 * Valide la réponse JSON du backend avec Zod.
 * Utilisation: routes qui renvoient un body JSON (GET/POST/PATCH).
 * @template TResponse Type de réponse attendu après validation.
 * @param rawBody JSON brut reçu du backend.
 * @param responseSchema Schéma Zod de validation de la réponse.
 * @param status Statut HTTP backend à propager (200, 201, etc.).
 * @returns Une réponse JSON validée, ou 502 si la forme est invalide.
 */
function parseBackendJson<TResponse>(
  rawBody: unknown,
  responseSchema: ZodType<TResponse>,
  status: number,
): NextResponse {
  const parsed = responseSchema.safeParse(rawBody);

  if (!parsed.success) {
    console.error('Backend response failed schema validation', parsed.error);
    return NextResponse.json({ error: 'Unexpected backend response shape' }, { status: 502 });
  }

  return NextResponse.json(parsed.data, { status });
}

/**
 * Copie le header Authorization de la requête entrante vers l'appel backend.
 * Utilisation: routes protégées (souvent POST/PATCH/DELETE).
 * @param request Requête entrante Next.js.
 * @param extra Headers supplémentaires optionnels (ex: Content-Type).
 * @returns Un objet Headers prêt à être transmis à fetch.
 */
function forwardAuthHeader(request: NextRequest, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  const authorization = request.headers.get('authorization');

  if (authorization) {
    headers.set('authorization', authorization);
  }

  return headers;
}

interface ProxyGetRouteConfig<TResponse, TParams extends Record<string, string>> {
  backendPath: BackendPath<TParams>;
  responseSchema: ZodType<TResponse>;
}

/**
 * Factory pour routes GET sans body entrant.
 * Utilisation: lecture de données (liste/détail) depuis un endpoint backend.
 * @template TResponse Type de réponse attendu.
 * @param config Configuration du proxy GET.
 * @param config.backendPath Chemin backend cible, ou fonction dérivée des params de route dynamique.
 * @param config.responseSchema Schéma Zod de validation de la réponse.
 * @returns Un handler GET qui appelle le backend puis valide la réponse.
 */
export function createProxyGetRoute<
  TResponse,
  TParams extends Record<string, string> = Record<string, string>,
>({ backendPath, responseSchema }: ProxyGetRouteConfig<TResponse, TParams>) {
  return async function GET(
    request?: NextRequest,
    context?: RouteContext<TParams>,
  ): Promise<NextResponse> {
    const path = await resolveBackendPath(backendPath, context);
    const result = await callBackend(path, request ? { headers: forwardAuthHeader(request) } : undefined);

    if (!result.ok) {
      return result.errorResponse;
    }

    // Valider par parseBackendJson pour s'assurer que la réponse du backend correspond au schéma attendu
    const rawBody: unknown = await result.response.json();
    return parseBackendJson(rawBody, responseSchema, result.response.status);
  };
}

interface ProxyMutationRouteConfig<TBody, TResponse> {
  method: 'POST' | 'PATCH';
  backendPath: string;
  bodySchema: ZodType<TBody>;
  responseSchema: ZodType<TResponse>;
}

/**
 * Factory pour mutations POST/PATCH avec validation d'entrée/sortie.
 * Utilisation: création/mise à jour avec body JSON.
 * @template TBody Type du body attendu en entrée.
 * @template TResponse Type de réponse attendu en sortie.
 * @param config Configuration du proxy mutation.
 * @param config.method Méthode autorisée: POST ou PATCH.
 * @param config.backendPath Chemin backend cible.
 * @param config.bodySchema Schéma Zod de validation du body entrant.
 * @param config.responseSchema Schéma Zod de validation de la réponse backend.
 * @returns Un handler qui valide l'entrée (400 si invalide), forwarde l'auth,
 * puis valide la réponse backend avant de la renvoyer.
 */
export function createProxyMutationRoute<TBody, TResponse>({
  method,
  backendPath,
  bodySchema,
  responseSchema,
}: ProxyMutationRouteConfig<TBody, TResponse>) {
  return async function handler(request: NextRequest): Promise<NextResponse> {
    const rawBody: unknown = await request.json();
    const parsedBody = bodySchema.safeParse(rawBody);

    if (!parsedBody.success) {
      console.error('Request body failed schema validation', parsedBody.error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const headers = forwardAuthHeader(request, { 'Content-Type': 'application/json' });
    const result = await callBackend(backendPath, {
      method,
      headers,
      body: JSON.stringify(parsedBody.data),
    });

    if (!result.ok) {
      return result.errorResponse;
    }

    const rawResponseBody: unknown = await result.response.json();
    return parseBackendJson(rawResponseBody, responseSchema, result.response.status);
  };
}

interface ProxyDeleteRouteConfig {
  backendPath: string;
}

/**
 * Factory pour route DELETE.
 * Utilisation: suppression de ressource (souvent réponse 204 sans body).
 * @param config Configuration du proxy DELETE.
 * @param config.backendPath Chemin backend cible.
 * @returns Un handler DELETE qui forwarde l'auth et propage le statut backend.
 */
export function createProxyDeleteRoute({ backendPath }: ProxyDeleteRouteConfig) {
  return async function DELETE(request: NextRequest): Promise<NextResponse> {
    const headers = forwardAuthHeader(request);
    const result = await callBackend(backendPath, { method: 'DELETE', headers });

    if (!result.ok) {
      return result.errorResponse;
    }

    return new NextResponse(null, { status: result.response.status });
  };
}

interface ProxyActionRouteConfig<TResponse, TParams extends Record<string, string>> {
  method: 'POST' | 'DELETE';
  backendPath: BackendPath<TParams>;
  responseSchema: ZodType<TResponse>;
}

/**
 * Factory pour actions POST/DELETE authentifiées sans body entrant, dont la
 * réponse backend est un JSON à valider (ex: favoris `{ok:true}`) plutôt
 * qu'un 204 vide — cas que ni createProxyMutationRoute (body requis) ni
 * createProxyDeleteRoute (pas de validation de réponse) ne couvrent.
 * @param config.method Méthode autorisée: POST ou DELETE.
 * @param config.backendPath Chemin backend cible, ou fonction dérivée des params de route dynamique.
 * @param config.responseSchema Schéma Zod de validation de la réponse.
 * @returns Un handler qui forwarde l'auth (pas de body) puis valide la réponse backend.
 */
export function createProxyActionRoute<
  TResponse,
  TParams extends Record<string, string> = Record<string, string>,
>({ method, backendPath, responseSchema }: ProxyActionRouteConfig<TResponse, TParams>) {
  return async function handler(
    request: NextRequest,
    context?: RouteContext<TParams>,
  ): Promise<NextResponse> {
    const path = await resolveBackendPath(backendPath, context);
    const headers = forwardAuthHeader(request);
    const result = await callBackend(path, { method, headers });

    if (!result.ok) {
      return result.errorResponse;
    }

    const rawBody: unknown = await result.response.json();
    return parseBackendJson(rawBody, responseSchema, result.response.status);
  };
}
