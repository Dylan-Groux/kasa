import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { FavoritesProvider } from '@/lib/favorites/FavoritesContext';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Kasa',
  description: 'Chez vous, partout et ailleurs.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
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
