import type { Metadata } from 'next';
import { AboutContent } from '@/components/about/AboutContent';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'À propos - Kasa' };

export default function AProposPage() {
  return (
    <main id="main-content" className={styles.main}>
      <AboutContent />
    </main>
  );
}
