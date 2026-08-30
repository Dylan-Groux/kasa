'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PlusIcon } from '@/components/icons/PlusIcon';
import styles from './ImageUploadField.module.css';

type ImageUploadFieldProps = {
  label: string;
  name: string;
};

export function ImageUploadField({ label, name }: ImageUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Object URLs are only valid for this tab's lifetime — release the old one
  // whenever the selection changes or the field unmounts, to avoid leaking it.
  useEffect(() => {
    if (!previewUrl) {
      return;
    }
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span className={styles.dropzone}>
        <input
          type="file"
          name={name}
          accept="image/*"
          className={styles.input}
          onChange={handleChange}
        />
        {previewUrl ? (
          <span className={styles.preview}>
            <Image src={previewUrl} alt="" fill unoptimized className={styles.previewImage} />
          </span>
        ) : (
          <span className={styles.button}>
            <PlusIcon className={styles.icon} />
          </span>
        )}
        <span>{previewUrl ? "Changer l'image" : 'Ajouter une image'}</span>
      </span>
    </label>
  );
}
