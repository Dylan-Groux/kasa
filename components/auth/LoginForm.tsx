import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/form/TextField';
import styles from './AuthForm.module.css';

export function LoginForm() {
  return (
    <form className={styles.form}>
      <div className={styles.fields}>
        <TextField label="Adresse email" name="email" />
        <TextField label="Mot de passe" name="password" />
      </div>

      <div className={styles.actions}>
        <Button variant="brand" className={styles.submit}>
          Se connecter
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
