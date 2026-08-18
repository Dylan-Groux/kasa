import styles from './AuthPageLayout.module.css';

type AuthPageLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthPageLayout({ title, subtitle, children }: AuthPageLayoutProps) {
  return (
    <div className={styles.card}>
      <div className={styles.heading}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
