import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <p className={styles.code}>404</p>
        <p className={styles.message}>
          Il semble que la page que vous cherchez ait pris des vacances… ou n&apos;ait jamais
          existé.
        </p>
      </div>
      <div className={styles.actions}>
        <Button href="/" variant="brand" className={styles.button}>
          Accueil
        </Button>
        <Button href="/#logements" variant="brand" className={styles.button}>
          Logements
        </Button>
      </div>
    </main>
  );
}
