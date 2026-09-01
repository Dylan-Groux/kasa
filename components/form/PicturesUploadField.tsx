'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { PlusIcon } from '@/components/icons/PlusIcon';
import styles from './PicturesUploadField.module.css';

type PicturesUploadFieldProps = {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  /** Nombre maximum de fichiers acceptés ; illimité si absent. */
  maxFiles?: number;
};

export function PicturesUploadField({
  label,
  files,
  onChange,
  maxFiles,
}: PicturesUploadFieldProps) {
  const inputId = useId();
  const hasReachedLimit = maxFiles !== undefined && files.length >= maxFiles;

  /**
   * @objectif Ajoute les fichiers sélectionnés en respectant `maxFiles` : si
   * la sélection dépasse les places restantes, seul le début de la sélection
   * est gardé plutôt que de rejeter le tout ou de dépasser la limite (utile
   * côté galerie propriété, où la grille d'affichage a un nombre de cases fixe).
   */
  function handleAdd(event: React.ChangeEvent<HTMLInputElement>) {
    const added = Array.from(event.target.files ?? []);
    if (added.length > 0) {
      const remainingSlots =
        maxFiles === undefined ? added.length : Math.max(maxFiles - files.length, 0);
      const accepted = added.slice(0, remainingSlots);
      if (accepted.length > 0) {
        onChange([...files, ...accepted]);
      }
    }
    // Reset pour que resélectionner le même fichier après l'avoir retiré redéclenche bien onChange.
    event.target.value = '';
  }

  function handleRemove(index: number) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {maxFiles !== undefined ? (
          <span className={styles.hint}>
            {' '}
            ({files.length}/{maxFiles})
          </span>
        ) : null}
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
        {!hasReachedLimit ? (
          <li>
            <label className={styles.addTile}>
              <span className={styles.visuallyHidden}>Ajouter une photo</span>
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
        ) : null}
      </ul>
    </div>
  );
}

/**
 * Aperçu d'une photo sélectionnée dans le champ multi-upload.
 * @objectif Crée puis révoque l'URL objet dans le même run d'effet (plutôt
 * que de la créer dans l'initialiseur de useState et de la révoquer depuis
 * un effet séparé), pour que le double-invoke de React StrictMode en dev ne
 * révoque pas l'URL juste après sa création, sous les pieds de l'`<img>` en
 * cours de chargement.
 */
function PicturePreview({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    // Exception délibérée : l'URL doit être créée ici (pas dans un useMemo ni
    // dans le handler du parent) pour que le double-invoke au montage décrit
    // ci-dessus recrée une URL fraîche correctement appairée, plutôt que de
    // révoquer celle déjà committée en state — voir le commentaire au-dessus
    // de ce composant.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!previewUrl) {
    return <span className={styles.previewWrapper} />;
  }

  return (
    <span className={styles.previewWrapper}>
      <Image src={previewUrl} alt="" fill unoptimized className={styles.previewImage} />
    </span>
  );
}
