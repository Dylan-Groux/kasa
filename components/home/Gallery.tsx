import type { PropertyBaseSchema } from '@/lib/proxy/schemas/properties/propertyBase.schema';
import { PropertyCard } from '@/components/ui/PropertyCard';
import styles from './Gallery.module.css';

type GalleryProps = {
  properties: PropertyBaseSchema[];
};

export function Gallery({ properties }: GalleryProps) {
  if (properties.length === 0) {
    return (
      <section aria-label="Logements disponibles">
        <p className={styles.empty}>Logements indisponibles pour le moment.</p>
      </section>
    );
  }

  return (
    <section aria-label="Logements disponibles">
      <ul className={styles.grid}>
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </ul>
    </section>
  );
}
