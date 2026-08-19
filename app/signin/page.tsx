import type { Metadata } from 'next';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { SignupForm } from '@/components/auth/SignupForm';
import styles from '../auth.module.css';

export const metadata: Metadata = { title: 'Inscription - Kasa' };

export default function SignInPage() {
  return (
    <main className={styles.main}>
      <AuthPageLayout
        title="Rejoignez la communauté Kasa"
        subtitle="Créez votre compte et commencez à voyager autrement : réservez des logements uniques, découvrez de nouvelles destinations et partagez vos propres lieux avec d'autres voyageurs."
      >
        <SignupForm />
      </AuthPageLayout>
    </main>
  );
}
