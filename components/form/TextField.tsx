import styles from './FormField.module.css';

type TextFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  required?: boolean;
};

export function TextField({ label, name, placeholder, type = 'text', required }: TextFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className={styles.input}
      />
    </label>
  );
}
