import type { Metadata } from 'next';
import { AboutContent } from '@/components/about/AboutContent';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    "Découvrez la mission de Kasa : mettre en relation voyageurs et hôtes passionnés autour d'hébergements uniques.",
  alternates: { canonical: '/a-propos' },
};

export default function AProposPage() {
  return (
    <main id="main-content" className={styles.main}>
      <AboutContent />
    </main>
  );
}
