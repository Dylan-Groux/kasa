import type { Metadata } from 'next';
import { AddPropertyGate } from '@/components/property/AddPropertyGate';
import { RequireAuth } from '@/components/auth/RequireAuth';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Ajouter une propriété',
  robots: { index: false, follow: false },
};

export default function AjouterPropertePage() {
  return (
    <RequireAuth>
      <main id="main-content" className={styles.main}>
        <AddPropertyGate />
      </main>
    </RequireAuth>
  );
}
