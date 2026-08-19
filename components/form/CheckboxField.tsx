import { CheckIcon } from '@/components/icons/CheckIcon';
import styles from './CheckboxField.module.css';

type CheckboxFieldProps = {
  label: string;
  name: string;
};

export function CheckboxField({ label, name }: CheckboxFieldProps) {
  return (
    <label className={styles.field}>
      <input type="checkbox" name={name} value={label} className={styles.input} />
      <span className={styles.box}>
        <CheckIcon className={styles.check} />
      </span>
      {label}
    </label>
  );
}
