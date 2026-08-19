import { ChevronLeftIcon } from '@/components/icons/ChevronLeftIcon';
import { Button } from '@/components/ui/Button';
import { CategoryTagField } from '@/components/form/CategoryTagField';
import { CheckboxField } from '@/components/form/CheckboxField';
import { ImageUploadField } from '@/components/form/ImageUploadField';
import { TextField } from '@/components/form/TextField';
import { TextareaField } from '@/components/form/TextareaField';
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
  return (
    <form className={styles.form}>
      <Button href="/" variant="muted" icon={<ChevronLeftIcon />}>
        Retour aux annonces
      </Button>

      <div className={styles.heading}>
        <h1 className={styles.title}>Ajouter une propriété</h1>
        <Button variant="brand" className={styles.submit}>
          Ajouter
        </Button>
      </div>

      <div className={styles.row}>
        <div className={styles.card}>
          <TextField
            label="Titre de la propriété"
            name="title"
            placeholder="Ex : Appartement cosy au coeur de paris"
          />
          <TextareaField
            label="Description"
            name="description"
            placeholder="Décrivez votre propriété en détail..."
          />
          <TextField label="Code postal" name="postalCode" />
          <TextField label="Localisation" name="location" />
        </div>

        <div className={styles.card}>
          <ImageUploadField label="Image de couverture" name="cover" />
          <TextField label="Nom de l'hôte" name="hostName" />
          <ImageUploadField label="Photo de profil" name="hostPicture" />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.card}>
          <span className={styles.sectionLabel}>Équipements</span>
          <ul className={styles.equipmentList}>
            {EQUIPMENTS.map((equipment) => (
              <li key={equipment}>
                <CheckboxField label={equipment} name="equipments" />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.card}>
          <span className={styles.sectionLabel}>Catégories</span>
          <ul className={styles.categoryList}>
            {CATEGORIES.map((category) => (
              <li key={category}>
                <CategoryTagField label={category} name="tags" />
              </li>
            ))}
          </ul>
          <TextField
            label="Ajouter une catégorie personnalisée"
            name="customTag"
            placeholder="Nouveau tag"
          />
          <button type="button" className={styles.addTag}>
            +Ajouter un tag
          </button>
        </div>
      </div>
    </form>
  );
}
