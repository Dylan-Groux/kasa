import type { Metadata } from 'next';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import styles from '../auth.module.css';

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main id="main-content" className={styles.main}>
      <AuthPageLayout
        title="Heureux de vous revoir"
        subtitle="Connectez-vous pour retrouver vos réservations, vos annonces et tout ce qui rend vos séjours uniques."
      >
        <LoginForm />
      </AuthPageLayout>
    </main>
  );
}
