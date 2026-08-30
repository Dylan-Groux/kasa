import type { Metadata } from 'next';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { MessagerieShell } from '@/components/messaging/MessagerieShell';
import { MessagingProvider } from '@/lib/messaging/MessagingContext';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Messagerie',
  robots: { index: false, follow: false },
};

export default function MessagerieLayout({ children }: LayoutProps<'/messagerie'>) {
  return (
    <RequireAuth>
      <MessagingProvider>
        <main id="main-content" className={styles.main}>
          <MessagerieShell>{children}</MessagerieShell>
        </main>
      </MessagingProvider>
    </RequireAuth>
  );
}
