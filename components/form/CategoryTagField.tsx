import styles from './CategoryTagField.module.css';

type CategoryTagFieldProps = {
  label: string;
  name: string;
};

export function CategoryTagField({ label, name }: CategoryTagFieldProps) {
  return (
    <label className={styles.tag}>
      <input type="checkbox" name={name} value={label} className={styles.input} />
      <span className={styles.pill}>{label}</span>
    </label>
  );
}
