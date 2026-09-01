import styles from './FormField.module.css';

type TextFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  value?: string;
  /** Valeur initiale pour un champ non contrôlé (ignorée si `value` est fourni). */
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function TextField({
  label,
  name,
  placeholder,
  type = 'text',
  required,
  value,
  defaultValue,
  onChange,
  onKeyDown,
}: TextFieldProps) {
  // React traite un input comme contrôlé dès que la prop `value` est passée,
  // même à `undefined` — donc ne jamais fournir les deux props à la fois,
  // sous peine que `defaultValue` soit silencieusement ignorée.
  const valueProps = value !== undefined ? { value } : { defaultValue };

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        {...valueProps}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={styles.input}
      />
    </label>
  );
}
