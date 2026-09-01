import type { NextConfig } from 'next';

// Autorise next/image à charger les images uploadées, dont l'URL est résolue
// (côté proxy, voir lib/proxy/createProxyRoute.ts#resolveBackendUrl) vers
// l'origine du backend configuré en local/staging/prod.
const backendUrl = process.env.BACKEND_API_URL ? new URL(process.env.BACKEND_API_URL) : null;

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3-eu-west-1.amazonaws.com',
      },
      ...(backendUrl
        ? [
            {
              protocol: backendUrl.protocol.replace(':', '') as 'http' | 'https',
              hostname: backendUrl.hostname,
              port: backendUrl.port,
            },
          ]
        : []),
    ],
    // Next refuses by default to fetch images from a loopback/private IP (SSRF
    // guard). BACKEND_API_URL is "localhost" in local dev, but remotePatterns
    // above already restricts fetches to that one explicitly configured host,
    // so this doesn't reopen SSRF to arbitrary hosts.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
