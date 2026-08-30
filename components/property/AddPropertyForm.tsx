'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@/components/icons/ChevronLeftIcon';
import { Button } from '@/components/ui/Button';
import { CategoryTagField } from '@/components/form/CategoryTagField';
import { CheckboxField } from '@/components/form/CheckboxField';
import { ImageUploadField } from '@/components/form/ImageUploadField';
import { PicturesUploadField } from '@/components/form/PicturesUploadField';
import { TextField } from '@/components/form/TextField';
import { TextareaField } from '@/components/form/TextareaField';
import { useAuth } from '@/lib/auth/AuthContext';
import { propertyCreateResponseSchema } from '@/lib/proxy/schemas/properties/propertyCreate.schema';
import {
  uploadImageResponseSchema,
  type UploadImagePurpose,
} from '@/lib/proxy/schemas/uploads/uploadImage.schema';
import styles from './AddPropertyForm.module.css';

const EQUIPMENTS = [
  'Micro-Ondes',
  'Douche italienne',
  'Frigo',
  'WIFI',
  'Parking',
  'Sèche Cheveux',
  'Machine à laver',
  'Cuisine équipée',
  'Télévision',
  'Chambre Séparée',
  'Climatisation',
  'Frigo Américain',
  'Clic-clac',
  'Four',
  'Rangements',
  'Lit',
  'Bouilloire',
  'SDB',
  'Toilettes sèches',
  'Cintres',
  'Baie vitrée',
  'Hotte',
  'Baignoire',
  'Vue Parc',
];

// Marque un message d'erreur comme affichable tel quel à l'utilisateur
// (contrairement à une exception réseau/parsing brute, qui reste masquée derrière le message générique).
class UserFacingError extends Error {}

const CATEGORIES = [
  'Parc',
  'Night Life',
  'Culture',
  'Nature',
  'Touristique',
  'Vue sur mer',
  'Pour les couples',
  'Famille',
  'Forêt',
];

export function AddPropertyForm() {
  const router = useRouter();
  const { session } = useAuth();
  const [customTagValue, setCustomTagValue] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [pictureFiles, setPictureFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleAddCustomTag() {
    const trimmed = customTagValue.trim();
    if (trimmed && !customTags.includes(trimmed)) {
      setCustomTags((current) => [...current, trimmed]);
    }
    setCustomTagValue('');
  }

  function handleRemoveCustomTag(tag: string) {
    setCustomTags((current) => current.filter((current_) => current_ !== tag));
  }

  /**
   * Envoie un fichier au proxy et renvoie l'URL attendue par le backend dans
   * le payload (cover/host.picture sont des URLs, pas des fichiers). Lève
   * une UserFacingError affichable telle quelle par le catch plus bas.
   * @route /api/uploads/image
   * @method POST
   */
  async function uploadImage(
    file: File,
    purpose: UploadImagePurpose,
    fieldLabel: string,
  ): Promise<string> {
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    uploadForm.append('purpose', purpose);

    let response: Response;
    try {
      response = await fetch('/api/uploads/image', {
        method: 'POST',
        headers: session ? { Authorization: `Bearer ${session.token}` } : undefined,
        body: uploadForm,
      });
    } catch {
      throw new UserFacingError(`${fieldLabel} : envoi impossible, vérifiez votre connexion.`);
    }

    const rawBody: unknown = await response.json();

    if (!response.ok) {
      const message =
        typeof rawBody === 'object' && rawBody && 'error' in rawBody
          ? String((rawBody as { error: unknown }).error)
          : `Erreur ${response.status}`;
      throw new UserFacingError(`${fieldLabel} : ${message}`);
    }

    return uploadImageResponseSchema.parse(rawBody).url;
  }

  /**
   * @route /api/properties
   * @method POST
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formEl = event.currentTarget;
      const formData = new FormData(formEl);
      // Lit les fichiers directement sur les inputs plutôt que via
      // formData.get(name) : plus fiable pour les inputs file, certains
      // navigateurs perdant le contenu du fichier avec FormData(form).
      const coverFile = (formEl.elements.namedItem('cover') as HTMLInputElement | null)?.files?.[0];
      const hostPictureFile = (formEl.elements.namedItem('hostPicture') as HTMLInputElement | null)
        ?.files?.[0];

      const [coverUrl, hostPictureUrl, pictureUrls] = await Promise.all([
        coverFile && coverFile.size > 0
          ? uploadImage(coverFile, 'property-cover', 'Image de couverture')
          : undefined,
        hostPictureFile && hostPictureFile.size > 0
          ? uploadImage(hostPictureFile, 'user-picture', 'Photo de profil')
          : undefined,
        Promise.all(
          pictureFiles.map((file) => uploadImage(file, 'property-picture', 'Photos du logement')),
        ),
      ]);

      const title = String(formData.get('title') ?? '').trim();
      const description = String(formData.get('description') ?? '').trim();
      const postalCode = String(formData.get('postalCode') ?? '').trim();
      const location = String(formData.get('location') ?? '').trim();
      const hostName = String(formData.get('hostName') ?? '').trim();
      const priceRaw = String(formData.get('price_per_night') ?? '').trim();
      const equipments = formData.getAll('equipments').map(String);
      const tags = [...formData.getAll('tags').map(String), ...customTags];

      const payload = {
        title,
        description: description || undefined,
        cover: coverUrl,
        location: [location, postalCode].filter(Boolean).join(' - ') || undefined,
        price_per_night: priceRaw ? Number(priceRaw) : undefined,
        host: { name: hostName, picture: hostPictureUrl },
        pictures: pictureUrls.length ? pictureUrls : undefined,
        equipments: equipments.length ? equipments : undefined,
        tags: tags.length ? tags : undefined,
      };

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const rawBody: unknown = await response.json();

      if (!response.ok) {
        const message =
          response.status === 403
            ? 'Seuls les comptes propriétaire peuvent ajouter un logement.'
            : typeof rawBody === 'object' && rawBody && 'error' in rawBody
              ? String((rawBody as { error: unknown }).error)
              : 'Impossible de créer le logement.';
        setError(message);
        return;
      }

      propertyCreateResponseSchema.parse(rawBody);
      router.push('/');
    } catch (err) {
      setError(
        err instanceof UserFacingError
          ? err.message
          : 'Impossible de créer le logement. Réessayez plus tard.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Button href="/" variant="muted" icon={<ChevronLeftIcon />}>
        Retour aux annonces
      </Button>

      <div className={styles.heading}>
        <h1 className={styles.title}>Ajouter une propriété</h1>
        <Button variant="brand" type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
        </Button>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.row}>
        <div className={styles.card}>
          <TextField
            label="Titre de la propriété"
            name="title"
            placeholder="Ex : Appartement cosy au coeur de paris"
            required
          />
          <TextareaField
            label="Description"
            name="description"
            placeholder="Décrivez votre propriété en détail..."
          />
          <TextField label="Code postal" name="postalCode" />
          <TextField label="Localisation" name="location" />
          <TextField
            label="Prix par nuit (€)"
            name="price_per_night"
            type="number"
            placeholder="80"
          />
        </div>

        <div className={styles.card}>
          <ImageUploadField label="Image de couverture" name="cover" />
          <PicturesUploadField
            label="Photos du logement"
            files={pictureFiles}
            onChange={setPictureFiles}
          />
          <TextField label="Nom de l'hôte" name="hostName" required />
          <ImageUploadField label="Photo de profil" name="hostPicture" />
        </div>
      </div>

      <div className={styles.row}>
        <fieldset className={styles.card}>
          <legend className={styles.sectionLabel}>Équipements</legend>
          <ul className={styles.equipmentList}>
            {EQUIPMENTS.map((equipment) => (
              <li key={equipment}>
                <CheckboxField label={equipment} name="equipments" />
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset className={styles.card}>
          <legend className={styles.sectionLabel}>Catégories</legend>
          <ul className={styles.categoryList}>
            {CATEGORIES.map((category) => (
              <li key={category}>
                <CategoryTagField label={category} name="tags" />
              </li>
            ))}
            {customTags.map((tag) => (
              <li key={tag} className={styles.customTag}>
                {tag}
                <button
                  type="button"
                  className={styles.removeTag}
                  onClick={() => handleRemoveCustomTag(tag)}
                  aria-label={`Retirer ${tag}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <TextField
            label="Ajouter une catégorie personnalisée"
            name="customTag"
            placeholder="Nouveau tag"
            value={customTagValue}
            onChange={(event) => setCustomTagValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddCustomTag();
              }
            }}
          />
          <button type="button" className={styles.addTag} onClick={handleAddCustomTag}>
            +Ajouter un tag
          </button>
        </fieldset>
      </div>
    </form>
  );
}
