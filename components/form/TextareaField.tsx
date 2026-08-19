import styles from './FormField.module.css';

type TextareaFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
};

export function TextareaField({ label, name, placeholder }: TextareaFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={5}
        className={`${styles.input} ${styles.textarea}`}
      />
    </label>
  );
}
