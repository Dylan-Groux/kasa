import Link from 'next/link';
import styles from './Button.module.css';

type ButtonOwnProps = {
  variant?: 'muted' | 'brand';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

type ButtonAsLink = ButtonOwnProps & { href: string } & Omit<
    React.ComponentPropsWithoutRef<typeof Link>,
    'href' | 'className' | 'children'
  >;

type ButtonAsButton = ButtonOwnProps & { href?: undefined } & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'children'
  >;

type ButtonProps = ButtonAsLink | ButtonAsButton;

// Même rendu que ce soit un lien (navigation) ou un bouton (action).
export function Button({ variant = 'muted', icon, children, className, ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');

  if ('href' in rest && rest.href) {
    const { href, ...linkProps } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        {children}
      </Link>
    );
  }

  const buttonProps = rest as ButtonAsButton;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {children}
    </button>
  );
}
