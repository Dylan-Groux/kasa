import type { Metadata } from 'next';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import styles from '../auth.module.css';

export const metadata: Metadata = { title: 'Connexion - Kasa' };

export default function LoginPage() {
  return (
    <main className={styles.main}>
      <AuthPageLayout
        title="Heureux de vous revoir"
        subtitle="Connectez-vous pour retrouver vos réservations, vos annonces et tout ce qui rend vos séjours uniques."
      >
        <LoginForm />
      </AuthPageLayout>
    </main>
  );
}
