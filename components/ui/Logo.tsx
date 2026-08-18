import Image from 'next/image';
import Link from 'next/link';
import styles from './Logo.module.css';

type LogoProps = {
  variant?: 'default' | 'footer';
};

const VARIANTS = {
  default: { src: '/images/icons/logo.svg', width: 113, height: 40 },
  footer: { src: '/images/icons/logo-footer.svg', width: 46, height: 53 },
} as const;

export function Logo({ variant = 'default' }: LogoProps) {
  const { src, width, height } = VARIANTS[variant];
  return (
    <Link href="/" className={styles.link} aria-label="Kasa - accueil">
      <Image src={src} width={width} height={height} alt="Kasa" priority={variant === 'default'} />
    </Link>
  );
}
