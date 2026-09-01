/**
 * Lit le champ `error` d'un corps de réponse JSON déjà parsé (format
 * uniforme `{ error: string }` du backend, voir API_ROUTES.md), sinon
 * retombe sur `fallback`.
 */
export function extractErrorMessage(rawBody: unknown, fallback: string): string {
  if (typeof rawBody === 'object' && rawBody !== null && 'error' in rawBody) {
    return String((rawBody as { error: unknown }).error);
  }
  return fallback;
}
