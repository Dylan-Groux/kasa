import styles from './FormField.module.css';

type TextFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TextField({
  label,
  name,
  placeholder,
  type = 'text',
  required,
  value,
  onChange,
}: TextFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className={styles.input}
      />
    </label>
  );
}
