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

  /**
   * @note Les URLs objet ne sont valides que pour la durée de vie de l'onglet
   * — on libère l'ancienne à chaque changement de sélection ou au démontage,
   * pour éviter une fuite. Ce champ ne monte qu'une fois (pas remonté à
   * chaque fichier sélectionné, contrairement à l'aperçu par item de
   * PicturesUploadField), donc le double-invoke de React StrictMode en dev
   * ne révoque jamais une URL encore en cours de chargement.
   */
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
