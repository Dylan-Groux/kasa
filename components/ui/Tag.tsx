import styles from './Tag.module.css';

type TagProps = {
  children: React.ReactNode;
};

export function Tag({ children }: TagProps) {
  return <li className={styles.tag}>{children}</li>;
}
