import { PlusIcon } from '@/components/icons/PlusIcon';
import styles from './ImageUploadField.module.css';

type ImageUploadFieldProps = {
  label: string;
  name: string;
};

export function ImageUploadField({ label, name }: ImageUploadFieldProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <label className={styles.dropzone}>
        <input type="file" name={name} accept="image/*" className={styles.input} />
        <span className={styles.button}>
          <PlusIcon className={styles.icon} />
        </span>
        <span>Ajouter une image</span>
      </label>
    </div>
  );
}
