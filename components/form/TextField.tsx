import styles from './FormField.module.css';

type TextFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
};

export function TextField({ label, name, placeholder }: TextFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input type="text" name={name} placeholder={placeholder} className={styles.input} />
    </label>
  );
}
