export const SITE_NAME = 'Kasa';

/**
 * Résout l'URL publique du site (sitemap, JSON-LD, canonical...).
 * @objectif Vercel injecte VERCEL_PROJECT_PRODUCTION_URL (domaine de prod
 * stable) à chaque build, donc rien à configurer sur Vercel. Les autres
 * hébergeurs (o2switch, Docker, VPS...) n'ont pas cet équivalent et doivent
 * définir SITE_URL explicitement. Localhost est le fallback de dev en dernier recours.
 * @note Server-only (comme BACKEND_API_URL) : jamais lu côté client, donc pas
 * de préfixe NEXT_PUBLIC_, et modifiable sans rebuild.
 */
function resolveSiteUrl(): string {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();
