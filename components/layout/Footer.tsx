import { Logo } from '@/components/ui/Logo';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Logo variant="footer" />
      <p className={styles.copyright}>&copy; 2025 Kasa. All rights reserved</p>
    </footer>
  );
}
