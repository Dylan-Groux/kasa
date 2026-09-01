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
import { extractErrorMessage } from '@/lib/http/extractErrorMessage';
import { propertyCreateResponseSchema } from '@/lib/proxy/schemas/properties/propertyCreate.schema';
import {
  uploadImageResponseSchema,
  type UploadImagePurpose,
} from '@/lib/proxy/schemas/uploads/uploadImage.schema';
import { userUpdateResponseSchema } from '@/lib/proxy/schemas/users/userUpdate.schema';
import { MAX_GALLERY_THUMBNAILS } from './propertyGallerySlides';
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
  const { session, updateUser } = useAuth();
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
      const message = extractErrorMessage(rawBody, `Erreur ${response.status}`);
      throw new UserFacingError(`${fieldLabel} : ${message}`);
    }

    return uploadImageResponseSchema.parse(rawBody).url;
  }

  /**
   * Met à jour le nom/la photo du compte connecté si l'utilisateur les a
   * changés dans les champs "Nom de l'hôte"/"Photo de profil" (préremplis
   * avec son profil actuel).
   * @objectif L'hôte affiché sur une annonce est toujours le compte
   * connecté (`host_id`) — ces champs ne créent plus un hôte séparé, ils
   * modifient le vrai profil, comme le permet PATCH /api/users/:id en
   * libre-service pour son propre compte.
   * @note No-op si rien n'a changé, pour ne pas faire un appel réseau inutile.
   * @route /api/users/:id
   * @method PATCH
   */
  async function updateHostProfileIfChanged(hostName: string, hostPictureFile: File | undefined) {
    if (!session) {
      return;
    }

    const patch: { name?: string; picture?: string } = {};
    if (hostName && hostName !== session.user.name) {
      patch.name = hostName;
    }
    if (hostPictureFile && hostPictureFile.size > 0) {
      patch.picture = await uploadImage(hostPictureFile, 'user-picture', 'Photo de profil');
    }
    if (Object.keys(patch).length === 0) {
      return;
    }

    const response = await fetch(`/api/users/${session.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
      body: JSON.stringify(patch),
    });
    const rawBody: unknown = await response.json();

    if (!response.ok) {
      const message = extractErrorMessage(rawBody, 'Impossible de mettre à jour votre profil.');
      throw new UserFacingError(`Profil hôte : ${message}`);
    }

    const updated = userUpdateResponseSchema.parse(rawBody);
    updateUser({ name: updated.name, picture: updated.picture });
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
      const hostName = String(formData.get('hostName') ?? '').trim();

      const [coverUrl, pictureUrls] = await Promise.all([
        coverFile && coverFile.size > 0
          ? uploadImage(coverFile, 'property-cover', 'Image de couverture')
          : undefined,
        Promise.all(
          pictureFiles.map((file) => uploadImage(file, 'property-picture', 'Photos du logement')),
        ),
        updateHostProfileIfChanged(hostName, hostPictureFile),
      ]);

      const title = String(formData.get('title') ?? '').trim();
      const description = String(formData.get('description') ?? '').trim();
      const postalCode = String(formData.get('postalCode') ?? '').trim();
      const location = String(formData.get('location') ?? '').trim();
      const priceRaw = String(formData.get('price_per_night') ?? '').trim();
      const equipments = formData.getAll('equipments').map(String);
      const tags = [...formData.getAll('tags').map(String), ...customTags];

      const payload = {
        title,
        description: description || undefined,
        cover: coverUrl,
        location: [location, postalCode].filter(Boolean).join(' - ') || undefined,
        price_per_night: priceRaw ? Number(priceRaw) : undefined,
        host_id: session?.user.id,
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
            : extractErrorMessage(rawBody, 'Impossible de créer le logement.');
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
      <Button href="/" variant="muted" icon={<ChevronLeftIcon />} className={styles.backButton}>
        Retour
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

      <div className={styles.topGrid}>
        <div className={`${styles.card} ${styles.infoCard}`}>
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

        <div className={`${styles.card} ${styles.coverCard}`}>
          <ImageUploadField label="Image de couverture" name="cover" />
          <PicturesUploadField
            label="Photos du logement"
            files={pictureFiles}
            onChange={setPictureFiles}
            maxFiles={MAX_GALLERY_THUMBNAILS}
          />
        </div>

        <div className={`${styles.card} ${styles.hostCard}`}>
          <TextField
            label="Nom de l'hôte"
            name="hostName"
            required
            defaultValue={session?.user.name}
          />
          <ImageUploadField
            label="Photo de profil"
            name="hostPicture"
            initialPreviewUrl={session?.user.picture}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.card} role="group" aria-labelledby="equipments-label">
          <p id="equipments-label" className={styles.sectionLabel}>
            Équipements
          </p>
          <ul className={styles.equipmentList}>
            {EQUIPMENTS.map((equipment) => (
              <li key={equipment}>
                <CheckboxField label={equipment} name="equipments" />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.card} role="group" aria-labelledby="categories-label">
          <p id="categories-label" className={styles.sectionLabel}>
            Catégories
          </p>
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
        </div>
      </div>
    </form>
  );
}
