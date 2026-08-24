'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckboxField } from '@/components/form/CheckboxField';
import { TextField } from '@/components/form/TextField';
import { useAuth } from '@/lib/auth/AuthContext';
import { authRegisterResponseSchema } from '@/lib/proxy/schemas/auth/authRegister.schema';
import styles from './AuthForm.module.css';

export function SignupForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calls the real /api/auth/register proxy route (no mock) and, on success,
  // drops the { token, user } response straight into the in-memory session.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email: formData.get('email'),
          password: formData.get('password'),
          role: formData.get('isHost') ? 'owner' : 'client',
        }),
      });

      const rawBody: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof rawBody === 'object' && rawBody && 'error' in rawBody
            ? String((rawBody as { error: unknown }).error)
            : 'Inscription impossible.';
        setError(message);
        return;
      }

      const session = authRegisterResponseSchema.parse(rawBody);
      login(session);
      router.push('/');
    } catch {
      setError('Inscription impossible. Réessayez plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fields}>
        <TextField label="Nom" name="lastName" required />
        <TextField label="Prénom" name="firstName" required />
        <TextField label="Adresse email" name="email" type="email" required />
        <TextField label="Mot de passe" name="password" type="password" required />
        <CheckboxField label="J'accepte les conditions générales d'utilisation" name="terms" />
        <CheckboxField label="Je veux louer mon logement (compte propriétaire)" name="isHost" />
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button variant="brand" className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Inscription...' : "S'inscrire"}
        </Button>
        <p className={styles.linkText}>
          Déjà membre ?{' '}
          <Link href="/login" className={styles.link}>
            Se connecter
          </Link>
        </p>
      </div>
    </form>
  );
}
