export const SITE_NAME = 'Kasa';

// Vercel injects VERCEL_PROJECT_PRODUCTION_URL (the stable production
// domain) into every build, so Vercel deployments need no manual config.
// Other hosts (o2switch, Docker, VPS...) have no equivalent signal and must
// set SITE_URL explicitly. Localhost is the last-resort dev fallback.
// Server-only (like BACKEND_API_URL): only used in Server Components, route
// handlers, sitemap.ts and robots.ts — never read from the client, so no
// NEXT_PUBLIC_ prefix needed, and it can be changed without a rebuild.
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
