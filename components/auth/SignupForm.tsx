import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckboxField } from '@/components/form/CheckboxField';
import { TextField } from '@/components/form/TextField';
import styles from './AuthForm.module.css';

export function SignupForm() {
  return (
    <form className={styles.form}>
      <div className={styles.fields}>
        <TextField label="Nom" name="lastName" />
        <TextField label="Prénom" name="firstName" />
        <TextField label="Adresse email" name="email" />
        <TextField label="Mot de passe" name="password" />
        <CheckboxField label="J'accepte les conditions générales d'utilisation" name="terms" />
      </div>

      <div className={styles.actions}>
        <Button variant="brand" className={styles.submit}>
          S&apos;inscrire
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
