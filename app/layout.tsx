import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { FavoritesProvider } from '@/lib/favorites/FavoritesContext';
import { SITE_NAME, SITE_URL } from '@/lib/seo/site';
import { jsonLdScriptProps } from '@/lib/seo/jsonLd';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const DESCRIPTION =
  'Chez vous, partout et ailleurs. Découvrez des logements uniques, sélectionnés avec soin par nos hôtes.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s - ${SITE_NAME}` },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DESCRIPTION,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/images/icons/logo.svg`,
    },
    {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <script type="application/ld+json" {...jsonLdScriptProps(organizationJsonLd)} />
        <AuthProvider>
          <FavoritesProvider>
            <Navbar />
            {children}
            <Footer />
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
