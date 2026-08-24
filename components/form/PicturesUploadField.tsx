'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { PlusIcon } from '@/components/icons/PlusIcon';
import styles from './PicturesUploadField.module.css';

type PicturesUploadFieldProps = {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
};

export function PicturesUploadField({ label, files, onChange }: PicturesUploadFieldProps) {
  const inputId = useId();

  function handleAdd(event: React.ChangeEvent<HTMLInputElement>) {
    const added = Array.from(event.target.files ?? []);
    if (added.length > 0) {
      onChange([...files, ...added]);
    }
    // Reset so selecting the same file again after removing it still fires onChange.
    event.target.value = '';
  }

  function handleRemove(index: number) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <ul className={styles.list}>
        {files.map((file, index) => (
          <li key={`${file.name}-${index}`} className={styles.thumb}>
            <PicturePreview file={file} />
            <button
              type="button"
              className={styles.remove}
              onClick={() => handleRemove(index)}
              aria-label={`Retirer ${file.name}`}
            >
              ×
            </button>
          </li>
        ))}
        <li>
          <label className={styles.addTile}>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              multiple
              className={styles.input}
              onChange={handleAdd}
            />
            <PlusIcon className={styles.icon} />
          </label>
        </li>
      </ul>
    </div>
  );
}

function PicturePreview({ file }: { file: File }) {
  const [previewUrl] = useState(() => URL.createObjectURL(file));

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  return (
    <span className={styles.previewWrapper}>
      <Image src={previewUrl} alt="" fill unoptimized className={styles.previewImage} />
    </span>
  );
}
