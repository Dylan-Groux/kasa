import type { Metadata } from 'next';
import { AddPropertyForm } from '@/components/property/AddPropertyForm';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Ajouter une propriété - Kasa' };

export default function AjouterPropertePage() {
  return (
    <main className={styles.main}>
      <AddPropertyForm />
    </main>
  );
}
