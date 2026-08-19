'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/form/TextField';
import { useAuth } from '@/lib/auth/AuthContext';
import { authLoginResponseSchema } from '@/lib/proxy/schemas/auth/authLogin.schema';
import styles from './AuthForm.module.css';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calls the real /api/auth/login proxy route (no mock) and, on success,
  // drops the { token, user } response straight into the in-memory session.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      const rawBody: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof rawBody === 'object' && rawBody && 'error' in rawBody
            ? String((rawBody as { error: unknown }).error)
            : 'Connexion impossible.';
        setError(message);
        return;
      }

      const session = authLoginResponseSchema.parse(rawBody);
      login(session);
      router.push('/');
    } catch {
      setError('Connexion impossible. Réessayez plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fields}>
        <TextField label="Adresse email" name="email" type="email" required />
        <TextField label="Mot de passe" name="password" type="password" required />
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button variant="brand" className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </Button>
        <div className={styles.links}>
          <button type="button" className={styles.link}>
            Mot de passe oublié
          </button>
          <p className={styles.linkText}>
            Pas encore de compte ?{' '}
            <Link href="/signin" className={styles.link}>
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}
